import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

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

// Use absolute shared database path
const SHARED_DB_PATH = 'C:\\WEBSITES\\shared_data\\unified_users.json'

// Fallback to local data directory if shared doesn't exist
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'unified_users.json')

async function getDbPath(): Promise<string> {
  try {
    await fs.access(SHARED_DB_PATH)
    return SHARED_DB_PATH
  } catch {
    // Fall back to local if shared directory not accessible
    await ensureDir(path.dirname(LOCAL_DB_PATH))
    return LOCAL_DB_PATH
  }
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    console.error('Failed to create directory:', error)
  }
}

async function readUnifiedUsers(): Promise<Record<string, UnifiedUserData>> {
  try {
    const dbPath = await getDbPath()
    const data = await fs.readFile(dbPath, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.users || parsed // Handle both formats
  } catch {
    console.log('📄 Creating new unified users database')
    return {}
  }
}

async function writeUnifiedUsers(users: Record<string, UnifiedUserData>): Promise<void> {
  try {
    const dbPath = await getDbPath()
    const data = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      users: users
    }
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2))
    console.log('💾 Unified users database updated:', dbPath)
  } catch (error) {
    console.error('Failed to write unified users:', error)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const deviceId = searchParams.get('deviceId')
  const action = searchParams.get('action')

  if (action === 'admin_get_all') {
    const users = await readUnifiedUsers()
    return NextResponse.json(users)
  }

  if (!deviceId) {
    return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
  }

  try {
    const users = await readUnifiedUsers()
    
    // IMPROVED: Find user by device ID more reliably
    const user = Object.values(users).find(u => u.deviceId === deviceId)
    
    if (user) {
      console.log(`✅ Found user by device ID: ${user.userId} (${deviceId})`)
      return NextResponse.json(user)
    } else {
      console.log(`❌ No user found for device ID: ${deviceId}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error loading user:', error)
    return NextResponse.json({ error: 'Failed to load user' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userData, userId, amount, credits, site, blocked } = body

    const users = await readUnifiedUsers()

    switch (action) {
      case 'sync':
        if (!userData || !userData.userId) {
          return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
        }

        // IMPROVED: Check for existing user with same device ID
        const existingUserWithDevice = Object.values(users).find(u => u.deviceId === userData.deviceId)
        
        let finalUserId = userData.userId
        
        if (existingUserWithDevice && existingUserWithDevice.userId !== userData.userId) {
          // Use the existing user instead of creating a duplicate
          console.log(`🔄 Merging duplicate user ${userData.userId} into existing ${existingUserWithDevice.userId}`)
          finalUserId = existingUserWithDevice.userId
          
          // Merge the data (keep highest values)
          userData.credits = Math.max(userData.credits, existingUserWithDevice.credits)
          userData.totalGenerations = Math.max(userData.totalGenerations, existingUserWithDevice.totalGenerations)
          userData.totalFreeTrialsUsed = Math.max(userData.totalFreeTrialsUsed, existingUserWithDevice.totalFreeTrialsUsed)
          userData.firstVisitDate = userData.firstVisitDate < existingUserWithDevice.firstVisitDate ? userData.firstVisitDate : existingUserWithDevice.firstVisitDate
        }

        // Update or create user
        users[finalUserId] = {
          ...userData,
          userId: finalUserId,
          lastSyncDate: new Date().toISOString(),
          lastVisitDate: new Date().toISOString(),
          sitesUsed: Array.from(new Set([...(userData.sitesUsed || []), site || 'unknown']))
        }

        await writeUnifiedUsers(users)
        console.log(`💾 User synced: ${finalUserId} with credits: ${users[finalUserId].credits}`)
        return NextResponse.json(users[finalUserId])

      case 'admin_add_credits':
        if (!userId || typeof amount !== 'number') {
          return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
        }

        if (users[userId]) {
          users[userId].credits += amount
          users[userId].lastSyncDate = new Date().toISOString()
          await writeUnifiedUsers(users)
          console.log(`💎 Admin added ${amount} credits to ${userId}. New total: ${users[userId].credits}`)
          return NextResponse.json({ success: true, newCredits: users[userId].credits })
        }
        return NextResponse.json({ error: 'User not found' }, { status: 404 })

      case 'admin_set_credits':
        if (!userId || typeof credits !== 'number') {
          return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
        }

        if (users[userId]) {
          users[userId].credits = credits
          users[userId].lastSyncDate = new Date().toISOString()
          await writeUnifiedUsers(users)
          console.log(`💎 Admin set credits for ${userId} to ${credits}`)
          return NextResponse.json({ success: true, newCredits: users[userId].credits })
        }
        return NextResponse.json({ error: 'User not found' }, { status: 404 })

      case 'admin_block_user':
        if (!userId || typeof blocked !== 'boolean') {
          return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
        }

        if (users[userId]) {
          users[userId].isBlocked = blocked
          users[userId].lastSyncDate = new Date().toISOString()
          await writeUnifiedUsers(users)
          console.log(`🚫 Admin ${blocked ? 'blocked' : 'unblocked'} user ${userId}`)
          return NextResponse.json({ success: true, isBlocked: users[userId].isBlocked })
        }
        return NextResponse.json({ error: 'User not found' }, { status: 404 })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in shared user API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}