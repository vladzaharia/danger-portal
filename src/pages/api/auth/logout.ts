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
    // Robust removal from all storage mechanisms
    function robustRemove(key) {
      try { localStorage.removeItem(key); } catch (e) {}
      try { sessionStorage.removeItem(key); } catch (e) {}
      try { document.cookie = key + '=; path=/; max-age=0'; } catch (e) {}
    }

    // Clear all session-related data
    robustRemove('danger_portal_session');
    robustRemove('authenticated');
    robustRemove('pkce_code_verifier');
    robustRemove('pkce_state');

    console.log('All session data cleared');

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

