import type { APIRoute } from 'astro';
import { exchangeCodeForTokens, createSessionData, SESSION_COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { callbackUrl, codeVerifier, expectedState } = body;

    if (!callbackUrl || !codeVerifier || !expectedState) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse the full callback URL with all parameters from PocketID
    const url = new URL(callbackUrl);

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(
      url,
      codeVerifier,
      expectedState
    );

    // Create session data
    const sessionData = await createSessionData(tokens);

    // Determine if we're in a secure context
    const isSecure = url.protocol === 'https:';

    // Store session in HTTP-only cookie
    cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Also set a client-accessible cookie for client-side checks
    cookies.set('authenticated', 'true', {
      path: '/',
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Complete auth error:', error);
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

