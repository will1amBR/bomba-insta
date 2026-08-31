import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notifications'
import type { NotificationRecord } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Package,
  Sparkles,
  ExternalLink,
  Flame,
  AlertTriangle,
} from 'lucide-react'

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const loadNotifications = async () => {
    try {
      const items = await getNotifications(20)
      setNotifications(items)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useRealtime('notifications', () => {
    loadNotifications()
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {
      // ignore
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setLoading(true)
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleClickItem = async (notif: NotificationRecord) => {
    if (!notif.read) {
      await handleMarkAsRead(notif.id)
    }
    if (notif.link) {
      setOpen(false)
      navigate(notif.link)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'briefing_new':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'deliverable_submitted':
        return <Package className="w-4 h-4 text-violet-500" />
      case 'deliverable_status':
        return <Check className="w-4 h-4 text-emerald-500" />
      case 'comparison_alert':
        return <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
      default:
        return <Sparkles className="w-4 h-4 text-primary" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-xl border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Notificações 🔔</span>
            {unreadCount > 0 && (
              <span className="bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={loading}
              className="text-xs h-7 px-2 text-muted-foreground hover:text-primary gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar lidas
            </Button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <p className="text-base">🎉</p>
              <p className="font-semibold text-foreground">Tudo limpo por aqui!</p>
              <p>Você será notificado quando receber briefings ou entregas.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClickItem(n)}
                className={`p-3 text-xs flex items-start gap-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                  !n.read ? 'bg-primary/5 font-medium' : 'text-muted-foreground'
                }`}
              >
                <div className="p-2 rounded-lg bg-background border flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs truncate ${
                        !n.read ? 'font-bold text-foreground' : 'text-foreground/80'
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {n.created
                        ? new Date(n.created).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          })
                        : 'Hoje'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>

                  {/* Detalhes extras se for alerta de concorrente */}
                  {n.type === 'comparison_alert' && n.metadata?.viral_score && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" /> Viral Score{' '}
                        {n.metadata.viral_score}/100
                      </span>
                    </div>
                  )}

                  {n.link && (
                    <div className="flex items-center gap-1 text-[10px] text-primary font-semibold pt-0.5">
                      <span>
                        {n.type === 'comparison_alert' ? 'Espiar Concorrente 👀' : 'Ver detalhes'}
                      </span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleMarkAsRead(n.id, e)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary flex-shrink-0"
                    title="Marcar como lida"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
