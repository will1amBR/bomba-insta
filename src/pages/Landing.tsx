import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SmartHandleInput } from '@/components/SmartHandleInput'
import { parseSmartInput, type DetectedPlatform } from '@/lib/smart-input'
import { createLead, type LeadPreview } from '@/services/leads'
import { fetchSocialMetrics, type RealVideoMetrics } from '@/services/social-tokens'
import { toast } from '@/hooks/use-toast'
import {
  Flame,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  Target,
  BarChart3,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  Video,
  Play,
  Instagram,
  Youtube,
  ShieldCheck,
  Star,
  Award,
  Sparkle,
  Compass,
  Layers,
  ChevronRight,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const { signInWith } = useAuth()
  const [handleInput, setHandleInput] = useState('')
  const [detectedPlatform, setDetectedPlatform] = useState<DetectedPlatform>('instagram')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isRealSource, setIsRealSource] = useState(false)
  const [previewData, setPreviewData] = useState<{
    handle: string
    platform: string
    preview: LeadPreview
    videos?: RealVideoMetrics[]
    whatToDo?: string[]
  } | null>(null)

  const previewRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (val: string, platform?: DetectedPlatform) => {
    setHandleInput(val)
    if (platform && platform !== 'unknown') {
      setDetectedPlatform(platform)
    }
  }

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')

    const parsed = parseSmartInput(handleInput)
    if (!parsed.isValid || !handleInput.trim()) {
      setError('Por favor, informe seu @ ou cole o link do seu perfil/vídeo! 🚀')
      return
    }

    setLoading(true)
    try {
      const platformToSave = parsed.platform !== 'unknown' ? parsed.platform : detectedPlatform
      const links = /^https?:\/\//.test(handleInput.trim()) ? [handleInput.trim()] : []

      // 1. Try real metric search first
      let realMetrics: any = null
      try {
        const metricRes = await fetchSocialMetrics(parsed.handle, platformToSave)
        if (metricRes && metricRes.success) {
          realMetrics = metricRes
          setIsRealSource(metricRes.is_real_api)
        }
      } catch {
        /* intentionally ignored */
      }

      // 2. Save lead in backend
      const res = await createLead(parsed.handle, links, platformToSave)

      // Save lead token in localStorage so signup can associate it
      if (res.id) {
        localStorage.setItem('lead_token', res.id)
      }

      // Combine real metrics or fallback
      const hasRealVideos = realMetrics && realMetrics.has_real_data
      const effectivePreview: LeadPreview = realMetrics
        ? {
            title: hasRealVideos
              ? `Diagnóstico com vídeos reais de @${parsed.handle} ✅`
              : res.preview.title,
            summary: hasRealVideos
              ? (realMetrics.data_note || 'Métricas extraídas de vídeos reais.') +
                ` Engajamento médio: ${realMetrics.avg_engagement}.`
              : res.preview.summary,
            metrics: realMetrics.metrics,
            insights: realMetrics.insights || res.preview.insights,
            note:
              hasRealVideos || realMetrics.is_real_api
                ? realMetrics.data_note || 'Métricas obtidas de fonte real.'
                : (realMetrics.what_to_do || []).join(' ') || res.preview.note,
          }
        : res.preview

      setPreviewData({
        handle: parsed.handle,
        platform: platformToSave,
        preview: effectivePreview,
        videos: hasRealVideos ? realMetrics.videos || [] : [],
        whatToDo: !hasRealVideos ? realMetrics?.what_to_do || [] : [],
      })

      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch {
      setError('Ops! Não foi possível gerar os dados no momento. Tente novamente! 😅')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSocialAuth = async (provider: string) => {
    setSocialLoading(provider)
    try {
      const res = await signInWith(provider)
      if (res.error) {
        navigate('/signup')
      } else {
        toast({ title: 'Login realizado com sucesso! 🎉' })
        navigate('/')
      }
    } catch {
      navigate('/signup')
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="w-full overflow-hidden">
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 opacity-30 blur-3xl">
        <div className="w-full h-full bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 rounded-full" />
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 px-4 container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-violet-500/15 border border-rose-500/30 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold text-foreground shadow-sm animate-pulse">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>A inteligência artificial que destrava o seu algoritmo</span>
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
            Descubra por que seus vídeos{' '}
            <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 bg-clip-text text-transparent underline decoration-wavy decoration-amber-400">
              bombam de verdade
            </span>{' '}
            🚀
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
            Métricas virais, retenção de hook nos primeiros 3 segundos, diagnóstico de concorrentes
            e roteiros prontos que convertem views em seguidores e vendas! 💸
          </p>

          {/* Smart Input Hero Box */}
          <div className="w-full max-w-2xl bg-card/90 backdrop-blur-md p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-primary/30 shadow-2xl space-y-3">
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1">
                <SmartHandleInput
                  value={handleInput}
                  onChange={handleInputChange}
                  placeholder="@seuperfil, link do Insta, TikTok ou Shorts..."
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-13 px-6 bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 hover:from-amber-600 hover:via-rose-600 hover:to-violet-700 text-white font-extrabold text-base rounded-xl shadow-lg shadow-rose-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] gap-2 flex-shrink-0"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">🌀</span> Analisando perfil...
                  </>
                ) : (
                  <>
                    <span>Analisar Grátis</span>
                    <Zap className="w-5 h-5 fill-current" />
                  </>
                )}
              </Button>
            </form>

            {error && (
              <p className="text-xs sm:text-sm text-destructive font-semibold bg-destructive/10 py-1.5 px-3 rounded-lg border border-destructive/20 text-left">
                {error}
              </p>
            )}

            {/* Micro badges below hero input */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-[11px] sm:text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Seguro & Grátis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>+12.800 criadores já analisaram</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-500" />
                <span>Resultado em 3 segundos</span>
              </div>
            </div>

            {/* Social Login Shortcut on Hero */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-semibold">
                Ou acesse direto com sua rede:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={socialLoading !== null}
                  onClick={() => handleQuickSocialAuth('google')}
                  className="h-8 px-3 text-[11px] font-bold border rounded-lg gap-1.5 hover:bg-muted"
                >
                  <img
                    src="https://img.usecurling.com/i?q=google"
                    alt="Google"
                    className="w-3.5 h-3.5"
                  />
                  <span>Google</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={socialLoading !== null}
                  onClick={() => handleQuickSocialAuth('instagram')}
                  className="h-8 px-3 text-[11px] font-bold border rounded-lg gap-1.5 text-pink-600 hover:bg-muted"
                >
                  <img
                    src="https://img.usecurling.com/i?q=instagram"
                    alt="Instagram"
                    className="w-3.5 h-3.5"
                  />
                  <span>Instagram</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick social proof tags */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Instagram className="w-4 h-4 text-pink-500" /> Instagram Reels
            </span>
            <span className="flex items-center gap-1.5">
              <Video className="w-4 h-4 text-violet-600" /> TikTok
            </span>
            <span className="flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-500" /> YouTube Shorts
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-500" /> Agências & MCNs
            </span>
          </div>
        </div>

        {/* 📊 PREVIEW DE INSIGHTS (Shown upon submitting handle or link) */}
        {previewData && (
          <div
            ref={previewRef}
            className="mt-12 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500"
          >
            <div className="p-1 rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 shadow-2xl">
              <Card className="border-0 bg-card rounded-[22px] overflow-hidden">
                <CardHeader className="bg-muted/40 border-b border-border p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        <Sparkles className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2">
                          {previewData.preview.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm font-medium">
                          {previewData.preview.summary ||
                            'Resumo de performance e métricas virais do seu perfil'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="self-start sm:self-auto bg-primary/10 text-primary border-primary/30 font-bold px-3 py-1"
                    >
                      {previewData.platform.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Metric Chips */}
                  {previewData.preview.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-muted/50 p-3.5 rounded-xl border border-border/80 text-center">
                        <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                          Seguidores Est.
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-foreground">
                          {previewData.preview.metrics.followers.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="bg-muted/50 p-3.5 rounded-xl border border-border/80 text-center">
                        <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                          Engajamento Médio
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-emerald-500">
                          {previewData.preview.metrics.avgEngagement}
                        </span>
                      </div>
                      <div className="bg-muted/50 p-3.5 rounded-xl border border-border/80 text-center">
                        <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                          Hook Rate (3s)
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-amber-500">
                          {previewData.preview.metrics.hookRetention}
                        </span>
                      </div>
                      <div className="bg-muted/50 p-3.5 rounded-xl border border-border/80 text-center">
                        <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                          Potencial Viral
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-violet-500">
                          {previewData.preview.metrics.viralPotential}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Insights Cards List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Insights & Oportunidades
                      Detectadas:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {previewData.preview.insights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="bg-card border-2 border-border/70 hover:border-primary/40 transition-colors p-3.5 rounded-xl flex items-start gap-3 shadow-sm"
                        >
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                            ✓
                          </div>
                          <p className="text-xs sm:text-sm font-medium leading-snug">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note info box */}
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3.5 text-xs text-violet-900 dark:text-violet-200 flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-violet-600 flex-shrink-0" />
                    <span>{previewData.preview.note}</span>
                  </div>

                  {/* Vídeos reais encontrados */}
                  {previewData.videos && previewData.videos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-violet-500" /> Vídeos reais verificados (
                        {previewData.videos.length}):
                      </h4>
                      <div className="space-y-2">
                        {previewData.videos.map((v) => (
                          <div
                            key={v.id}
                            className="bg-muted/40 border border-border/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold truncate">{v.title}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {v.platform.toUpperCase()}
                                {v.posting_date ? ` • ${v.posting_date.substring(0, 10)}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold flex-shrink-0">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                                {v.views.toLocaleString('pt-BR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 text-rose-500" />
                                {v.likes.toLocaleString('pt-BR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                                {v.comments.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* O que fazer quando não há dados reais */}
                  {previewData.whatToDo && previewData.whatToDo.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Para analisar vídeos reais, faça
                        isto:
                      </h4>
                      <ul className="space-y-1.5">
                        {previewData.whatToDo.map((todo, idx) => (
                          <li
                            key={idx}
                            className="text-xs sm:text-sm text-foreground flex items-start gap-2"
                          >
                            <span className="font-bold text-amber-600">{idx + 1}.</span>
                            <span>{todo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* High conversion CTA after preview */}
                  <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-violet-500/10 p-6 rounded-2xl border-2 border-primary/20 text-center space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                        Quer desbloquear todos os roteiros e o plano de 30 dias? 🌟
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                        Crie sua conta agora mesmo. Seus dados já estão salvos e prontos para o
                        diagnóstico completo!
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        onClick={() => navigate('/signup')}
                        className="w-full sm:w-auto h-13 px-8 bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 hover:from-amber-600 hover:via-rose-600 hover:to-violet-700 text-white font-extrabold text-base rounded-xl shadow-xl shadow-rose-500/20 gap-2"
                      >
                        <span>Criar Conta Gratuita por 7 Dias 🎉</span>
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
                      <span>✨ Sem cartão de crédito</span>
                      <span>•</span>
                      <span>🚀 Acesso imediato</span>
                      <span>•</span>
                      <span>🔒 Cancele quando quiser</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>

      {/* 2. COMO FUNCIONA (4 Passos Simples) */}
      <section className="py-16 bg-muted/40 border-y border-border px-4">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-xs font-bold px-3 py-1"
            >
              PROCESSO SIMPLIFICADO ⚡
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Como funciona o caminho para a viralização?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Sem fórmulas mágicas ou achismos. Nossa IA analisa métricas reais e entrega exatamente
              o que seu público quer assistir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-card border-2 border-border/80 hover:border-amber-500/50 transition-all duration-300 p-6 rounded-2xl relative shadow-sm group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xl mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                1
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-1.5">
                Cole seu @ ou link 🎯
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                Insira o usuário do Instagram, TikTok ou YouTube Shorts. Reconhecemos a plataforma
                na hora.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-card border-2 border-border/80 hover:border-rose-500/50 transition-all duration-300 p-6 rounded-2xl relative shadow-sm group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xl mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                2
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-1.5">
                Receba Insights IA 📊
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                Descubra qual foi o ponto exato onde o público parou de assistir e quais temas geram
                mais retenção.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-card border-2 border-border/80 hover:border-violet-500/50 transition-all duration-300 p-6 rounded-2xl relative shadow-sm group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-black text-xl mb-4 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                3
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-1.5">
                Siga o Plano de Ação 📈
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                Use roteiros com ganchos hipnóticos nos primeiros 3s e calendário editorial sob
                medida para seu nicho.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-card border-2 border-border/80 hover:border-emerald-500/50 transition-all duration-300 p-6 rounded-2xl relative shadow-sm group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xl mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                4
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-1.5">
                Bombeee sem parar! 🚀
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                Acompanhe o crescimento dos seus números, atraia marcas patrocinadoras e monetize
                seu público!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FUNCIONALIDADES PRINCIPAIS */}
      <section className="py-16 md:py-24 px-4 container mx-auto max-w-6xl space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge
            variant="outline"
            className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-xs font-bold px-3 py-1"
          >
            ARSENAL COMPLETO 🛠️
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Tudo o que criadores e agências precisam para liderar
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Ferramentas robustas que transformam criadores amadores em máquinas de conteúdo viral
            consistente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Feature 1: Viral Metrics */}
          <div className="bg-gradient-to-br from-card to-muted/30 border-2 border-border/80 hover:border-primary/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black">📊 Métricas e Análise de Retenção</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Analise o Hook Rate (taxa de retenção nos 3 primeiros segundos), tempo médio de
              visualização e pontuação de viralidade com inteligência artificial para nunca mais
              postar no escuro.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-foreground pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Diagnóstico comparativo de vídeos virais vs. vídeos flopados</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Calculadora de melhor horário e dia por rede social</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Classificação automática por status: Viral, Padrão ou Flop</span>
              </li>
            </ul>
          </div>

          {/* Feature 2: Competitor Radar */}
          <div className="bg-gradient-to-br from-card to-muted/30 border-2 border-border/80 hover:border-primary/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm transition-all">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              🕵️ Radar e Espionagem de Concorrentes
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mapeie os principais concorrentes do seu nicho, descubra quais formatos eles estão
              usando para crescer rápido e copie a estratégia que já foi validada no mercado.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-foreground pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Extração dos melhores ganchos e títulos que os concorrentes usam</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Mapeamento de lacunas de conteúdo que você pode dominar</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Alertas de novos formatos virando tendência no seu segmento</span>
              </li>
            </ul>
          </div>

          {/* Feature 3: Script & Action Plan */}
          <div className="bg-gradient-to-br from-card to-muted/30 border-2 border-border/80 hover:border-primary/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm transition-all">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              🎯 Gerador de Roteiros & Plano de Ação
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Receba roteiros completos com introdução matadora, estrutura de retenção, notas
              visuais para cortes dinâmicos e CTAs que geram comentários e compartilhamentos em
              massa.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-foreground pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Modelos otimizados para Instagram Reels, TikTok e YouTube Shorts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Plano de 30 dias com checklist diário de postagens</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Biblioteca para salvar seus roteiros favoritos e status de gravação</span>
              </li>
            </ul>
          </div>

          {/* Feature 4: Agency Portal */}
          <div className="bg-gradient-to-br from-card to-muted/30 border-2 border-border/80 hover:border-primary/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black">🏢 Portal da Agência & Briefings</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Feito para agências de influenciadores e gestores de tráfego. Crie briefings com
              instruções precisas, aprove entregáveis e acompanhe o ROI de cada creator do seu
              casting.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-foreground pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Fluxo completo de criação de briefing, envio e aprovação</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Dashboard de múltiplos criadores com comparativo de entrega</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Feedback direto em cada publicação submetida</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. DEPOIMENTOS / PROVA SOCIAL */}
      <section className="py-16 bg-muted/40 border-y border-border px-4">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-bold px-3 py-1"
            >
              QUEM USA NÃO LARGA MAIS ⭐
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              O que dizem os criadores que destravam o algoritmo
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Histórias reais de quem saiu dos 1.000 views estagnados para milhões de visualizações
              consistentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-card border-2 border-border/80 p-6 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm italic text-foreground font-medium leading-relaxed">
                  "Eu postava 2 vídeos por dia e não passava de 2k views. Depois que ajustei meu
                  gancho dos 3 primeiros segundos pelo ViralMetrics, meu terceiro vídeo bateu 480k
                  no Reels! 😱"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=44"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-primary/20"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Mariana Prado</h4>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    @mari.lifestyle • 142k seguidores
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card border-2 border-border/80 p-6 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm italic text-foreground font-medium leading-relaxed">
                  "O gerador de roteiros com notas visuais economizou metade do meu tempo de
                  gravação. Não preciso mais travar na frente da câmera sem saber o que falar."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=89"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-primary/20"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Lucas Albuquerque</h4>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    @lucasfinancas • 88k inscritos
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card border-2 border-border/80 p-6 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm italic text-foreground font-medium leading-relaxed">
                  "Gerenciamos mais de 15 creators na agência. O portal com briefings e métricas de
                  retenção organizou nosso fluxo e melhorou o ROI dos clientes em 3x."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=12"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-primary/20"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Camila Fontes</h4>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    Diretora de Mídia @ Hive Agency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="py-16 md:py-24 px-4 container mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 p-8 sm:p-14 text-white text-center shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-black text-white border border-white/30">
            <Sparkles className="w-4 h-4" /> TESTE TOTALMENTE GRÁTIS POR 7 DIAS
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Pronto pra viralizar e viver de conteúdo? 🚀
          </h2>

          <p className="text-sm sm:text-lg text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Junte-se a milhares de criadores e agências que usam dados para multiplicar
            visualizações, inscritos e faturamento todos os meses.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/signup')}
              className="h-14 px-10 bg-white text-slate-950 hover:bg-white/90 font-black text-base sm:text-lg rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 gap-2"
            >
              <span>Começar Grátis Agora</span>
              <ArrowRight className="w-5 h-5 text-rose-600" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-white/80 pt-2">
            <span>✨ 7 Dias Gratuitos</span>
            <span>•</span>
            <span>💳 Sem Cartão de Crédito</span>
            <span>•</span>
            <span>⚡ Configuração em 1 Minuto</span>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-card border-t border-border pt-12 pb-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 font-black text-lg">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 bg-clip-text text-transparent">
                  ViralMetrics AI
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                O sistema de métrica, inteligência viral e sugestão de conteúdo para criadores e
                agências.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-muted-foreground">
              <Link to="/login" className="hover:text-foreground transition-colors">
                Entrar na Conta
              </Link>
              <Link to="/signup" className="hover:text-foreground transition-colors">
                Cadastre-se Grátis
              </Link>
              <Link
                to="/plans"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <span>Planos & Preços</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                  7 Dias Grátis
                </span>
              </Link>
              <a
                href="mailto:contato@viralmetrics.ai"
                className="hover:text-foreground transition-colors"
              >
                Suporte & Contato
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} ViralMetrics AI. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              Feito com ⚡ para criadores que querem explodir o algoritmo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
