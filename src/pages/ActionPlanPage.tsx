import { useEffect, useState } from 'react'
import { getActionPlans, generateActionPlan, updateActionPlan } from '@/services/action-plans'
import type { ActionPlanRecord, ActionPlanGoal, ChecklistItem } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Target, CheckCircle2, Circle, Calendar, ListChecks, Zap, Cpu, Trophy } from 'lucide-react'

export default function ActionPlanPage() {
  const [plans, setPlans] = useState<ActionPlanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setPlans(await getActionPlans())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('action_plans', () => {
    loadData()
  })

  const plan = plans[0]

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateActionPlan()
      toast({ title: 'Plano gerado! 🚀' })
      loadData()
    } catch {
      toast({ title: 'Erro ao gerar plano', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const toggleGoal = async (goalId: string) => {
    if (!plan) return
    const goals = Array.isArray(plan.goals) ? plan.goals : []
    const updated: ActionPlanGoal[] = goals.map((g) =>
      g.id === goalId ? { ...g, status: g.status === 'completed' ? 'pending' : 'completed' } : g,
    )
    const completed = updated.filter((g) => g.status === 'completed').length
    const progress = Math.round((completed / Math.max(updated.length, 1)) * 100)
    try {
      await updateActionPlan(plan.id, { goals: updated, progress })
      loadData()
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const toggleChecklist = async (itemId: string) => {
    if (!plan) return
    const checklist = Array.isArray(plan.checklist) ? plan.checklist : []
    const updated: ChecklistItem[] = checklist.map((c) =>
      c.id === itemId ? { ...c, done: !c.done } : c,
    )
    try {
      await updateActionPlan(plan.id, { checklist: updated })
      loadData()
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="container mx-auto py-12 text-center text-muted-foreground text-sm">
        Carregando...
      </div>
    )

  const goals = Array.isArray(plan?.goals) ? plan.goals : []
  const calendar = Array.isArray(plan?.posting_calendar) ? plan.posting_calendar : []
  const checklist = Array.isArray(plan?.checklist) ? plan.checklist : []

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Target className="w-7 h-7 text-primary" /> Plano de Ação 🎯
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Metas, calendário e checklist pra você dominar! 🔥
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="gap-2 bg-primary text-white"
        >
          {generating ? (
            <>
              <Cpu className="w-4 h-4 animate-spin" /> Criando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Novo Plano
            </>
          )}
        </Button>
      </div>

      {!plan ? (
        <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Sem plano ainda! Gera o primeiro pra começar a evoluir 🚀
          </p>
        </div>
      ) : (
        <>
          <Card className="border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base">{plan.summary}</h2>
                <span className="bg-primary/15 text-primary font-extrabold text-sm px-3 py-1 rounded-full">
                  {plan.progress}%
                </span>
              </div>
              <Progress value={plan.progress || 0} className="h-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Suas Metas
              </h2>
              <div className="space-y-2">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className="w-full flex items-start gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all text-left"
                  >
                    {g.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${g.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {g.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{g.description}</p>
                      <span className="text-[10px] font-bold text-primary mt-0.5 inline-block">
                        Meta: {g.target}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5 space-y-3">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-500" /> Calendário de Postagens
                </h2>
                <div className="space-y-1.5">
                  {calendar.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded"
                    >
                      <span className="font-bold">
                        {c.day} • {c.time}
                      </span>
                      <div className="text-right">
                        <span className="block text-muted-foreground">{c.platform}</span>
                        <span className="text-[10px]">{c.content_type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-secondary" /> Checklist de Produção
                </h2>
                <div className="space-y-1.5">
                  {checklist.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleChecklist(c.id)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted/30 transition-all text-left text-xs"
                    >
                      {c.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={c.done ? 'line-through text-muted-foreground' : ''}>
                        {c.text}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
