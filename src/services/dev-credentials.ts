import pb from '@/lib/pocketbase/client'
import type { DevCredentialRecord, DevCredentialPlatform } from '@/types/content'

export const getDevCredentials = async (): Promise<DevCredentialRecord[]> => {
  const userId = pb.authStore.record?.id
  if (!userId) return []
  return pb.collection('dev_credentials').getFullList<DevCredentialRecord>({
    sort: '-created',
    filter: `user_id = "${userId}"`,
  })
}

export const saveDevCredential = async (
  platform: DevCredentialPlatform,
  data: Partial<DevCredentialRecord>,
): Promise<DevCredentialRecord> => {
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('Não autenticado')

  // Check if existing record exists for this user and platform
  const existing = await pb.collection('dev_credentials').getFullList<DevCredentialRecord>({
    filter: `user_id = "${userId}" && platform = "${platform}"`,
  })

  if (existing.length > 0) {
    return pb.collection('dev_credentials').update<DevCredentialRecord>(existing[0].id, {
      ...data,
      status: data.app_id || data.api_key ? 'configured' : 'pending',
    })
  }

  return pb.collection('dev_credentials').create<DevCredentialRecord>({
    user_id: userId,
    platform,
    status: data.app_id || data.api_key ? 'configured' : 'pending',
    quota_limit_daily: data.quota_limit_daily || 10000,
    quota_used_today: 0,
    ...data,
  })
}

export const testDevConnection = async (platform: DevCredentialPlatform) => {
  return pb.send('/backend/v1/dev-accounts/test', {
    method: 'POST',
    body: JSON.stringify({ platform }),
    headers: { 'Content-Type': 'application/json' },
  })
}
