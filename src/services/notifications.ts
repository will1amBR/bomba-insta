import pb from '@/lib/pocketbase/client'
import type { NotificationRecord } from '@/types/content'

export const getNotifications = async (limit = 50): Promise<NotificationRecord[]> => {
  const userId = pb.authStore.record?.id
  if (!userId) return []
  return pb
    .collection('notifications')
    .getList<NotificationRecord>(1, limit, {
      sort: '-created',
      filter: `user_id = "${userId}"`,
    })
    .then((res) => res.items)
}

export const getUnreadNotificationsCount = async (): Promise<number> => {
  const userId = pb.authStore.record?.id
  if (!userId) return 0
  const res = await pb.collection('notifications').getList<NotificationRecord>(1, 1, {
    filter: `user_id = "${userId}" && read = false`,
  })
  return res.totalItems
}

export const markNotificationAsRead = async (id: string): Promise<NotificationRecord> => {
  return pb.collection('notifications').update<NotificationRecord>(id, { read: true })
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const userId = pb.authStore.record?.id
  if (!userId) return
  const unread = await pb.collection('notifications').getFullList<NotificationRecord>({
    filter: `user_id = "${userId}" && read = false`,
  })
  await Promise.all(unread.map((n) => pb.collection('notifications').update(n.id, { read: true })))
}

export const createNotification = async (
  data: Partial<NotificationRecord>,
): Promise<NotificationRecord> => {
  return pb.collection('notifications').create<NotificationRecord>({
    read: false,
    ...data,
  })
}

export const deleteNotification = async (id: string): Promise<boolean> => {
  return pb.collection('notifications').delete(id)
}
