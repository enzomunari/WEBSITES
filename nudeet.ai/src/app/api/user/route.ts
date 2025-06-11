// src/app/api/user/route.ts - Bridge between server storage and client
import { NextRequest, NextResponse } from 'next/server'
import { getUserData, saveUserData } from '@/utils/dataStorage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }
    
    const userData = await getUserData(userId)
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json(userData)
    
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    if (!userData.userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    await saveUserData(userData)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}