export async function POST(request: Request) {
  const body = await request.text()
  const res = await fetch('https://api2.amplitude.com/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  return new Response(await res.text(), { status: res.status })
}
