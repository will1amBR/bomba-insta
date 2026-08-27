import pb from '@/lib/pocketbase/client'

export interface UserSubscriptionStatus {
  subscription: {
    id?: string
    status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'incomplete'
    provider?: string
    trial_ends_at?: string
    current_period_ends_at?: string
    cancel_at_period_end?: boolean
  } | null
  plan: {
    id: string
    name: string
    slug: string
    price: number
    currency: string
    interval: string
  } | null
  isTrialActive: boolean
  daysRemaining: number
  trialEnd: string | null
}

export interface CheckoutResult {
  success: boolean
  provider: 'stripe' | 'mercadopago'
  checkout_url: string
  session_id?: string
  preference_id?: string
  simulated?: boolean
  message?: string
}

export const getMySubscriptionStatus = async (): Promise<UserSubscriptionStatus> => {
  return pb.send<UserSubscriptionStatus>('/backend/v1/subscription/me', {
    method: 'GET',
  })
}

export const createCheckoutSession = async (
  planIdOrSlug: string,
  provider: 'stripe' | 'mercadopago' = 'stripe',
  returnUrl?: string,
): Promise<CheckoutResult> => {
  return pb.send<CheckoutResult>('/backend/v1/subscription/checkout', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: planIdOrSlug,
      provider,
      return_url: returnUrl || window.location.origin,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const confirmSubscription = async (
  planIdOrSlug: string,
  provider: 'stripe' | 'mercadopago',
  sessionId?: string,
): Promise<{ success: boolean; message: string }> => {
  return pb.send<{ success: boolean; message: string }>('/backend/v1/subscription/confirm', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: planIdOrSlug,
      provider,
      session_id: sessionId,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const cancelSubscription = async (): Promise<{ success: boolean; message: string }> => {
  return pb.send<{ success: boolean; message: string }>('/backend/v1/subscription/cancel', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  })
}
