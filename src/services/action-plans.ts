import pb from '@/lib/pocketbase/client'
import type { ActionPlanRecord } from '@/types/content'

export const getActionPlans = async (): Promise<ActionPlanRecord[]> => {
  return pb.collection('action_plans').getFullList<ActionPlanRecord>({
    sort: '-created',
  })
}

export const generateActionPlan = async (analysisId?: string) => {
  return pb.send('/backend/v1/action-plan', {
    method: 'POST',
    body: JSON.stringify({ analysis_id: analysisId || '' }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const updateActionPlan = async (id: string, data: Partial<ActionPlanRecord>) => {
  return pb.collection('action_plans').update(id, data)
}

export const deleteActionPlan = async (id: string) => {
  return pb.collection('action_plans').delete(id)
}
