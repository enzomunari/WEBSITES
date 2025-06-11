// src/app/api/admin/route.ts - COMPLETE Admin dashboard API endpoints
import { NextRequest, NextResponse } from 'next/server'
import { 
  getUsers, 
  getGenerations, 
  getUserEvents, 
  getSiteStats,
  updateUserCredits,
  addUserCredits,
  blockUser,
  cleanOldData
} from '@/utils/sharedDataStorage'

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Verify admin password
function verifyAdminPassword(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const providedPassword = authHeader.substring(7)
  const adminPassword = process.env.ADMIN_PASSWORD
  
  return Boolean(adminPassword && providedPassword === adminPassword)
}

// GET - Fetch admin data
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminPassword(request)) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      ))
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    console.log(`📊 Admin GET request for type: ${type}`)

    switch (type) {
      case 'stats':
        const stats = await getSiteStats('deeplab')
        console.log('📈 Returning stats:', stats)
        return addCorsHeaders(NextResponse.json(stats))

      case 'users':
        const users = await getUsers()
        console.log(`👥 Returning ${Object.keys(users).length} users`)
        return addCorsHeaders(NextResponse.json(users))

      case 'generations':
        const generations = await getGenerations()
        const deeplabGenerations = generations.filter((gen) => gen.site === 'deeplab')
        console.log(`🎨 Returning ${deeplabGenerations.length} generations`)
        return addCorsHeaders(NextResponse.json(deeplabGenerations))

      case 'userEvents':
        const events = await getUserEvents()
        const deeplabEvents = events.filter((event) => event.site === 'deeplab')
        console.log(`📝 Returning ${deeplabEvents.length} user events`)
        return addCorsHeaders(NextResponse.json(deeplabEvents))

      case 'queue':
        // Mock queue data since you don't have real ComfyUI queue integration in admin
        const queueData = {
          comfyuiStatus: 'idle',
          queue: {
            running: [],
            pending: [],
            recentCompleted: [],
            totalInQueue: 0
          },
          timestamp: new Date().toISOString()
        }
        console.log('⏳ Returning queue data')
        return addCorsHeaders(NextResponse.json(queueData))

      default:
        return addCorsHeaders(NextResponse.json(
          { error: 'Invalid type parameter' }, 
          { status: 400 }
        ))
    }

  } catch (error) {
    console.error('❌ Admin GET error:', error)
    return addCorsHeaders(NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    ))
  }
}

