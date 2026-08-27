routerAdd(
  'POST',
  '/backend/v1/social/connect',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const platform = (body.platform || '').trim().toLowerCase()
    const accessToken = (body.access_token || '').trim()
    const platformUsername = (body.platform_username || body.username || '')
      .trim()
      .replace(/^@/, '')
    const platformUserId = (body.platform_user_id || '').trim()
    const refreshToken = (body.refresh_token || '').trim()
    const expiresIn = body.expires_in ? parseInt(body.expires_in) : 5184000 // default 60 days for IG long-lived
    const profilePic = (body.profile_picture_url || '').trim()

    if (!platform || !['instagram', 'tiktok', 'youtube'].includes(platform)) {
      return e.badRequestError('Plataforma inválida. Use instagram, tiktok ou youtube.')
    }
    if (!accessToken && !platformUsername) {
      return e.badRequestError('access_token ou platform_username é obrigatório')
    }

    const effectiveToken =
      accessToken ||
      'token_' + platform + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
    const expiresAtDate = new Date(Date.now() + expiresIn * 1000)
    const expiresAtStr = expiresAtDate.toISOString().replace('T', ' ').substring(0, 19)

    let tokenRecord = null
    try {
      const existing = $app.findRecordsByFilter(
        'social_tokens',
        'user_id="' + userId + '" && platform="' + platform + '"',
        '-created',
        1,
        0,
      )
      if (existing.length > 0) tokenRecord = existing[0]
    } catch (_) {}

    const tokensCol = $app.findCollectionByNameOrId('social_tokens')
    if (!tokenRecord) {
      tokenRecord = new Record(tokensCol)
      tokenRecord.set('user_id', userId)
      tokenRecord.set('platform', platform)
    }

    tokenRecord.set('access_token', effectiveToken)
    if (refreshToken) tokenRecord.set('refresh_token', refreshToken)
    if (platformUsername) tokenRecord.set('platform_username', platformUsername)
    if (platformUserId) tokenRecord.set('platform_user_id', platformUserId)
    if (profilePic) tokenRecord.set('profile_picture_url', profilePic)
    tokenRecord.set('expires_at', expiresAtStr)
    tokenRecord.set(
      'metadata',
      JSON.stringify({
        connected_at: new Date().toISOString(),
        is_valid: true,
        last_sync: new Date().toISOString(),
      }),
    )

    $app.save(tokenRecord)

    return e.json(200, {
      success: true,
      message: 'Conta do ' + platform.toUpperCase() + ' conectada com sucesso! 🎉',
      token_id: tokenRecord.id,
      platform: platform,
      platform_username: platformUsername,
      expires_at: expiresAtStr,
    })
  },
  $apis.requireAuth(),
)
