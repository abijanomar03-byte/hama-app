import { NextRequest, NextResponse } from 'next/server'

const VALID_ROOMS = ['sitting_room', 'bedroom', 'kitchen', 'washroom'] as const
const VALID_TYPES = ['Bedsitter', '1 Bedroom', '2 Bedrooms', '3 Bedrooms'] as const

type Room = typeof VALID_ROOMS[number]
type HouseType = typeof VALID_TYPES[number]

const roomLabel: Record<Room, string> = {
  sitting_room: 'sitting room / living room',
  bedroom: 'bedroom',
  kitchen: 'kitchen',
  washroom: 'washroom / bathroom / toilet'
}

function isRoom(value: unknown): value is Room {
  return typeof value === 'string' && (VALID_ROOMS as readonly string[]).includes(value)
}

function isHouseType(value: unknown): value is HouseType {
  return typeof value === 'string' && (VALID_TYPES as readonly string[]).includes(value)
}

function fallbackReason(room: Room) {
  return `This does not clearly look like a ${roomLabel[room]} photo.`
}

function parseJsonFromModel(rawText: unknown): { is_house: boolean; reason?: string } | null {
  const text = typeof rawText === 'string' ? rawText : ''
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    if (parsed && typeof parsed.is_house === 'boolean') return parsed
  } catch {}

  const match = cleaned.match(/\{\s*"is_house"\s*:\s*(true|false)\s*,\s*"reason"\s*:\s*"([^"\n]*)"\s*\}/i)
  if (match) return { is_house: match[1].toLowerCase() === 'true', reason: match[2] }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageBase64, mediaType } = body as { imageBase64?: string; mediaType?: string }
    const expectedRoomValue: unknown = body?.expectedRoom
    const houseTypeValue: unknown = body?.houseType

    if (
      !imageBase64 ||
      !mediaType ||
      !VALID_ROOMS.includes(expectedRoomValue as Room) ||
      !VALID_TYPES.includes(houseTypeValue as HouseType)
    ) {
      return NextResponse.json({ error: 'Missing or invalid verification fields' }, { status: 400 })
    }

    if (!isRoom(expectedRoomValue) || !isHouseType(houseTypeValue)) {
      return NextResponse.json({ error: 'Invalid room or house type' }, { status: 400 })
    }

    const expectedRoom: Room = expectedRoomValue
    const houseType: HouseType = houseTypeValue

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      return NextResponse.json({
        is_house: false,
        reason: 'Hama room verification is not configured. Add the Cloudflare AI credentials.',
        unverified: true,
        configuration_error: true
      }, { status: 503 })
    }

    const bedsitterBedroomRule = houseType === 'Bedsitter'
      ? '\nIMPORTANT: This is a Bedsitter. Do not require a separate bedroom photo.\n'
      : ''

    const prompt = `You are Hama's strict room verifier for a rental marketplace. The user is posting a ${houseType} house and Hama is currently asking for the ${roomLabel[expectedRoom]} photo.

Approve ONLY when the main subject clearly shows the requested room itself. Be practical and human. Recognize normal Kenyan homes, including modest or unfinished rooms.

For a sitting room, look for a living/sitting area such as sofas, chairs, coffee table, TV unit, curtains, or an obvious living space.
For a bedroom, look for a sleeping area such as a bed, mattress, wardrobe, bedside table, or obvious bedroom layout.
For a kitchen, look for kitchen worktops, cabinets, sink, cooker, stove, fridge, shelves, or a clear cooking area.
For a washroom, look for a toilet, shower, basin/sink, bathtub, bathroom tiles, or another unmistakable bathroom/toilet setting.

Reject a different room. Reject selfies, people as the main subject, screenshots, documents, food, cars, streets, landscapes, random objects, or unclear/blurry images.

${bedsitterBedroomRule}
Respond ONLY with JSON in exactly this shape: {"is_house":true|false,"reason":"brief human explanation under 12 words"}`

    // Cloudflare Workers AI REST API. The token stays server-side.
    // Llama 3.2 11B Vision supports image reasoning and accepts a data-URI image.
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image: `data:${mediaType};base64,${imageBase64}`,
        max_tokens: 160,
        temperature: 0,
        top_p: 0.1
      }),
      cache: 'no-store'
    })

    const payload = await response.json().catch(() => null) as { result?: { response?: string }; success?: boolean; errors?: Array<{ message?: string }> } | null

    if (!response.ok) {
      const providerMessage = payload?.errors?.[0]?.message || ''
      const licenseHint = /license|acceptable use|meta/i.test(providerMessage)
        ? 'Cloudflare needs the Meta model license accepted once before Hama can use this model.'
        : ''
      return NextResponse.json({
        is_house: false,
        reason: licenseHint || `Hama could not verify this ${roomLabel[expectedRoom]} photo. Please try another photo.`,
        unverified: true,
        provider_error: true
      }, { status: 200 })
    }

    const text = payload?.result?.response || ''
    const parsed = parseJsonFromModel(text)

    if (parsed) {
      return NextResponse.json({
        is_house: parsed.is_house,
        reason: (typeof parsed.reason === 'string' ? parsed.reason.trim() : '') || (parsed.is_house ? '' : fallbackReason(expectedRoom)),
        unverified: false
      })
    }

    return NextResponse.json({
      is_house: false,
      reason: fallbackReason(expectedRoom),
      unverified: true
    })
  } catch (error) {
    console.error("VERIFY-PHOTO ERROR:", error);
    return NextResponse.json({
      is_house: false,
      reason: 'Hama could not check this photo right now. Please try again.',
      unverified: true
    }, { status: 200 })
  }
}
