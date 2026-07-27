routerAdd(
  'POST',
  '/backend/v1/leads/link',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const leadId = (body.lead_token || '').trim()
    if (!leadId) return e.badRequestError('lead_token é obrigatório')

    let lead
    try {
      lead = $app.findRecordById('leads', leadId)
    } catch (err) {
      return e.notFoundError('Lead não encontrado')
    }

    lead.set('user_id', userId)
    $app.save(lead)

    const user = $app.findRecordById('users', userId)
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const trialEndStr = trialEnd.toISOString().replace('T', ' ').substring(0, 19)
    user.set('trial_end', trialEndStr)
    $app.saveNoValidate(user)

    return e.json(200, { success: true, trial_end: trialEnd.toISOString() })
  },
  $apis.requireAuth(),
)
