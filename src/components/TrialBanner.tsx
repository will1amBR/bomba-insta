import { useAuth } from '@/hooks/use-auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet } from 'lucide-react'

export function TrialBanner() {
  const { user } = useAuth()

  if (!user?.trial_end) return null

  const trialEnd = new Date(user.trial_end)
  if (isNaN(trialEnd.getTime())) return null
  if (trialEnd > new Date()) return null

  return (
    <Alert className="border-amber-500/30 bg-amber-500/10">
      <Wallet className="w-4 h-4 text-amber-600" />
      <AlertDescription className="text-sm text-amber-700 dark:text-amber-400 font-medium">
        Seu teste grátis acabou! Escolha um plano para continuar usando todos os recursos. (Em
        breve) 💰
      </AlertDescription>
    </Alert>
  )
}
