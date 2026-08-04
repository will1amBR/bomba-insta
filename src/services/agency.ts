import pb from '@/lib/pocketbase/client'

export interface CreatorRecord {
  id: string
  name: string
  email: string
  avatar?: string
  trial_end?: string
  role?: string
  created: string
  updated: string
}

export interface CreatorContent {
  id: string
  title: string
  type: string
  platform: string
  views: number
  likes: number
  status: string
  viral_score: number
  hook_rate: number
  retention_rate: number
  created: string
}

export interface CreatorDetail {
  creator: CreatorRecord
  contents: CreatorContent[]
  briefingsCount: number
  deliverablesCount: number
}

export const getCreators = async (): Promise<CreatorRecord[]> => {
  return pb.send('/backend/v1/agency/creators', { method: 'GET' })
}

export const getCreatorDetail = async (creatorId: string): Promise<CreatorDetail> => {
  return pb.send(`/backend/v1/agency/creators/${creatorId}`, { method: 'GET' })
}
