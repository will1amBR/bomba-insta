import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DeliverableRecord, CreatorRecord } from '@/types/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  UserCheck,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react'

interface AgencyPendingApprovalsProps {
  deliverables: DeliverableRecord[]
  creators: CreatorRecord[]
  onApprove?: (id: string) => Promise<void>
  onReject?: (id: string) => Promise<void>
}

export function AgencyPendingApprovals({
  deliverables,
  creators,
  onApprove,
  onReject,
}: AgencyPendingApprovalsProps) {
  const [selectedCreatorFilter, setSelectedCreatorFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Filtrar apenas entregas aguardando aprovação (status: 'submitted' ou 'pending')
  const pendingApprovals = deliverables.filter(
    (d) => d.status === 'submitted' || d.status === 'pending',
  )

  const filteredApprovals = pendingApprovals.filter((d) => {
    if (selectedCreatorFilter === 'all') return true
    return d.influencer_id === selectedCreatorFilter
  })

  // Agrupamento por Creator/Influencer
  const creatorMap = new Map<string, { creator?: CreatorRecord; items: DeliverableRecord[] }>()

  filteredApprovals.forEach((item) => {
    const creatorId = item.influencer_id
    if (!creatorMap.has(creatorId)) {
      const creator = creators.find((c) => c.id === creatorId)
      creatorMap.set(creatorId, { creator, items: [] })
    }
    creatorMap.get(creatorId)!.items.push(item)
  })

  const handleQuickApprove = async (delId: string) => {
    if (!onApprove) return
    try {
      setActionLoadingId(delId)
      await onApprove(delId)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleQuickReject = async (delId: string) => {
    if (!onReject) return
    try {
      setActionLoadingId(delId)
      await onReject(delId)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-md overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b bg-amber-500/[0.04]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="w-5 h-5 animate-pulse" />
              </span>
              <CardTitle className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                Aprovações Pendentes
                <Badge
                  variant="outline"
                  className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs px-2.5 py-0.5 font-bold"
                >
                  {pendingApprovals.length} aguardando
                </Badge>
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Entregas submetidas pelos criadores que precisam de revisão da agência ou cliente 🎯
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/70 rounded-lg p-0.5 border text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'grouped'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Por Criador
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Todas ({pendingApprovals.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filtros rápidos se houver múltiplos criadores */}
        {creators.length > 1 && pendingApprovals.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 overflow-x-auto text-xs scrollbar-hide">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCreatorFilter('all')}
              className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                selectedCreatorFilter === 'all'
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              Todos ({pendingApprovals.length})
            </button>
            {creators.map((c) => {
              const count = pendingApprovals.filter((d) => d.influencer_id === c.id).length
              if (count === 0) return null
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCreatorFilter(c.id)}
                  className={`px-2 py-0.5 rounded-full text-[11px] transition-colors whitespace-nowrap ${
                    selectedCreatorFilter === c.id
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {c.name || c.email} ({count})
                </button>
              )
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {pendingApprovals.length === 0 ? (
          <div className="bg-muted/20 border border-dashed border-emerald-500/30 rounded-xl p-8 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">
              Tudo em dia! Nenhuma entrega pendente 🎉
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Todas as entregas submetidas já foram analisadas ou aprovadas. Quando um influencer
              enviar novo material, ele aparecerá aqui.
            </p>
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="space-y-4">
            {Array.from(creatorMap.entries()).map(([creatorId, { creator, items }]) => {
              const creatorName =
                creator?.name ||
                items[0]?.expand?.influencer_id?.name ||
                creator?.email ||
                'Influencer'

              return (
                <div
                  key={creatorId}
                  className="rounded-xl border bg-card p-4 space-y-3 shadow-sm hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{creatorName}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          {creator?.email || items[0]?.expand?.influencer_id?.email || ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-amber-600 bg-amber-500/10 text-[11px] font-bold"
                      >
                        {items.length} pendente{items.length > 1 ? 's' : ''}
                      </Badge>
                      <Link to={`/agencia/clientes/${creatorId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 border-primary/30 hover:bg-primary/10"
                        >
                          Ver perfil <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col justify-between gap-2.5 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-foreground line-clamp-1">
                              {item.title}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] text-blue-600 bg-blue-500/10 whitespace-nowrap"
                            >
                              {item.status === 'submitted' ? 'Enviado' : 'Pendente'}
                            </Badge>
                          </div>
                          {item.expand?.briefing_id?.title && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              📋 Briefing: {item.expand.briefing_id.title}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            Enviado em: {new Date(item.created).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(item.created).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary underline flex items-center gap-1 font-medium hover:text-primary/80"
                            >
                              <ExternalLink className="w-3 h-3" /> Ver Conteúdo
                            </a>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">
                              Sem link
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            {onReject && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50"
                                onClick={() => handleQuickReject(item.id)}
                                disabled={actionLoadingId === item.id}
                              >
                                Ajustes
                              </Button>
                            )}
                            {onApprove && (
                              <Button
                                size="sm"
                                className="h-7 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleQuickApprove(item.id)}
                                disabled={actionLoadingId === item.id}
                              >
                                Aprovar ✅
                              </Button>
                            )}
                            <Link to={`/agencia/clientes/${creatorId}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title="Ver detalhes"
                              >
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredApprovals.map((item) => {
              const creator =
                creators.find((c) => c.id === item.influencer_id) || item.expand?.influencer_id
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border bg-card hover:border-amber-500/40 transition-colors flex flex-col justify-between gap-3 text-xs shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-primary" />
                          {creator?.name || creator?.email || 'Influencer'}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] text-blue-600 bg-blue-500/10 whitespace-nowrap"
                      >
                        {item.status === 'submitted' ? 'Enviado' : 'Pendente'}
                      </Badge>
                    </div>
                    {item.expand?.briefing_id?.title && (
                      <p className="text-[11px] text-muted-foreground bg-muted/40 p-1.5 rounded">
                        📋 {item.expand.briefing_id.title}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline flex items-center gap-1 font-medium hover:text-primary/80"
                      >
                        <ExternalLink className="w-3 h-3" /> Ver Conteúdo
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">
                        Sem link anexo
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {onReject && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50"
                          onClick={() => handleQuickReject(item.id)}
                          disabled={actionLoadingId === item.id}
                        >
                          Ajustes
                        </Button>
                      )}
                      {onApprove && (
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleQuickApprove(item.id)}
                          disabled={actionLoadingId === item.id}
                        >
                          Aprovar ✅
                        </Button>
                      )}
                      <Link to={`/agencia/clientes/${item.influencer_id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="Ver detalhes do cliente"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
