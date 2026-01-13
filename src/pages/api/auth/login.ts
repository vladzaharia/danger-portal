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
    (function() {
      try {
        // Robust storage: store in all three mechanisms
        const codeVerifier = ${JSON.stringify(codeVerifier)};
        const state = ${JSON.stringify(state)};

        // Store in sessionStorage
        try {
          sessionStorage.setItem('pkce_code_verifier', codeVerifier);
          sessionStorage.setItem('pkce_state', state);
        } catch (e) {
          console.warn('sessionStorage failed:', e);
        }

        // Store in localStorage
        try {
          localStorage.setItem('pkce_code_verifier', codeVerifier);
          localStorage.setItem('pkce_state', state);
        } catch (e) {
          console.warn('localStorage failed:', e);
        }

        // Store in cookies (10 minute expiry)
        try {
          document.cookie = 'pkce_code_verifier=' + encodeURIComponent(codeVerifier) + '; path=/; max-age=600; SameSite=Lax';
          document.cookie = 'pkce_state=' + encodeURIComponent(state) + '; path=/; max-age=600; SameSite=Lax';
        } catch (e) {
          console.warn('cookie storage failed:', e);
        }

        console.log('PKCE parameters stored in all storage mechanisms');
        console.log('Code verifier length:', codeVerifier.length);
        console.log('State:', state);

        // Small delay to ensure storage is written
        setTimeout(function() {
          window.location.href = ${JSON.stringify(authUrl.toString())};
        }, 100);
      } catch (error) {
        console.error('Error storing PKCE parameters:', error);
        alert('Error during login initialization. Please try again.');
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
  } catch (error) {
    console.error('Login error:', error);
    return new Response('Authentication error', { status: 500 });
  }
};

