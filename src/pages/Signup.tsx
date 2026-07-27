import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Flame, Lock, Mail, ArrowRight, Gift } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const { signUp, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terms) {
      toast({
        title: 'Aceite os termos',
        description: 'Você precisa aceitar os termos para continuar.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const res = await signUp(email, password)
      if (res.error) {
        toast({
          title: 'Falha no Cadastro',
          description: 'Verifique os dados informados.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Conta criada! Bem-vindo! 🎉' })
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
          <CardTitle className="text-2xl font-extrabold">Criar Conta Gratuita 🎉</CardTitle>
          <p className="text-xs text-muted-foreground">7 dias grátis. Sem cartão de crédito.</p>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20">
            <Gift className="w-3.5 h-3.5" />
            Teste de 7 dias incluído
          </div>
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
                  placeholder="seu@email.com"
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
                  placeholder="Mínimo 8 caracteres"
                  className="pl-9 text-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={terms}
                onCheckedChange={(v) => setTerms(v === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                Aceito os termos de uso e a política de privacidade. Compreendo que meu teste grátis
                termina em 7 dias.
              </label>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 text-white font-bold gap-2"
            >
              {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/login" className="text-primary font-semibold underline">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
