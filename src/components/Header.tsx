import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Flame,
  Sparkles,
  Lightbulb,
  MessageSquare,
  Camera,
  Target,
  Crosshair,
  LogOut,
  User,
} from 'lucide-react'

export function Header() {
  const location = useLocation()
  const { user, signOut, isAuthenticated } = useAuth()

  const navItems = [
    { label: 'Início', path: '/', icon: BarChart3 },
    { label: 'Snapshot', path: '/snapshot', icon: Camera },
    { label: 'Análise', path: '/analise', icon: Flame },
    { label: 'Roteiros', path: '/roteiros', icon: Sparkles },
    { label: 'Biblioteca', path: '/biblioteca', icon: Lightbulb },
    { label: 'Concorrentes', path: '/concorrentes', icon: Crosshair },
    { label: 'Plano', path: '/plano', icon: Target },
    { label: 'IA', path: '/chat', icon: MessageSquare },
  ]

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-primary to-violet-600 flex items-center justify-center text-white shadow-md">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 bg-clip-text text-transparent">
            ViralMetrics AI
          </span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="max-w-[120px] truncate">{user?.name || user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-destructive"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90"
              >
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="lg:hidden border-t border-border bg-muted/30 px-2 py-1.5 flex gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-shrink-0 p-2 rounded-lg flex flex-col items-center text-[10px] font-medium ${
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
