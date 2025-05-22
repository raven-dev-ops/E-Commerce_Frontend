import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;

  // If the user is not authenticated and is trying to access the /cart route,
  // redirect them to the login page.
  if (!accessToken && request.nextUrl.pathname === '/cart') {
    const loginUrl = new URL('/auth/login', request.url);
    // You might want to add a 'next' query parameter to redirect back to the cart after login
    // loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Continue to the next middleware or the requested page
  return NextResponse.next();
}

export const config = {
  // Match all routes except API routes, static files, images, favicons, and auth pages
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/register).*)', '/cart'],
};