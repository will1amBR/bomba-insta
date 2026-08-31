import { useEffect, useState } from 'react'
import { getBriefings } from '@/services/briefings'
import { getDeliverables, updateDeliverable } from '@/services/deliverables'
import type { BriefingRecord, DeliverableRecord } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubmitDeliverableDialog } from '@/components/SubmitDeliverableDialog'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Inbox,
  FileText,
  Package,
  ExternalLink,
  Check,
  Clock,
  Download,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import { generateReportPdf } from '@/lib/pdf-generator'

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'text-gray-500 bg-gray-500/10' },
  sent: { label: 'Novo briefing! 📋', color: 'text-blue-500 bg-blue-500/10' },
  in_progress: { label: 'Em produção', color: 'text-amber-500 bg-amber-500/10' },
  delivered: { label: 'Entregue', color: 'text-violet-500 bg-violet-500/10' },
  approved: {
    label: 'Aprovado! 🎉',
    color: 'text-emerald-600 bg-emerald-500/15 border-emerald-500/30',
  },
  submitted: { label: 'Enviado / Em Análise ⏳', color: 'text-blue-500 bg-blue-500/10' },
  rejected: { label: 'Revisão Solicitada ⚠️', color: 'text-rose-500 bg-rose-500/10' },
  pending: { label: 'Pendente', color: 'text-gray-500 bg-gray-500/10' },
}

export default function ClientPortal() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [briefings, setBriefings] = useState<BriefingRecord[]>([])
  const [deliverables, setDeliverables] = useState<DeliverableRecord[]>([])
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const handleApproveDeliverable = async (deliverableId: string, title: string) => {
    try {
      setApprovingId(deliverableId)
      await updateDeliverable(deliverableId, {
        status: 'approved',
        feedback: 'Aprovado pelo cliente! 🎉 Prontinho para publicação.',
      })
      toast({
        title: 'Entrega Aprovada! 🎉✅',
        description: `A entrega "${title}" foi aprovada e a agência já foi notificada!`,
      })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao aprovar',
        description: 'Não foi possível aprovar a entrega. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setApprovingId(null)
    }
  }

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

      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4 flex-1">
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
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            generateReportPdf({
              userName: user?.name || 'Creator',
              userEmail: user?.email || '',
              contents: [],
              competitors: [],
            })
          }
          className="gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
        >
          <Download className="w-4 h-4" /> Exportar Relatório em PDF
        </Button>
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
                      <div className="space-y-2 pt-1 border-t border-border/50">
                        <div className="flex items-center justify-between">
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
                              className="text-xs text-primary underline flex items-center gap-1 hover:text-primary/80 font-medium"
                            >
                              <ExternalLink className="w-3 h-3" /> Ver Conteúdo
                            </a>
                          )}
                        </div>

                        {/* Botão de Aprovação de Entrega para o Cliente */}
                        {del.status !== 'approved' && (
                          <div className="bg-muted/40 p-2.5 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-2 mt-2">
                            <div className="text-left w-full sm:w-auto">
                              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                                <span>Aprovação da Entrega</span>
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {del.status === 'submitted'
                                  ? 'Conteúdo enviado! Você pode aprovar a entrega final.'
                                  : 'Aguardando validação ou ajustes.'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleApproveDeliverable(del.id, del.title)}
                              disabled={approvingId === del.id}
                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                            >
                              {approvingId === del.id ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Aprovando...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" /> Aprovar Entrega ✅
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {del.status === 'approved' && (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Entrega 100% aprovada e validada para publicação! 🚀🎉</span>
                          </div>
                        )}
                      </div>
                    ) : b.status === 'sent' || b.status === 'in_progress' ? (
                      <div className="pt-2">
                        <SubmitDeliverableDialog briefing={b} onSuccess={loadData} />
                      </div>
                    ) : null}
                    {del?.feedback && del.status !== 'approved' && (
                      <p className="text-xs bg-muted/50 p-2 rounded flex items-start gap-1 text-muted-foreground">
                        <Check className="w-3 h-3 text-primary mt-0.5" />
                        Feedback: {del.feedback}
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
