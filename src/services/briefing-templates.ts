import pb from '@/lib/pocketbase/client'
import type { BriefingTemplateRecord } from '@/types/content'

export const getBriefingTemplates = async (): Promise<BriefingTemplateRecord[]> => {
  const userId = pb.authStore.record?.id
  const filter = userId ? `is_preset = true || user_id = "${userId}"` : `is_preset = true`

  return pb.collection('briefing_templates').getFullList<BriefingTemplateRecord>({
    sort: '-is_preset,name',
    filter,
  })
}

export const createBriefingTemplate = async (
  data: Partial<BriefingTemplateRecord>,
): Promise<BriefingTemplateRecord> => {
  const userId = pb.authStore.record?.id
  return pb.collection('briefing_templates').create<BriefingTemplateRecord>({
    ...data,
    user_id: userId,
    is_preset: false,
  })
}

export const deleteBriefingTemplate = async (id: string): Promise<boolean> => {
  return pb.collection('briefing_templates').delete(id)
}
