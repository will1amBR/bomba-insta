import { useAuth } from '@/hooks/use-auth'
import Dashboard from '@/pages/Dashboard'
import Landing from '@/pages/Landing'

export function HomeRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
        Carregando...
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <Landing />
}
