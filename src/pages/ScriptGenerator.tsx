import { useEffect, useState } from 'react'
import { generateAiScript } from '@/services/scripts'
import { getCompetitors, getCompetitorInsights } from '@/services/competitors'
import type { CompetitorRecord, CompetitorInsightRecord } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { Sparkles, Wand2, ArrowRight, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ScriptGenerator() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [format, setFormat] = useState('video')
  const [objective, setObjective] = useState('Maximizar retenção nos primeiros 3 segundos')
  const [loading, setLoading] = useState(false)
  const [scriptResult, setScriptResult] = useState<any>(null)
  const [inspiredByCompetitor, setInspiredByCompetitor] = useState(false)
  const [competitors, setCompetitors] = useState<CompetitorRecord[]>([])
  const [insights, setInsights] = useState<CompetitorInsightRecord[]>([])
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>('')

  useEffect(() => {
    getCompetitors()
      .then(setCompetitors)
      .catch(() => {})
    getCompetitorInsights()
      .then(setInsights)
      .catch(() => {})
  }, [])

  const handleCompetitorSelect = (compId: string) => {
    setSelectedCompetitorId(compId)
    const insight = insights.find((i) => i.competitor_id === compId)
    if (insight) {
      const ideas = Array.isArray(insight.suggested_ideas) ? insight.suggested_ideas : []
      if (ideas[0]) setTopic(ideas[0])
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) {
      toast({ title: 'Preencha o tema! 🎬', variant: 'destructive' })
      return
    }
    setLoading(true)
    setScriptResult(null)
    try {
      const res = await generateAiScript({ topic, platform, format, objective })
      setScriptResult(res)
      toast({ title: 'Roteiro gerado! ✨', description: 'Salvo na sua biblioteca!' })
    } catch {
      toast({ title: 'Erro ao gerar 😢', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-amber-500 fill-amber-500" /> Gerador de Roteiros Virais
          ✨
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cria roteiros que prendem desde o segundo 1! 🎬
        </p>
      </div>

      <div className="bg-card p-5 rounded-xl border shadow-subtle">
        <form onSubmit={handleGenerate} className="space-y-4 text-sm">
          <div>
            <Label htmlFor="topic">Tema / Tópico 🎯</Label>
            <Input
              id="topic"
              placeholder="Ex: 5 Dicas para crescer sem anúncios"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3 bg-secondary/5 p-3 rounded-lg border border-secondary/20">
            <Switch checked={inspiredByCompetitor} onCheckedChange={setInspiredByCompetitor} />
            <div className="flex-1">
              <span className="text-xs font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-secondary" /> Inspirado em concorrente
              </span>
              <p className="text-[11px] text-muted-foreground">
                Puxa ideias e hooks dos melhores canais que você acompanha
              </p>
            </div>
          </div>

          {inspiredByCompetitor && competitors.length > 0 && (
            <div>
              <Label>Escolha o concorrente</Label>
              <Select value={selectedCompetitorId} onValueChange={handleCompetitorSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {competitors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.channel_name} ({c.handle})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Plataforma</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram Reels</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube_shorts">YouTube Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Formato</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo Falado</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                  <SelectItem value="photo">Foto + Legenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Objetivo</Label>
              <Input
                placeholder="Ex: Ganhar seguidores"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 via-primary to-violet-600 text-white font-bold h-11 gap-2 shadow-md"
          >
            {loading ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin" /> Criando mágica...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Gerar Roteiro com IA
              </>
            )}
          </Button>
        </form>
      </div>

      {scriptResult && (
        <Card className="border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">{scriptResult.title}</CardTitle>
              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-xs px-2.5 py-1 rounded-full border border-amber-300">
                Viral: {scriptResult.viral_potential_score}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs md:text-sm">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-wider text-[11px] block">
                ⚡ Hook 3s
              </span>
              <p className="font-bold text-base italic">"{scriptResult.hook_headline}"</p>
            </div>
            <div className="bg-card p-4 rounded-xl border space-y-2">
              <span className="font-bold block">📈 Desenvolvimento</span>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {scriptResult.body_outline}
              </p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 p-3.5 rounded-xl">
              <span className="font-bold text-violet-700 dark:text-violet-400 block mb-0.5">
                🎯 CTA
              </span>
              <p>{scriptResult.cta}</p>
            </div>
            {scriptResult.visual_notes && (
              <div className="bg-muted/60 p-3 rounded-lg border text-xs text-muted-foreground">
                <span className="font-bold text-foreground block mb-1">🎬 Notas Visuais:</span>
                {scriptResult.visual_notes}
              </div>
            )}
            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => navigate('/biblioteca')}
                className="gap-2 bg-primary text-primary-foreground font-semibold"
              >
                Ver na Biblioteca <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
