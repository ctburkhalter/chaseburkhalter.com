export async function POST(request: Request) {
  const body = await request.text()

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
