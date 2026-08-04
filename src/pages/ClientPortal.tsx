import { useEffect, useState } from 'react'
import { getBriefings } from '@/services/briefings'
import { getDeliverables } from '@/services/deliverables'
import type { BriefingRecord, DeliverableRecord } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubmitDeliverableDialog } from '@/components/SubmitDeliverableDialog'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Inbox, FileText, Package, ExternalLink, Check, Clock } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'text-gray-500 bg-gray-500/10' },
  sent: { label: 'Novo briefing! 📋', color: 'text-blue-500 bg-blue-500/10' },
  in_progress: { label: 'Em producao', color: 'text-amber-500 bg-amber-500/10' },
  delivered: { label: 'Entregue', color: 'text-violet-500 bg-violet-500/10' },
  approved: { label: 'Aprovado! 🎉', color: 'text-emerald-500 bg-emerald-500/10' },
  submitted: { label: 'Enviado', color: 'text-blue-500 bg-blue-500/10' },
  rejected: { label: 'Rejeitado', color: 'text-rose-500 bg-rose-500/10' },
  pending: { label: 'Pendente', color: 'text-gray-500 bg-gray-500/10' },
}

export default function ClientPortal() {
  const { user } = useAuth()
  const [briefings, setBriefings] = useState<BriefingRecord[]>([])
  const [deliverables, setDeliverables] = useState<DeliverableRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [b, d] = await Promise.all([getBriefings(), getDeliverables()])
      setBriefings(b)
      setDeliverables(d)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('briefings', () => loadData())
  useRealtime('deliverables', () => loadData())

  const activeBriefings = briefings.filter((b) => b.status === 'sent' || b.status === 'in_progress')

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Inbox className="w-7 h-7 text-primary" /> Meu Portal 📥
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Seus briefings e entregas num so lugar, {user?.name || 'creator'}! 🚀
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Briefings Ativos</p>
                <p className="text-2xl font-extrabold text-primary">{activeBriefings.length}</p>
              </div>
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Entregas Enviadas</p>
                <p className="text-2xl font-extrabold text-violet-600">{deliverables.length}</p>
              </div>
              <Package className="w-5 h-5 text-violet-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Briefings
        </h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
        ) : briefings.length === 0 ? (
          <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Sem briefings ainda! Quando a agencia enviar, aparece aqui 📬
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefings.map((b) => {
              const del = deliverables.find((d) => d.briefing_id === b.id)
              return (
                <Card key={b.id} className="hover:shadow-elevation transition-all">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-sm">{b.title}</h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusConfig[b.status]?.color}`}
                      >
                        {statusConfig[b.status]?.label}
                      </Badge>
                    </div>
                    {b.description && (
                      <p className="text-xs text-muted-foreground">{b.description}</p>
                    )}
                    {b.hook && (
                      <p className="text-xs italic bg-amber-500/5 p-2 rounded">🎯 "{b.hook}"</p>
                    )}
                    {b.cta && <p className="text-xs text-muted-foreground">CTA: {b.cta}</p>}
                    {b.visual_notes && (
                      <p className="text-xs text-muted-foreground">Visual: {b.visual_notes}</p>
                    )}
                    {b.due_date && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Prazo:{' '}
                        {new Date(b.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {del ? (
                      <div className="flex items-center justify-between pt-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusConfig[del.status]?.color}`}
                        >
                          {statusConfig[del.status]?.label}
                        </Badge>
                        {del.link && (
                          <a
                            href={del.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver
                          </a>
                        )}
                      </div>
                    ) : b.status === 'sent' ? (
                      <SubmitDeliverableDialog briefing={b} onSuccess={loadData} />
                    ) : null}
                    {del?.feedback && (
                      <p className="text-xs bg-emerald-500/5 p-2 rounded flex items-start gap-1">
                        <Check className="w-3 h-3 text-emerald-500 mt-0.5" />
                        {del.feedback}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
