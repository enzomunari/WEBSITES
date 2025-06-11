// Unified User Storage System - Cross-site user management
interface UnifiedUserData {
  userId: string
  deviceId: string
  credits: number
  lastFreeTrialDate: string | null
  firstVisitDate: string
  lastVisitDate: string
  totalGenerations: number
  totalFreeTrialsUsed: number
  isBlocked: boolean
  sitesUsed: string[]
  lastSyncDate: string
  migrated?: boolean
}

// Configuration
const SYNC_API_ENDPOINT = '/api/shared-user'
const FREE_TRIAL_COOLDOWN_HOURS = 24
const FREE_TRIAL_CREDITS = 3

// Site detection
function getCurrentSite(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname.includes('nudeet')) return 'nudeet'
    if (hostname.includes('deeplab')) return 'deeplab'
    if (hostname.includes('localhost:3000')) return 'nudeet'
    if (hostname.includes('localhost:3001')) return 'deeplab'
  }
  return 'deeplab' // Default for deeplab
}

// FIXED: Consistent device fingerprinting matching existing users
function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server_' + Date.now()
  
  // Use the EXACT same logic as your existing users
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  // Simple hash function (SAME as original)
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return 'device_' + Math.abs(hash).toString(36)
}

// FIXED: Force use existing user with matching device ID
async function findExistingUserByDevice(deviceId: string): Promise<UnifiedUserData | null> {
  try {
    const response = await fetch(`${SYNC_API_ENDPOINT}?deviceId=${deviceId}&_t=${Date.now()}`)
    if (response.ok) {
      const userData = await response.json()
      if (userData && userData.userId && !userData.error) {
        console.log('✅ Found existing user by device ID:', userData.userId, 'Credits:', userData.credits)
        return userData
      }
    }
  } catch (error) {
    console.log('⚠️ Could not check for existing user')
  }
  return null
}

// CRITICAL: Check localStorage for existing user mapping
function getStoredUserData(): UnifiedUserData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('unified_user_data')
    if (stored) {
      const userData = JSON.parse(stored)
      console.log('📋 Found stored user data:', userData.userId, 'Credits:', userData.credits)
      return userData
    }
  } catch (error) {
    console.warn('Failed to parse stored user data')
  }
  return null
}

// Sync with server
async function syncWithServer(userData: UnifiedUserData): Promise<UnifiedUserData> {
  try {
    const currentSite = getCurrentSite()
    
    if (!userData.sitesUsed.includes(currentSite)) {
      userData.sitesUsed.push(currentSite)
    }
    
    userData.lastSyncDate = new Date().toISOString()
    userData.lastVisitDate = new Date().toISOString()
    
    console.log('🔄 Syncing with server...', userData.userId, 'Credits:', userData.credits)
    
    const response = await fetch(SYNC_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync',
        userData,
        site: currentSite
      })
    })
    
    if (response.ok) {
      const syncedData = await response.json()
      localStorage.setItem('unified_user_data', JSON.stringify(syncedData))
      console.log('✅ Synced successfully:', {
        userId: syncedData.userId,
        credits: syncedData.credits,
        sitesUsed: syncedData.sitesUsed
      })
      return syncedData
    } else {
      console.warn('⚠️ Server sync failed, using local data')
      return userData
    }
  } catch (error) {
    console.error('❌ Sync error:', error)
    return userData
  }
}

// MAIN FUNCTION: Load unified user data with priority order
export async function loadUnifiedUserData(): Promise<UnifiedUserData> {
  console.log('📋 Loading unified user data...')
  
  const deviceId = generateDeviceFingerprint()
  const now = new Date().toISOString()
  
  // PRIORITY 1: Check stored user data first
  const storedUser = getStoredUserData()
  if (storedUser && storedUser.deviceId === deviceId) {
    console.log('🎯 Using stored user with matching device:', storedUser.userId)
    return await syncWithServer(storedUser)
  }
  
  // PRIORITY 2: Find existing user by device ID on server
  const existingUser = await findExistingUserByDevice(deviceId)
  if (existingUser) {
    console.log('🎯 Using existing server user:', existingUser.userId)
    localStorage.setItem('unified_user_data', JSON.stringify(existingUser))
    return await syncWithServer(existingUser)
  }
  
  // PRIORITY 3: Check if stored user exists on server (different device ID scenario)
  if (storedUser) {
    console.log('🔄 Attempting to sync stored user with different device ID:', storedUser.userId)
    return await syncWithServer(storedUser)
  }
  
  // LAST RESORT: Create new user
  console.log('👤 Creating new unified user for device:', deviceId)
  const userData: UnifiedUserData = {
    userId: `user_${Date.now()}_${deviceId}`,
    deviceId,
    credits: 0,
    lastFreeTrialDate: null,
    firstVisitDate: now,
    lastVisitDate: now,
    totalGenerations: 0,
    totalFreeTrialsUsed: 0,
    isBlocked: false,
    sitesUsed: [getCurrentSite()],
    lastSyncDate: now
  }
  
  return await syncWithServer(userData)
}

