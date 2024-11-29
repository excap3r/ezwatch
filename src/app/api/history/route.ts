import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const history = db.prepare(`
      SELECT 
        wh.id,
        wh.movieId,
        m.title,
        wh.timestamp,
        wh.lastPlayed,
        wh.videoSource,
        m.type,
        wh.seriesId,
        wh.seasonNumber as seasonNumber,
        wh.episodeNumber as episodeNumber
      FROM watch_history wh
      JOIN movies m ON m.id = wh.movieId
      ORDER BY wh.lastPlayed DESC
      LIMIT 10
    `).all()

    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to fetch watch history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watch history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      movieId, 
      timestamp, 
      videoSource, 
      videoTitle,
      lastPlayed,
      seriesId, 
      seasonNumber, 
      episodeNumber 
    } = await request.json()
    
    // Nejdřív smažeme starý záznam pro tento film
    db.prepare('DELETE FROM watch_history WHERE movieId = ?').run(movieId)
    
    // Pak vložíme nový záznam
    const result = db.prepare(`
      INSERT INTO watch_history 
      (movieId, timestamp, lastPlayed, videoSource, videoTitle, seriesId, seasonNumber, episodeNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      movieId,
      timestamp,
      lastPlayed || new Date().toISOString(),
      videoSource,
      videoTitle,
      seriesId || null,
      seasonNumber || null,
      episodeNumber || null
    )

    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch (error) {
    console.error('Failed to save watch history:', error)
    return NextResponse.json(
      { error: 'Failed to save watch history' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { 
      movieId, 
      timestamp,
      lastPlayed
    } = await request.json()
    
    // Aktualizujeme existující záznam
    db.prepare(`
      UPDATE watch_history 
      SET timestamp = ?, lastPlayed = ?
      WHERE movieId = ?
    `).run(
      timestamp,
      lastPlayed || new Date().toISOString(),
      movieId
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update watch history:', error)
    return NextResponse.json(
      { error: 'Failed to update watch history' },
      { status: 500 }
    )
  }
} 