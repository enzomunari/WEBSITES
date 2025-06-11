// src/app/api/test/route.ts - FIXED
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Test endpoint called')
    
    const testData: Record<string, unknown> = {
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      status: 'success'
    }
    
    return NextResponse.json(testData)
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}