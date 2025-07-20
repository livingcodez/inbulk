import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('imageUrl')
  const sizeParam = searchParams.get('size')
  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
  }
  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid imageUrl' }, { status: 400 })
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return NextResponse.json({ error: 'Invalid imageUrl' }, { status: 400 })
  }
  const size = sizeParam ? parseInt(sizeParam, 10) : 64
  if (isNaN(size) || size <= 0 || size > 1024) {
    return NextResponse.json({ error: 'Invalid size' }, { status: 400 })
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    const res = await fetch(parsed.toString(), { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) {
      console.error('thumbnail fetch failed', res.status)
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    const png = await sharp(buffer).resize(size, size).png().toBuffer()
    // store original link on profile
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_profiles').update({ avatar_original_url: parsed.toString() }).eq('id', user.id)
    }
    return new NextResponse(png, {
      headers: { 'Content-Type': 'image/png' }
    })
  } catch (err) {
    console.error('thumbnail error', err)
    return NextResponse.json({ error: 'Unable to fetch image' }, { status: 500 })
  }
}
