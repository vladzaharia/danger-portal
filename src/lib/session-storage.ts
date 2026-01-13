// Client-side session storage utility
// Manages session data across cookies, localStorage, and sessionStorage

import { RobustStorage } from './storage';

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
  groups: string[];
}

const SESSION_KEY = 'danger_portal_session';

/**
 * Save session data to all available storage mechanisms
 */
export function saveSession(sessionData: SessionData): void {
  if (typeof window === 'undefined') return;

  // Calculate max age in seconds
  const maxAge = Math.floor((sessionData.expiresAt - Date.now()) / 1000);

  // Use RobustStorage to save to all mechanisms
  RobustStorage.setJSON(SESSION_KEY, sessionData, maxAge);
}

/**
 * Get session data from any available storage mechanism
 * Priority: sessionStorage -> localStorage -> cookie
 */
export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null;

  // Use RobustStorage to retrieve from any mechanism
  const sessionData = RobustStorage.getJSON<SessionData>(SESSION_KEY);

  if (sessionData && isSessionValid(sessionData)) {
    return sessionData;
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

  // Use RobustStorage to remove from all mechanisms
  RobustStorage.remove(SESSION_KEY);
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

