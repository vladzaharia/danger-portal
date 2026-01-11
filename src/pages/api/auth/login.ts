import type { APIRoute } from 'astro';
import { generatePKCE, generateState, buildAuthorizationUrl } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = generateState();

    // Build authorization URL
    const authUrl = await buildAuthorizationUrl(await codeChallenge, state);

    // Return HTML that stores PKCE in sessionStorage and redirects
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to PocketID...</p>
  <script>
    sessionStorage.setItem('pkce_code_verifier', ${JSON.stringify(codeVerifier)});
    sessionStorage.setItem('pkce_state', ${JSON.stringify(state)});
    window.location.href = ${JSON.stringify(authUrl.toString())};
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
  } catch (error) {
    console.error('Login error:', error);
    return new Response('Authentication error', { status: 500 });
  }
};

