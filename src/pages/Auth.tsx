import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Flame, Lock, Mail, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const { signIn, signUp, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('william@korenambiental.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = isSignUp ? await signUp(email, password) : await signIn(email, password)
      if (res.error) {
        toast({
          title: 'Falha na Autenticação',
          description: 'Verifique os dados informados.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Bem-vindo de volta!' })
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Flame className="w-7 h-7 fill-current" />
          </div>
          <CardTitle className="text-2xl font-extrabold">ViralMetrics AI</CardTitle>
          <p className="text-xs text-muted-foreground">
            Acesse o sistema de metrificação e roteiros de alto engajamento.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9 text-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-violet-600 text-white font-bold gap-2"
            >
              {loading ? 'Acessando...' : isSignUp ? 'Criar Conta' : 'Entrar na Conta'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
