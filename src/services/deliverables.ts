import pb from '@/lib/pocketbase/client'
import type { DeliverableRecord } from '@/types/content'

export const getDeliverables = async (filter?: string): Promise<DeliverableRecord[]> => {
  return pb.collection('deliverables').getFullList<DeliverableRecord>({
    sort: '-created',
    expand: 'briefing_id,influencer_id',
    filter: filter || undefined,
  })
}

export const getDeliverable = async (id: string): Promise<DeliverableRecord> => {
  return pb.collection('deliverables').getOne<DeliverableRecord>(id, {
    expand: 'briefing_id',
  })
}

export const createDeliverable = async (
  data: Partial<DeliverableRecord>,
): Promise<DeliverableRecord> => {
  const userId = pb.authStore.record?.id
  return pb.collection('deliverables').create<DeliverableRecord>({
    ...data,
    influencer_id: userId,
  })
}

export const updateDeliverable = async (
  id: string,
  data: Partial<DeliverableRecord>,
): Promise<DeliverableRecord> => {
  return pb.collection('deliverables').update<DeliverableRecord>(id, data)
}
