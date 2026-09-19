# Production Multi-Stage Dockerfile for ProtoTech Intelli
FROM node:20-alpine AS base

# Install openssl for Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Stage 3: Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build artifacts and dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Prepare local data directory for persistent SQLite or database
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data /app/.next /app/prisma

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && node_modules/.bin/next start"]
