import pb from '@/lib/pocketbase/client'
import type { BriefingRecord } from '@/types/content'

export const getBriefings = async (filter?: string): Promise<BriefingRecord[]> => {
  return pb.collection('briefings').getFullList<BriefingRecord>({
    sort: '-created',
    expand: 'influencer_id,agency_id',
    filter: filter || undefined,
  })
}

export const getBriefing = async (id: string): Promise<BriefingRecord> => {
  return pb.collection('briefings').getOne<BriefingRecord>(id, {
    expand: 'influencer_id,agency_id',
  })
}

export const createBriefing = async (data: Partial<BriefingRecord>): Promise<BriefingRecord> => {
  const userId = pb.authStore.record?.id
  return pb.collection('briefings').create<BriefingRecord>({
    ...data,
    agency_id: userId,
  })
}

export const updateBriefing = async (
  id: string,
  data: Partial<BriefingRecord>,
): Promise<BriefingRecord> => {
  return pb.collection('briefings').update<BriefingRecord>(id, data)
}

export const deleteBriefing = async (id: string): Promise<boolean> => {
  return pb.collection('briefings').delete(id)
}
