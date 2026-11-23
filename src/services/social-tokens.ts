import pb from '@/lib/pocketbase/client'

export interface SocialTokenRecord {
  id: string
  user_id: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  platform_username?: string
  platform_user_id?: string
  access_token: string
  expires_at?: string
  profile_picture_url?: string
  created?: string
}

export interface RealVideoMetrics {
  id: string
  title: string
  platform: string
  views: number
  likes: number
  comments: number
  shares: number
  retention_rate: number
  hook_rate: number
  viral_score: number
  status: string
  hook_text: string
  posting_date: string
  permalink?: string
}

export interface SocialMetricsResult {
  success: boolean
  is_real_api: boolean
  source: string
  handle: string
  platform: string
  followers: number
  media_count: number
  avg_engagement: string
  hook_retention: string
  viral_potential: string
  metrics: {
    followers: number
    postsCount: number
    avgEngagement: string
    viralPotential: string
    hookRetention: string
  }
  insights: string[]
  videos?: RealVideoMetrics[]
  has_real_data?: boolean
  data_note?: string
  what_to_do?: string[]
}

export const getMySocialTokens = async (): Promise<SocialTokenRecord[]> => {
  return pb.collection('social_tokens').getFullList<SocialTokenRecord>({
    sort: '-created',
  })
}

export const connectSocialAccount = async (data: {
  platform: 'instagram' | 'tiktok' | 'youtube'
  platform_username: string
  access_token?: string
  platform_user_id?: string
  profile_picture_url?: string
}): Promise<{ success: boolean; message: string; token_id?: string }> => {
  return pb.send('/backend/v1/social/connect', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const disconnectSocialAccount = async (
  platform: 'instagram' | 'tiktok' | 'youtube',
): Promise<{ success: boolean; message: string }> => {
  return pb.send('/backend/v1/social/disconnect', {
    method: 'POST',
    body: JSON.stringify({ platform }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const fetchSocialMetrics = async (
  handle: string,
  platform: string = 'instagram',
): Promise<SocialMetricsResult> => {
  return pb.send<SocialMetricsResult>('/backend/v1/social/metrics', {
    method: 'POST',
    body: JSON.stringify({ handle, platform }),
    headers: { 'Content-Type': 'application/json' },
  })
}
