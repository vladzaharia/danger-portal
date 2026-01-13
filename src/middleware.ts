import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE_NAME, type SessionData } from './lib/auth';

// Protected routes that require authentication
// /services is protected to enforce group-based access control
// /embed remains public for embedding
const PROTECTED_ROUTES: string[] = ['/services'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  // Check if the current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  // Always try to attach session data if available (for non-protected routes too)
  // This allows pages to show user info when authenticated
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME);

  if (sessionCookie && sessionCookie.value) {
    try {
      // Parse session data
      const sessionData: SessionData = JSON.parse(sessionCookie.value);

      // Check if session is not expired
      if (Date.now() < sessionData.expiresAt) {
        // Attach session data to locals for use in pages
        context.locals.session = sessionData;
      } else {
        // Session expired, clear cookie
        cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
      }
    } catch (error) {
      // Invalid session data, clear cookie
      cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    }
  }

  // For protected routes, enforce authentication
  if (isProtectedRoute && !context.locals.session) {
    // No valid session, redirect to login
    // Note: Client-side storage (localStorage/sessionStorage) is checked on the client
    return redirect('/');
  }

  return next();
});

