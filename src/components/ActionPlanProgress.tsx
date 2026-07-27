import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Target, CheckCircle2, Clock } from 'lucide-react'
import type { ActionPlanRecord } from '@/types/content'

interface ActionPlanProgressProps {
  plan: ActionPlanRecord | null
}

export function ActionPlanProgress({ plan }: ActionPlanProgressProps) {
  if (!plan) return null

  const goals = Array.isArray(plan.goals) ? plan.goals : []
  const checklist = Array.isArray(plan.checklist) ? plan.checklist : []
  const completedGoals = goals.filter((g) => g.status === 'completed').length
  const doneChecklist = checklist.filter((c) => c.done).length

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Seu Plano de Ação 🎯
          </h2>
          <Link to="/plano" className="text-xs font-semibold text-primary hover:underline">
            Ver completo →
          </Link>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1">{plan.summary}</p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Progresso geral</span>
            <span className="font-extrabold text-primary">{plan.progress || 0}%</span>
          </div>
          <Progress value={plan.progress || 0} className="h-2.5" />
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {completedGoals}/{goals.length} metas
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            {doneChecklist}/{checklist.length} tarefas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
