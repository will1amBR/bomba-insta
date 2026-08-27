import { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getMySubscriptionStatus, UserSubscriptionStatus } from '@/services/subscriptions'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const [subStatus, setSubStatus] = useState<UserSubscriptionStatus | null>(null)
  const [checkingSub, setCheckingSub] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setCheckingSub(true)
      getMySubscriptionStatus()
        .then(setSubStatus)
        .catch(() => {})
        .finally(() => setCheckingSub(false))
    }
  }, [isAuthenticated])

  if (loading || checkingSub) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
        Carregando seus dados... 🚀
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // If trial has expired and user has no active subscription, redirect to /plans with warning
  // (Exclude /plans itself to avoid redirect loops)
  if (subStatus && subStatus.subscription?.status === 'expired' && location.pathname !== '/plans') {
    return <Navigate to="/plans?expired=true" replace />
  }

  return <Outlet />
}
