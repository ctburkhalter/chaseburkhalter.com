/** @type {import('next').NextConfig} */
const nextConfig = {
  // No `eslint` key: Next.js 16 removed `next lint` and the `eslint` config
  // option entirely (next build no longer runs ESLint at all, regardless of
  // this setting). Linting is enforced by the separate `pnpm lint` / CI
  // "Lint" step instead.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        // Hardcoded rather than imported: this file runs before the
        // TypeScript app compiles, so it cannot import lib/content.ts's
        // RESUME_PDF_PATH constant. Keep this path in sync with that
        // constant by hand if the resume filename ever changes.
        //
        // The caching below is why that filename carries a version suffix:
        // a day of max-age plus a week of stale-while-revalidate means
        // replacing the bytes at a stable URL would keep serving the old
        // resume to recent visitors. New content gets a new filename.
        source: '/resume/Chase_Burkhalter_Resume_2026-07.pdf',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },
}

export default nextConfig