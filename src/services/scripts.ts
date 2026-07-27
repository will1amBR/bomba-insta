import pb from '@/lib/pocketbase/client'
import type { ScriptRecord } from '@/types/content'

export const getScripts = async (): Promise<ScriptRecord[]> => {
  return pb.collection('scripts').getFullList<ScriptRecord>({
    sort: '-created',
  })
}

export const generateAiScript = async (params: {
  topic: string
  platform: string
  format: string
  objective?: string
}) => {
  return pb.send('/backend/v1/generate-script', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const updateScriptStatus = async (id: string, status: 'draft' | 'approved' | 'produced') => {
  return pb.collection('scripts').update(id, { status })
}

export const deleteScript = async (id: string) => {
  return pb.collection('scripts').delete(id)
}
