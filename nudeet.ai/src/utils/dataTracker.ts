// utils/dataTracker.ts - Fixed TypeScript types for client-side data tracking
import { loadUserData } from './userStorage'

// Define proper types instead of any
interface TrackingMetadata {
  [key: string]: string | number | boolean;
}

interface UserTrackingData {
  userId: string;
  deviceId: string;
  credits: number;
  lastFreeTrialDate: string | null;
  firstVisitDate: string;
  lastVisitDate: string;
  totalGenerations: number;
  totalFreeTrialsUsed: number;
}

interface GenerationTrackingData {
  userId: string;
  deviceId: string;
  pose: string;
  gender: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

interface EventTrackingData {
  userId: string;
  deviceId: string;
  action: string;
  timestamp: string;
  metadata?: TrackingMetadata;
}

// Track user data to centralized storage
export async function trackUser(userData: UserTrackingData): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const response = await fetch('/api/track/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      console.warn('Failed to track user data:', response.statusText);
    }
  } catch (error) {
    console.warn('Error tracking user data:', error);
  }
}

// Alias for backward compatibility
export const trackUserData = trackUser;

// Track generation events
export async function trackGeneration(generationData: GenerationTrackingData): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const response = await fetch('/api/track/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generationData)
    });

    if (!response.ok) {
      console.warn('Failed to track generation:', response.statusText);
    }
  } catch (error) {
    console.warn('Error tracking generation:', error);
  }
}

// Track user events (actions, clicks, etc.)
export async function trackEvent(action: string, metadata?: TrackingMetadata): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Get current user data
    const userData = await loadUserData();
    
    const eventData: EventTrackingData = {
      userId: userData.userId,
      deviceId: userData.deviceId,
      action,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    const response = await fetch('/api/track/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      console.warn('Failed to track event:', response.statusText);
    }
  } catch (error) {
    console.warn('Error tracking event:', error);
  }
}

// Alias for backward compatibility
export const trackUserEvent = trackEvent;

// Analytics integration helper
export async function initializeTracking(): Promise<void> {
  try {
    const userData = await loadUserData();
    await trackEvent('session_start', {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer || 'direct'
    });
    
    console.log('📊 Tracking initialized for user:', userData.userId);
  } catch (error) {
    console.warn('Failed to initialize tracking:', error);
  }
}

// Export for use in components
export { loadUserData };