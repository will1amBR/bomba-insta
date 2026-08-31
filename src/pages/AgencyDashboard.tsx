import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCreators } from '@/services/agency'
import { getBriefings } from '@/services/briefings'
import { getDeliverables, updateDeliverable } from '@/services/deliverables'
import type { CreatorRecord, BriefingRecord, DeliverableRecord } from '@/types/content'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AgencyPendingApprovals } from '@/components/AgencyPendingApprovals'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Users, FileText, Package, ArrowRight, Search, BarChart3, Sparkles } from 'lucide-react'

export default function AgencyDashboard() {
  const [creators, setCreators] = useState<CreatorRecord[]>([])
  const [briefings, setBriefings] = useState<BriefingRecord[]>([])
  const [deliverables, setDeliverables] = useState<DeliverableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadData = async () => {
    try {
      const [creatorsData, briefingsData, deliverablesData] = await Promise.all([
        getCreators(),
        getBriefings(),
        getDeliverables(),
      ])
      setCreators(creatorsData as CreatorRecord[])
      setBriefings(briefingsData)
      setDeliverables(deliverablesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDeliverable = async (delId: string) => {
    try {
      await updateDeliverable(delId, {
        status: 'approved',
        feedback: 'Aprovado pela agência! 🎉 Pronto para publicação.',
      })
      toast({
        title: 'Entrega Aprovada! ✅',
        description: 'Status atualizado com sucesso e notificação enviada.',
      })
      await loadData()
    } catch (err) {
      toast({
        title: 'Erro ao aprovar',
        description: 'Não foi possível aprovar a entrega. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleRejectDeliverable = async (delId: string) => {
    try {
      await updateDeliverable(delId, {
        status: 'rejected',
        feedback: 'Revisão necessária. Favor verificar os apontamentos.',
      })
      toast({
        title: 'Ajustes Solicitados ⚠️',
        description: 'O criador foi informado sobre as alterações necessárias.',
        variant: 'destructive',
      })
      await loadData()
    } catch (err) {
      toast({
        title: 'Erro ao solicitar ajustes',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('briefings', () => loadData())
  useRealtime('deliverables', () => loadData())

  const filteredCreators = creators.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  )

  const pendingDeliverables = deliverables.filter(
    (d) => d.status === 'submitted' || d.status === 'pending',
  )

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Portal da Agência 🏢
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seus influencers, aprovações de entregas e relatórios de nicho 🚀
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/nicho">
            <Button
              variant="outline"
              className="gap-1.5 text-xs font-semibold border-violet-500/30 text-violet-600 hover:bg-violet-500/10"
            >
              <BarChart3 className="w-4 h-4 text-violet-500" /> Relatório por Nicho 📊
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-subtle transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Influencers Ativos</p>
                <p className="text-2xl font-extrabold text-foreground">{creators.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-subtle transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total de Briefings</p>
                <p className="text-2xl font-extrabold text-violet-600">{briefings.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-subtle transition-shadow border-amber-500/30 bg-amber-500/[0.03]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  Aprovações Pendentes
                </p>
                <p className="text-2xl font-extrabold text-amber-600">
                  {pendingDeliverables.length}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção 1: Resumo e Lista de Aprovações Pendentes da Agência */}
      <AgencyPendingApprovals
        deliverables={deliverables}
        creators={creators}
        onApprove={handleApproveDeliverable}
        onReject={handleRejectDeliverable}
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Buscar influencer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
      ) : filteredCreators.length === 0 ? (
        <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Nenhum influencer cadastrado ainda 📭</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCreators.map((creator) => {
            const creatorBriefings = briefings.filter((b) => b.influencer_id === creator.id)
            const creatorDeliverables = deliverables.filter((d) => d.influencer_id === creator.id)
            return (
              <Card key={creator.id} className="hover:shadow-elevation transition-all">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{creator.name || creator.email}</h3>
                      <p className="text-xs text-muted-foreground">{creator.email}</p>
                    </div>
                    <Link to={`/agencia/clientes/${creator.id}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        Ver perfil <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded font-medium">
                      {creatorBriefings.length} briefings
                    </span>
                    <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-medium">
                      {creatorDeliverables.length} entregas
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
