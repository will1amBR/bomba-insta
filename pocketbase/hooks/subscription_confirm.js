routerAdd(
  'POST',
  '/backend/v1/subscription/confirm',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const planIdOrSlug = (body.plan_id || body.slug || '').trim()
    const provider = (body.provider || 'stripe').trim()
    const sessionId = (body.session_id || '').trim()

    if (!planIdOrSlug) return e.badRequestError('plan_id é obrigatório')

    let plan = null
    try {
      plan = $app.findRecordById('plans', planIdOrSlug)
    } catch (_) {
      try {
        plan = $app.findFirstRecordByData('plans', 'slug', planIdOrSlug)
      } catch (_) {
        return e.notFoundError('Plano não encontrado')
      }
    }

    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const nextMonthStr = nextMonth.toISOString().replace('T', ' ').substring(0, 19)

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

    const subsCol = $app.findCollectionByNameOrId('subscriptions')
    if (!sub) {
      sub = new Record(subsCol)
      sub.set('user_id', userId)
    }

    sub.set('plan_id', plan.id)
    sub.set('status', 'active')
    sub.set('provider', provider)
    sub.set('current_period_ends_at', nextMonthStr)
    sub.set('cancel_at_period_end', false)
    if (provider === 'stripe') {
      sub.set('stripe_subscription_id', sessionId || 'sub_stripe_' + Date.now())
    } else {
      sub.set('mercadopago_subscription_id', sessionId || 'sub_mp_' + Date.now())
    }

    $app.save(sub)

    // Also update user's trial_end to beyond to keep access intact
    try {
      const user = $app.findRecordById('users', userId)
      user.set('trial_end', nextMonthStr)
      $app.saveNoValidate(user)
    } catch (_) {}

    return e.json(200, {
      success: true,
      message: 'Assinatura ativada com sucesso! Parabéns pelo upgrade! 🎉🚀',
      subscription: {
        id: sub.id,
        plan_id: plan.id,
        status: 'active',
        current_period_ends_at: nextMonthStr,
      },
    })
  },
  $apis.requireAuth(),
)
