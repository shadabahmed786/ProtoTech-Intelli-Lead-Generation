import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();
    const name = body.name?.trim();
    const requestedRole = body.role?.trim() || 'Member';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const totalProfiles = await prisma.profile.count();
    let profile = await prisma.profile.findUnique({
      where: { email },
    });

    if (!profile) {
      // First user registered becomes Admin automatically
      const role = totalProfiles === 0 ? 'Admin' : requestedRole;
      const userName = name || email.split('@')[0];
      const pwdHash = password ? hashPassword(password) : null;

      profile = await prisma.profile.create({
        data: {
          email,
          name: userName,
          role,
          passwordHash: pwdHash,
        },
      });
    } else {
      // Existing profile
      if (profile.passwordHash && password) {
        const isValid = verifyPassword(password, profile.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
      } else if (!profile.passwordHash && password) {
        // First time setting password on initial seeded account
        await prisma.profile.update({
          where: { id: profile.id },
          data: { passwordHash: hashPassword(password) },
        });
      }
    }

    const token = createSessionToken({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      avatarUrl: profile.avatarUrl,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
