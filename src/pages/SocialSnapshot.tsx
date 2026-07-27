import { useEffect, useState } from 'react'
import { getSocialSnapshots, generateSnapshot } from '@/services/social-snapshots'
import type { SocialSnapshotRecord, PlatformSummary } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Camera,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Zap,
  Trophy,
} from 'lucide-react'

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube_shorts: 'YouTube Shorts',
}

export default function SocialSnapshot() {
  const [snapshots, setSnapshots] = useState<SocialSnapshotRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')

  const loadData = async () => {
    try {
      setLoading(true)
      const items = await getSocialSnapshots()
      setSnapshots(items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('social_snapshots', () => {
    loadData()
  })

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateSnapshot()
      toast({ title: 'Snapshot gerado! 📸', description: 'Seu relatório social está pronto.' })
      loadData()
    } catch {
      toast({ title: 'Erro ao gerar snapshot', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const latest = snapshots[0]
  const previous = snapshots[1]
  const platforms: PlatformSummary[] = Array.isArray(latest?.platforms_summary)
    ? latest.platforms_summary
    : []
  const filtered =
    filterPlatform === 'all' ? platforms : platforms.filter((p) => p.platform === filterPlatform)

  const calcChange = (current: number, prev: number | undefined) => {
    if (prev === undefined || prev === 0) return null
    const diff = ((current - prev) / prev) * 100
    return Math.round(diff)
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Camera className="w-7 h-7 text-secondary" />
            Snapshot Social 📸
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Veja onde você está bombando e onde dá pra crescer mais! 🚀
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="gap-2 bg-secondary text-white"
        >
          <Zap className="w-4 h-4" />
          {generating ? 'Gerando...' : 'Novo Snapshot'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Carregando snapshots...
        </div>
      ) : !latest ? (
        <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Nenhum snapshot ainda. Bora gerar o primeiro? 🔥
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2 bg-secondary text-white"
          >
            <Camera className="w-4 h-4" /> Gerar Snapshot
          </Button>
        </div>
      ) : (
        <>
          {latest.gaps && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-sm text-foreground">
              <span className="font-bold">💡 Gap identificado:</span> {latest.gaps}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filterPlatform === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterPlatform('all')}
              className="text-xs"
            >
              Todas
            </Button>
            {platforms.map((p) => (
              <Button
                key={p.platform}
                size="sm"
                variant={filterPlatform === p.platform ? 'default' : 'outline'}
                onClick={() => setFilterPlatform(p.platform)}
                className="text-xs"
              >
                {platformLabels[p.platform] || p.platform}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const prevP = Array.isArray(previous?.platforms_summary)
                ? previous.platforms_summary.find((pp) => pp.platform === p.platform)
                : undefined
              return (
                <Card key={p.platform} className="hover:shadow-elevation transition-all">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">
                        {platformLabels[p.platform] || p.platform}
                      </h3>
                      <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded text-[10px] font-bold">
                        {p.total_posts} posts
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'Views', value: p.avg_views, icon: Eye, prev: prevP?.avg_views },
                        {
                          label: 'Curtidas',
                          value: p.avg_likes,
                          icon: Heart,
                          prev: prevP?.avg_likes,
                        },
                        {
                          label: 'Coment.',
                          value: p.avg_comments,
                          icon: MessageCircle,
                          prev: prevP?.avg_comments,
                        },
                        {
                          label: 'Compart.',
                          value: p.avg_shares,
                          icon: Share2,
                          prev: prevP?.avg_shares,
                        },
                      ].map((m) => {
                        const change = calcChange(m.value, m.prev)
                        const Icon = m.icon
                        return (
                          <div key={m.label} className="bg-muted/40 p-2 rounded text-center">
                            <Icon className="w-3 h-3 mx-auto mb-0.5 text-muted-foreground" />
                            <p className="font-bold text-foreground">
                              {m.value.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{m.label}</p>
                            {change !== null && (
                              <span
                                className={`text-[10px] font-bold flex items-center justify-center gap-0.5 ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                              >
                                {change >= 0 ? (
                                  <TrendingUp className="w-2.5 h-2.5" />
                                ) : (
                                  <TrendingDown className="w-2.5 h-2.5" />
                                )}
                                {Math.abs(change)}%
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/5 p-2 rounded">
                      <Clock className="w-3 h-3 text-primary" />
                      Melhor horário:{' '}
                      <span className="font-bold text-foreground">{p.best_posting_time}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {Array.isArray(latest.ranking) && latest.ranking.length > 0 && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Ranking de Alcance 🏆
                </h2>
                <div className="space-y-2">
                  {latest.ranking.map((r) => (
                    <div
                      key={r.platform}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            r.position === 1
                              ? 'bg-amber-500 text-white'
                              : r.position === 2
                                ? 'bg-gray-400 text-white'
                                : 'bg-amber-700 text-white'
                          }`}
                        >
                          {r.position}
                        </span>
                        <span className="font-medium text-sm">
                          {platformLabels[r.platform] || r.platform}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-muted-foreground">
                        {r.reach.toLocaleString('pt-BR')} views
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
