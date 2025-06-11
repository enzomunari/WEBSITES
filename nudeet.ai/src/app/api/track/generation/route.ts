// src/app/api/track/generation/route.ts - Track generation events
import { NextRequest, NextResponse } from 'next/server'
import { logGeneration } from '@/utils/dataStorage'

export async function POST(request: NextRequest) {
  try {
    const generationData = await request.json()
    
    // Log generation
    await logGeneration({
      ...generationData,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Generation tracking error:', error)
    return NextResponse.json({ error: 'Failed to track generation' }, { status: 500 })
  }
}