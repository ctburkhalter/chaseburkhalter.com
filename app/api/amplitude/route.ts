// This route is same-origin-only in practice (only the Amplitude Browser SDK
// on this site calls it), but as written it was an unvalidated open relay to
// Amplitude's batch API: any request, any size, any content type, got
// forwarded. These two checks are cheap, defensive guardrails, not a
// rewrite: they reject obviously-wrong requests before they reach Amplitude.
const MAX_BODY_BYTES = 200_000 // 200KB; typical SDK batches are well under this

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return new Response('Unsupported Content-Type', { status: 415 })
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return new Response('Payload too large', { status: 413 })
  }

  const body = await request.text()
  if (body.length > MAX_BODY_BYTES) {
    return new Response('Payload too large', { status: 413 })
  }

  // Forward the original client IP so Amplitude geolocates the visitor, not
  // the Vercel server. Without this, every event shows Vercel's datacenter
  // location instead of the actual user's city/DMA/region.
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip')

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (clientIp) (headers as Record<string, string>)['X-Forwarded-For'] = clientIp

  const res = await fetch('https://api2.amplitude.com/batch', {
    method: 'POST',
    headers,
    body,
  })
  return new Response(await res.text(), { status: res.status })
}
