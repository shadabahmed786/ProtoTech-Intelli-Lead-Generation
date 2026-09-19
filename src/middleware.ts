import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets and login
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') || // static files like favicon.ico, images, etc.
    pathname.startsWith('/api/campaigns') && pathname.includes('/process') // allow background processing endpoint
  ) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = req.cookies.get('prototech_session');

  // If no session cookie and visiting a page (not an API route), redirect to /login
  if (!sessionCookie && !pathname.startsWith('/api/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If visiting an API route without a session, let the route handler enforce role/auth
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
