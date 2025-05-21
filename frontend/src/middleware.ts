import { withAuth } from 'next-auth/middleware';

export default withAuth({
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/register).*)'],
});