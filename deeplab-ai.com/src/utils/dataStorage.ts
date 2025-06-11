// utils/dataStorage.ts - Data storage utilities for tracking and admin
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
  style: string
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

// File paths
const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const GENERATIONS_FILE = path.join(DATA_DIR, 'generations.json')
const EVENTS_FILE = path.join(DATA_DIR, 'events.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create data directory:', error)
  }
}

// Read JSON file with error handling
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return defaultValue
  }
}

// Write JSON file with error handling
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await ensureDataDir()
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Failed to write ${filePath}:`, error)
  }
}

// Save user data
export async function saveUser(userData: UserData): Promise<void> {
  const users = await readJsonFile<Record<string, UserData>>(USERS_FILE, {})
  
  // Add site information
  const updatedUserData = {
    ...userData,
    site: 'deeplab',
    lastVisitDate: new Date().toISOString()
  }
  
  users[userData.userId] = updatedUserData
  await writeJsonFile(USERS_FILE, users)
  console.log('💾 User data saved:', userData.userId)
}

// Log generation event
export async function logGeneration(generationData: Omit<GenerationEvent, 'id' | 'site'>): Promise<void> {
  const generations = await readJsonFile<GenerationEvent[]>(GENERATIONS_FILE, [])
  
  const newGeneration: GenerationEvent = {
    ...generationData,
    id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    site: 'deeplab',
    timestamp: generationData.timestamp || new Date().toISOString()
  }
  
  generations.push(newGeneration)
  
  // Keep only last 1000 generations
  if (generations.length > 1000) {
    generations.splice(0, generations.length - 1000)
  }
  
  await writeJsonFile(GENERATIONS_FILE, generations)
  console.log('📊 Generation logged:', newGeneration.id)
}

// Log user event
export async function logUserEvent(eventData: Omit<UserEvent, 'id' | 'site'>): Promise<void> {
  const events = await readJsonFile<UserEvent[]>(EVENTS_FILE, [])
  
  const newEvent: UserEvent = {
    ...eventData,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    site: 'deeplab',
    timestamp: eventData.timestamp || new Date().toISOString()
  }
  
  events.push(newEvent)
  
  // Keep only last 5000 events
  if (events.length > 5000) {
    events.splice(0, events.length - 5000)
  }
  
  await writeJsonFile(EVENTS_FILE, events)
  console.log('📝 Event logged:', newEvent.action)
}

// Get all users
export async function getUsers(): Promise<Record<string, UserData>> {
  return await readJsonFile<Record<string, UserData>>(USERS_FILE, {})
}

// Get single user
export async function getUser(userId: string): Promise<UserData | null> {
  const users = await getUsers()
  return users[userId] || null
}

// Update user credits
export async function updateUserCredits(userId: string, credits: number): Promise<boolean> {
  try {
    const users = await getUsers()
    if (users[userId]) {
      users[userId].credits = credits
      users[userId].lastSyncDate = new Date().toISOString()
      await writeJsonFile(USERS_FILE, users)
      return true
    }
    return false
  } catch (error) {
    console.error('Error updating user credits:', error)
    return false
  }
}

// Block/unblock user
export async function blockUser(userId: string, blocked: boolean): Promise<boolean> {
  try {
    const users = await getUsers()
    if (users[userId]) {
      users[userId].isBlocked = blocked
      users[userId].lastSyncDate = new Date().toISOString()
      await writeJsonFile(USERS_FILE, users)
      return true
    }
    return false
  } catch (error) {
    console.error('Error blocking user:', error)
    return false
  }
}

// Get generations
export async function getGenerations(): Promise<GenerationEvent[]> {
  return await readJsonFile<GenerationEvent[]>(GENERATIONS_FILE, [])
}

// Get user events
export async function getUserEvents(): Promise<UserEvent[]> {
  return await readJsonFile<UserEvent[]>(EVENTS_FILE, [])
}

// Get site statistics
export async function getStats(): Promise<{
  totalUsers: number
  totalGenerations: number
  totalSuccessfulGenerations: number
  totalFailedGenerations: number
  totalCreditsUsed: number
  lastUpdated: string
}> {
  const users = await getUsers()
  const generations = await getGenerations()
  
  const totalUsers = Object.keys(users).length
  const totalGenerations = generations.length
  const successfulGenerations = generations.filter(g => g.success).length
  const failedGenerations = generations.filter(g => !g.success).length
  const totalCreditsUsed = Object.values(users).reduce((sum, user) => sum + user.totalGenerations, 0)
  
  return {
    totalUsers,
    totalGenerations,
    totalSuccessfulGenerations: successfulGenerations,
    totalFailedGenerations: failedGenerations,
    totalCreditsUsed,
    lastUpdated: new Date().toISOString()
  }
}

// Clean old data
export async function cleanOldData(): Promise<void> {
  try {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    // Clean old generations
    const generations = await getGenerations()
    const recentGenerations = generations.filter(g => new Date(g.timestamp) > oneMonthAgo)
    await writeJsonFile(GENERATIONS_FILE, recentGenerations)
    
    // Clean old events
    const events = await getUserEvents()
    const recentEvents = events.filter(e => new Date(e.timestamp) > oneMonthAgo)
    await writeJsonFile(EVENTS_FILE, recentEvents)
    
    console.log('🧹 Old data cleaned')
  } catch (error) {
    console.error('Error cleaning old data:', error)
  }
}