// utils/sharedDataStorage.ts - Shared data storage utilities across both sites
import fs from 'fs/promises'
import path from 'path'

// Interfaces
interface UserData {
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
  ipAddress?: string
}

interface GenerationEvent {
  id: string
  userId: string
  deviceId: string
  style?: string
  pose?: string
  gender: string
  success: boolean
  error?: string
  timestamp: string
  ipAddress?: string
  site: string
}

interface UserEvent {
  id: string
  userId: string
  deviceId: string
  action: string
  timestamp: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  site: string
}

// File paths - Try shared directory first, fall back to local
const SHARED_DATA_DIR = 'C:\\WEBSITES\\shared_data'
const LOCAL_DATA_DIR = path.join(process.cwd(), 'data')

async function getDataDir(): Promise<string> {
  try {
    await fs.access(SHARED_DATA_DIR)
    return SHARED_DATA_DIR
  } catch {
    return LOCAL_DATA_DIR
  }
}

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = await getDataDir()
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    console.error('Failed to create data directory:', error)
  }
}

// Read JSON file with error handling
async function readJsonFile<T>(fileName: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir()
    const dataDir = await getDataDir()
    const filePath = path.join(dataDir, fileName)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return defaultValue
  }
}

// Write JSON file with error handling
async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  try {
    await ensureDataDir()
    const dataDir = await getDataDir()
    const filePath = path.join(dataDir, fileName)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Failed to write ${fileName}:`, error)
  }
}

// DIRECT DATABASE ACCESS FUNCTIONS (No fetch calls)

// Read unified users database directly
async function readUnifiedUsers(): Promise<Record<string, UserData>> {
  try {
    const dataDir = await getDataDir()
    const filePath = path.join(dataDir, 'unified_users.json')
    const data = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.users || parsed
  } catch {
    console.log('📄 Creating new unified users database')
    return {}
  }
}

// Write unified users database directly
async function writeUnifiedUsers(users: Record<string, UserData>): Promise<void> {
  try {
    const dataDir = await getDataDir()
    const filePath = path.join(dataDir, 'unified_users.json')
    const data = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      users: users
    }
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    console.log('💾 Unified users database updated directly')
  } catch (error) {
    console.error('Failed to write unified users:', error)
  }
}

// Get all users from unified database
export async function getUsers(): Promise<Record<string, UserData>> {
  return await readUnifiedUsers()
}

// Get generations from both sites
export async function getGenerations(): Promise<GenerationEvent[]> {
  // Try to read from both sites' generation files
  const deeplabGenerations = await readJsonFile<GenerationEvent[]>('generations.json', [])
  
  // Try to read from nudeet site
  let nudeetGenerations: GenerationEvent[] = []
  try {
    const nudeetDataDir = 'C:\\WEBSITES\\nudeet.ai\\data'
    const nudeetFile = path.join(nudeetDataDir, 'generations.json')
    const data = await fs.readFile(nudeetFile, 'utf-8')
    nudeetGenerations = JSON.parse(data)
  } catch {
    // Nudeet generations not available
  }
  
  // Combine and sort by timestamp
  const allGenerations = [...deeplabGenerations, ...nudeetGenerations]
  return allGenerations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get user events from both sites
export async function getUserEvents(): Promise<UserEvent[]> {
  // Try to read from both sites' event files
  const deeplabEvents = await readJsonFile<UserEvent[]>('events.json', [])
  
  // Try to read from nudeet site
  let nudeetEvents: UserEvent[] = []
  try {
    const nudeetDataDir = 'C:\\WEBSITES\\nudeet.ai\\data'
    const nudeetFile = path.join(nudeetDataDir, 'events.json')
    const data = await fs.readFile(nudeetFile, 'utf-8')
    nudeetEvents = JSON.parse(data)
  } catch {
    // Nudeet events not available
  }
  
  // Combine and sort by timestamp
  const allEvents = [...deeplabEvents, ...nudeetEvents]
  return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Get site statistics
export async function getSiteStats(site: string): Promise<{
  totalUsers: number
  totalGenerations: number
  totalSuccessfulGenerations: number
  totalFailedGenerations: number
  totalCreditsUsed: number
  lastUpdated: string
}> {
  const users = await getUsers()
  const generations = await getGenerations()
  
  // Filter by site
  const siteUsers = Object.values(users).filter(u => u.sitesUsed.includes(site))
  const siteGenerations = generations.filter(g => g.site === site)
  
  const totalUsers = siteUsers.length
  const totalGenerations = siteGenerations.length
  const successfulGenerations = siteGenerations.filter(g => g.success).length
  const failedGenerations = siteGenerations.filter(g => !g.success).length
  const totalCreditsUsed = siteUsers.reduce((sum, user) => sum + user.totalGenerations, 0)
  
  return {
    totalUsers,
    totalGenerations,
    totalSuccessfulGenerations: successfulGenerations,
    totalFailedGenerations: failedGenerations,
    totalCreditsUsed,
    lastUpdated: new Date().toISOString()
  }
}

// FIXED: Direct database access instead of fetch
export async function updateUserCredits(userId: string, credits: number): Promise<boolean> {
  try {
    const users = await readUnifiedUsers()
    
    if (users[userId]) {
      users[userId].credits = credits
      users[userId].lastSyncDate = new Date().toISOString()
      await writeUnifiedUsers(users)
      console.log(`💎 Direct update: Set credits for ${userId} to ${credits}`)
      return true
    } else {
      console.error(`User ${userId} not found`)
      return false
    }
  } catch (error) {
    console.error('Error updating user credits:', error)
    return false
  }
}

// FIXED: Direct database access instead of fetch
export async function addUserCredits(userId: string, amount: number): Promise<boolean> {
  try {
    const users = await readUnifiedUsers()
    
    if (users[userId]) {
      users[userId].credits += amount
      users[userId].lastSyncDate = new Date().toISOString()
      await writeUnifiedUsers(users)
      console.log(`💎 Direct update: Added ${amount} credits to ${userId}. New total: ${users[userId].credits}`)
      return true
    } else {
      console.error(`User ${userId} not found`)
      return false
    }
  } catch (error) {
    console.error('Error adding user credits:', error)
    return false
  }
}

// FIXED: Direct database access instead of fetch
export async function blockUser(userId: string, blocked: boolean): Promise<boolean> {
  try {
    const users = await readUnifiedUsers()
    
    if (users[userId]) {
      users[userId].isBlocked = blocked
      users[userId].lastSyncDate = new Date().toISOString()
      await writeUnifiedUsers(users)
      console.log(`🚫 Direct update: ${blocked ? 'Blocked' : 'Unblocked'} user ${userId}`)
      return true
    } else {
      console.error(`User ${userId} not found`)
      return false
    }
  } catch (error) {
    console.error('Error blocking user:', error)
    return false
  }
}

// Clean old data
export async function cleanOldData(): Promise<void> {
  try {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    // Clean old generations
    const generations = await readJsonFile<GenerationEvent[]>('generations.json', [])
    const recentGenerations = generations.filter(g => new Date(g.timestamp) > oneMonthAgo)
    await writeJsonFile('generations.json', recentGenerations)
    
    // Clean old events
    const events = await readJsonFile<UserEvent[]>('events.json', [])
    const recentEvents = events.filter(e => new Date(e.timestamp) > oneMonthAgo)
    await writeJsonFile('events.json', recentEvents)
    
    console.log('🧹 Old data cleaned')
  } catch (error) {
    console.error('Error cleaning old data:', error)
  }
}