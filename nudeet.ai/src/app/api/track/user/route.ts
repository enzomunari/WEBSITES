// src/app/api/track/user/route.ts - Track user data
import { NextRequest, NextResponse } from 'next/server'
import { saveUser } from '@/utils/dataStorage'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Save/update user data
    await saveUser({
      ...userData,
      lastVisitDate: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User tracking error:', error)
    return NextResponse.json({ error: 'Failed to track user' }, { status: 500 })
  }
}