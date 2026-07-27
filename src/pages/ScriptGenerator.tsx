import { useState } from 'react'
import { generateAiScript } from '@/services/scripts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Value'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Sparkles, Video, Play, CheckCircle2, ArrowRight, Wand2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ScriptGenerator() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [format, setFormat] = useState('video')
  const [objective, setObjective] = useState('Maximizar retenção nos primeiros 3 segundos')
  const [loading, setLoading] = useState(false)
  const [scriptResult, setScriptResult] = useState<any>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) {
      toast({ title: 'Preencha o tema do roteiro', variant: 'destructive' })
      return
    }

    setLoading(true)
    setScriptResult(null)

    try {
      const res = await generateAiScript({ topic, platform, format, objective })
      setScriptResult(res)
      toast({ title: 'Roteiro Gerado!', description: 'Salvo automaticamente na sua biblioteca.' })
    } catch (err) {
      toast({ title: 'Erro ao gerar roteiro', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-amber-500 fill-amber-500" />
          Gerador de Roteiros de Alto Engajamento
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Crie roteiros otimizados para alta retenção baseados nas técnicas dos vídeos mais virais.
        </p>
      </div>

      <div className="bg-card p-5 rounded-xl border shadow-subtle">
        <form onSubmit={handleGenerate} className="space-y-4 text-sm">
          <div>
            <Label htmlFor="topic">Tema / Tópico do Conteúdo</Label>
            <Input
              id="topic"
              placeholder="Ex: 5 Dicas para crescer o perfil sem gastar em anúncios"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

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
                  <SelectItem value="carousel">Carrossel Texto/Imagem</SelectItem>
                  <SelectItem value="photo">Foto + Legenda Longa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Objetivo Principal</Label>
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
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 text-white font-bold h-11 gap-2 shadow-md"
          >
            {loading ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin" />
                Estruturando Roteiro Viral...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Roteiro Estruturado com IA
              </>
            )}
          </Button>
        </form>
      </div>

      {scriptResult && (
        <Card className="border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent space-y-4 animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground">
                {scriptResult.title}
              </CardTitle>
              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-xs px-2.5 py-1 rounded-full border border-amber-300">
                Potencial Viral: {scriptResult.viral_potential_score}%
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-xs md:text-sm">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-wider text-[11px] block">
                ⚡ Gancho nos Primeiros 3s (Hook Rate)
              </span>
              <p className="font-bold text-base text-foreground italic">
                "{scriptResult.hook_headline}"
              </p>
            </div>

            <div className="bg-card p-4 rounded-xl border space-y-2">
              <span className="font-bold text-foreground block">
                📈 Desenvolvimento & Pacing (Troca de cenas a cada 2-3s)
              </span>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {scriptResult.body_outline}
              </p>
            </div>

            <div className="bg-violet-500/10 border border-violet-500/20 p-3.5 rounded-xl">
              <span className="font-bold text-violet-700 dark:text-violet-400 block mb-0.5">
                🎯 Chamada para Ação (CTA)
              </span>
              <p className="text-foreground">{scriptResult.cta}</p>
            </div>

            {scriptResult.visual_notes && (
              <div className="bg-muted/60 p-3 rounded-lg border text-xs text-muted-foreground">
                <span className="font-bold text-foreground block mb-1">
                  🎬 Instruções Visuais & Edição:
                </span>
                {scriptResult.visual_notes}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => navigate('/biblioteca')}
                className="gap-2 bg-primary text-primary-foreground font-semibold"
              >
                Ver na Biblioteca de Roteiros
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