// NEW: Force refresh user data from server (bypass all caches)
export async function refreshUserData(): Promise<UnifiedUserData> {
  console.log('🔄 Force refreshing user data from server...')
  
  const deviceId = generateDeviceFingerprint()
  
  try {
    // Clear localStorage cache first
    localStorage.removeItem('unified_user_data')
    
    // Force check server
    const response = await fetch(`${SYNC_API_ENDPOINT}?deviceId=${deviceId}&_t=${Date.now()}`)
    if (response.ok) {
      const serverData = await response.json()
      if (serverData && serverData.userId && !serverData.error) {
        console.log('✅ Force refreshed from server:', serverData.userId, 'Credits:', serverData.credits)
        localStorage.setItem('unified_user_data', JSON.stringify(serverData))
        return serverData
      }
    }
  } catch (error) {
    console.error('❌ Force refresh failed:', error)
  }
  
  // Fall back to regular load if force refresh fails
  return await loadUnifiedUserData()
}

// Credit management functions
export async function addUnifiedCredits(amount: number): Promise<UnifiedUserData> {
  console.log(`💎 Adding ${amount} credits...`)
  const userData = await loadUnifiedUserData()
  userData.credits += amount
  const syncedData = await syncWithServer(userData)
  console.log(`✅ Added ${amount} credits. New total: ${syncedData.credits}`)
  return syncedData
}

export async function useUnifiedCredit(): Promise<{ success: boolean; userData: UnifiedUserData }> {
  const userData = await loadUnifiedUserData()
  
  if (userData.credits <= 0) {
    console.log('❌ Insufficient credits')
    return { success: false, userData }
  }
  
  userData.credits -= 1
  userData.totalGenerations += 1
  const syncedData = await syncWithServer(userData)
  console.log(`💸 Used 1 credit. Remaining: ${syncedData.credits}`)
  
  return { success: true, userData: syncedData }
}

// Free trial functions
export function canUseFreeTrial(userData: UnifiedUserData): boolean {
  if (!userData.lastFreeTrialDate) return true
  
  const lastTrial = new Date(userData.lastFreeTrialDate)
  const now = new Date()
  const hoursSinceLastTrial = (now.getTime() - lastTrial.getTime()) / (1000 * 60 * 60)
  
  return hoursSinceLastTrial >= FREE_TRIAL_COOLDOWN_HOURS
}

export async function markFreeTrialUsed(): Promise<UnifiedUserData> {
  const userData = await loadUnifiedUserData()
  userData.lastFreeTrialDate = new Date().toISOString()
  userData.totalFreeTrialsUsed += 1
  userData.credits += FREE_TRIAL_CREDITS
  return await syncWithServer(userData)
}

export function canUseFreeTrialToday(userData: UnifiedUserData): boolean {
  return canUseFreeTrial(userData)
}

export function getTimeUntilNextFreeTrial(userData: UnifiedUserData): string {
  if (!userData.lastFreeTrialDate) return "Available now"
  
  const lastTrial = new Date(userData.lastFreeTrialDate)
  const nextTrial = new Date(lastTrial.getTime() + (FREE_TRIAL_COOLDOWN_HOURS * 60 * 60 * 1000))
  const now = new Date()
  
  if (now >= nextTrial) return "Available now"
  
  const timeDiff = nextTrial.getTime() - now.getTime()
  const hours = Math.floor(timeDiff / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours}h ${minutes}m`
}