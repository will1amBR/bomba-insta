import pb from '@/lib/pocketbase/client'

export interface LeadPreview {
  title: string
  insights: string[]
  note: string
}

export interface CreateLeadResponse {
  id: string
  handle: string
  preview: LeadPreview
}

export const createLead = async (handle: string, links: string[]): Promise<CreateLeadResponse> => {
  return pb.send('/backend/v1/leads', {
    method: 'POST',
    body: JSON.stringify({ handle, links }),
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
