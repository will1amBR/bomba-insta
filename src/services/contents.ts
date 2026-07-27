import pb from '@/lib/pocketbase/client'
import type { ContentRecord } from '@/types/content'

export const getContents = async (): Promise<ContentRecord[]> => {
  return pb.collection('contents').getFullList<ContentRecord>({
    sort: '-created',
  })
}

export const getContent = async (id: string): Promise<ContentRecord> => {
  return pb.collection('contents').getOne<ContentRecord>(id)
}

export const createContent = async (data: Partial<ContentRecord>): Promise<ContentRecord> => {
  const userId = pb.authStore.record?.id
  return pb.collection('contents').create<ContentRecord>({
    ...data,
    user_id: userId,
  })
}

export const updateContent = async (
  id: string,
  data: Partial<ContentRecord>,
): Promise<ContentRecord> => {
  return pb.collection('contents').update<ContentRecord>(id, data)
}

export const deleteContent = async (id: string): Promise<boolean> => {
  return pb.collection('contents').delete(id)
}
