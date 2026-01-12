// Client-side session storage utility
// Manages session data across cookies, localStorage, and sessionStorage

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

const SESSION_COOKIE_NAME = 'danger_portal_session';
const SESSION_LOCAL_KEY = 'danger_portal_session';
const SESSION_SESSION_KEY = 'danger_portal_session';

/**
 * Save session data to all available storage mechanisms
 */
export function saveSession(sessionData: SessionData): void {
  if (typeof window === 'undefined') return;

  const sessionJson = JSON.stringify(sessionData);

  // Save to localStorage
  try {
    localStorage.setItem(SESSION_LOCAL_KEY, sessionJson);
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }

  // Save to sessionStorage
  try {
    sessionStorage.setItem(SESSION_SESSION_KEY, sessionJson);
  } catch (e) {
    console.warn('Failed to save to sessionStorage:', e);
  }

  // Save to cookie (as fallback, server sets the main cookie)
  try {
    // Calculate max age in seconds
    const maxAge = Math.floor((sessionData.expiresAt - Date.now()) / 1000);
    document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionJson)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to save to cookie:', e);
  }
}

/**
 * Get session data from any available storage mechanism
 * Priority: cookie -> localStorage -> sessionStorage
 */
export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null;

  // Try cookie first
  try {
    const cookieMatch = document.cookie.split('; ').find(row => row.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (cookieMatch) {
      const sessionJson = decodeURIComponent(cookieMatch.split('=')[1]);
      const sessionData = JSON.parse(sessionJson) as SessionData;
      if (isSessionValid(sessionData)) {
        return sessionData;
      }
    }
  } catch (e) {
    console.warn('Failed to read from cookie:', e);
  }

  // Try localStorage
  try {
    const sessionJson = localStorage.getItem(SESSION_LOCAL_KEY);
    if (sessionJson) {
      const sessionData = JSON.parse(sessionJson) as SessionData;
      if (isSessionValid(sessionData)) {
        return sessionData;
      }
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }

  // Try sessionStorage
  try {
    const sessionJson = sessionStorage.getItem(SESSION_SESSION_KEY);
    if (sessionJson) {
      const sessionData = JSON.parse(sessionJson) as SessionData;
      if (isSessionValid(sessionData)) {
        return sessionData;
      }
    }
  } catch (e) {
    console.warn('Failed to read from sessionStorage:', e);
  }

  return null;
}

/**
 * Check if session data is valid (not expired)
 */
export function isSessionValid(sessionData: SessionData | null): boolean {
  if (!sessionData) return false;
  if (!sessionData.expiresAt) return false;
  return Date.now() < sessionData.expiresAt;
}

/**
 * Clear session data from all storage mechanisms
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  try {
    localStorage.removeItem(SESSION_LOCAL_KEY);
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }

  // Clear sessionStorage
  try {
    sessionStorage.removeItem(SESSION_SESSION_KEY);
  } catch (e) {
    console.warn('Failed to clear sessionStorage:', e);
  }

  // Clear cookie
  try {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`;
  } catch (e) {
    console.warn('Failed to clear cookie:', e);
  }
}

/**
 * Sync session data across all storage mechanisms
 * Useful when one storage has data but others don't
 */
export function syncSession(): void {
  const session = getSession();
  if (session) {
    saveSession(session);
  }
}

