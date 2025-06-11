// src/app/api/user/route.ts - User data synchronization API
import { NextRequest, NextResponse } from 'next/server'
import { getUserData } from '@/utils/sharedDataStorage'

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

// GET - Get user data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const deviceId = searchParams.get('deviceId')

    if (!userId || !deviceId) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Missing userId or deviceId' }, 
        { status: 400 }
      ))
    }

    const userData = await getUserData(userId, deviceId)
    
    return addCorsHeaders(NextResponse.json(userData))

  } catch (error) {
    console.error('User API GET error:', error)
    return addCorsHeaders(NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    ))
  }
}

// POST - Create or sync user data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, deviceId } = body

    if (!userId || !deviceId) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Missing userId or deviceId' }, 
        { status: 400 }
      ))
    }

    console.log(`👤 Syncing user data for user: ${userId}`)

    // Get or create user data in shared storage
    const userData = await getUserData(userId, deviceId)
    
    console.log(`✅ User data synced:`, {
      userId: userData.userId,
      credits: userData.credits,
      totalGenerations: userData.totalGenerations,
      isBlocked: userData.isBlocked
    })

    return addCorsHeaders(NextResponse.json(userData))

  } catch (error) {
    console.error('User API POST error:', error)
    return addCorsHeaders(NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    ))
  }
}