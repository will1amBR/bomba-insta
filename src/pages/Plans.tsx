import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { getPlans, PlanRecord } from '@/services/plans'
import {
  getMySubscriptionStatus,
  createCheckoutSession,
  confirmSubscription,
  cancelSubscription,
  UserSubscriptionStatus,
} from '@/services/subscriptions'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import {
  Flame,
  CheckCircle2,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  HelpCircle,
  Clock,
  Gift,
  PartyPopper,
  AlertTriangle,
} from 'lucide-react'

export default function PlansPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [subStatus, setSubStatus] = useState<UserSubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'mercadopago'>('stripe')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const plansData = await getPlans()
      setPlans(plansData)

      if (isAuthenticated) {
        try {
          const status = await getMySubscriptionStatus()
          setSubStatus(status)
        } catch (err) {
          console.error('Error fetching subscription status:', err)
        }
      }
    } catch (err) {
      console.error('Error loading plans:', err)
      toast({
        title: 'Erro ao carregar planos',
        description: 'Tente recarregar a página.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isAuthenticated])

  // Handle URL return parameters (success / canceled / simulate_checkout)
  useEffect(() => {
    const status = searchParams.get('status')
    const simulateCheckout = searchParams.get('simulate_checkout')
    const planId = searchParams.get('plan_id')
    const sessionId = searchParams.get('session_id')

    if (status === 'success') {
      toast({
        title: 'Pagamento Concluído! 🎉',
        description: 'Seu plano foi atualizado com sucesso! Aproveite todos os recursos.',
      })
      if (isAuthenticated) loadData()
    } else if (status === 'canceled') {
      toast({
        title: 'Checkout cancelado',
        description: 'Você pode tentar novamente quando quiser.',
      })
    }

    if (simulateCheckout === 'true' && planId) {
      // Prompt modal for simulated checkout confirmation
      const targetPlan = plans.find((p) => p.id === planId || p.slug === planId)
      if (targetPlan) {
        setSelectedPlan(targetPlan)
        setCheckoutModalOpen(true)
      }
    }
  }, [searchParams, plans])

  const handleSelectPlan = async (plan: PlanRecord) => {
    if (!isAuthenticated) {
      navigate('/signup')
      return
    }

    // Check if user is already in this plan and status is active
    if (subStatus?.plan?.id === plan.id && subStatus?.subscription?.status === 'active') {
      toast({
        title: 'Plano Atual ⚡',
        description: `Você já está aproveitando os recursos do plano ${plan.name}.`,
      })
      return
    }

    setSelectedPlan(plan)
    setCheckoutModalOpen(true)
  }

  const handleConfirmCheckout = async () => {
    if (!selectedPlan) return
    setCheckoutLoading(selectedPlan.id)

    try {
      const res = await createCheckoutSession(selectedPlan.id, paymentProvider)

      if (res.checkout_url && !res.simulated) {
        // Direct redirect to live Stripe / Mercado Pago
        window.location.href = res.checkout_url
        return
      }

      // If sandbox / simulated confirmation
      const confirmRes = await confirmSubscription(selectedPlan.id, paymentProvider, res.session_id)

      if (confirmRes.success) {
        toast({
          title: 'Upgrade realizado com sucesso! 🚀🎉',
          description: `Você agora é assinante do Plano ${selectedPlan.name}!`,
        })
        setCheckoutModalOpen(false)
        await loadData()
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao processar assinatura',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleCancelSub = async () => {
    setCanceling(true)
    try {
      const res = await cancelSubscription()
      if (res.success) {
        toast({
          title: 'Assinatura cancelada',
          description: 'Seu plano continuará ativo até o encerramento do ciclo atual.',
        })
        setCancelModalOpen(false)
        await loadData()
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao cancelar',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setCanceling(false)
    }
  }

  const currentPlanId = subStatus?.plan?.id
  const isExpired = subStatus?.subscription?.status === 'expired'
  const isTrial = subStatus?.subscription?.status === 'trialing'
  const isActive = subStatus?.subscription?.status === 'active'

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl space-y-12">
      {/* Top Banner for Trial / Expired users */}
      {isAuthenticated && (
        <div className="space-y-4">
          {isTrial && subStatus?.daysRemaining !== undefined && (
            <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-violet-500/15 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                    Você está no Teste Grátis de 7 Dias! 🎁
                    <Badge
                      variant="secondary"
                      className="bg-amber-500 text-white text-xs font-bold"
                    >
                      {subStatus.daysRemaining}{' '}
                      {subStatus.daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                    </Badge>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Garanta seu plano com desconto e não perca seus diagnósticos e roteiros quando o
                    teste acabar!
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  const pro = plans.find((p) => p.slug === 'profissional') || plans[1]
                  if (pro) handleSelectPlan(pro)
                }}
                className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 hover:from-amber-600 hover:via-rose-600 hover:to-violet-700 text-white font-bold text-xs sm:text-sm h-11 px-6 rounded-xl shadow-md flex-shrink-0 gap-2"
              >
                <span>Escolher Plano Pro 🔥</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {isExpired && (
            <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-rose-700 dark:text-rose-400">
                    Seu período de teste grátis expirou! ⏰
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Escolha um dos planos abaixo para reativar o acesso ilimitado à inteligência
                    viral e ferramentas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isActive && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Assinatura Ativa: Plano {subStatus?.plan?.name || 'Profissional'} 🚀
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Você pode alterar ou gerenciar seu plano a qualquer momento.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Cancelar assinatura
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Hero Title Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-violet-500/10 border border-rose-500/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-foreground">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span>INVESTIMENTO QUE SE PAGA NO PRIMEIRO VÍDEO VIRAL 💸</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Planos feitos para você{' '}
          <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 bg-clip-text text-transparent">
            dominar o algoritmo
          </span>{' '}
          🚀
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          Escolha o plano ideal para o momento da sua criação de conteúdo. Sem fidelidade, cancele
          quando quiser.
        </p>
      </div>

      {/* Pricing Grid */}
      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground text-sm">
          Carregando planos disponíveis...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.id && isActive
            const isPro = plan.highlight

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl transition-all duration-300 hover:shadow-2xl ${
                  isPro
                    ? 'border-2 border-primary shadow-xl scale-100 md:scale-105 z-10 bg-gradient-to-b from-card via-card to-primary/5'
                    : 'border-2 border-border/80 bg-card hover:border-primary/40'
                }`}
              >
                {/* Badge Header */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge
                      className={`px-3.5 py-1 text-xs font-black shadow-md ${
                        isPro
                          ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 text-white border-0'
                          : 'bg-muted-foreground/10 text-muted-foreground border'
                      }`}
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div>
                  <CardHeader className="pt-8 pb-4 text-center space-y-2">
                    <CardTitle className="text-2xl font-black flex items-center justify-center gap-2">
                      {plan.name}
                      {isPro && <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {plan.slug === 'basico' &&
                        'Ideal para quem está começando a entender suas métricas'}
                      {plan.slug === 'profissional' &&
                        'Para creators que querem crescer rápido e monetizar'}
                      {plan.slug === 'premium' &&
                        'Para agências, equipes e creators em escala máxima'}
                    </CardDescription>

                    <div className="pt-4 flex items-baseline justify-center gap-1">
                      <span className="text-xs font-bold text-muted-foreground">R$</span>
                      <span className="text-4xl sm:text-5xl font-black text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">/mês</span>
                    </div>

                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      🎉 7 dias grátis inclusos no primeiro acesso
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2">
                    <div className="border-t border-border pt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        O que está incluso:
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm font-medium"
                          >
                            <CheckCircle2
                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                isPro ? 'text-primary' : 'text-emerald-500'
                              }`}
                            />
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-6 pb-6">
                  {isCurrentPlan ? (
                    <Button
                      disabled
                      className="w-full h-12 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-500/30"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Plano Atual
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={checkoutLoading === plan.id}
                      className={`w-full h-12 rounded-xl font-black text-sm transition-all gap-2 shadow-lg ${
                        isPro
                          ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 hover:from-amber-600 hover:via-rose-600 hover:to-violet-700 text-white shadow-rose-500/25'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      {checkoutLoading === plan.id ? (
                        'Processando...'
                      ) : !isAuthenticated ? (
                        <>
                          <span>Teste Grátis 7 Dias</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : isTrial ? (
                        <>
                          <span>Assinar Plano {plan.name}</span>
                          <Zap className="w-4 h-4 fill-current" />
                        </>
                      ) : (
                        <>
                          <span>Mudar para {plan.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Trust & Guarantee Box */}
      <div className="bg-muted/40 border-2 border-border/80 rounded-3xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm sm:text-base">Garantia Total de 7 Dias 🛡️</h4>
          <p className="text-xs text-muted-foreground">
            Teste todos os recursos à vontade. Se não curtir, você não paga nada.
          </p>
        </div>

        <div className="space-y-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm sm:text-base">Pagamento 100% Seguro 💳</h4>
          <p className="text-xs text-muted-foreground">
            Processado via Stripe ou Mercado Pago com suporte a Cartão, Pix e Boleto.
          </p>
        </div>

        <div className="space-y-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm sm:text-base">Sem Fidelidade ou Multas ⚡</h4>
          <p className="text-xs text-muted-foreground">
            Cancele ou mude de plano a qualquer momento com apenas 1 clique no painel.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 max-w-3xl mx-auto pt-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-black flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" /> Perguntas Frequentes 🤔
          </h3>
          <p className="text-xs text-muted-foreground">Tire suas dúvidas antes de assinar</p>
        </div>

        <div className="space-y-3">
          <div className="bg-card border rounded-2xl p-4 space-y-1.5 shadow-sm">
            <h4 className="font-bold text-sm">Como funciona o teste de 7 dias grátis? 🎁</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você cria sua conta e ganha acesso imediato a todas as funcionalidades de diagnóstico,
              IA e métricas. Nenhum valor é cobrado antecipadamente.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-4 space-y-1.5 shadow-sm">
            <h4 className="font-bold text-sm">Quais métodos de pagamento são aceitos? 💸</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Aceitamos cartões de crédito internacionais e nacionais (Visa, Mastercard, Elo, Amex)
              via Stripe, além de PIX e saldo via Mercado Pago.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-4 space-y-1.5 shadow-sm">
            <h4 className="font-bold text-sm">Posso fazer upgrade ou downgrade depois? 🔄</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sim! Você pode trocar de plano a qualquer momento. O valor será proporcional ao
              período utilizado.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Selection Modal */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center text-white mx-auto shadow-sm">
              <PartyPopper className="w-5 h-5" />
            </div>
            <DialogTitle className="text-center text-xl font-extrabold">
              Assinar Plano {selectedPlan?.name} 🚀
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Escolha seu método de pagamento preferido para ativar sua assinatura.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 p-4 rounded-2xl border space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-muted-foreground">Plano Selecionado:</span>
                  <span className="font-black text-foreground">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-muted-foreground">Valor Mensal:</span>
                  <span className="font-black text-primary text-base">
                    R$ {selectedPlan.price}/mês
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-600 font-bold pt-1 border-t">
                  <span>Período de Teste:</span>
                  <span>7 Dias Grátis</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Gateway de Pagamento:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('stripe')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      paymentProvider === 'stripe'
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Cartão de Crédito</span>
                    <span className="text-[10px] font-normal opacity-70">(Stripe)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentProvider('mercadopago')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      paymentProvider === 'mercadopago'
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-amber-500 fill-current" />
                    <span>PIX / Mercado Pago</span>
                    <span className="text-[10px] font-normal opacity-70">(Aprovação na hora)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setCheckoutModalOpen(false)}
              className="text-xs font-semibold"
            >
              Voltar
            </Button>
            <Button
              onClick={handleConfirmCheckout}
              disabled={checkoutLoading !== null}
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 hover:from-amber-600 hover:via-rose-600 hover:to-violet-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-md gap-2"
            >
              {checkoutLoading ? 'Processando...' : 'Confirmar e Continuar 🚀'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-center text-lg font-bold text-rose-600">
              Deseja cancelar sua assinatura? 😢
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Você perderá o acesso às análises ilimitadas, radar de concorrentes e gerador de
              roteiros ao final do período.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} className="text-xs">
              Manter meu plano
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSub}
              disabled={canceling}
              className="text-xs font-bold"
            >
              {canceling ? 'Cancelando...' : 'Sim, cancelar assinatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
