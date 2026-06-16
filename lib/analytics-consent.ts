export function hasPrivacySignalEnabled(): boolean {
  if (typeof navigator === "undefined") {
    return false
  }

  const doNotTrack = navigator.doNotTrack === "1"
  const legacyDoNotTrack = typeof window !== "undefined" && window.doNotTrack === "1"
  const globalPrivacyControl = Boolean(navigator.globalPrivacyControl)

  return doNotTrack || legacyDoNotTrack || globalPrivacyControl
}

export function canLoadAnalytics(): boolean {
  return !hasPrivacySignalEnabled()
}

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean
  }

  interface Window {
    doNotTrack?: string
  }
}
