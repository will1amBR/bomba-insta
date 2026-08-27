export type DetectedPlatform = 'instagram' | 'tiktok' | 'youtube_shorts' | 'unknown'

export interface SmartInputResult {
  platform: DetectedPlatform
  handle: string
  normalizedUrl: string
  isValid: boolean
}

export function detectPlatform(input: string): DetectedPlatform {
  const lower = input.toLowerCase().trim()
  if (lower.includes('instagram.com') || lower.includes('instagr.am') || lower.includes('ig.me'))
    return 'instagram'
  if (lower.includes('tiktok.com') || lower.includes('vm.tiktok.com')) return 'tiktok'
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube_shorts'
  if (lower.startsWith('ig:') || lower.startsWith('insta:')) return 'instagram'
  if (lower.startsWith('tt:') || lower.startsWith('tiktok:')) return 'tiktok'
  if (lower.startsWith('yt:') || lower.startsWith('youtube:')) return 'youtube_shorts'
  return 'unknown'
}

export function normalizeHandle(input: string): string {
  return input.trim().replace(/^@+/, '').replace(/\s+/g, '')
}

function extractHandleFromUrl(url: string, platform: DetectedPlatform): string {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/').filter(Boolean)
    if (platform === 'instagram' || platform === 'tiktok') {
      return parts[0] || ''
    }
    if (platform === 'youtube_shorts') {
      const shortsIdx = parts.indexOf('shorts')
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1]
      return parts[parts.length - 1] || ''
    }
    return parts[parts.length - 1] || ''
  } catch {
    return ''
  }
}

export function parseSmartInput(input: string): SmartInputResult {
  const trimmed = input.trim()
  if (!trimmed) return { platform: 'unknown', handle: '', normalizedUrl: '', isValid: false }

  const platform = detectPlatform(trimmed)

  if (trimmed.startsWith('@')) {
    const handle = normalizeHandle(trimmed)
    return {
      platform: platform === 'unknown' ? 'instagram' : platform,
      handle: `@${handle}`,
      normalizedUrl: handle,
      isValid: handle.length > 0,
    }
  }

  if (/^https?:\/\//.test(trimmed)) {
    const detectedPlat = platform === 'unknown' ? 'instagram' : platform
    const handle = extractHandleFromUrl(trimmed, detectedPlat)
    return {
      platform: detectedPlat,
      handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : trimmed,
      normalizedUrl: trimmed,
      isValid: true,
    }
  }

  const cleanHandle = normalizeHandle(trimmed)
  return {
    platform: platform === 'unknown' ? 'instagram' : platform,
    handle: cleanHandle ? `@${cleanHandle}` : '',
    normalizedUrl: cleanHandle,
    isValid: cleanHandle.length > 0,
  }
}

export const platformLabels: Record<DetectedPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube_shorts: 'YouTube Shorts',
  unknown: 'Detectar...',
}

export const platformColors: Record<DetectedPlatform, string> = {
  instagram: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  tiktok: 'text-violet-600 bg-violet-600/10 border-violet-600/20',
  youtube_shorts: 'text-red-500 bg-red-500/10 border-red-500/20',
  unknown: 'text-muted-foreground bg-muted/40 border-border',
}
