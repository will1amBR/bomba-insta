import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getContents } from '@/services/contents'
import { getCompetitors, getCompetitorInsights } from '@/services/competitors'
import type { ContentRecord, CompetitorRecord, CompetitorInsightRecord } from '@/types/content'
import { computeNicheBenchmark, KNOWN_NICHES, type NicheMetrics } from '@/services/niche-benchmark'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { generateNicheReportPdf } from '@/lib/niche-pdf-generator'
import { Download } from 'lucide-react'
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Flame,
  Target,
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Zap,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  ArrowLeft,
} from 'lucide-react'

export default function NicheReport() {
  const { user } = useAuth()
  const [contents, setContents] = useState<ContentRecord[]>([])
  const [competitors, setCompetitors] = useState<CompetitorRecord[]>([])
  const [insights, setInsights] = useState<CompetitorInsightRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedNiche, setSelectedNiche] = useState<string>('Marketing Digital')
  const [customNicheInput, setCustomNicheInput] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')

  const loadData = async () => {
    try {
      setLoading(true)
      const [cList, compList, insList] = await Promise.all([
        getContents(),
        getCompetitors(),
        getCompetitorInsights(),
      ])
      setContents(cList)
      setCompetitors(compList)
      setInsights(insList)

      // Se houver concorrentes com nicho cadastrado, seleciona o primeiro por padrão
      const firstCompNiche = compList.find((c) => c.niche)?.niche
      if (firstCompNiche && !selectedNiche) {
        setSelectedNiche(firstCompNiche)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('contents', () => loadData())
  useRealtime('competitors', () => loadData())
  useRealtime('competitor_insights', () => loadData())

  // Filtrar conteúdos e concorrentes pela plataforma selecionada se aplicável
  const platformFilteredContents = contents.filter(
    (c) => selectedPlatform === 'all' || c.platform === selectedPlatform,
  )
  const platformFilteredCompetitors = competitors.filter(
    (c) => selectedPlatform === 'all' || c.platform === selectedPlatform,
  )

  const currentNicheName = customNicheInput.trim() || selectedNiche || 'Geral'

  const benchmark = computeNicheBenchmark(
    currentNicheName,
    platformFilteredContents,
    platformFilteredCompetitors,
    insights,
  )

  // Lista de todos os nichos disponíveis (dos concorrentes cadastrados + predefinidos)
  const availableNiches = Array.from(
    new Set([...competitors.map((c) => c.niche).filter(Boolean), ...KNOWN_NICHES]),
  )

  const renderStatusBadge = (status: 'above' | 'below' | 'equal', diffPct: number) => {
    if (status === 'above') {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold gap-1 flex items-center">
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          Acima da média (+{Math.abs(diffPct)}%)
        </Badge>
      )
    }
    if (status === 'below') {
      return (
        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold gap-1 flex items-center">
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
          Abaixo da média ({diffPct}%)
        </Badge>
      )
    }
    return (
      <Badge className="bg-muted text-muted-foreground border text-[11px] font-medium gap-1 flex items-center">
        <Minus className="w-3.5 h-3.5" />
        Na média ({diffPct >= 0 ? `+${diffPct}` : diffPct}%)
      </Badge>
    )
  }

  const metricsComparisonList = [
    {
      label: 'Visualizações Médias (Views)',
      icon: Eye,
      iconColor: 'text-blue-500',
      userVal: benchmark.userAvgViews.toLocaleString(),
      nicheVal: benchmark.nicheAvgViews.toLocaleString(),
      status: benchmark.viewsStatus,
      diffPct: benchmark.viewsDiffPct,
      help: 'Média de alcance orgânico por post no nicho.',
    },
    {
      label: 'Curtidas Médias',
      icon: Heart,
      iconColor: 'text-rose-500',
      userVal: benchmark.userAvgLikes.toLocaleString(),
      nicheVal: benchmark.nicheAvgLikes.toLocaleString(),
      status: benchmark.likesStatus,
      diffPct: benchmark.likesDiffPct,
      help: 'Volume médio de reações positivas por publicação.',
    },
    {
      label: 'Comentários Médios',
      icon: MessageSquare,
      iconColor: 'text-amber-500',
      userVal: benchmark.userAvgComments.toLocaleString(),
      nicheVal: benchmark.nicheAvgComments.toLocaleString(),
      status: benchmark.commentsStatus,
      diffPct: benchmark.commentsDiffPct,
      help: 'Capacidade de gerar conversa e discussão na comunidade.',
    },
    {
      label: 'Compartilhamentos',
      icon: Share2,
      iconColor: 'text-violet-500',
      userVal: benchmark.userAvgShares.toLocaleString(),
      nicheVal: benchmark.nicheAvgShares.toLocaleString(),
      status: benchmark.sharesStatus,
      diffPct: benchmark.sharesDiffPct,
      help: 'Métrica de ouro: valor prático e desejo de propagação.',
    },
    {
      label: 'Taxa de Engajamento',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      userVal: `${benchmark.userAvgEngagementRate}%`,
      nicheVal: `${benchmark.nicheAvgEngagementRate}%`,
      status: benchmark.engagementStatus,
      diffPct: benchmark.engagementDiffPct,
      help: '(Curtidas + Comentários + Compartilhamentos) / Views.',
    },
    {
      label: 'Hook Rate (Retenção 3s)',
      icon: Zap,
      iconColor: 'text-amber-500',
      userVal: `${benchmark.userAvgHookRate}%`,
      nicheVal: `${benchmark.nicheAvgHookRate}%`,
      status: benchmark.hookRateStatus,
      diffPct: benchmark.hookRateDiffPct,
      help: 'Porcentagem do público que assiste além dos 3 primeiros segundos.',
    },
    {
      label: 'Taxa de Retenção Média',
      icon: Clock,
      iconColor: 'text-indigo-500',
      userVal: `${benchmark.userAvgRetentionRate}%`,
      nicheVal: `${benchmark.nicheAvgRetentionRate}%`,
      status: benchmark.retentionStatus,
      diffPct: benchmark.retentionDiffPct,
      help: 'Tempo médio assistido em relação à duração total do vídeo.',
    },
    {
      label: 'Pontuação Viral (Viral Score)',
      icon: Flame,
      iconColor: 'text-primary',
      userVal: `${benchmark.userAvgViralScore}/100`,
      nicheVal: `${benchmark.nicheAvgViralScore}/100`,
      status: benchmark.viralScoreStatus,
      diffPct: benchmark.viralScoreDiffPct,
      help: 'Algoritmo ViralMetrics: potencial estatístico de explosão algorítmica.',
    },
  ]

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-5xl">
      {/* Header com Navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/concorrentes">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Concorrentes
              </Button>
            </Link>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs font-semibold text-primary">Inteligência Competitiva</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" /> Relatório de Performance por Nicho 📊
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Compare seus números com a média real do seu segmento (benchmark) lado a lado ⚔️
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar Dados
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              generateNicheReportPdf({
                benchmark,
                userName: user?.name || 'Criador',
                userEmail: user?.email || '',
              })
            }
            className="gap-1.5 text-xs font-semibold border-primary/30 hover:bg-primary/10 text-primary"
          >
            <Download className="w-3.5 h-3.5 text-primary" /> Exportar PDF 📄
          </Button>
        </div>
      </div>

      {/* Barra de Filtros e Seleção de Nicho */}
      <Card className="border shadow-sm bg-card/60 backdrop-blur">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <Target className="w-3.5 h-3.5 text-primary" /> Selecione o Nicho
              </label>
              <Select
                value={selectedNiche}
                onValueChange={(v) => {
                  setSelectedNiche(v)
                  setCustomNicheInput('')
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Escolha um nicho" />
                </SelectTrigger>
                <SelectContent>
                  {availableNiches.map((niche) => (
                    <SelectItem key={niche} value={niche!}>
                      {niche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <Search className="w-3.5 h-3.5 text-secondary" /> Ou Digite um Nicho Personalizado
              </label>
              <Input
                placeholder="Ex: Odontologia, Cripto..."
                value={customNicheInput}
                onChange={(e) => setCustomNicheInput(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <Layers className="w-3.5 h-3.5 text-violet-500" /> Plataforma
              </label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Todas as plataformas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Redes</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube_shorts">YouTube Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Nicho Ativo:</span>
              <Badge variant="secondary" className="font-bold text-xs bg-primary/10 text-primary">
                {currentNicheName}
              </Badge>
              <span>•</span>
              <span>
                {benchmark.nicheCompetitorsCount > 0
                  ? `${benchmark.nicheCompetitorsCount} concorrente(s) mapeado(s) neste nicho`
                  : 'Benchmark calibrado com base de dados do segmento'}
              </span>
            </div>
            <div className="text-[11px]">
              Seus conteúdos analisados:{' '}
              <strong className="text-foreground">{benchmark.userCount} posts</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veredito Geral e Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
          <CardHeader className="p-4 sm:p-5 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" /> Veredito de Posicionamento no Nicho
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Como seu perfil performa em relação ao topo do mercado ({currentNicheName})
                </CardDescription>
              </div>
              <Badge
                className={`text-xs px-3 py-1 font-bold ${
                  benchmark.overallVerdict === 'dominando'
                    ? 'bg-emerald-500 text-white'
                    : benchmark.overallVerdict === 'competitivo'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                }`}
              >
                {benchmark.overallVerdict === 'dominando'
                  ? '👑 Liderando o Nicho'
                  : benchmark.overallVerdict === 'competitivo'
                    ? '⚡ Altamente Competitivo'
                    : '⚠️ Oportunidade de Ajustes'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-muted/40 border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Score Geral
                </span>
                <p className="text-2xl font-black text-primary mt-0.5">
                  {benchmark.overallScore}/100
                </p>
                <span className="text-[10px] text-muted-foreground">Saúde do canal</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                  Posts Virais
                </span>
                <p className="text-2xl font-black text-emerald-600 mt-0.5">
                  {benchmark.userViralCount}
                </p>
                <span className="text-[10px] text-muted-foreground">Alta tração</span>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <span className="text-[10px] uppercase font-bold text-violet-700 dark:text-violet-400">
                  Engajamento
                </span>
                <p className="text-2xl font-black text-violet-600 mt-0.5">
                  {benchmark.userAvgEngagementRate}%
                </p>
                <span className="text-[10px] text-muted-foreground">
                  Média do nicho: {benchmark.nicheAvgEngagementRate}%
                </span>
              </div>
            </div>

            {/* Insights Direcionais */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Diagnóstico & Recomendações
                Táticas:
              </h4>
              <div className="space-y-1.5">
                {benchmark.insights.map((insight, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50 leading-relaxed"
                  >
                    {insight}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Lateral: Melhores Ganchos do Nicho */}
        <Card className="border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Ganchos em Alta no Nicho
            </CardTitle>
            <CardDescription className="text-[11px]">
              Ideias validadas extraídas dos concorrentes do nicho {currentNicheName}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 flex-1">
            {benchmark.topKeywordsOrHooks.length > 0 ? (
              benchmark.topKeywordsOrHooks.map((hook, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-foreground italic space-y-1"
                >
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block not-italic">
                    Hook #{idx + 1}
                  </span>
                  "{hook}"
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs space-y-2">
                <p>Nenhum hook específico cadastrado ainda.</p>
                <Link to="/concorrentes">
                  <Button variant="outline" size="sm" className="text-xs">
                    Adicionar Concorrente
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela Comparativa Detalhada: Usuário vs Média do Nicho */}
      <Card className="border shadow-md">
        <CardHeader className="p-4 sm:p-5 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Comparativo Detalhado de Métricas
                (Benchmark)
              </CardTitle>
              <CardDescription className="text-xs">
                Seus números vs. Média calculada do segmento {currentNicheName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                <ArrowUpRight className="w-3 h-3" /> Acima
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-medium">
                <ArrowDownRight className="w-3 h-3" /> Abaixo
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b bg-muted/60 text-muted-foreground font-semibold">
                  <th className="py-3.5 px-4">Métrica Analisada</th>
                  <th className="py-3.5 px-4 text-primary font-bold">Sua Média (Perfil)</th>
                  <th className="py-3.5 px-4 text-foreground font-bold">
                    Média do Nicho ({currentNicheName})
                  </th>
                  <th className="py-3.5 px-4 text-right">Comparação com o Nicho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metricsComparisonList.map((item, idx) => {
                  const Icon = item.icon
                  const isAbove = item.status === 'above'
                  const isBelow = item.status === 'below'

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-muted/30 transition-colors ${
                        isAbove ? 'bg-emerald-500/[0.02]' : isBelow ? 'bg-rose-500/[0.02]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-md bg-muted ${item.iconColor}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <span className="font-bold text-foreground block">{item.label}</span>
                            <span className="text-[10px] text-muted-foreground">{item.help}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-foreground text-sm">
                        <span
                          className={isAbove ? 'text-emerald-600' : isBelow ? 'text-rose-600' : ''}
                        >
                          {item.userVal}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-muted-foreground text-sm">
                        {item.nicheVal}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end">
                          {renderStatusBadge(item.status, item.diffPct)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dicas para Superar o Nicho */}
      <Card className="border bg-gradient-to-br from-violet-500/[0.05] via-card to-primary/[0.05]">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-600" /> Como Superar a Média do Seu Nicho
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border bg-background/80 space-y-1">
              <span className="font-bold text-primary">1. Gancho nos Primeiros 2s 🎯</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                A média do seu nicho tem {benchmark.nicheAvgHookRate}% de retenção inicial. Use
                perguntas provocativas e quebra de padrão visual logo no frame 1.
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-background/80 space-y-1">
              <span className="font-bold text-violet-600">
                2. Roteiro Focado em Compartilhamento 🚀
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Vídeos que ensinam uma técnica prática passo a passo recebem 3x mais envios no
                WhatsApp e Direct, impulsionando a entrega orgânica.
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-background/80 space-y-1">
              <span className="font-bold text-amber-600">3. Frequência e Teste de Formato 📊</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Varie entre carrosséis explicativos e vídeos rápidos de 30 a 45 segundos para
                maximizar tanto o alcance quanto a autoridade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
