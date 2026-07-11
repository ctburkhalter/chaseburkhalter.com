import { NextResponse } from "next/server"

// Report-only for now: this logs violations to the browser console (and to a
// report-uri/report-to endpoint if one is added later) without blocking
// anything. Enforcing (Content-Security-Policy, not -Report-Only) needs a
// period of watching real traffic for false positives first.
//
// script-src/style-src allow 'unsafe-inline' because Next.js's inline
// bootstrap script and the site's inline JSON-LD <script> tag, plus
// Tailwind's inline styles, would otherwise need per-request nonces, which is
// out of scope for this pass.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://tile.openstreetmap.org",
  "connect-src 'self' https://tile.openstreetmap.org",
  "frame-ancestors 'none'",
].join("; ")

export function proxy() {
  const response = NextResponse.next()

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Content-Security-Policy-Report-Only", CSP_DIRECTIVES)

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
