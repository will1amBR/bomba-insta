import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Sparkles,
  FileText,
  Lightbulb,
  MessageSquare,
  Flame,
  LogOut,
  User,
} from 'lucide-react'

export function Header() {
  const location = useLocation()
  const { user, signOut, isAuthenticated } = useAuth()

  const navItems = [
    { label: 'Dashboard & Mídias', path: '/', icon: BarChart3 },
    { label: 'Diagnóstico Viral', path: '/analise', icon: Flame },
    { label: 'Gerador de Roteiros', path: '/roteiros', icon: Sparkles },
    { label: 'Biblioteca & Ideias', path: '/biblioteca', icon: Lightbulb },
    { label: 'Assistente IA', path: '/chat', icon: MessageSquare },
  ]

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white shadow-md">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 bg-clip-text text-transparent">
            ViralMetrics AI
          </span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
                <User className="w-3.5 h-3.5 text-rose-500" />
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
                className="bg-gradient-to-r from-rose-500 to-violet-600 text-white hover:opacity-90"
              >
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="md:hidden border-t border-border bg-muted/30 px-2 py-1.5 flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2 rounded-lg flex flex-col items-center text-[10px] font-medium ${
                  isActive ? 'text-rose-600 font-bold' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                {item.label.split(' ')[0]}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
