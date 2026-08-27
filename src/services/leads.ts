import pb from '@/lib/pocketbase/client'

export interface LeadMetrics {
  followers: number
  postsCount: number
  avgEngagement: string
  viralPotential: string
  hookRetention: string
}

export interface LeadPreview {
  title: string
  summary?: string
  metrics?: LeadMetrics
  insights: string[]
  note: string
}

export interface CreateLeadResponse {
  id: string
  handle: string
  platform?: string
  preview: LeadPreview
}

export const createLead = async (
  handle: string,
  links: string[] = [],
  platform: string = 'instagram',
): Promise<CreateLeadResponse> => {
  return pb.send('/backend/v1/leads', {
    method: 'POST',
    body: JSON.stringify({ handle, links, platform }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const linkLead = async (
  leadToken: string,
): Promise<{ success: boolean; trial_end: string }> => {
  return pb.send('/backend/v1/leads/link', {
    method: 'POST',
    body: JSON.stringify({ lead_token: leadToken }),
    headers: { 'Content-Type': 'application/json' },
  })
}
