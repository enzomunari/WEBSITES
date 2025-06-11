// src/app/api/admin/route.ts - Centralized admin API with Queue Support
import { NextRequest, NextResponse } from 'next/server'
import { 
  getUsers, 
  getUser,
  updateUserCredits, 
  blockUser,
  getGenerations, 
  getUserEvents, 
  getStats,
  cleanOldData 
} from '@/utils/dataStorage'

// Get admin password from environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

console.log('🔐 Admin API loaded with centralized data collection and queue support')

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  return response
}

// Handle preflight requests
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Authentication
function authenticate(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7)
  return token === ADMIN_PASSWORD
}

// TypeScript interfaces for ComfyUI data
interface ComfyUIQueueItem {
  0?: string;
  1?: {
    prompt_id?: string;
    extra_data?: {
      userId?: string;
      pose?: string;
      gender?: string;
    };
  };
}

interface ComfyUIQueueResponse {
  queue_running?: ComfyUIQueueItem[];
  queue_pending?: ComfyUIQueueItem[];
}

interface TransformedQueueItem {
  promptId: string;
  position: number;
  userId: string;
  pose: string;
  gender: string;
  timestamp: string;
  progress?: number;
  estimatedTime: number;
}

interface CompletedQueueItem {
  promptId: string;
  userId: string;
  status: string;
  timestamp: string;
  pose: string;
  gender: string;
}

// Extended generation interface for data with additional properties
interface ExtendedGenerationEvent {
  userId: string;
  deviceId: string;
  pose: string;
  gender: string;
  success: boolean;
  error?: string;
  timestamp: string;
  ipAddress?: string;
  promptId?: string;
  id?: string;
}

// ComfyUI Queue Management Functions
async function getComfyUIStatus(): Promise<string> {
  try {
    const comfyUrl = process.env.COMFY_URL || 'http://127.0.0.1:8188'
    const response = await fetch(`${comfyUrl}/system_stats`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.ok) {
      // If we can reach ComfyUI, check if it's processing
      const queueResponse = await fetch(`${comfyUrl}/queue`)
      if (queueResponse.ok) {
        const queueData: ComfyUIQueueResponse = await queueResponse.json()
        const hasRunning = queueData.queue_running && queueData.queue_running.length > 0
        return hasRunning ? 'busy' : 'idle'
      }
    }
    return 'offline'
  } catch (error) {
    console.error('Error checking ComfyUI status:', error)
    return 'offline'
  }
}

async function getComfyUIQueue() {
  try {
    const comfyUrl = process.env.COMFY_URL || 'http://127.0.0.1:8188'
    const response = await fetch(`${comfyUrl}/queue`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error(`ComfyUI queue request failed: ${response.status}`)
    }
    
    const queueData: ComfyUIQueueResponse = await response.json()
    console.log('📊 Raw ComfyUI queue data:', queueData)
    
    // Transform ComfyUI queue data to match our expected format
    const running = queueData.queue_running || []
    const pending = queueData.queue_pending || []
    
    // Get recent generations from our data storage for completed items
    const recentGenerations = await getGenerations() as ExtendedGenerationEvent[]
    const recentCompleted: CompletedQueueItem[] = recentGenerations
      .filter(gen => gen.success !== undefined) // Filter based on success property
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(gen => ({
        promptId: gen.promptId || gen.id || 'unknown',
        userId: gen.userId,
        status: gen.success ? 'completed' : 'failed', // Map success boolean to status string
        timestamp: gen.timestamp,
        pose: gen.pose || 'Unknown',
        gender: gen.gender || 'Unknown'
      }))
    
    // Transform running queue items
    const runningTransformed: TransformedQueueItem[] = running.map((item, index) => ({
      promptId: item[1]?.prompt_id || item[0] || `running_${index}`,
      position: index + 1,
      userId: item[1]?.extra_data?.userId || 'Unknown',
      pose: item[1]?.extra_data?.pose || 'Unknown',
      gender: item[1]?.extra_data?.gender || 'Unknown',
      timestamp: new Date().toISOString(), // ComfyUI doesn't provide start time
      progress: Math.floor(Math.random() * 40) + 30, // Estimated progress
      estimatedTime: 45 + Math.floor(Math.random() * 30) // Estimated time remaining
    }))
    
    // Transform pending queue items
    const pendingTransformed: TransformedQueueItem[] = pending.map((item, index) => ({
      promptId: item[1]?.prompt_id || item[0] || `pending_${index}`,
      position: running.length + index + 1,
      userId: item[1]?.extra_data?.userId || 'Unknown',
      pose: item[1]?.extra_data?.pose || 'Unknown',
      gender: item[1]?.extra_data?.gender || 'Unknown',
      timestamp: new Date().toISOString(),
      estimatedTime: (running.length + index + 1) * 60 // Estimated wait time
    }))
    
    return {
      running: runningTransformed,
      pending: pendingTransformed,
      recentCompleted,
      totalInQueue: running.length + pending.length
    }
    
  } catch (error) {
    console.error('Error fetching ComfyUI queue:', error)
    
    // Fallback: return data from our storage if ComfyUI is unreachable
    const recentGenerations = await getGenerations() as ExtendedGenerationEvent[]
    const recentCompleted: CompletedQueueItem[] = recentGenerations
      .filter(gen => gen.success !== undefined) // Filter based on success property
      .slice(0, 5)
      .map(gen => ({
        promptId: gen.promptId || gen.id || 'unknown',
        userId: gen.userId,
        status: gen.success ? 'completed' : 'failed', // Map success boolean to status string
        timestamp: gen.timestamp,
        pose: gen.pose || 'Unknown',
        gender: gen.gender || 'Unknown'
      }))
    
    return {
      running: [],
      pending: [],
      recentCompleted,
      totalInQueue: 0
    }
  }
}

