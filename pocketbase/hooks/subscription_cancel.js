routerAdd(
  'POST',
  '/backend/v1/subscription/cancel',
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

    if (!sub) {
      return e.notFoundError('Nenhuma assinatura encontrada')
    }

    sub.set('cancel_at_period_end', true)
    sub.set('status', 'canceled')
    $app.save(sub)

    return e.json(200, {
      success: true,
      message: 'Assinatura cancelada com sucesso. Seu acesso continuará até o fim do período.',
      subscription: {
        id: sub.id,
        status: 'canceled',
        cancel_at_period_end: true,
      },
    })
  },
  $apis.requireAuth(),
)
