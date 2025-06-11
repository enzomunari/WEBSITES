// src/app/api/track/event/route.ts - Track user events
import { NextRequest, NextResponse } from 'next/server'
import { logUserEvent } from '@/utils/dataStorage'

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // Log event
    await logUserEvent({
      ...eventData,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Event tracking error:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}