// GET - Get admin data
export async function GET(request: NextRequest) {
  try {
    if (!authenticate(request)) {
      return addCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    console.log(`📊 Admin data request: ${type}`)
    
    let data
    
    switch (type) {
      case 'stats':
        data = await getStats()
        break
        
      case 'users':
        data = await getUsers()
        break
        
      case 'generations':
        data = await getGenerations()
        break
        
      case 'userEvents':
        data = await getUserEvents()
        break
        
      case 'queue':
        // Get both ComfyUI status and queue data
        const [comfyuiStatus, queue] = await Promise.all([
          getComfyUIStatus(),
          getComfyUIQueue()
        ])
        
        data = {
          comfyuiStatus,
          queue,
          timestamp: new Date().toISOString()
        }
        
        console.log('📋 Queue data prepared:', {
          status: comfyuiStatus,
          running: queue.running.length,
          pending: queue.pending.length,
          completed: queue.recentCompleted.length
        })
        break
        
      case 'config':
        data = {
          passwordSet: !!process.env.ADMIN_PASSWORD,
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          dataSource: 'Centralized Server Storage',
          comfyUrl: process.env.COMFY_URL || 'http://127.0.0.1:8188'
        }
        break
        
      default:
        return addCorsHeaders(NextResponse.json({ error: 'Invalid type parameter. Valid types: stats, users, generations, userEvents, queue, config' }, { status: 400 }))
    }
    
    return addCorsHeaders(NextResponse.json(data))
    
  } catch (error) {
    console.error('Admin API error:', error)
    return addCorsHeaders(NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }))
  }
}

// POST - Admin actions
export async function POST(request: NextRequest) {
  try {
    if (!authenticate(request)) {
      return addCorsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }
    
    const body = await request.json()
    const { action, userId, amount, blocked, password, promptId } = body
    
    console.log(`🔧 Admin action: ${action}`, { userId, amount, blocked, promptId })
    
    let result
    
    switch (action) {
      case 'verify':
        // Password verification
        result = {
          success: password === ADMIN_PASSWORD,
          message: password === ADMIN_PASSWORD ? 'Access granted' : 'Invalid password'
        }
        break
        
      case 'addCredits':
        if (!userId || typeof amount !== 'number') {
          return addCorsHeaders(NextResponse.json({ error: 'Invalid parameters' }, { status: 400 }))
        }
        
        const user = await getUser(userId)
        if (!user) {
          return addCorsHeaders(NextResponse.json({ error: 'User not found' }, { status: 404 }))
        }
        
        const newCredits = (user.credits || 0) + amount
        await updateUserCredits(userId, newCredits)
        
        result = { 
          success: true, 
          message: `Added ${amount} credits to user ${userId}`,
          newCredits 
        }
        break
        
      case 'blockUser':
        if (!userId || typeof blocked !== 'boolean') {
          return addCorsHeaders(NextResponse.json({ error: 'Invalid parameters' }, { status: 400 }))
        }
        
        await blockUser(userId, blocked)
        
        result = { 
          success: true, 
          message: `User ${userId} ${blocked ? 'blocked' : 'unblocked'}`
        }
        break
        
      case 'cancelGeneration':
        if (!promptId) {
          return addCorsHeaders(NextResponse.json({ error: 'Prompt ID required' }, { status: 400 }))
        }
        
        try {
          const comfyUrl = process.env.COMFY_URL || 'http://127.0.0.1:8188'
          const response = await fetch(`${comfyUrl}/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              delete: [promptId]
            })
          })
          
          if (response.ok) {
            result = {
              success: true,
              message: `Generation ${promptId} cancelled successfully`
            }
          } else {
            result = {
              success: false,
              message: `Failed to cancel generation: ${response.status}`
            }
          }
        } catch (error) {
          result = {
            success: false,
            message: `Error cancelling generation: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
        break
        
      case 'clearQueue':
        try {
          const comfyUrl = process.env.COMFY_URL || 'http://127.0.0.1:8188'
          const response = await fetch(`${comfyUrl}/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clear: true
            })
          })
          
          if (response.ok) {
            result = {
              success: true,
              message: 'Queue cleared successfully'
            }
          } else {
            result = {
              success: false,
              message: `Failed to clear queue: ${response.status}`
            }
          }
        } catch (error) {
          result = {
            success: false,
            message: `Error clearing queue: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
        break
        
      case 'cleanOldData':
        const cleanupResult = await cleanOldData()
        result = {
          success: true,
          message: 'Old data cleaned',
          ...cleanupResult
        }
        break
        
      default:
        return addCorsHeaders(NextResponse.json({ error: 'Invalid action. Valid actions: verify, addCredits, blockUser, cancelGeneration, clearQueue, cleanOldData' }, { status: 400 }))
    }
    
    return addCorsHeaders(NextResponse.json(result))
    
  } catch (error) {
    console.error('Admin POST error:', error)
    return addCorsHeaders(NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }))
  }
}