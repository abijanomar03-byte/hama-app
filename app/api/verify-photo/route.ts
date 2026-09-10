import { NextRequest, NextResponse } from 'next/server'

// Runs on the server only — this is the fix for the bug where the old
// prototype called Anthropic's API directly from the browser with no key,
// which only ever worked inside Claude.ai's own preview and silently
// "failed open" (approved every photo) everywhere else, including the
// live hosted site. Here the key never reaches the client at all.

export async function POST(req: NextRequest) {
  const { imageBase64, mediaType } = await req.json()

  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: 'Missing image data' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // No key configured yet — tell the truth instead of silently
    // approving. The post flow shows this as a visible warning rather
    // than pretending a check happened.
    return NextResponse.json({
      is_house: true,
      reason: '',
      unverified: true,
      warning: 'AI photo verification is not configured on this server yet (ANTHROPIC_API_KEY missing). Photo accepted without a content check.'
    })
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            {
              type: 'text',
              text: "You are a strict content filter for a house-rental listing app. Look at this image very carefully.\n\nApprove it (is_house:true) ONLY if the clear main subject, filling most of the frame, is a room interior (bedroom, sitting room, kitchen, washroom/bathroom) or a building's exterior/facade — the kind of photo someone would take specifically to show a room or house to a prospective tenant.\n\nReject it (is_house:false) for EVERYTHING else, including but not limited to: selfies or photos of people (even if a room is faintly visible behind them), portraits, group photos, screenshots, memes, documents/IDs, food, animals/pets, cars, street scenes without a building as the clear subject, landscapes/nature, products, artwork, blurry/unclear images where you cannot confidently tell it's a room, or any photo where a person or something else — not the room itself — is the main subject.\n\nWhen in doubt, reject it. Respond with ONLY raw JSON, no markdown fences, no other text: {\"is_house\":true or false,\"reason\":\"under 8 words, specific about what it actually shows\"}"
            }
          ]
        }]
      })
    })

    const data = await r.json()

    if (!r.ok) {
      return NextResponse.json({
        is_house: true, reason: '', unverified: true,
        warning: 'AI verification request failed (' + (data?.error?.message || r.status) + '). Photo accepted without a content check.'
      })
    }

    const text = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .trim()
      .replace(/^```json/i, '')
      .replace(/```$/, '')
      .trim()

    let parsed: any = null
    try { parsed = JSON.parse(text) } catch {}

    if (parsed && typeof parsed.is_house === 'boolean') {
      return NextResponse.json({ is_house: parsed.is_house, reason: parsed.reason || '', unverified: false })
    }
    return NextResponse.json({ is_house: true, reason: '', unverified: true, warning: "Couldn't parse a verdict — photo accepted without a content check." })
  } catch (e: any) {
    return NextResponse.json({
      is_house: true, reason: '', unverified: true,
      warning: 'AI verification request failed (' + (e?.message || 'network error') + '). Photo accepted without a content check.'
    })
  }
}
