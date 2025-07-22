import { NextResponse } from 'next/server'
import { load } from 'cheerio'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) {
      console.error('resolve-image fetch failed', res.status)
      return NextResponse.json({ error: 'Fetch failed' }, { status: 404 })
    }
    const html = await res.text()
    const $ = load(html)
    const img =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('img').first().attr('src')
    if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ image: img })
  } catch (err) {
    console.error('resolve-image error', err)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
