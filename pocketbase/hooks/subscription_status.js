routerAdd(
  'GET',
  '/backend/v1/subscription/me',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    let sub = null
    try {
      const subs = $app.findRecordsByFilter(
        'subscriptions',
        'user_id="' + userId + '"',
        '-created',
        1,
        0,
      )
      if (subs.length > 0) sub = subs[0]
    } catch (_) {}

    const user = $app.findRecordById('users', userId)
    let plan = null
    if (sub && sub.getString('plan_id')) {
      try {
        plan = $app.findRecordById('plans', sub.getString('plan_id'))
      } catch (_) {}
    }

    const now = new Date()
    let trialEnd = null
    if (sub && sub.getString('trial_ends_at')) {
      trialEnd = new Date(sub.getString('trial_ends_at'))
    } else if (user.getString('trial_end')) {
      trialEnd = new Date(user.getString('trial_end'))
    }

    let isTrialActive = false
    let daysRemaining = 0
    if (trialEnd && !isNaN(trialEnd.getTime())) {
      const diffMs = trialEnd.getTime() - now.getTime()
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
      isTrialActive = diffMs > 0
    }

    let status = sub ? sub.getString('status') : isTrialActive ? 'trialing' : 'expired'
    if (status === 'trialing' && !isTrialActive) {
      status = 'expired'
    }

    return e.json(200, {
      subscription: sub
        ? {
            id: sub.id,
            status: status,
            provider: sub.getString('provider'),
            trial_ends_at: sub.getString('trial_ends_at') || user.getString('trial_end'),
            current_period_ends_at: sub.getString('current_period_ends_at'),
            cancel_at_period_end: sub.getBool('cancel_at_period_end'),
          }
        : {
            status: isTrialActive ? 'trialing' : 'expired',
            trial_ends_at: user.getString('trial_end'),
          },
      plan: plan
        ? {
            id: plan.id,
            name: plan.getString('name'),
            slug: plan.getString('slug'),
            price: plan.getInt('price'),
            currency: plan.getString('currency'),
            interval: plan.getString('interval'),
          }
        : null,
      isTrialActive: isTrialActive,
      daysRemaining: daysRemaining,
      trialEnd: trialEnd ? trialEnd.toISOString() : null,
    })
  },
  $apis.requireAuth(),
)
