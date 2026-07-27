import type { ScriptRecord } from '@/types/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, CheckCircle2, Clock, Trash2, Eye } from 'lucide-react'

interface ScriptCardProps {
  script: ScriptRecord
  onStatusChange?: (id: string, newStatus: 'draft' | 'approved' | 'produced') => void
  onDelete?: (id: string) => void
}

export function ScriptCard({ script, onStatusChange, onDelete }: ScriptCardProps) {
  const getStatusBadge = () => {
    switch (script.status) {
      case 'produced':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">
            Gravação Concluída
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 border-blue-300">Pronto para Gravar</Badge>
        )
      default:
        return <Badge variant="outline">Rascunho</Badge>
    }
  }

  return (
    <Card className="hover:shadow-elevation transition-all">
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
              {script.platform} • {script.format}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {script.estimated_duration}s
            </span>
          </div>
          <CardTitle className="text-base font-bold leading-snug">{script.title}</CardTitle>
        </div>
        {getStatusBadge()}
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3 text-xs">
        {script.hook_headline && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
            <p className="font-extrabold text-amber-800 dark:text-amber-400 mb-0.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> GANCHO 3 SEGUNDOS:
            </p>
            <p className="text-foreground italic">"{script.hook_headline}"</p>
          </div>
        )}

        {script.body_outline && (
          <div>
            <p className="font-bold text-foreground mb-1">Roteiro / Desenvolvimento:</p>
            <p className="whitespace-pre-line text-muted-foreground bg-muted/40 p-2 rounded border leading-relaxed">
              {script.body_outline}
            </p>
          </div>
        )}

        {script.cta && (
          <div className="bg-violet-500/10 border border-violet-500/20 p-2 rounded">
            <span className="font-bold text-violet-700 dark:text-violet-400">
              Chamada para Ação (CTA):{' '}
            </span>
            <span className="text-foreground">{script.cta}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Potencial Viral:</span>
            <span className="font-extrabold text-emerald-600">{script.viral_potential_score}%</span>
          </div>

          <div className="flex items-center gap-1">
            {onStatusChange && script.status === 'draft' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(script.id, 'approved')}
                className="h-7 text-xs gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Aprovar
              </Button>
            )}

            {onStatusChange && script.status === 'approved' && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onStatusChange(script.id, 'produced')}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              >
                Marcar Gravado
              </Button>
            )}

            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(script.id)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
