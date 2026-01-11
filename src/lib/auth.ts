import * as client from 'openid-client';

// PocketID configuration
const POCKETID_ISSUER = process.env.POCKETID_ISSUER || 'https://id.danger.direct';
const CLIENT_ID = process.env.CLIENT_ID || 'danger-portal';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://danger.direct/api/auth/callback';

// Session cookie name
export const SESSION_COOKIE_NAME = 'danger_portal_session';

// Initialize OIDC configuration
let configPromise: Promise<client.Configuration> | null = null;

export async function getOIDCConfig(): Promise<client.Configuration> {
  if (!configPromise) {
    configPromise = client.discovery(
      new URL(POCKETID_ISSUER),
      CLIENT_ID,
      CLIENT_SECRET
    );
  }
  return configPromise;
}

// Generate PKCE code verifier and challenge
export function generatePKCE() {
  const codeVerifier = client.randomPKCECodeVerifier();
  return {
    codeVerifier,
    codeChallenge: client.calculatePKCECodeChallenge(codeVerifier)
  };
}

// Generate random state
export function generateState(): string {
  return client.randomState();
}

// Build authorization URL
export async function buildAuthorizationUrl(
  codeChallenge: string,
  state: string
): Promise<URL> {
  const config = await getOIDCConfig();
  
  const parameters: Record<string, string> = {
    redirect_uri: REDIRECT_URI,
    scope: 'openid profile email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state
  };

  return client.buildAuthorizationUrl(config, parameters);
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  currentUrl: URL,
  codeVerifier: string,
  expectedState: string
): Promise<client.TokenEndpointResponse> {
  const config = await getOIDCConfig();
  
  return await client.authorizationCodeGrant(
    config,
    currentUrl,
    {
      pkceCodeVerifier: codeVerifier,
      expectedState
    }
  );
}

// Get ID token claims from token response
// The authorizationCodeGrant already validates the ID token
export function getIdTokenClaims(tokens: client.TokenEndpointResponse): client.IDToken {
  if (!tokens.id_token) {
    throw new Error('No ID token in response');
  }

  // The ID token claims are already validated and available in the response
  // We need to decode the JWT to get the claims
  const parts = tokens.id_token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid ID token format');
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  return payload as client.IDToken;
}

// Fetch user info
export async function fetchUserInfo(
  accessToken: string
): Promise<client.UserInfoResponse> {
  const config = await getOIDCConfig();
  
  return await client.fetchUserInfo(config, accessToken);
}

// Refresh access token
export async function refreshAccessToken(
  refreshToken: string
): Promise<client.TokenEndpointResponse> {
  const config = await getOIDCConfig();
  
  return await client.refreshTokenGrant(config, refreshToken);
}

// Revoke token
export async function revokeToken(
  token: string,
  tokenTypeHint?: 'access_token' | 'refresh_token'
): Promise<void> {
  const config = await getOIDCConfig();
  
  await client.revoke(config, token, tokenTypeHint);
}

// Session data interface
export interface SessionData {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  expiresAt: number;
  user: {
    sub: string;
    email?: string;
    name?: string;
  };
}

// Create session data from tokens
export async function createSessionData(
  tokens: client.TokenEndpointResponse
): Promise<SessionData> {
  const idTokenClaims = getIdTokenClaims(tokens);

  // Calculate expiration time
  const expiresIn = tokens.expires_in || 3600;
  const expiresAt = Date.now() + (expiresIn * 1000);

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token!,
    expiresAt,
    user: {
      sub: idTokenClaims.sub,
      email: idTokenClaims.email as string | undefined,
      name: idTokenClaims.name as string | undefined
    }
  };
}

