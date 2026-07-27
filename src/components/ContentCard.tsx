import type { ContentRecord } from '@/types/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Play,
  Image as ImageIcon,
  Layers,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react'

interface ContentCardProps {
  content: ContentRecord
  onSelectCompare?: (content: ContentRecord) => void
  isSelectedForCompare?: boolean
}

export function ContentCard({ content, onSelectCompare, isSelectedForCompare }: ContentCardProps) {
  const getStatusBadge = () => {
    switch (content.status) {
      case 'viral':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> VIRAL ({content.viral_score} pt)
          </Badge>
        )
      case 'flop':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> FLOP ({content.viral_score} pt)
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="font-medium">
            NORMAL ({content.viral_score} pt)
          </Badge>
        )
    }
  }

  const getTypeIcon = () => {
    switch (content.type) {
      case 'video':
        return <Play className="w-4 h-4 text-rose-500" />
      case 'photo':
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      case 'carousel':
        return <Layers className="w-4 h-4 text-amber-500" />
    }
  }

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-elevation ${
        isSelectedForCompare ? 'ring-2 ring-rose-500 bg-rose-50/20 dark:bg-rose-950/20' : ''
      }`}
    >
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
              {getTypeIcon()}
              {content.platform.replace('_', ' ')}
            </span>
            <span>•</span>
            <span className="capitalize">{content.type}</span>
          </div>
          {getStatusBadge()}
        </div>
        <CardTitle className="text-base font-bold line-clamp-2 mt-1 leading-snug">
          {content.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3 text-xs">
        {content.hook_text && (
          <div className="bg-muted/60 p-2 rounded-lg border border-border/50 italic text-muted-foreground">
            <span className="font-semibold not-italic text-foreground">Gancho 3s: </span>"
            {content.hook_text}"
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 pt-1 border-t text-center">
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Eye className="w-3 h-3" />
            </div>
            <p className="font-bold text-foreground">
              {content.views?.toLocaleString('pt-BR') || 0}
            </p>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Heart className="w-3 h-3 text-rose-500" />
            </div>
            <p className="font-bold text-foreground">
              {content.likes?.toLocaleString('pt-BR') || 0}
            </p>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Share2 className="w-3 h-3 text-violet-500" />
            </div>
            <p className="font-bold text-foreground">
              {content.shares?.toLocaleString('pt-BR') || 0}
            </p>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <MessageCircle className="w-3 h-3 text-blue-500" />
            </div>
            <p className="font-bold text-foreground">
              {content.comments?.toLocaleString('pt-BR') || 0}
            </p>
          </div>
        </div>

        {content.type === 'video' && (
          <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2 rounded-lg border text-center">
            <div>
              <span className="text-[10px] text-muted-foreground block">Hook Rate (3s)</span>
              <span className="font-extrabold text-sm text-amber-600">
                {content.hook_rate || 0}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Retenção Média</span>
              <span className="font-extrabold text-sm text-emerald-600">
                {content.retention_rate || 0}%
              </span>
            </div>
          </div>
        )}

        {onSelectCompare && (
          <button
            onClick={() => onSelectCompare(content)}
            className={`w-full mt-2 py-1.5 px-3 rounded-md text-xs font-medium border transition-colors ${
              isSelectedForCompare
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-background hover:bg-muted text-foreground'
            }`}
          >
            {isSelectedForCompare ? 'Selecionado para Comparação' : '+ Selecionar para Diagnóstico'}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
