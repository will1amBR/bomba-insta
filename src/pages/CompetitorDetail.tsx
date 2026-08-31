import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getCompetitor,
  getCompetitorInsight,
  generateCompetitorInsights,
  checkCompetitorViralAlert,
} from '@/services/competitors'
import type { CompetitorRecord, CompetitorInsightRecord } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Sparkles, Lightbulb, Layers, Zap, Cpu, BellRing, Flame } from 'lucide-react'

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube_shorts: 'YouTube Shorts',
}

export default function CompetitorDetail() {
  const { id } = useParams<{ id: string }>()
  const [competitor, setCompetitor] = useState<CompetitorRecord | null>(null)
  const [insight, setInsight] = useState<CompetitorInsightRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [testingAlert, setTestingAlert] = useState(false)

  const handleSimulateViralAlert = async () => {
    if (!id) return
    setTestingAlert(true)
    try {
      const res: any = await checkCompetitorViralAlert(id)
      if (res.viral_detected) {
        toast({
          title: 'Alerta Viral Gerado! 🔥🚨',
          description: `Novo post de ${competitor?.channel_name} detectado com Score ${res.viral_score}/100! Veja no sino de notificações.`,
        })
      } else {
        toast({
          title: 'Post monitorado',
          description: 'Métricas abaixo do limiar viral de 80 pts.',
        })
      }
    } catch {
      toast({
        title: 'Erro ao verificar alerta',
        variant: 'destructive',
      })
    } finally {
      setTestingAlert(false)
    }
  }

  const loadData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [comp, ins] = await Promise.all([getCompetitor(id), getCompetitorInsight(id)])
      setCompetitor(comp)
      setInsight(ins)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleGenerate = async () => {
    if (!id) return
    setGenerating(true)
    try {
      await generateCompetitorInsights(id)
      toast({ title: 'Insights gerados! 🧠✨' })
      loadData()
    } catch {
      toast({ title: 'Erro ao gerar insights', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  if (loading)
    return (
      <div className="container mx-auto py-12 text-center text-muted-foreground text-sm">
        Carregando...
      </div>
    )
  if (!competitor)
    return (
      <div className="container mx-auto py-12 text-center text-muted-foreground">
        Concorrente não encontrado
      </div>
    )

  const hooks = Array.isArray(insight?.best_hooks) ? insight!.best_hooks : []
  const formats = Array.isArray(insight?.formats) ? insight!.formats : []
  const ideas = Array.isArray(insight?.suggested_ideas) ? insight!.suggested_ideas : []

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      <Link to="/concorrentes">
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {competitor.channel_name} 🎯
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {competitor.handle} • {platformLabels[competitor.platform] || competitor.platform} •{' '}
            {competitor.niche}
          </p>
          {competitor.notes && (
            <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded">
              {competitor.notes}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSimulateViralAlert}
            disabled={testingAlert}
            className="gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 text-xs font-semibold"
          >
            {testingAlert ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" /> Monitorando...
              </>
            ) : (
              <>
                <BellRing className="w-3.5 h-3.5 text-amber-500" /> Testar Alerta Viral 🔥
              </>
            )}
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2 bg-secondary text-white text-xs"
          >
            {generating ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" /> Analisando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Gerar Insights
              </>
            )}
          </Button>
        </div>
      </div>

      {insight ? (
        <>
          <Card className="border-2 border-secondary/20 bg-gradient-to-b from-secondary/5 to-transparent">
            <CardContent className="p-5 space-y-2">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" /> Resumo da Análise
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Melhores Hooks
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {hooks.map((h, i) => (
                    <li key={i} className="bg-amber-500/5 p-2 rounded italic">
                      "{h}"
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-violet-500" /> Formatos
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {formats.map((f, i) => (
                    <li key={i} className="bg-violet-500/5 p-2 rounded">
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-primary" /> Ideias para Você
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {ideas.map((s, i) => (
                    <li key={i} className="bg-primary/5 p-2 rounded">
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Sem insights ainda! Clica em "Gerar Insights" e deixa a IA fazer a mágica 🪄
          </p>
        </div>
      )}
    </div>
  )
}
