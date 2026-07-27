import { useEffect, useState } from 'react'
import { getContents } from '@/services/contents'
import type { ContentRecord } from '@/types/content'
import { ContentCard } from '@/components/ContentCard'
import { AddContentModal } from '@/components/AddContentModal'
import { ViralMetricsChart } from '@/components/ViralMetricsChart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Flame,
  TrendingUp,
  Sparkles,
  Video,
  Image as ImageIcon,
  Filter,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [contents, setContents] = useState<ContentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const items = await getContents()
      setContents(items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('contents', () => {
    loadData()
  })

  const filteredContents = contents.filter((c) => {
    const matchesType = filterType === 'all' || c.type === filterType
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  const viralCount = contents.filter((c) => c.status === 'viral').length
  const flopCount = contents.filter((c) => c.status === 'flop').length
  const avgHook = contents.length
    ? Math.round(contents.reduce((acc, curr) => acc + (curr.hook_rate || 0), 0) / contents.length)
    : 0
  const avgRetention = contents.length
    ? Math.round(
        contents.reduce((acc, curr) => acc + (curr.retention_rate || 0), 0) / contents.length,
      )
    : 0

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Metrificação e Desempenho
            <span className="bg-rose-500/10 text-rose-600 text-xs px-2.5 py-1 rounded-full border border-rose-200">
              Vídeos & Fotos
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Análise de engajamento, retenção dos primeiros 3 segundos e fatores de viralização.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/analise">
            <Button variant="outline" className="gap-2 text-xs font-semibold">
              <Zap className="w-4 h-4 text-amber-500" />
              Diagnóstico por IA
            </Button>
          </Link>
          <AddContentModal onSuccess={loadData} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border shadow-subtle space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Vídeos Virais</span>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold text-emerald-600">{viralCount}</p>
            <Flame className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-muted-foreground">{contents.length} cadastrados</span>
        </div>

        <div className="bg-card p-4 rounded-xl border shadow-subtle space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Vídeos com Baixo Engajamento
          </span>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold text-rose-600">{flopCount}</p>
            <TrendingUp className="w-5 h-5 text-rose-500 rotate-180" />
          </div>
          <span className="text-[10px] text-muted-foreground">Precisam de ajuste</span>
        </div>

        <div className="bg-card p-4 rounded-xl border shadow-subtle space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Hook Rate Média (3s)</span>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold text-amber-600">{avgHook}%</p>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-muted-foreground">Meta ideal: &gt;70%</span>
        </div>

        <div className="bg-card p-4 rounded-xl border shadow-subtle space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Retenção Média</span>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold text-violet-600">{avgRetention}%</p>
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
          <span className="text-[10px] text-muted-foreground">Média do canal</span>
        </div>
      </div>

      {contents.length > 0 && (
        <div className="bg-card p-5 rounded-xl border shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              Pontuação de Viralização por Conteúdo
            </h2>
            <span className="text-xs text-muted-foreground">Comparativo de Mídias</span>
          </div>
          <ViralMetricsChart contents={contents} />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Mídias & Publicações
            <span className="text-xs font-normal text-muted-foreground">
              ({filteredContents.length})
            </span>
          </h2>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 sm:w-56 h-9 text-xs"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="video">Vídeos</SelectItem>
                <SelectItem value="photo">Fotos</SelectItem>
                <SelectItem value="carousel">Carrosséis</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={loadData} className="h-9 w-9 p-0">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Carregando métricas...
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center space-y-3">
            <p className="text-muted-foreground text-sm">Nenhum conteúdo registrado ainda.</p>
            <AddContentModal onSuccess={loadData} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContents.map((c) => (
              <ContentCard key={c.id} content={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
