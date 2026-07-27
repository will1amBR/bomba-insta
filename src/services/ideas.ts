import pb from '@/lib/pocketbase/client'
import type { ContentIdea } from '@/types/content'

export const getContentIdeas = async (): Promise<ContentIdea[]> => {
  return pb.collection('content_ideas').getFullList<ContentIdea>({
    sort: '-created',
  })
}

export const generateIdeas = async (niche: string) => {
  return pb.send('/backend/v1/suggest-ideas', {
    method: 'POST',
    body: JSON.stringify({ niche }),
    headers: { 'Content-Type': 'application/json' },
  })
}
