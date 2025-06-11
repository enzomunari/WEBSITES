// userStorage.ts - Compatibility wrapper for the unified user storage system
// This file provides backward compatibility for existing imports

// Import types
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
}

// Import from the unified system
import { 
  loadUnifiedUserData, 
  addUnifiedCredits, 
  useUnifiedCredit,
  canUseFreeTrial,
  markFreeTrialUsed,
  canUseFreeTrialToday,
  getTimeUntilNextFreeTrial
} from './unifiedUserStorage'

// Export unified functions with backward compatibility names
export { 
  loadUnifiedUserData as loadUserData,
  addUnifiedCredits as addCredits,
  useUnifiedCredit as useCredit,
  canUseFreeTrial,
  markFreeTrialUsed,
  canUseFreeTrialToday,
  getTimeUntilNextFreeTrial
}

// Admin functions for dashboard
export async function updateUserCredits(userId: string, credits: number): Promise<boolean> {
  try {
    const response = await fetch('/api/shared-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'admin_add_credits',
        userId,
        amount: credits
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error updating user credits:', error)
    return false
  }
}

export async function setUserCreditsAdmin(userId: string, credits: number): Promise<boolean> {
  try {
    const response = await fetch('/api/shared-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'admin_set_credits',
        userId,
        credits
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error setting user credits:', error)
    return false
  }
}

export async function getAllUsers() {
  try {
    const response = await fetch('/api/shared-user?action=admin_get_all')
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.error('Error getting all users:', error)
  }
  return {}
}

// Compatibility functions for Nudeet
export async function getNudeetUserData() {
  return await loadUnifiedUserData()
}

export async function canNudeetGenerate(): Promise<boolean> {
  const userData = await loadUnifiedUserData()
  
  if (userData.isBlocked) {
    console.log('❌ User is blocked')
    return false
  }
  
  if (userData.credits > 0) {
    console.log('✅ User has credits:', userData.credits)
    return true
  }
  
  if (canUseFreeTrial(userData)) {
    console.log('✅ User can use free trial')
    return true
  }
  
  console.log('❌ No credits and no free trial available')
  return false
}

// Additional admin functions
export async function blockUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/shared-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'admin_block_user',
        userId,
        blocked: true
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error blocking user:', error)
    return false
  }
}

export async function unblockUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/shared-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'admin_block_user',
        userId,
        blocked: false
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error unblocking user:', error)
    return false
  }
}