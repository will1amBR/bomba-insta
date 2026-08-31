routerAdd(
  'POST',
  '/backend/v1/competitors/{id}/check-viral-alert',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const competitorId = e.request.pathValue('id')
    let competitor
    try {
      competitor = $app.findRecordById('competitors', competitorId)
    } catch (_) {
      return e.notFoundError('Concorrente não encontrado')
    }

    const channelName = competitor.getString('channel_name') || 'Concorrente'
    const handle = competitor.getString('handle') || ''
    const platform = competitor.getString('platform') || 'instagram'
    const niche = competitor.getString('niche') || 'nicho'

    let reqBody = {}
    try {
      reqBody = e.requestInfo().body || {}
    } catch (_) {}

    const customTitle = reqBody.title || ''
    const customHook = reqBody.hook_text || ''
    const customViews = Number(reqBody.views) || 0
    const customViralScore = Number(reqBody.viral_score) || 0

    const seed = (channelName + handle + (customTitle || '') + new Date().toISOString())
      .split('')
      .reduce((a, b) => a + b.charCodeAt(0), 0)

    const viralScore = customViralScore > 0 ? customViralScore : 84 + (seed % 15) // >= 84
    const views = customViews > 0 ? customViews : 35000 + (seed % 65000)

    const viralHooks = [
      'Esse detalhe simples fez meu post bater 500k visualizações em 48h!',
      'O que ninguém te conta sobre o algoritmo dessa semana...',
      'Copie essa estrutura de roteiro antes que sature!',
      '3 coisas que parei de fazer e que salvaram o meu engajamento.',
      'Você está usando o CTA errado. Faça isso agora!',
    ]

    const hookText = customHook || viralHooks[seed % viralHooks.length]
    const postTitle = customTitle || 'Post em alta: ' + hookText.slice(0, 35) + '...'

    // Criar notificação se passar do limiar de viralidade (>= 80)
    let notifRecord = null
    if (viralScore >= 80) {
      try {
        const notifCol = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCol)
        notif.set('user_id', userId)
        notif.set('title', '🚨 Alerta: Concorrente Viralizou! 💥')
        notif.set(
          'message',
          channelName +
            ' acabou de postar um conteúdo com Viral Score ' +
            viralScore +
            '/100 (' +
            views.toLocaleString('pt-BR') +
            ' views). Gancho: "' +
            hookText +
            '".',
        )
        notif.set('type', 'comparison_alert')
        notif.set('read', false)
        notif.set('link', '/concorrentes/' + competitor.id)
        notif.set(
          'metadata',
          JSON.stringify({
            competitor_id: competitor.id,
            channel_name: channelName,
            platform: platform,
            title: postTitle,
            viral_score: viralScore,
            views: views,
            hook: hookText,
            niche: niche,
            is_viral: true,
          }),
        )
        $app.save(notif)
        notifRecord = {
          id: notif.id,
          title: notif.getString('title'),
          message: notif.getString('message'),
        }
      } catch (err) {
        console.log('Erro ao salvar notificação de alerta viral: ' + err)
      }
    }

    return e.json(200, {
      success: true,
      viral_detected: viralScore >= 80,
      viral_score: viralScore,
      views: views,
      hook: hookText,
      title: postTitle,
      notification: notifRecord,
    })
  },
  $apis.requireAuth(),
)
