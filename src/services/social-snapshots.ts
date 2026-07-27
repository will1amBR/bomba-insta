import pb from '@/lib/pocketbase/client'
import type { SocialSnapshotRecord } from '@/types/content'

export const getSocialSnapshots = async (): Promise<SocialSnapshotRecord[]> => {
  return pb.collection('social_snapshots').getFullList<SocialSnapshotRecord>({
    sort: '-created',
  })
}

export const generateSnapshot = async () => {
  return pb.send('/backend/v1/social-snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}
