import { useEffect, useState } from 'react'
import { getContents } from '@/services/contents'
import { runAiAnalysis } from '@/services/analyses'
import { generateActionPlan } from '@/services/action-plans'
import type { ContentRecord } from '@/types/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'

export default function Analysis() {
  const [contents, setContents] = useState<ContentRecord[]>([])
  const [mainContentId, setMainContentId] = useState<string>('')
  const [comparedContentId, setComparedContentId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  useEffect(() => {
    getContents().then((items) => {
      setContents(items)
      const viral = items.find((i) => i.status === 'viral')
      const flop = items.find((i) => i.status === 'flop')
      if (viral) setMainContentId(viral.id)
      if (flop) setComparedContentId(flop.id)
    })
  }, [])

  const handleRunAnalysis = async () => {
    if (!mainContentId) {
      toast({ title: 'Selecione o conteúdo principal', variant: 'destructive' })
      return
    }

    setLoading(true)
    setAnalysisResult(null)

    try {
      const res = await runAiAnalysis(mainContentId, comparedContentId || undefined)
      setAnalysisResult(res)
      toast({
        title: 'Diagnóstico Concluído!',
        description: 'Fatores de viralização identificados.',
      })
      try {
        await generateActionPlan(res.id)
        toast({ title: 'Plano de Ação gerado! 🎯', description: 'Confira na aba Plano de Ação!' })
      } catch {
        /* intentionally ignored */
      }
    } catch (err) {
      toast({
        title: 'Erro ao analisar',
        description: 'Não foi possível rodar o diagnóstico por IA.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const mainContent = contents.find((c) => c.id === mainContentId)
  const comparedContent = contents.find((c) => c.id === comparedContentId)

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Flame className="w-7 h-7 text-rose-500 fill-rose-500" />
          Diagnóstico & Comparação de Viralidade
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Descubra os fatores exatos que fizeram um vídeo/foto viralizar enquanto outro teve baixo
          engajamento.
        </p>
      </div>

      <div className="bg-card p-5 rounded-xl border shadow-subtle space-y-4">
        <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
          1. Selecionar Mídias para Comparação
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Conteúdo Principal (Ex: O que viralizou)
            </label>
            <Select value={mainContentId} onValueChange={setMainContentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o conteúdo 1" />
              </SelectTrigger>
              <SelectContent>
                {contents.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    [{c.status.toUpperCase()}] {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {mainContent && (
              <div className="bg-muted/40 p-3 rounded-lg border text-xs space-y-1 mt-2">
                <p className="font-bold text-foreground">{mainContent.title}</p>
                <p className="text-muted-foreground">
                  Views: {mainContent.views?.toLocaleString()} • Retenção:{' '}
                  {mainContent.retention_rate}% • Hook 3s: {mainContent.hook_rate}%
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Conteúdo Comparativo (Opcional - Ex: O que Flopou)
            </label>
            <Select value={comparedContentId} onValueChange={setComparedContentId}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhum (Analisa apenas o principal)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (Apenas o principal)</SelectItem>
                {contents.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    [{c.status.toUpperCase()}] {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {comparedContent && (
              <div className="bg-muted/40 p-3 rounded-lg border text-xs space-y-1 mt-2">
                <p className="font-bold text-foreground">{comparedContent.title}</p>
                <p className="text-muted-foreground">
                  Views: {comparedContent.views?.toLocaleString()} • Retenção:{' '}
                  {comparedContent.retention_rate}% • Hook 3s: {comparedContent.hook_rate}%
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleRunAnalysis}
          disabled={loading || !mainContentId}
          className="w-full bg-gradient-to-r from-rose-600 via-purple-600 to-violet-600 text-white font-bold h-11 gap-2 shadow-elevation"
        >
          {loading ? (
            <>
              <Cpu className="w-5 h-5 animate-spin" />
              Analisando Padrões de Engajamento com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Diagnóstico de Viralização
            </>
          )}
        </Button>
      </div>

      {analysisResult && (
        <div className="space-y-4 animate-fade-in">
          <Card className="border-2 border-violet-500/30 bg-gradient-to-b from-violet-500/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  Resultado do Diagnóstico por IA
                </CardTitle>
                <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm px-3 py-1 rounded-full border border-emerald-300">
                  Pontuação Viral: {analysisResult.virality_score}/100
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="bg-card p-3.5 rounded-lg border">
                <h3 className="font-bold text-foreground mb-1">Resumo Executivo:</h3>
                <p className="text-muted-foreground leading-relaxed">{analysisResult.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Fatores Determinantes de Sucesso:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-foreground">
                    {(analysisResult.positive_factors || []).map((f: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Pontos de Atrito e Perda de Retenção:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-foreground">
                    {(analysisResult.negative_factors || []).map((f: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {analysisResult.engagement_diagnosis && (
                <div className="bg-card p-4 rounded-xl border space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Diagnóstico Completo de Gancho & Retenção:
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {analysisResult.engagement_diagnosis}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
