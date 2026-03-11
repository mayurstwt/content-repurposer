// proxy.ts  (or src/proxy.ts)
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  // Optional: Customize if needed later (e.g. publicRoutes: ['/'])
});

export const config = {
  matcher: [
    // Apply to API routes and skip static/_next files
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Or more specific: '/(api|trpc)(.*)'
  ],
};