// POST - Admin actions
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminPassword(request)) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      ))
    }

    const body = await request.json()
    const { action } = body

    console.log(`⚡ Admin POST action: ${action}`)

    switch (action) {
      case 'addCredits':
        const { userId, amount } = body
        if (!userId || !amount || amount <= 0) {
          return addCorsHeaders(NextResponse.json(
            { error: 'Missing userId or invalid amount' }, 
            { status: 400 }
          ))
        }

        // Validate amount is reasonable
        if (amount > 1000) {
          return addCorsHeaders(NextResponse.json(
            { error: 'Cannot add more than 1000 credits at once' }, 
            { status: 400 }
          ))
        }

        const success = await addUserCredits(userId, amount)
        
        if (success) {
          console.log(`💰 Added ${amount} credits to user ${userId}`)
          return addCorsHeaders(NextResponse.json({ 
            success: true,
            message: `Successfully added ${amount} credits to user` 
          }))
        } else {
          return addCorsHeaders(NextResponse.json(
            { error: 'User not found' }, 
            { status: 404 }
          ))
        }

      case 'blockUser':
        const { userId: blockUserId, blocked } = body
        if (!blockUserId || blocked === undefined) {
          return addCorsHeaders(NextResponse.json(
            { error: 'Missing userId or blocked status' }, 
            { status: 400 }
          ))
        }

        const blockSuccess = await blockUser(blockUserId, blocked)
        
        if (blockSuccess) {
          console.log(`🚫 ${blocked ? 'Blocked' : 'Unblocked'} user ${blockUserId}`)
          return addCorsHeaders(NextResponse.json({ 
            success: true,
            message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`
          }))
        } else {
          return addCorsHeaders(NextResponse.json(
            { error: 'User not found' }, 
            { status: 404 }
          ))
        }

      case 'cleanOldData':
        const result = await cleanOldData()
        console.log('🧹 Cleaned old data:', result)

        return addCorsHeaders(NextResponse.json({ 
          success: true, 
          result,
          message: `Cleaned ${result.eventsRemoved} events and ${result.generationsRemoved} generations`
        }))

      case 'updateCredits':
        // Alternative action for setting credits to a specific value
        const { userId: updateUserId, credits } = body
        if (!updateUserId || credits === undefined || credits < 0) {
          return addCorsHeaders(NextResponse.json(
            { error: 'Missing userId or invalid credits value' }, 
            { status: 400 }
          ))
        }

        const updateSuccess = await updateUserCredits(updateUserId, credits)
        
        if (updateSuccess) {
          console.log(`💳 Set credits to ${credits} for user ${updateUserId}`)
          return addCorsHeaders(NextResponse.json({ 
            success: true,
            message: `Successfully set credits to ${credits}` 
          }))
        } else {
          return addCorsHeaders(NextResponse.json(
            { error: 'User not found' }, 
            { status: 404 }
          ))
        }

      case 'getUserDetails':
        // Get detailed information about a specific user
        const { userId: detailUserId } = body
        if (!detailUserId) {
          return addCorsHeaders(NextResponse.json(
            { error: 'Missing userId' }, 
            { status: 400 }
          ))
        }

        const users = await getUsers()
        const userDetails = users[detailUserId]
        
        if (userDetails) {
          // Get user's recent generations
          const allGenerations = await getGenerations()
          const userGenerations = allGenerations
            .filter((gen) => gen.userId === detailUserId && gen.site === 'deeplab')
            .slice(0, 10) // Last 10 generations
          
          // Get user's recent events
          const allEvents = await getUserEvents()
          const userEvents = allEvents
            .filter((event) => event.userId === detailUserId && event.site === 'deeplab')
            .slice(0, 10) // Last 10 events

          return addCorsHeaders(NextResponse.json({
            success: true,
            user: userDetails,
            recentGenerations: userGenerations,
            recentEvents: userEvents
          }))
        } else {
          return addCorsHeaders(NextResponse.json(
            { error: 'User not found' }, 
            { status: 404 }
          ))
        }

      case 'getSystemInfo':
        // Get system information for diagnostics
        const systemInfo = {
          timestamp: new Date().toISOString(),
          nodeEnv: process.env.NODE_ENV,
          hasAdminPassword: !!process.env.ADMIN_PASSWORD,
          hasComfyUrl: !!process.env.COMFY_URL,
          comfyUrl: process.env.COMFY_URL || 'Not set',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: process.version
        }

        console.log('🔧 Returning system info')
        return addCorsHeaders(NextResponse.json({
          success: true,
          systemInfo
        }))

      case 'testComfyUI':
        // Test ComfyUI connection
        const comfyUrl = process.env.COMFY_URL || 'http://127.0.0.1:8188'
        
        try {
          const testResponse = await fetch(`${comfyUrl}/system_stats`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          })
          
          if (testResponse.ok) {
            const stats = await testResponse.json()
            return addCorsHeaders(NextResponse.json({
              success: true,
              message: 'ComfyUI is accessible',
              comfyStats: stats
            }))
          } else {
            return addCorsHeaders(NextResponse.json({
              success: false,
              message: `ComfyUI returned HTTP ${testResponse.status}`,
              comfyUrl
            }))
          }
        } catch (comfyError) {
          return addCorsHeaders(NextResponse.json({
            success: false,
            message: 'Cannot connect to ComfyUI',
            error: comfyError instanceof Error ? comfyError.message : 'Unknown error',
            comfyUrl
          }))
        }

      default:
        return addCorsHeaders(NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        ))
    }

  } catch (error) {
    console.error('❌ Admin POST error:', error)
    return addCorsHeaders(NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    ))
  }
}

// PUT - Update operations (alternative to POST for RESTful design)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminPassword(request)) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      ))
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    console.log(`🔄 Admin PUT action: ${action}`)

    switch (action) {
      case 'user':
        const { userId, credits, isBlocked } = body
        
        if (!userId) {
          return addCorsHeaders(NextResponse.json(
            { error: 'Missing userId' }, 
            { status: 400 }
          ))
        }

        let updateSuccess = true

        // Update credits if provided
        if (credits !== undefined) {
          updateSuccess = updateSuccess && await updateUserCredits(userId, credits)
        }

        // Update blocked status if provided
        if (isBlocked !== undefined) {
          updateSuccess = updateSuccess && await blockUser(userId, isBlocked)
        }

        if (updateSuccess) {
          return addCorsHeaders(NextResponse.json({
            success: true,
            message: 'User updated successfully'
          }))
        } else {
          return addCorsHeaders(NextResponse.json(
            { error: 'User not found or update failed' }, 
            { status: 404 }
          ))
        }

      default:
        return addCorsHeaders(NextResponse.json(
          { error: 'Invalid PUT action' }, 
          { status: 400 }
        ))
    }

  } catch (error) {
    console.error('❌ Admin PUT error:', error)
    return addCorsHeaders(NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    ))
  }
}

// DELETE - Delete operations
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminPassword(request)) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      ))
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    console.log(`🗑️ Admin DELETE action: ${action}`)

    switch (action) {
      case 'oldData':
        const cleanResult = await cleanOldData()
        console.log('🧹 Cleaned old data via DELETE:', cleanResult)

        return addCorsHeaders(NextResponse.json({
          success: true,
          result: cleanResult,
          message: `Deleted ${cleanResult.eventsRemoved} old events and ${cleanResult.generationsRemoved} old generations`
        }))

      default:
        return addCorsHeaders(NextResponse.json(
          { error: 'Invalid DELETE action' }, 
          { status: 400 }
        ))
    }

  } catch (error) {
    console.error('❌ Admin DELETE error:', error)
    return addCorsHeaders(NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    ))
  }
}