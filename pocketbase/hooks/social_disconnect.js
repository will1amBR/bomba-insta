routerAdd(
  'POST',
  '/backend/v1/social/disconnect',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const platform = (body.platform || '').trim().toLowerCase()

    if (!platform) return e.badRequestError('platform é obrigatório')

    try {
      const records = $app.findRecordsByFilter(
        'social_tokens',
        'user_id="' + userId + '" && platform="' + platform + '"',
        '-created',
        10,
        0,
      )
      for (let i = 0; i < records.length; i++) {
        $app.delete(records[i])
      }
    } catch (_) {}

    return e.json(200, {
      success: true,
      message: 'Conta ' + platform + ' desconectada com sucesso.',
    })
  },
  $apis.requireAuth(),
)
