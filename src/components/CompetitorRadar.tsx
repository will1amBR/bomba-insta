import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Crosshair, Eye, Sparkles } from 'lucide-react'
import type { CompetitorRecord, CompetitorInsightRecord } from '@/types/content'
import { getCompetitorInsights } from '@/services/competitors'

interface CompetitorRadarProps {
  competitors: CompetitorRecord[]
}

export function CompetitorRadar({ competitors }: CompetitorRadarProps) {
  const [insights, setInsights] = useState<CompetitorInsightRecord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    getCompetitorInsights()
      .then(setInsights)
      .catch(() => {})
  }, [competitors])

  useEffect(() => {
    if (competitors.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % competitors.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [competitors.length])

  if (competitors.length === 0) return null

  const current = competitors[currentIndex]
  const currentInsight = insights.find((i) => i.competitor_id === current?.id)
  const topHook = Array.isArray(currentInsight?.best_hooks) ? currentInsight!.best_hooks[0] : null

  return (
    <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent overflow-hidden">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-secondary" />
            Radar da Concorrência 📡
          </h2>
          <Link to="/concorrentes" className="text-xs font-semibold text-secondary hover:underline">
            Ver todos →
          </Link>
        </div>

        <Link
          to={`/concorrentes/${current.id}`}
          className="block bg-card p-3 rounded-lg border hover:shadow-subtle transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-sm text-foreground">{current.channel_name}</p>
              <p className="text-xs text-muted-foreground">{current.handle}</p>
            </div>
            <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              {current.platform.replace('_', ' ')}
            </span>
          </div>

          {topHook && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded text-xs">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-0.5">
                <Sparkles className="w-3 h-3" /> Hook de destaque:
              </span>
              <p className="italic text-foreground">"{topHook}"</p>
            </div>
          )}

          {currentInsight && (
            <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 flex items-start gap-1">
              <Eye className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {currentInsight.summary}
            </p>
          )}
        </Link>

        <div className="flex items-center gap-1.5 justify-center">
          {competitors.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-secondary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
