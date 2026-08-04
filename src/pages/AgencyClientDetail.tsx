import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCreatorDetail, type CreatorDetail } from '@/services/agency'
import { getBriefings, updateBriefing } from '@/services/briefings'
import { getDeliverables, updateDeliverable } from '@/services/deliverables'
import type { BriefingRecord, DeliverableRecord } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CreateBriefingDialog } from '@/components/CreateBriefingDialog'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { ArrowLeft, Check, X, ExternalLink, Eye, Heart } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'text-gray-500 bg-gray-500/10' },
  sent: { label: 'Enviado', color: 'text-blue-500 bg-blue-500/10' },
  in_progress: { label: 'Em producao', color: 'text-amber-500 bg-amber-500/10' },
  delivered: { label: 'Entregue', color: 'text-violet-500 bg-violet-500/10' },
  approved: { label: 'Aprovado', color: 'text-emerald-500 bg-emerald-500/10' },
  submitted: { label: 'Enviado', color: 'text-blue-500 bg-blue-500/10' },
  rejected: { label: 'Rejeitado', color: 'text-rose-500 bg-rose-500/10' },
  pending: { label: 'Pendente', color: 'text-gray-500 bg-gray-500/10' },
}

export default function AgencyClientDetail() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<CreatorDetail | null>(null)
  const [briefings, setBriefings] = useState<BriefingRecord[]>([])
  const [deliverables, setDeliverables] = useState<DeliverableRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    try {
      const [d, b, del] = await Promise.all([
        getCreatorDetail(id),
        getBriefings(`influencer_id = "${id}"`),
        getDeliverables(`influencer_id = "${id}"`),
      ])
      setDetail(d)
      setBriefings(b)
      setDeliverables(del)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])
  useRealtime('briefings', () => loadData())
  useRealtime('deliverables', () => loadData())

  const handleApprove = async (delId: string) => {
    try {
      await updateDeliverable(delId, { status: 'approved', feedback: 'Aprovado! 🎉' })
      toast({ title: 'Entrega aprovada! ✅' })
      loadData()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleReject = async (delId: string) => {
    try {
      await updateDeliverable(delId, { status: 'rejected' })
      toast({ title: 'Entrega rejeitada', variant: 'destructive' })
      loadData()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="container mx-auto py-12 text-center text-muted-foreground text-sm">
        Carregando...
      </div>
    )
  if (!detail)
    return (
      <div className="container mx-auto py-12 text-center text-muted-foreground">
        Influencer nao encontrado
      </div>
    )

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      <Link to="/agencia">
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {detail.creator.name || detail.creator.email} 🎤
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{detail.creator.email}</p>
        </div>
        <CreateBriefingDialog influencerId={id!} onSuccess={loadData} />
      </div>

      <Tabs defaultValue="briefings">
        <TabsList>
          <TabsTrigger value="briefings" className="text-xs">
            Briefings ({briefings.length})
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="text-xs">
            Entregas ({deliverables.length})
          </TabsTrigger>
          <TabsTrigger value="contents" className="text-xs">
            Conteudos ({detail.contents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="briefings" className="space-y-3 mt-4">
          {briefings.length === 0 ? (
            <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Sem briefings ainda. Crie o primeiro! 📋
              </p>
            </div>
          ) : (
            briefings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{b.title}</h3>
                      <p className="text-xs text-muted-foreground">{b.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusConfig[b.status]?.color}`}
                    >
                      {statusConfig[b.status]?.label}
                    </Badge>
                  </div>
                  {b.hook && (
                    <p className="text-xs italic bg-amber-500/5 p-2 rounded">Hook: "{b.hook}"</p>
                  )}
                  {b.cta && <p className="text-xs text-muted-foreground">CTA: {b.cta}</p>}
                  {b.due_date && (
                    <p className="text-[10px] text-muted-foreground">
                      Prazo: {new Date(b.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="deliverables" className="space-y-3 mt-4">
          {deliverables.length === 0 ? (
            <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhuma entrega ainda 📦</p>
            </div>
          ) : (
            deliverables.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{d.title}</h3>
                      {d.link && (
                        <a
                          href={d.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> Ver conteudo
                        </a>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusConfig[d.status]?.color}`}
                    >
                      {statusConfig[d.status]?.label}
                    </Badge>
                  </div>
                  {d.feedback && <p className="text-xs bg-muted/40 p-2 rounded">{d.feedback}</p>}
                  {d.status === 'submitted' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1 bg-emerald-600 text-white"
                        onClick={() => handleApprove(d.id)}
                      >
                        <Check className="w-3 h-3" /> Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-rose-600"
                        onClick={() => handleReject(d.id)}
                      >
                        <X className="w-3 h-3" /> Rejeitar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="contents" className="space-y-3 mt-4">
          {detail.contents.length === 0 ? (
            <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">Sem conteudos cadastrados 📭</p>
            </div>
          ) : (
            detail.contents.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{c.title}</h3>
                    <span className="text-[10px] text-muted-foreground">
                      {c.platform} • {c.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {c.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {c.likes || 0}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusConfig[c.status]?.color || ''}`}
                    >
                      {c.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
