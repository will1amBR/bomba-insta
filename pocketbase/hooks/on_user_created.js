onRecordAfterCreateSuccess((e) => {
  const user = e.record
  if (!user) return

  // Set 7-day trial if not set
  if (!user.getString('trial_end')) {
    const trialDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const trialEndStr = trialDate.toISOString().replace('T', ' ').substring(0, 19)
    user.set('trial_end', trialEndStr)
    try {
      $app.saveNoValidate(user)
    } catch (_) {}
  }

  // Create initial subscription if none exists
  try {
    const subs = $app.findRecordsByFilter(
      'subscriptions',
      'user_id="' + user.id + '"',
      '-created',
      1,
      0,
    )
    if (subs.length === 0) {
      const subsCol = $app.findCollectionByNameOrId('subscriptions')
      let proPlan = null
      try {
        proPlan = $app.findFirstRecordByData('plans', 'slug', 'profissional')
      } catch (_) {}

      const sub = new Record(subsCol)
      sub.set('user_id', user.id)
      if (proPlan) sub.set('plan_id', proPlan.id)
      sub.set('status', 'trialing')
      sub.set('provider', 'system')
      const trialDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      sub.set('trial_ends_at', trialDate.toISOString().replace('T', ' ').substring(0, 19))
      $app.save(sub)
    }
  } catch (_) {}
}, 'users')
