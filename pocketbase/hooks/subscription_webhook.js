routerAdd('POST', '/backend/v1/subscription/webhook', (e) => {
  const rawBody = e.requestInfo().body || {}
  const headers = e.requestInfo().headers || {}
  const stripeSig = headers['stripe-signature'] || ''
  const provider = e.requestInfo().query['provider'] || (stripeSig ? 'stripe' : 'mercadopago')

  console.log('Payment webhook received for provider: ' + provider)

  // Process Stripe Webhook events
  if (provider === 'stripe' || rawBody.type) {
    const eventType = rawBody.type || ''
    const dataObj = rawBody.data ? rawBody.data.object || {} : {}
    const customerId = dataObj.customer || ''
    const subId = dataObj.id || ''
    const metadata = dataObj.metadata || {}
    const userId = metadata.user_id || dataObj.client_reference_id

    if (userId) {
      try {
        const subsCol = $app.findCollectionByNameOrId('subscriptions')
        let sub = null
        const existing = $app.findRecordsByFilter(
          'subscriptions',
          'user_id="' + userId + '"',
          '-created',
          1,
          0,
        )
        if (existing.length > 0) {
          sub = existing[0]
        } else {
          sub = new Record(subsCol)
          sub.set('user_id', userId)
        }

        if (
          eventType === 'checkout.session.completed' ||
          eventType === 'invoice.payment_succeeded' ||
          eventType === 'customer.subscription.created'
        ) {
          sub.set('status', 'active')
          sub.set('provider', 'stripe')
          sub.set('stripe_customer_id', customerId)
          sub.set('stripe_subscription_id', subId)
          if (metadata.plan_id) sub.set('plan_id', metadata.plan_id)
          const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          sub.set(
            'current_period_ends_at',
            nextMonth.toISOString().replace('T', ' ').substring(0, 19),
          )
          $app.save(sub)
        } else if (eventType === 'customer.subscription.deleted') {
          sub.set('status', 'canceled')
          $app.save(sub)
        }
      } catch (err) {
        console.error('Webhook processing error: ' + err)
      }
    }
  }

  // Process Mercado Pago Webhook events
  if (provider === 'mercadopago' || rawBody.action || rawBody.type === 'payment') {
    const action = rawBody.action || rawBody.type
    const mpData = rawBody.data || {}
    console.log('MercadoPago webhook action: ' + action + ' data id: ' + mpData.id)
  }

  return e.json(200, { received: true })
})
