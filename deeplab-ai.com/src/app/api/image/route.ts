// src/app/api/image/route.ts - Fixed image proxy for Deeplab-ai
import { NextRequest, NextResponse } from 'next/server'

const COMFYUI_SERVER_URL = process.env.COMFY_URL || 'http://127.0.0.1:8188'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const subfolder = searchParams.get('subfolder') || ''
    const type = searchParams.get('type') || 'output'
    
    if (!filename) {
      console.error('❌ Missing filename parameter')
      return NextResponse.json({ error: 'Missing filename parameter' }, { status: 400 })
    }
    
    // Construct ComfyUI image URL
    const comfyuiUrl = `${COMFYUI_SERVER_URL}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`
    
    console.log('🖼️ Proxying image from ComfyUI:', comfyuiUrl)
    
    try {
      // Fetch image from ComfyUI with proper timeout and error handling
      const response = await fetch(comfyuiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Deeplab-AI-Proxy/1.0'
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })
      
      if (!response.ok) {
        console.error(`❌ Failed to fetch image from ComfyUI: HTTP ${response.status}`)
        
        // Try alternative approach - check if image exists
        const alternativeUrl = `${COMFYUI_SERVER_URL}/view?filename=${encodeURIComponent(filename)}`
        const altResponse = await fetch(alternativeUrl, {
          signal: AbortSignal.timeout(10000)
        })
        
        if (altResponse.ok) {
          console.log('✅ Found image using alternative URL')
          const imageBuffer = await altResponse.arrayBuffer()
          const contentType = altResponse.headers.get('content-type') || 'image/jpeg'
          
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000',
              'Access-Control-Allow-Origin': '*',
              'Cross-Origin-Resource-Policy': 'cross-origin'
            },
          })
        }
        
        return NextResponse.json({ 
          error: 'Image not found', 
          details: `ComfyUI returned ${response.status}`,
          url: comfyuiUrl 
        }, { status: 404 })
      }
      
      // Get image data and content type
      const imageBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'image/jpeg'
      
      console.log(`✅ Successfully proxied image: ${filename}, size: ${imageBuffer.byteLength} bytes, type: ${contentType}`)
      
      // Return image with proper headers for CORS and caching
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cross-Origin-Resource-Policy': 'cross-origin',
          'Content-Length': imageBuffer.byteLength.toString()
        },
      })
      
    } catch (fetchError) {
      console.error('❌ ComfyUI fetch error:', fetchError)
      
      // Return a helpful error response
      return NextResponse.json({ 
        error: 'Failed to fetch image from ComfyUI',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        comfyUrl: COMFYUI_SERVER_URL,
        requestedUrl: comfyuiUrl
      }, { status: 503 })
    }
    
  } catch (error) {
    console.error('❌ Image proxy error:', error)
    return NextResponse.json({ 
      error: 'Internal image proxy error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}