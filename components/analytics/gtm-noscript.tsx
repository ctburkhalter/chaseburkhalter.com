export function GTMNoScript({ containerId }: { containerId?: string }) {
  const gtmId = containerId || process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || ""

  // Don't render if no GTM ID is configured
  if (!gtmId) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  )
}
