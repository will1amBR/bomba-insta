import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getContents } from '@/services/contents'
import { getAnalyses, runAiAnalysis } from '@/services/analyses'
import { generateActionPlan } from '@/services/action-plans'
import type { ContentRecord, AnalysisRecord } from '@/types/content'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import {
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  History,
  TrendingUp,
  BarChart3,
  Eye,
  Percent,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Award,
  Video,
  FileText,
} from 'lucide-react'

export default function Analysis() {
  const [contents, setContents] = useState<ContentRecord[]>([])
  const [savedAnalyses, setSavedAnalyses] = useState<AnalysisRecord[]>([])
  const [mainContentId, setMainContentId] = useState<string>('')
  const [comparedContentId, setComparedContentId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null)

  const loadInitialData = async () => {
    setLoadingData(true)
    try {
      const [items, analyses] = await Promise.all([
        getContents().catch(() => []),
        getAnalyses().catch(() => []),
      ])

      setContents(items)
      setSavedAnalyses(analyses)

      const viral = items.find((i) => i.status === 'viral')
      const flop = items.find((i) => i.status === 'flop')
      if (viral) setMainContentId(viral.id)
      if (flop) setComparedContentId(flop.id)

      if (analyses.length > 0) {
        setSelectedAnalysisId(analyses[0].id)
        setAnalysisResult(analyses[0])
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const handleRunAnalysis = async () => {
    if (!mainContentId) {
      toast({ title: 'Selecione o conteúdo principal', variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      const targetCompared =
        comparedContentId && comparedContentId !== 'none' ? comparedContentId : undefined
      const res = await runAiAnalysis(mainContentId, targetCompared)
      setAnalysisResult(res)
      setSelectedAnalysisId(res.id)

      toast({
        title: 'Diagnóstico Concluído!',
        description: 'Fatores de viralização e retenção identificados com sucesso.',
      })

      // Recarrega o histórico
      getAnalyses()
        .then(setSavedAnalyses)
        .catch(() => {})

      try {
        await generateActionPlan(res.id)
        toast({
          title: 'Plano de Ação gerado! 🎯',
          description: 'Confira as recomendações detalhadas na aba Plano de Ação.',
        })
      } catch {
        /* intentionally ignored */
      }
    } catch (err: any) {
      const detail =
        err?.response?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Não foi possível rodar o diagnóstico por IA. Tente novamente.'
      toast({
        title: 'Erro ao analisar',
        description: detail,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSavedAnalysis = (analysis: AnalysisRecord) => {
    setSelectedAnalysisId(analysis.id)
    setAnalysisResult(analysis)
    if (analysis.content_id) setMainContentId(analysis.content_id)
    if (analysis.compared_content_id) setComparedContentId(analysis.compared_content_id)
  }

  const mainContent = contents.find((c) => c.id === mainContentId)
  const comparedContent = contents.find(
    (c) => c.id === (comparedContentId === 'none' ? '' : comparedContentId),
  )

  // Estatísticas consolidadas
  const stats = useMemo(() => {
    const totalContents = contents.length
    const viralCount = contents.filter((c) => c.status === 'viral').length
    const avgRetention =
      totalContents > 0
        ? Math.round(contents.reduce((acc, c) => acc + (c.retention_rate || 0), 0) / totalContents)
        : 0
    const avgHook =
      totalContents > 0
        ? Math.round(contents.reduce((acc, c) => acc + (c.hook_rate || 0), 0) / totalContents)
        : 0
    const totalViews = contents.reduce((acc, c) => acc + (c.views || 0), 0)

    return { totalContents, viralCount, avgRetention, avgHook, totalViews }
  }, [contents])

  const getContentTitleById = (id?: string) => {
    if (!id) return null
    const found = contents.find((c) => c.id === id)
    return found ? found.title : `Conteúdo #${id.slice(0, 6)}`
  }

  const getContentById = (id?: string) => {
    if (!id) return null
    return contents.find((c) => c.id === id)
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Flame className="w-8 h-8 text-rose-500 fill-rose-500" />
            Diagnóstico & Análise de Viralidade
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Compare postagens virais com flops, audite ganchos de 3 segundos e obtenha diagnósticos
            profundos gerados por IA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadInitialData}
            disabled={loadingData}
            className="gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Link to="/plano">
            <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white">
              Ver Plano de Ação
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-lg">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Visualizações Totais</p>
              <p className="text-xl font-extrabold">
                {stats.totalViews > 0 ? stats.totalViews.toLocaleString('pt-BR') : '0'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Hook Rate Médio (3s)</p>
              <p className="text-xl font-extrabold">{stats.avgHook}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Retenção Média</p>
              <p className="text-xl font-extrabold">{stats.avgRetention}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 text-violet-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Vídeos Virais</p>
              <p className="text-xl font-extrabold">
                {stats.viralCount}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  de {stats.totalContents}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="run" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="run" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Nova Análise
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Histórico Salvo ({savedAnalyses.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RUN ANALYSIS */}
        <TabsContent value="run" className="space-y-6">
          <div className="bg-card p-5 md:p-6 rounded-xl border shadow-subtle space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 text-xs font-bold">
                    1
                  </span>
                  Selecionar Conteúdos para Análise & Comparação
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Escolha seu post viral para diagnóstico ou compare diretamente com um conteúdo que
                  flopou.
                </p>
              </div>
            </div>

            {contents.length === 0 && !loadingData ? (
              <div className="p-6 text-center border rounded-lg bg-muted/20 space-y-3">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold">Nenhum conteúdo cadastrado ainda</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Cadastre conteúdos no Dashboard para poder realizar análises de métricas e
                  retenção.
                </p>
                <Link to="/">
                  <Button size="sm" variant="outline">
                    Ir para Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Principal */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Conteúdo Principal (Alvo da Análise)
                    </label>
                    {mainContent && (
                      <Badge
                        variant={
                          mainContent.status === 'viral'
                            ? 'default'
                            : mainContent.status === 'flop'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {mainContent.status}
                      </Badge>
                    )}
                  </div>

                  <Select value={mainContentId} onValueChange={setMainContentId}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione o conteúdo principal" />
                    </SelectTrigger>
                    <SelectContent>
                      {contents.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="font-semibold">[{c.status.toUpperCase()}]</span>{' '}
                          {c.title} ({c.views?.toLocaleString()} views)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {mainContent ? (
                    <div className="bg-muted/40 p-3.5 rounded-lg border text-xs space-y-2 mt-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-foreground line-clamp-1">
                          {mainContent.title}
                        </p>
                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                          {mainContent.platform} • {mainContent.type}
                        </Badge>
                      </div>

                      {mainContent.hook_text && (
                        <div className="bg-background/80 p-2 rounded border border-dashed">
                          <span className="text-[10px] font-bold text-muted-foreground block mb-0.5">
                            Gancho dos primeiros 3s:
                          </span>
                          <p className="text-foreground italic">"{mainContent.hook_text}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-1 border-t text-center">
                        <div className="bg-background/60 p-1.5 rounded">
                          <span className="text-[10px] text-muted-foreground block">Views</span>
                          <span className="font-bold text-foreground">
                            {mainContent.views?.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-background/60 p-1.5 rounded">
                          <span className="text-[10px] text-muted-foreground block">Retenção</span>
                          <span className="font-bold text-emerald-600">
                            {mainContent.retention_rate}%
                          </span>
                        </div>
                        <div className="bg-background/60 p-1.5 rounded">
                          <span className="text-[10px] text-muted-foreground block">Hook 3s</span>
                          <span className="font-bold text-violet-600">
                            {mainContent.hook_rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Selecione um vídeo ou post para diagnosticar.
                    </p>
                  )}
                </div>

                {/* Comparativo */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Conteúdo Comparativo (Opcional - Ex: Flop)
                    </label>
                    {comparedContent && (
                      <Badge
                        variant={
                          comparedContent.status === 'viral'
                            ? 'default'
                            : comparedContent.status === 'flop'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {comparedContent.status}
                      </Badge>
                    )}
                  </div>

                  <Select
                    value={comparedContentId || 'none'}
                    onValueChange={(val) => setComparedContentId(val === 'none' ? '' : val)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Nenhum (Analisa apenas o principal)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum (Analisa apenas o principal)</SelectItem>
                      {contents.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="font-semibold">[{c.status.toUpperCase()}]</span>{' '}
                          {c.title} ({c.views?.toLocaleString()} views)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {comparedContent ? (
                    <div className="bg-muted/40 p-3.5 rounded-lg border text-xs space-y-2 mt-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-foreground line-clamp-1">
                          {comparedContent.title}
                        </p>
                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                          {comparedContent.platform} • {comparedContent.type}
                        </Badge>
                      </div>

                      {comparedContent.hook_text && (
                        <div className="bg-background/80 p-2 rounded border border-dashed">
                          <span className="text-[10px] font-bold text-muted-foreground block mb-0.5">
                            Gancho dos primeiros 3s:
                          </span>
                          <p className="text-foreground italic">"{comparedContent.hook_text}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-1 border-t text-center">
                        <div className="bg-background/60 p-1.5 rounded">
                          <span className="text-[10px] text-muted-foreground block">Views</span>
                          <span className="font-bold text-foreground">
                            {comparedContent.views?.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-background/60 p-1.5 rounded">
                          <span className="text-[10px] text-muted-foreground block">Retenção</span>
                          <span className="font-bold text-rose-600">
                            {comparedContent.retention_rate}%
                          </span>
                        </div>
                        <div className="bg-background/60 p-1.5 rounded">
                          <span className="text-[10px] text-muted-foreground block">Hook 3s</span>
                          <span className="font-bold text-amber-600">
                            {comparedContent.hook_rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/20 p-4 rounded-lg border border-dashed text-xs text-muted-foreground text-center">
                      Nenhum conteúdo comparativo selecionado. A IA fará uma auditoria individual do
                      conteúdo principal.
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleRunAnalysis}
              disabled={loading || !mainContentId}
              className="w-full bg-gradient-to-r from-rose-600 via-purple-600 to-violet-600 hover:from-rose-700 hover:via-purple-700 hover:to-violet-700 text-white font-bold h-12 gap-2 shadow-elevation text-sm md:text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin" />
                  Cruzando Métricas e Analisando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Diagnóstico de Viralização por IA
                </>
              )}
            </Button>
          </div>

          {/* Active Diagnostic Card */}
          {analysisResult && (
            <AnalysisResultDisplay
              result={analysisResult}
              mainContent={mainContent || getContentById(analysisResult.content_id)}
              comparedContent={
                comparedContent || getContentById(analysisResult.compared_content_id)
              }
            />
          )}
        </TabsContent>

        {/* TAB 2: SAVED ANALYSES HISTORY */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar list */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-violet-500" />
                Diagnósticos Anteriores ({savedAnalyses.length})
              </h3>

              {savedAnalyses.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Nenhuma análise salva encontrada no banco.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {savedAnalyses.map((an) => {
                    const isSelected = selectedAnalysisId === an.id
                    return (
                      <div
                        key={an.id}
                        onClick={() => handleSelectSavedAnalysis(an)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left space-y-1.5 ${
                          isSelected
                            ? 'bg-violet-500/10 border-violet-500/50 shadow-sm'
                            : 'bg-card hover:bg-muted/40 border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant={an.virality_score >= 80 ? 'default' : 'secondary'}
                            className="text-[10px] font-bold"
                          >
                            Score {an.virality_score}/100
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(an.created).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-foreground line-clamp-1">
                          {getContentTitleById(an.content_id) || 'Diagnóstico de Conteúdo'}
                        </p>

                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {an.summary}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Main detail view */}
            <div className="lg:col-span-2">
              {analysisResult ? (
                <AnalysisResultDisplay
                  result={analysisResult}
                  mainContent={getContentById(analysisResult.content_id)}
                  comparedContent={getContentById(analysisResult.compared_content_id)}
                />
              ) : (
                <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-semibold text-foreground">
                    Selecione uma análise no menu lateral
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Clique em um diagnóstico salvo para carregar todos os detalhes e insights.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AnalysisResultDisplay({
  result,
  mainContent,
  comparedContent,
}: {
  result: any
  mainContent?: ContentRecord | null
  comparedContent?: ContentRecord | null
}) {
  const score = result.virality_score || 75
  const positiveFactors = Array.isArray(result.positive_factors) ? result.positive_factors : []
  const negativeFactors = Array.isArray(result.negative_factors) ? result.negative_factors : []

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-2 border-violet-500/30 bg-gradient-to-b from-violet-500/5 to-transparent overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                Diagnóstico de Inteligência Artificial
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {mainContent ? (
                  <>
                    Análise de{' '}
                    <span className="font-bold text-foreground">{mainContent.title}</span>
                    {comparedContent ? (
                      <>
                        {' '}
                        vs{' '}
                        <span className="font-bold text-foreground">{comparedContent.title}</span>
                      </>
                    ) : (
                      ' (Individual)'
                    )}
                  </>
                ) : (
                  'Auditoria de retenção e gancho'
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`font-black text-sm px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${
                  score >= 80
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300'
                    : score >= 60
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300'
                }`}
              >
                <Flame className="w-4 h-4" />
                Pontuação Viral: {score}/100
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-5 md:p-6 text-sm">
          {/* Executive Summary */}
          <div className="bg-card p-4 rounded-xl border space-y-1.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-violet-500" />
              Resumo Executivo do Diagnóstico
            </h3>
            <p className="text-foreground leading-relaxed font-medium text-sm">{result.summary}</p>
          </div>

          {/* Compared Media Comparison Cards if available */}
          {mainContent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="text-[10px]">
                    CONTEÚDO PRINCIPAL
                  </Badge>
                  <span className="text-xs font-bold text-foreground">
                    {mainContent.views?.toLocaleString()} visualizações
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground">{mainContent.title}</p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                  <span className="text-muted-foreground">
                    Retenção:{' '}
                    <strong className="text-foreground">{mainContent.retention_rate}%</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Hook 3s: <strong className="text-foreground">{mainContent.hook_rate}%</strong>
                  </span>
                </div>
              </div>

              {comparedContent ? (
                <div className="bg-card p-4 rounded-xl border space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">
                      CONTEÚDO COMPARATIVO
                    </Badge>
                    <span className="text-xs font-bold text-foreground">
                      {comparedContent.views?.toLocaleString()} visualizações
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{comparedContent.title}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                    <span className="text-muted-foreground">
                      Retenção:{' '}
                      <strong className="text-foreground">{comparedContent.retention_rate}%</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Hook 3s:{' '}
                      <strong className="text-foreground">{comparedContent.hook_rate}%</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 p-4 rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground text-center">
                  Análise gerada em modo individual com foco nas métricas de retenção da mídia
                  principal.
                </div>
              )}
            </div>
          )}

          {/* Pros vs Cons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2.5">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Fatores Determinantes de Sucesso:
              </h4>
              <ul className="space-y-2 text-xs text-foreground">
                {positiveFactors.map((f: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
                {positiveFactors.length === 0 && (
                  <li className="text-muted-foreground italic">
                    Nenhum fator positivo registrado.
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2.5">
              <h4 className="font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Pontos de Atrito e Perda de Retenção:
              </h4>
              <ul className="space-y-2 text-xs text-foreground">
                {negativeFactors.map((f: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
                {negativeFactors.length === 0 && (
                  <li className="text-muted-foreground italic">
                    Nenhum ponto de atrito registrado.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Aviso de dados não verificados */}
          {(result as any).has_real_data === false && (result as any).what_to_do?.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                Para analisar vídeos reais, faça isto:
              </h4>
              <ul className="space-y-1.5 text-xs">
                {(result as any).what_to_do.map((todo: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground">
                    <span className="font-bold text-amber-600">{idx + 1}.</span>
                    <span>{todo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deep Diagnosis */}
          {result.engagement_diagnosis && (
            <div className="bg-card p-4 md:p-5 rounded-xl border space-y-2 shadow-sm">
              <h4 className="font-bold text-foreground flex items-center gap-2 text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Diagnóstico Detalhado de Gancho, Retenção & CTA:
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-lg border">
                {result.engagement_diagnosis}
              </p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
            <span className="text-xs text-muted-foreground">
              Quer transformar esses insights em roteiros prontos?
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link to="/roteiros" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <Video className="w-3.5 h-3.5" />
                  Gerador de Roteiros
                </Button>
              </Link>
              <Link to="/plano" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs"
                >
                  Ver Plano de Ação
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
