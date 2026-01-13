/**
 * Robust storage wrapper that stores data in cookies, localStorage, and sessionStorage
 * with automatic fallback when retrieving data.
 */

// Cookie utilities
function setCookie(name: string, value: string, maxAge: number = 3600): void {
  try {
    const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = cookie;
  } catch (error) {
    console.warn(`Failed to set cookie ${name}:`, error);
  }
}

function getCookie(name: string): string | null {
  try {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
  } catch (error) {
    console.warn(`Failed to get cookie ${name}:`, error);
  }
  return null;
}

function deleteCookie(name: string): void {
  try {
    document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;
  } catch (error) {
    console.warn(`Failed to delete cookie ${name}:`, error);
  }
}

// Storage wrapper class
export class RobustStorage {
  /**
   * Store a value in all available storage mechanisms
   */
  static set(key: string, value: string, maxAge: number = 3600): void {
    const errors: string[] = [];

    // Try localStorage
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      errors.push(`localStorage: ${error}`);
    }

    // Try sessionStorage
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      errors.push(`sessionStorage: ${error}`);
    }

    // Try cookie
    try {
      setCookie(key, value, maxAge);
    } catch (error) {
      errors.push(`cookie: ${error}`);
    }

    if (errors.length === 3) {
      console.error(`Failed to store ${key} in all storage mechanisms:`, errors);
      throw new Error(`Failed to store ${key}: All storage mechanisms failed`);
    } else if (errors.length > 0) {
      console.warn(`Partial storage failure for ${key}:`, errors);
    }
  }

  /**
   * Retrieve a value from any available storage mechanism
   * Tries in order: sessionStorage -> localStorage -> cookie
   */
  static get(key: string): string | null {
    // Try sessionStorage first (most recent)
    try {
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    } catch (error) {
      console.warn(`Failed to read from sessionStorage for ${key}:`, error);
    }

    // Try localStorage
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        // Sync back to sessionStorage if found
        try {
          sessionStorage.setItem(key, value);
        } catch (e) {
          // Ignore sync errors
        }
        return value;
      }
    } catch (error) {
      console.warn(`Failed to read from localStorage for ${key}:`, error);
    }

    // Try cookie as last resort
    try {
      const value = getCookie(key);
      if (value !== null) {
        // Sync back to other storage mechanisms if found
        try {
          sessionStorage.setItem(key, value);
        } catch (e) {
          // Ignore sync errors
        }
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          // Ignore sync errors
        }
        return value;
      }
    } catch (error) {
      console.warn(`Failed to read from cookie for ${key}:`, error);
    }

    return null;
  }

  /**
   * Remove a value from all storage mechanisms
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage for ${key}:`, error);
    }

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from sessionStorage for ${key}:`, error);
    }

    try {
      deleteCookie(key);
    } catch (error) {
      console.warn(`Failed to remove cookie for ${key}:`, error);
    }
  }

  /**
   * Store a JSON object in all storage mechanisms
   */
  static setJSON(key: string, value: any, maxAge: number = 3600): void {
    const json = JSON.stringify(value);
    this.set(key, json, maxAge);
  }

  /**
   * Retrieve and parse a JSON object from any storage mechanism
   */
  static getJSON<T = any>(key: string): T | null {
    const value = this.get(key);
    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse JSON for ${key}:`, error);
      return null;
    }
  }
}

