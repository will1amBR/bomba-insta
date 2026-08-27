import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getMySubscriptionStatus, UserSubscriptionStatus } from '@/services/subscriptions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, ArrowRight, Zap } from 'lucide-react'

export function TrialBanner() {
  const { user, isAuthenticated } = useAuth()
  const [subStatus, setSubStatus] = useState<UserSubscriptionStatus | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      getMySubscriptionStatus()
        .then(setSubStatus)
        .catch(() => {})
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || !subStatus) return null

  const { isTrialActive, daysRemaining, subscription } = subStatus

  // If user has active paid subscription, don't show trial warning
  if (subscription?.status === 'active') return null

  // If trial has expired
  if (!isTrialActive || subscription?.status === 'expired') {
    return (
      <Alert className="border-rose-500/40 bg-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm text-rose-800 dark:text-rose-300 font-medium">
            Seu período de teste grátis acabou! Escolha um plano para continuar acessando todos os
            recursos de IA. 🚨
          </AlertDescription>
        </div>
        <Link to="/plans" className="flex-shrink-0">
          <Button
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 h-8"
          >
            <span>Ver Planos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </Alert>
    )
  }

  // If in trial
  return (
    <Alert className="border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-2.5">
        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 animate-pulse" />
        <AlertDescription className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-medium">
          Você tem{' '}
          <strong className="font-extrabold text-amber-700 dark:text-amber-200">
            {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
          </strong>{' '}
          de teste grátis! Aproveite ao máximo a IA. 🎁
        </AlertDescription>
      </div>
      <Link to="/plans" className="flex-shrink-0">
        <Button
          size="sm"
          className="bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs gap-1.5 h-8"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Escolher Plano</span>
        </Button>
      </Link>
    </Alert>
  )
}
