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
        // Robust retrieval: try all storage mechanisms with fallback
        function getCookie(name) {
          try {
            const nameEQ = encodeURIComponent(name) + '=';
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
              cookie = cookie.trim();
              if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
              }
            }
          } catch (e) {
            console.warn('Failed to get cookie:', e);
          }
          return null;
        }

        function robustGet(key) {
          // Try sessionStorage first
          try {
            const value = sessionStorage.getItem(key);
            if (value) return value;
          } catch (e) {
            console.warn('sessionStorage get failed:', e);
          }

          // Try localStorage
          try {
            const value = localStorage.getItem(key);
            if (value) return value;
          } catch (e) {
            console.warn('localStorage get failed:', e);
          }

          // Try cookie
          try {
            const value = getCookie(key);
            if (value) return value;
          } catch (e) {
            console.warn('cookie get failed:', e);
          }

          return null;
        }

        function robustRemove(key) {
          try { sessionStorage.removeItem(key); } catch (e) {}
          try { localStorage.removeItem(key); } catch (e) {}
          try { document.cookie = key + '=; path=/; max-age=0'; } catch (e) {}
        }

        // Get PKCE parameters from any available storage
        const codeVerifier = robustGet('pkce_code_verifier');
        const expectedState = robustGet('pkce_state');

        console.log('Retrieved PKCE parameters:', {
          hasCodeVerifier: !!codeVerifier,
          hasState: !!expectedState,
          codeVerifierLength: codeVerifier ? codeVerifier.length : 0
        });

        // Clear from all storage mechanisms
        robustRemove('pkce_code_verifier');
        robustRemove('pkce_state');

        if (!codeVerifier || !expectedState) {
          console.error('Missing PKCE parameters after checking all storage mechanisms');
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
          const data = await response.json();

          // Save session data to all storage mechanisms for redundancy
          if (data.sessionData) {
            const sessionJson = JSON.stringify(data.sessionData);

            // sessionStorage
            try {
              sessionStorage.setItem('danger_portal_session', sessionJson);
            } catch (e) {
              console.warn('Failed to save to sessionStorage:', e);
            }

            // localStorage
            try {
              localStorage.setItem('danger_portal_session', sessionJson);
            } catch (e) {
              console.warn('Failed to save to localStorage:', e);
            }

            // cookie (1 hour expiry)
            try {
              document.cookie = 'danger_portal_session=' + encodeURIComponent(sessionJson) + '; path=/; max-age=3600; SameSite=Lax';
            } catch (e) {
              console.warn('Failed to save to cookie:', e);
            }
          }

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

