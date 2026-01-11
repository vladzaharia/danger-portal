import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  // Return HTML that reads PKCE from sessionStorage and completes the flow
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <title>Completing authentication...</title>
</head>
<body>
  <p>Completing authentication...</p>
  <script>
    (async () => {
      try {
        // Get PKCE parameters from sessionStorage
        const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
        const expectedState = sessionStorage.getItem('pkce_state');

        // Clear sessionStorage
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');

        if (!codeVerifier || !expectedState) {
          console.error('Missing PKCE parameters');
          window.location.href = '/?error=missing_pkce';
          return;
        }

        // Send PKCE parameters and full callback URL to server endpoint
        const response = await fetch('/api/auth/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callbackUrl: window.location.href,
            codeVerifier,
            expectedState,
          }),
        });

        if (response.ok) {
          window.location.href = '/services';
        } else {
          window.location.href = '/?error=auth_failed';
        }
      } catch (error) {
        console.error('Callback error:', error);
        window.location.href = '/?error=auth_failed';
      }
    })();
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

