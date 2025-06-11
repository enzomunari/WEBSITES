// utils/deviceFingerprint.ts - Device fingerprinting for cross-browser/domain user recognition
interface DeviceFingerprint {
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: string;
  doNotTrack: string;
  hardwareConcurrency: string;
  deviceMemory: string;
  colorDepth: string;
  pixelRatio: string;
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

// Generate a unique device fingerprint
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server_' + Math.random().toString(36).substr(2, 9);
  }

  try {
    const navWithMemory = navigator as NavigatorWithMemory;
    
    const fingerprint: DeviceFingerprint = {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled.toString(),
      doNotTrack: navigator.doNotTrack || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency?.toString() || 'unknown',
      deviceMemory: navWithMemory.deviceMemory?.toString() || 'unknown',
      colorDepth: screen.colorDepth.toString(),
      pixelRatio: window.devicePixelRatio.toString()
    };

    // Create a hash from the fingerprint
    const fingerprintString = Object.values(fingerprint).join('|');
    const hash = simpleHash(fingerprintString);
    
    console.log('🔍 Device fingerprint generated:', {
      raw: fingerprint,
      hash: hash
    });
    
    return hash;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    return 'fallback_' + Math.random().toString(36).substr(2, 9);
  }
}

// Simple hash function
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return 'device_' + Math.abs(hash).toString(36);
}

// Storage key that works across domains
export function getUniversalStorageKey(): string {
  const deviceId = generateDeviceFingerprint();
  return `nudeet_user_${deviceId}`;
}

// Cross-domain storage using multiple methods
export function setUniversalUserData(data: Record<string, unknown>): void {
  const key = getUniversalStorageKey();
  const dataString = JSON.stringify(data);
  
  try {
    // Method 1: localStorage
    localStorage.setItem(key, dataString);
    
    // Method 2: sessionStorage as backup
    sessionStorage.setItem(key, dataString);
    
    // Method 3: Cookie as fallback (for cross-domain)
    document.cookie = `${key}=${encodeURIComponent(dataString)}; path=/; max-age=31536000; SameSite=Lax`;
    
    console.log('💾 Universal user data saved with key:', key);
  } catch (error) {
    console.error('Error saving universal user data:', error);
  }
}

export function getUniversalUserData(): Record<string, unknown> | null {
  const key = getUniversalStorageKey();
  
  try {
    // Try localStorage first
    let data = localStorage.getItem(key);
    if (data) {
      console.log('📖 User data loaded from localStorage');
      return JSON.parse(data) as Record<string, unknown>;
    }
    
    // Try sessionStorage
    data = sessionStorage.getItem(key);
    if (data) {
      console.log('📖 User data loaded from sessionStorage');
      const parsedData = JSON.parse(data) as Record<string, unknown>;
      // Restore to localStorage
      localStorage.setItem(key, data);
      return parsedData;
    }
    
    // Try cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === key && value) {
        console.log('📖 User data loaded from cookie');
        const parsedData = JSON.parse(decodeURIComponent(value)) as Record<string, unknown>;
        // Restore to localStorage
        localStorage.setItem(key, JSON.stringify(parsedData));
        return parsedData;
      }
    }
    
    console.log('📖 No existing user data found');
    return null;
  } catch (error) {
    console.error('Error loading universal user data:', error);
    return null;
  }
}

// Sync data across all storage methods
export function syncUniversalUserData(): void {
  const data = getUniversalUserData();
  if (data) {
    setUniversalUserData(data);
  }
}