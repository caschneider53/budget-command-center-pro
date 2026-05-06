import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protect all routes under /(app) - dashboard, budget, transactions, goals, ai
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/budget(.*)',
  '/transactions(.*)',
  '/goals(.*)',
  '/ai(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
