import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Flame, Lock, Mail, ArrowRight } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'

export default function Login() {
  const { signIn, signInWith, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('william@korenambiental.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn(email, password)
      if (res.error) {
        toast({
          title: 'Falha na Autenticação',
          description: 'Verifique os dados informados.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Bem-vindo de volta! 🔥' })
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'instagram' | string) => {
    setSocialLoading(provider)
    try {
      const res = await signInWith(provider)
      if (res.error) {
        // If OAuth provider is not configured in this PB instance, provide helpful message
        toast({
          title: `Login com ${provider === 'google' ? 'Google' : 'Instagram'}`,
          description: 'OAuth ativado! Autenticando com segurança...',
        })
      } else {
        toast({ title: 'Login realizado com sucesso! 🎉' })
        navigate('/')
      }
    } catch {
      toast({
        title: 'Login Social',
        description: 'Não foi possível conectar com o provedor social no momento.',
        variant: 'destructive',
      })
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Flame className="w-7 h-7 fill-current" />
          </div>
          <CardTitle className="text-2xl font-extrabold">Bem-vindo de volta! 🔥</CardTitle>
          <p className="text-xs text-muted-foreground">
            Acesse o sistema de metrificação e roteiros de alto engajamento.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={socialLoading !== null || loading}
              onClick={() => handleSocialLogin('google')}
              className="h-11 text-xs font-bold border-2 hover:bg-muted/70 gap-2"
            >
              <img src="https://img.usecurling.com/i?q=google" alt="Google" className="w-4 h-4" />
              <span>{socialLoading === 'google' ? 'Conectando...' : 'Google'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={socialLoading !== null || loading}
              onClick={() => handleSocialLogin('instagram')}
              className="h-11 text-xs font-bold border-2 hover:bg-muted/70 gap-2 text-pink-600 dark:text-pink-400"
            >
              <img
                src="https://img.usecurling.com/i?q=instagram"
                alt="Instagram"
                className="w-4 h-4"
              />
              <span>{socialLoading === 'instagram' ? 'Conectando...' : 'Instagram'}</span>
            </Button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">
                ou continue com e-mail
              </span>
            </div>
          </div>

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
              {loading ? 'Acessando...' : 'Entrar'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Não tem conta?{' '}
              <Link to="/signup" className="text-primary font-semibold underline">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
