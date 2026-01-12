import type { APIRoute } from 'astro';
import { SESSION_COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  // Clear session cookies
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  cookies.delete('authenticated', { path: '/' });

  // Return HTML that clears client-side storage and redirects
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <title>Logging out...</title>
</head>
<body>
  <p>Logging out...</p>
  <script>
    // Clear all storage mechanisms
    try {
      localStorage.removeItem('danger_portal_session');
      localStorage.removeItem('authenticated');
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }

    try {
      sessionStorage.removeItem('danger_portal_session');
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e);
    }

    // Redirect to home page
    window.location.href = '/';
  </script>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
};

