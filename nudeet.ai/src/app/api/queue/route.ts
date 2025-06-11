// src/app/api/queue/route.ts - Queue API endpoint with proper TypeScript types
import { NextRequest, NextResponse } from 'next/server'

// TypeScript interfaces
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

async function getComfyUIStatus(): Promise<string> {
  try {
    const comfyUrl = process.env.COMFY_URL || 'http://127.0.0.1:8188'
    const response = await fetch(`${comfyUrl}/system_stats`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.ok) {
      const queueResponse = await fetch(`${comfyUrl}/queue`)
      if (queueResponse.ok) {
        const queueData: ComfyUIQueueResponse = await response.json()
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
    
    const running = queueData.queue_running || []
    const pending = queueData.queue_pending || []
    
    // Transform running queue items
    const runningTransformed: TransformedQueueItem[] = running.map((item, index) => ({
      promptId: item[1]?.prompt_id || item[0] || `running_${index}`,
      position: index + 1,
      userId: item[1]?.extra_data?.userId || 'Unknown',
      pose: item[1]?.extra_data?.pose || 'Unknown',
      gender: item[1]?.extra_data?.gender || 'Unknown',
      timestamp: new Date().toISOString(),
      progress: Math.floor(Math.random() * 40) + 30,
      estimatedTime: 45 + Math.floor(Math.random() * 30)
    }))
    
    // Transform pending queue items
    const pendingTransformed: TransformedQueueItem[] = pending.map((item, index) => ({
      promptId: item[1]?.prompt_id || item[0] || `pending_${index}`,
      position: running.length + index + 1,
      userId: item[1]?.extra_data?.userId || 'Unknown',
      pose: item[1]?.extra_data?.pose || 'Unknown',
      gender: item[1]?.extra_data?.gender || 'Unknown',
      timestamp: new Date().toISOString(),
      estimatedTime: (running.length + index + 1) * 60
    }))
    
    return {
      running: runningTransformed,
      pending: pendingTransformed,
      totalInQueue: running.length + pending.length
    }
    
  } catch (error) {
    console.error('Error fetching ComfyUI queue:', error)
    return {
      running: [],
      pending: [],
      totalInQueue: 0
    }
  }
}

export async function GET() {
  try {
    console.log('📊 Queue API request received')
    
    const [comfyuiStatus, queue] = await Promise.all([
      getComfyUIStatus(),
      getComfyUIQueue()
    ])
    
    const data = {
      comfyuiStatus,
      queue,
      timestamp: new Date().toISOString()
    }
    
    console.log('📋 Queue data prepared:', {
      status: comfyuiStatus,
      running: queue.running.length,
      pending: queue.pending.length
    })
    
    return addCorsHeaders(NextResponse.json(data))
    
  } catch (error) {
    console.error('Queue API error:', error)
    return addCorsHeaders(NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, promptId } = body
    
    console.log(`🔧 Queue action: ${action}`, { promptId })
    
    const comfyUrl = process.env.COMFY_URL || 'http://127.0.0.1:8188'
    let result
    
    switch (action) {
      case 'cancel':
        if (!promptId) {
          return addCorsHeaders(NextResponse.json({ error: 'Prompt ID required' }, { status: 400 }))
        }
        
        const cancelResponse = await fetch(`${comfyUrl}/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            delete: [promptId]
          })
        })
        
        result = {
          success: cancelResponse.ok,
          message: cancelResponse.ok ? `Generation ${promptId} cancelled` : 'Failed to cancel generation'
        }
        break
        
      case 'clear':
        const clearResponse = await fetch(`${comfyUrl}/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clear: true
          })
        })
        
        result = {
          success: clearResponse.ok,
          message: clearResponse.ok ? 'Queue cleared successfully' : 'Failed to clear queue'
        }
        break
        
      default:
        return addCorsHeaders(NextResponse.json({ error: 'Invalid action' }, { status: 400 }))
    }
    
    return addCorsHeaders(NextResponse.json(result))
    
  } catch (error) {
    console.error('Queue POST error:', error)
    return addCorsHeaders(NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }))
  }
}