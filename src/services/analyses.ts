import pb from '@/lib/pocketbase/client'
import type { AnalysisRecord } from '@/types/content'

export const getAnalyses = async (): Promise<AnalysisRecord[]> => {
  return pb.collection('analyses').getFullList<AnalysisRecord>({
    sort: '-created',
  })
}

export const runAiAnalysis = async (contentId: string, comparedContentId?: string) => {
  return pb.send('/backend/v1/analyze-content', {
    method: 'POST',
    body: JSON.stringify({ content_id: contentId, compared_content_id: comparedContentId }),
    headers: { 'Content-Type': 'application/json' },
  })
}
