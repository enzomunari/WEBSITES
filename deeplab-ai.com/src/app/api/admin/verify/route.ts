// src/app/api/admin/verify/route.ts - Admin password verification endpoint
import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Admin password verification request received')
    
    // Get password from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header provided')
      return addCorsHeaders(NextResponse.json(
        { error: 'Authorization header required' }, 
        { status: 401 }
      ))
    }
    
    const providedPassword = authHeader.substring(7) // Remove 'Bearer ' prefix
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD environment variable not set')
      return addCorsHeaders(NextResponse.json(
        { error: 'Admin authentication not configured' }, 
        { status: 500 }
      ))
    }
    
    if (providedPassword === adminPassword) {
      console.log('✅ Admin password verification successful')
      return addCorsHeaders(NextResponse.json({
        success: true,
        message: 'Authentication successful'
      }))
    } else {
      console.log('❌ Invalid admin password provided')
      return addCorsHeaders(NextResponse.json(
        { error: 'Invalid password' }, 
        { status: 401 }
      ))
    }
    
  } catch (error) {
    console.error('💥 Admin verification error:', error)
    return addCorsHeaders(NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    ))
  }
}