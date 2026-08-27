import pb from '@/lib/pocketbase/client'

export interface PlanRecord {
  id: string
  name: string
  slug: string
  price: number
  currency?: string
  interval?: string
  features: string[]
  trial_days?: number
  stripe_price_id?: string
  mercadopago_plan_id?: string
  badge?: string
  highlight?: boolean
  created?: string
  updated?: string
}

export const getPlans = async (): Promise<PlanRecord[]> => {
  const records = await pb.collection('plans').getFullList({
    sort: 'price',
  })

  return records.map((r) => {
    let features: string[] = []
    if (typeof r.features === 'string') {
      try {
        features = JSON.parse(r.features)
      } catch {
        features = [r.features]
      }
    } else if (Array.isArray(r.features)) {
      features = r.features
    }

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.price,
      currency: r.currency || 'BRL',
      interval: r.interval || 'month',
      features,
      trial_days: r.trial_days || 7,
      stripe_price_id: r.stripe_price_id,
      mercadopago_plan_id: r.mercadopago_plan_id,
      badge: r.badge,
      highlight: r.highlight,
      created: r.created,
      updated: r.updated,
    }
  })
}
