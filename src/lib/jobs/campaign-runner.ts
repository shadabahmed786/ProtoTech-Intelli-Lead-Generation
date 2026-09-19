import { prisma } from '../db/prisma';
import { discoveryEngine } from '../discovery/manager';
import { normalizeLocation } from '../normalization/location';
import { normalizePhone } from '../normalization/phone';
import { normalizeDomain } from '../normalization/domain';
import { verifyEmail } from '../verification/email';
import { checkDeduplication } from '../deduplication';
import { crawlBusinessWebsite } from '../crawler/crawler';
import { auditWebsite } from '../analysis/audit';
import { calculateScores, DEFAULT_OFFER_PROFILE } from '../scoring/engine';
import { DiscoveredCandidate } from '@/types';

export interface CampaignRunOptions {
  campaignId: string;
}

export class CampaignRunner {
  private activeCampaigns = new Set<string>();

  /**
   * Helper to append an event to the campaign audit stream
   */
  private async logEvent(campaignId: string, stage: string, message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') {
    try {
      await prisma.campaignEvent.create({
        data: {
          campaignId,
          stage,
          message,
          level,
        },
      });
    } catch {
      // ignore logging errors
    }
  }

  /**
   * Checks if the campaign was cancelled by user
   */
  private async isCancelled(campaignId: string): Promise<boolean> {
    const camp = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { status: true },
    });
    return camp?.status === 'Cancelled';
  }

  /**
   * Runs the full end-to-end pipeline asynchronously
   */
  async runCampaign(campaignId: string): Promise<void> {
    if (this.activeCampaigns.has(campaignId)) return;
    this.activeCampaigns.add(campaignId);

    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { offerProfile: true },
      });

      if (!campaign) {
        throw new Error(`Campaign ${campaignId} not found`);
      }

      if (campaign.status === 'Cancelled') {
        this.activeCampaigns.delete(campaignId);
        return;
      }

      // 1. DISCOVERY STAGE
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'Discovering',
          currentStage: 'Discovering',
          progressPercent: 10,
        },
      });
      await this.logEvent(campaignId, 'Discovering', `Starting business discovery for ${campaign.leadType} in ${campaign.location}`);

      const discoveredCandidates = await discoveryEngine.discover(
        {
          leadType: campaign.leadType,
          location: campaign.location,
          quantityRequested: campaign.quantityRequested,
          bufferMultiplier: 1.5,
        },
        async (count, sourceName) => {
          await prisma.campaign.update({
            where: { id: campaignId },
            data: { discoveredCount: count },
          });
        }
      );

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          discoveredCount: discoveredCandidates.length,
          progressPercent: 30,
        },
      });
      await this.logEvent(
        campaignId,
        'Discovering',
        `Discovered ${discoveredCandidates.length} candidate businesses across public sources.`,
        discoveredCandidates.length > 0 ? 'success' : 'warning'
      );

      if (await this.isCancelled(campaignId)) {
        await this.logEvent(campaignId, 'Cancelled', 'Campaign execution stopped per user request.', 'warning');
        return;
      }

      // 2. EXTRACTION & NORMALIZATION & DEDUPLICATION
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'Extracting',
          currentStage: 'Extracting & Normalizing',
          progressPercent: 40,
        },
      });

      const existingLeads = await prisma.lead.findMany({
        select: {
          id: true,
          businessName: true,
          normalizedDomain: true,
          normalizedPhone: true,
          city: true,
          address: true,
        },
      });

      const suppressions = await prisma.suppression.findMany({
        select: { type: true, value: true },
      });

      const qualifiedCandidates: DiscoveredCandidate[] = [];
      let duplicatesCount = 0;
      let rejectedCount = 0;

      for (const cand of discoveredCandidates) {
        if (await this.isCancelled(campaignId)) break;

        // Normalize
        const normLoc = normalizeLocation(cand.city || campaign.location);
        const normPh = normalizePhone(cand.phone);
        const normDom = normalizeDomain(cand.website);

        // Deduplication & suppression check
        const dedup = checkDeduplication(
          {
            businessName: cand.businessName,
            website: cand.website,
            phone: normPh.e164 || cand.phone,
            email: cand.email,
            city: normLoc.city,
            address: cand.address,
          },
          existingLeads,
          suppressions
        );

        if (dedup.isSuppressed) {
          rejectedCount++;
          await this.logEvent(campaignId, 'Extraction', `Suppressed business skipped: ${cand.businessName}`, 'warning');
          continue;
        }

        if (dedup.isDuplicate) {
          duplicatesCount++;
          continue;
        }

        qualifiedCandidates.push(cand);

        // Stop once we have reached the requested lead quantity
        if (qualifiedCandidates.length >= campaign.quantityRequested) {
          break;
        }
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          duplicatesCount,
          rejectedCount,
          validCount: qualifiedCandidates.length,
          progressPercent: 55,
        },
      });

      if (await this.isCancelled(campaignId)) {
        return;
      }

      // 3. VERIFICATION & WEBSITE ANALYSIS & SCORING
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'Analyzing',
          currentStage: 'Analyzing Websites & Opportunities',
          progressPercent: 65,
        },
      });

      // Prepare Offer Profile for scoring
      let offerProfileConfig = DEFAULT_OFFER_PROFILE;
      if (campaign.offerProfile) {
        try {
          offerProfileConfig = {
            id: campaign.offerProfile.id,
            name: campaign.offerProfile.name,
            targetIndustries: JSON.parse(campaign.offerProfile.targetIndustries),
            targetLocations: JSON.parse(campaign.offerProfile.targetLocations),
            signalWeights: JSON.parse(campaign.offerProfile.signalWeights),
          };
        } catch {
          // fallback to default
        }
      }

      let processedCount = 0;

      for (const cand of qualifiedCandidates) {
        if (await this.isCancelled(campaignId)) break;

        const normLoc = normalizeLocation(cand.city || campaign.location);
        const normPh = normalizePhone(cand.phone);
        const normDom = normalizeDomain(cand.website);

        // Email Verification
        let verifiedEmail: string | undefined = cand.email;
        if (cand.email) {
          const emailCheck = await verifyEmail(cand.email);
          if (emailCheck.status === 'invalid_syntax' || emailCheck.status === 'disposable') {
            verifiedEmail = undefined;
          }
        }

        // Website Crawl & Audit (if website exists)
        let auditData: ReturnType<typeof auditWebsite> | null = null;
        if (cand.website) {
          try {
            await this.logEvent(campaignId, 'Analyzing', `Auditing website for ${cand.businessName}: ${cand.website}`);
            const crawlResult = await crawlBusinessWebsite(cand.website);
            if (crawlResult.homepage.html) {
              auditData = auditWebsite(
                cand.website,
                crawlResult.homepage.html,
                crawlResult.subpages
              );

              // Enrich emails & phones from website if missing
              if (!verifiedEmail && auditData.emails.length > 0) {
                verifiedEmail = auditData.emails[0];
              }
              if (!cand.phone && auditData.phones.length > 0) {
                cand.phone = auditData.phones[0];
              }
              if (!cand.whatsapp && auditData.whatsappNumbers.length > 0) {
                cand.whatsapp = auditData.whatsappNumbers[0];
              }
            }
          } catch (crawlErr: any) {
            await this.logEvent(campaignId, 'Analyzing', `Website audit notice for ${cand.businessName}: ${crawlErr.message}`, 'warning');
          }
        }

        // Calculate Scores
        const scores = calculateScores(
          {
            businessName: cand.businessName,
            category: cand.category,
            location: campaign.location,
            city: normLoc.city,
            country: normLoc.country,
            website: cand.website,
            email: verifiedEmail,
            phone: normPh.e164 || cand.phone,
            whatsapp: cand.whatsapp,
            hasMobileViewport: auditData?.hasMobileViewport,
            hasHttps: auditData?.hasHttps,
            hasCta: auditData?.hasCta,
            hasSocialLinks: auditData?.hasSocialLinks,
            metaDescription: auditData?.metaDescription,
            opportunities: auditData?.opportunities,
          },
          offerProfileConfig
        );

        // Persist Lead in Database
        const savedLead = await prisma.lead.create({
          data: {
            campaignId,
            businessName: cand.businessName,
            category: cand.category,
            description: cand.description,
            address: cand.address,
            city: normLoc.city,
            region: normLoc.region,
            country: normLoc.country,
            latitude: cand.latitude,
            longitude: cand.longitude,
            website: cand.website,
            email: verifiedEmail,
            phone: normPh.e164 || cand.phone,
            whatsapp: cand.whatsapp,
            normalizedDomain: normDom,
            normalizedPhone: normPh.e164,
            qualityScore: scores.qualityScore,
            opportunityScore: scores.opportunityScore,
            status: 'Qualified',
            sources: {
              create: {
                sourceName: cand.sourceName,
                sourceType: cand.sourceType,
                sourceUrl: cand.sourceUrl,
                confidence: cand.confidence,
              },
            },
            scoreBreakdown: {
              create: scores.breakdown.map((b) => ({
                signal: b.signal,
                points: b.points,
              })),
            },
            activity: {
              create: {
                action: 'Discovered',
                details: `Discovered and qualified via campaign ${campaign.name}`,
                actorName: 'System Worker',
              },
            },
          },
        });

        // Save Audit Details & Technologies if audited
        if (auditData) {
          await prisma.leadAudit.create({
            data: {
              leadId: savedLead.id,
              hasHttps: auditData.hasHttps,
              hasMobileViewport: auditData.hasMobileViewport,
              pageTitle: auditData.pageTitle,
              metaDescription: auditData.metaDescription,
              hasHeadingH1: auditData.hasHeadingH1,
              hasCta: auditData.hasCta,
              hasServicesPage: auditData.hasServicesPage,
              hasContactPage: auditData.hasContactPage,
              hasWhatsapp: auditData.hasWhatsapp,
              hasSocialLinks: auditData.hasSocialLinks,
              loadIndicator: auditData.loadIndicator,
              rawAuditJson: JSON.stringify(auditData),
            },
          });

          // Save Technologies
          for (const tech of auditData.technologies) {
            await prisma.leadTechnology.create({
              data: {
                leadId: savedLead.id,
                technology: tech.name,
                evidence: tech.evidence,
                confidence: tech.confidence,
              },
            });
          }

          // Save Opportunities
          for (const opp of auditData.opportunities) {
            await prisma.leadOpportunity.create({
              data: {
                leadId: savedLead.id,
                opportunityType: opp.type,
                description: opp.description,
                evidence: opp.evidence,
                confidence: opp.confidence,
              },
            });
          }

          // Save Socials
          for (const soc of auditData.socials) {
            await prisma.leadSocial.create({
              data: {
                leadId: savedLead.id,
                platform: soc.platform,
                profileUrl: soc.profileUrl,
              },
            });
          }
        } else if (!cand.website) {
          // No website is an explicit opportunity for website development
          await prisma.leadOpportunity.create({
            data: {
              leadId: savedLead.id,
              opportunityType: 'no_website',
              description: 'Business has no publicly discovered website.',
              evidence: 'No official domain or web page found in public registries',
              confidence: 'High',
            },
          });
        }

        processedCount++;
        const currentProgress = Math.min(95, 65 + Math.round((processedCount / qualifiedCandidates.length) * 30));

        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            finalLeadsCount: processedCount,
            progressPercent: currentProgress,
          },
        });
      }

      // Check cancellation before finalizing
      if (await this.isCancelled(campaignId)) {
        return;
      }

      // Final Completion Status (Rule 4: Accurate counts, Completed vs Completed — Partial)
      const finalStatus =
        processedCount >= campaign.quantityRequested ? 'Completed' : 'Completed Partial';

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: finalStatus,
          currentStage: finalStatus,
          progressPercent: 100,
          completedAt: new Date(),
        },
      });

      await this.logEvent(
        campaignId,
        finalStatus,
        `Campaign finished with ${processedCount} qualified leads (Requested: ${campaign.quantityRequested}).`,
        'success'
      );
    } catch (err: any) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'Failed',
          errorMessage: err.message,
          currentStage: 'Failed',
        },
      });
      await this.logEvent(campaignId, 'Failed', `Error: ${err.message}`, 'error');
    } finally {
      this.activeCampaigns.delete(campaignId);
    }
  }
}

export const campaignRunner = new CampaignRunner();
