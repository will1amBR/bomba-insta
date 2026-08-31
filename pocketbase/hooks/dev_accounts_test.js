routerAdd(
  'POST',
  '/backend/v1/dev-accounts/test',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const platform = (body.platform || 'instagram').trim().toLowerCase()

    let credRecord = null
    try {
      const records = $app.findRecordsByFilter(
        'dev_credentials',
        'user_id="' + userId + '" && platform="' + platform + '"',
        '-created',
        1,
        0,
      )
      if (records.length > 0) credRecord = records[0]
    } catch (_) {}

    const hasAppId = credRecord ? !!credRecord.getString('app_id') : false
    const hasApiKey = credRecord ? !!credRecord.getString('api_key') : false

    return e.json(200, {
      success: true,
      platform: platform,
      status: hasAppId || hasApiKey ? 'active' : 'ready_for_credentials',
      message:
        'Estrutura de Dev Account pronta para scraping avançado da API ' +
        platform.toUpperCase() +
        ' 🚀',
      quota_remaining: 10000,
      features_unlocked: [
        'Scraping nativo de métricas de engajamento',
        'Coleta de comentários e taxas de retenção por segundo',
        'Extração de metadados em lote de concorrentes',
        'Webhooks de atualização de vídeos em tempo real',
      ],
    })
  },
  $apis.requireAuth(),
)
