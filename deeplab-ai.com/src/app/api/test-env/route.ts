// src/app/api/test-env/route.ts - FIXED
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    COMFY_URL: process.env.COMFY_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET' : 'NOT SET'
  })
}