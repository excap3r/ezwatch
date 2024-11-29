import { getVideoStreamUrl } from '@/lib/services/prehrajto'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Použijeme await pro přístup k params
    const params = await Promise.resolve(context.params)
    const { id } = params
    
    if (!id) {
      return new Response('Missing video ID', { status: 400 })
    }

    // Decode the URL-encoded path
    const videoPath = decodeURIComponent(id)

    // Přidáme hlavičky pro CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    const video = await getVideoStreamUrl(videoPath)
    
    if (!video) {
      return new Response('Video not found', { 
        status: 404,
        headers 
      })
    }

    return Response.json(video, { headers })
  } catch (error) {
    console.error('Error fetching video:', error)
    return new Response('Internal Server Error', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
} 