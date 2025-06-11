// src/app/api/image/route.ts - Proxy for ComfyUI images
import { NextRequest, NextResponse } from 'next/server'

const COMFYUI_SERVER_URL = process.env.COMFYUI_SERVER_URL || 'http://localhost:8188'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const subfolder = searchParams.get('subfolder') || ''
    const type = searchParams.get('type') || 'output'
    
    if (!filename) {
      return NextResponse.json({ error: 'Missing filename parameter' }, { status: 400 })
    }
    
    // Construct ComfyUI image URL
    const comfyuiUrl = `${COMFYUI_SERVER_URL}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`
    
    console.log('Proxying image from:', comfyuiUrl)
    
    // Fetch image from ComfyUI
    const response = await fetch(comfyuiUrl)
    
    if (!response.ok) {
      console.error('Failed to fetch image from ComfyUI:', response.status)
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    
    // Get image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
    })
    
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 })
  }
}