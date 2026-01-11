import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE_NAME, type SessionData } from './lib/auth';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/services'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  // Check if the current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get session cookie
    const sessionCookie = cookies.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie || !sessionCookie.value) {
      // No session, redirect to login
      return redirect('/');
    }

    try {
      // Parse session data
      const sessionData: SessionData = JSON.parse(sessionCookie.value);
      
      // Check if session is expired
      if (Date.now() >= sessionData.expiresAt) {
        // Session expired, clear cookie and redirect
        cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
        return redirect('/');
      }

      // Attach session data to locals for use in pages
      context.locals.session = sessionData;
    } catch (error) {
      // Invalid session data, clear cookie and redirect
      cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
      return redirect('/');
    }
  }

  return next();
});

