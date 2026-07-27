export type ContentType = 'video' | 'photo' | 'carousel'
export type ContentPlatform = 'instagram' | 'tiktok' | 'youtube_shorts'
export type ViralStatus = 'viral' | 'standard' | 'flop'

export interface ContentRecord {
  id: string
  user_id: string
  title: string
  type: ContentType
  platform: ContentPlatform
  views: number
  likes: number
  comments: number
  shares: number
  retention_rate: number
  hook_rate: number
  watch_time_sec: number
  duration_sec: number
  posting_date: string
  viral_score: number
  status: ViralStatus
  hook_text?: string
  caption?: string
  tags?: string
  created: string
  updated: string
}

export interface AnalysisRecord {
  id: string
  user_id: string
  content_id: string
  compared_content_id?: string
  summary: string
  positive_factors: string[]
  negative_factors: string[]
  engagement_diagnosis: string
  virality_score: number
  created: string
}

export interface ScriptRecord {
  id: string
  user_id: string
  title: string
  topic: string
  platform: ContentPlatform
  format: ContentType
  hook_headline: string
  body_outline: string
  cta: string
  visual_notes: string
  estimated_duration: number
  viral_potential_score: number
  status: 'draft' | 'approved' | 'produced'
  created: string
}

export interface ContentIdea {
  id: string
  title: string
  category: string
  format: string
  reasoning: string
  hook_examples: string[]
  created: string
}
