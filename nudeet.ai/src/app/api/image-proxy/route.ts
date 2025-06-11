// nudeet/src/app/api/image-proxy/route.ts - Proxy for ComfyUI images
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const subfolder = searchParams.get('subfolder')
    const type = searchParams.get('type') || 'output'
    
    if (!filename) {
      return new NextResponse('Missing filename parameter', { status: 400 })
    }
    
    // Build ComfyUI URL
    const comfyUrl = process.env.COMFY_URL || 'http://127.0.0.1:8188'
    const imageUrl = `${comfyUrl}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder || '')}&type=${encodeURIComponent(type)}`
    
    console.log('🖼️ Proxying image from:', imageUrl)
    
    // Fetch image from ComfyUI
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Nudeet-Image-Proxy/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      console.error('❌ ComfyUI image fetch failed:', response.status, response.statusText)
      return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status })
    }
    
    // Get image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    console.log('✅ Image proxied successfully:', {
      filename,
      size: imageBuffer.byteLength,
      contentType
    })
    
    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('❌ Image proxy error:', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return new NextResponse('Request timeout', { status: 408 })
    }
    
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}