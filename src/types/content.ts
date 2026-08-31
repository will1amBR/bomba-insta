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

export interface PlatformSummary {
  platform: string
  total_posts: number
  avg_views: number
  avg_likes: number
  avg_comments: number
  avg_shares: number
  best_posting_time: string
}

export interface PlatformRanking {
  platform: string
  reach: number
  position: number
}

export interface SocialSnapshotRecord {
  id: string
  user_id: string
  snapshot_date: string
  platforms_summary: PlatformSummary[]
  ranking: PlatformRanking[]
  gaps: string
  created: string
  updated: string
}

export interface ActionPlanGoal {
  id: string
  title: string
  description: string
  status: 'completed' | 'in_progress' | 'pending'
  target: string
}

export interface CalendarEntry {
  day: string
  time: string
  platform: string
  content_type: string
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface ActionPlanRecord {
  id: string
  user_id: string
  summary: string
  goals: ActionPlanGoal[]
  posting_calendar: CalendarEntry[]
  checklist: ChecklistItem[]
  progress: number
  created: string
  updated: string
}

export interface CompetitorRecord {
  id: string
  user_id: string
  channel_name: string
  handle: string
  platform: ContentPlatform
  niche: string
  notes: string
  created: string
  updated: string
}

export interface CompetitorInsightRecord {
  id: string
  user_id: string
  competitor_id: string
  summary: string
  best_hooks: string[]
  formats: string[]
  suggested_ideas: string[]
  created: string
  updated: string
}

export type BriefingStatus = 'draft' | 'sent' | 'in_progress' | 'delivered' | 'approved'
export type DeliverableStatus = 'pending' | 'submitted' | 'approved' | 'rejected'

export interface BriefingRecord {
  id: string
  agency_id: string
  influencer_id: string
  title: string
  description?: string
  platform: ContentPlatform
  content_type?: ContentType
  hook?: string
  cta?: string
  visual_notes?: string
  status: BriefingStatus
  due_date?: string
  created: string
  updated: string
  expand?: { influencer_id?: any; agency_id?: any }
}

export interface DeliverableRecord {
  id: string
  influencer_id: string
  agency_id: string
  briefing_id: string
  title: string
  link?: string
  status: DeliverableStatus
  feedback?: string
  created: string
  updated: string
  expand?: {
    briefing_id?: BriefingRecord
    influencer_id?: { id: string; name?: string; email?: string; avatar?: string }
  }
}

export interface CreatorRecord {
  id: string
  name: string
  email: string
  avatar?: string
  trial_end?: string
  role?: string
  created: string
  updated?: string
}

export type NotificationType =
  | 'briefing_new'
  | 'deliverable_submitted'
  | 'deliverable_status'
  | 'system'
  | 'comparison_alert'

export interface NotificationRecord {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  link?: string
  metadata?: Record<string, any>
  created: string
  updated: string
}

export interface BriefingTemplateRecord {
  id: string
  user_id?: string
  name: string
  category: string
  description?: string
  platform: ContentPlatform | 'all'
  content_type?: ContentType
  hook_suggestion?: string
  cta_suggestion?: string
  visual_notes?: string
  estimated_days?: number
  is_preset?: boolean
  created: string
  updated: string
}

export type DevCredentialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'meta'
export type DevCredentialStatus = 'configured' | 'pending' | 'inactive' | 'testing'

export interface DevCredentialRecord {
  id: string
  user_id: string
  platform: DevCredentialPlatform
  app_id?: string
  app_secret?: string
  api_key?: string
  webhook_verify_token?: string
  status: DevCredentialStatus
  quota_limit_daily?: number
  quota_used_today?: number
  metadata?: Record<string, any>
  created: string
  updated: string
}
