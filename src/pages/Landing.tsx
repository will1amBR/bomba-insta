import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createLead, type LeadPreview } from '@/services/leads'
import {
  Flame,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { SmartHandleInput } from '@/components/SmartHandleInput'

export default function Landing() {
  const [handle, setHandle] = useState('')
  const [linksText, setLinksText] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<LeadPreview | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedHandle = handle.trim().replace(/^@/, '')
    if (!trimmedHandle) {
      setError('Digite seu @ para continuar! 😅')
      return
    }

    const links = linksText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (links.length === 0) {
      setError('Cole pelo menos um link para analisar! 🔗')
      return
    }

    const invalidLinks = links.filter((l) => !/^https?:\/\/.+/.test(l))
    if (invalidLinks.length > 0) {
      setError('Os links devem começar com http:// ou https:// 🔗')
      return
    }

    if (links.length > 5) {
      setError('Máximo de 5 links! 📋')
      return
    }

    setLoading(true)
    try {
      const res = await createLead(`@${trimmedHandle}`, links)
      localStorage.setItem('lead_token', res.id)
      setPreview(res.preview)
    } catch {
      setError('Algo deu errado. Tente novamente! 😅')
    } finally {
      setLoading(false)
    }
  }

  if (preview) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl space-y-6">
        <Card className="border-2 border-primary/20 shadow-lg animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {preview.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {preview.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              {preview.note}
            </div>
            <Link to="/signup">
              <Button className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 text-white font-bold gap-2 text-base h-12">
                Criar Conta Gratuita por 7 Dias 🎉
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground">Sem cartão de crédito ✨</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
          <Flame className="w-3.5 h-3.5" />
          Análise Viral com IA
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Descubra por que seu conteúdo{' '}
          <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 bg-clip-text text-transparent">
            bombou (ou não) 🔥
          </span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Cole seu @ e os links que quer analisar. Grátis por 7 dias.
        </p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Seu @ (handle) ou link</label>
              <div className="mt-1">
                <SmartHandleInput
                  value={handle}
                  onChange={(val) => setHandle(val)}
                  placeholder="@seuusuario ou cole o link"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Detectamos a plataforma automaticamente! 🪄
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold">Links para analisar</label>
              <Textarea
                placeholder={'https://instagram.com/p/...\nhttps://tiktok.com/@user/video/...'}
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                rows={4}
                className="mt-1 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cole até 5 links (um por linha) 📋
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 text-white font-bold gap-2 text-base h-12"
            >
              {loading ? 'Analisando...' : 'Analisar Grátis 🚀'}
              {!loading && <Zap className="w-5 h-5" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-card p-4 rounded-xl border text-center space-y-2">
          <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold">Métricas Virais</h3>
          <p className="text-xs text-muted-foreground">Hook rate, retenção e engajamento</p>
        </div>
        <div className="bg-card p-4 rounded-xl border text-center space-y-2">
          <Clock className="w-6 h-6 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold">Melhor Horário</h3>
          <p className="text-xs text-muted-foreground">Descubra quando postar</p>
        </div>
        <div className="bg-card p-4 rounded-xl border text-center space-y-2">
          <Target className="w-6 h-6 text-violet-500 mx-auto" />
          <h3 className="text-sm font-bold">Roteiros IA</h3>
          <p className="text-xs text-muted-foreground">Sugestões personalizadas</p>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}
