import pb from '@/lib/pocketbase/client'
import type { CompetitorRecord, CompetitorInsightRecord } from '@/types/content'

export const getCompetitors = async (): Promise<CompetitorRecord[]> => {
  return pb.collection('competitors').getFullList<CompetitorRecord>({
    sort: '-created',
  })
}

export const getCompetitor = async (id: string): Promise<CompetitorRecord> => {
  return pb.collection('competitors').getOne<CompetitorRecord>(id)
}

export const createCompetitor = async (data: Partial<CompetitorRecord>) => {
  const userId = pb.authStore.record?.id
  return pb.collection('competitors').create({ ...data, user_id: userId })
}

export const deleteCompetitor = async (id: string) => {
  return pb.collection('competitors').delete(id)
}

export const getCompetitorInsights = async (): Promise<CompetitorInsightRecord[]> => {
  return pb.collection('competitor_insights').getFullList<CompetitorInsightRecord>({
    sort: '-created',
  })
}

export const getCompetitorInsight = async (
  competitorId: string,
): Promise<CompetitorInsightRecord | null> => {
  try {
    return await pb
      .collection('competitor_insights')
      .getFirstListItem<CompetitorInsightRecord>(`competitor_id = "${competitorId}"`)
  } catch {
    return null
  }
}

export const generateCompetitorInsights = async (competitorId: string) => {
  return pb.send(`/backend/v1/competitors/${competitorId}/insights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

export const checkCompetitorViralAlert = async (
  competitorId: string,
  data?: {
    title?: string
    hook_text?: string
    views?: number
    viral_score?: number
  },
) => {
  return pb.send(`/backend/v1/competitors/${competitorId}/check-viral-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  })
}
