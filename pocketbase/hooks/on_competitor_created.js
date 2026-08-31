onRecordAfterCreateSuccess((e) => {
  const competitor = e.record
  if (!competitor) return

  const userId = competitor.getString('user_id')
  const channelName = competitor.getString('channel_name') || 'Concorrente'
  const handle = competitor.getString('handle') || ''
  const platform = competitor.getString('platform') || 'instagram'
  const niche = competitor.getString('niche') || 'nicho'

  if (!userId) return

  // Gerar alerta com conteúdo viral simulado de alto impacto (> 80 score) do concorrente
  const viralHookExamples = [
    'O segredo que nenhuma agência quer que você descubra sobre o algoritmo...',
    'Pare de postar dessa forma se você quer passar dos 100k views!',
    'Fiz esse teste por 7 dias e tripliquei o alcance sem gastar 1 real.',
    '3 configurações secretas que dobraram minha retenção nos primeiros 3s!',
    'Se você cria conteúdo e não usa essa estratégia, está perdendo tempo!',
  ]

  const seed = (channelName + handle).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const viralScore = 82 + (seed % 17) // 82 a 98
  const viewsCount = (25000 + (seed % 75000)).toLocaleString('pt-BR')
  const hookPicked = viralHookExamples[seed % viralHookExamples.length]

  try {
    const notifCol = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifCol)
    notif.set('user_id', userId)
    notif.set('title', '🚨 Alerta Viral de Concorrente! 🔥')
    notif.set(
      'message',
      'O concorrente ' +
        channelName +
        ' (' +
        (handle || platform) +
        ') postou um conteúdo com Score ' +
        viralScore +
        '/100 (' +
        viewsCount +
        ' views). Gancho: "' +
        hookPicked +
        '". Analise agora!',
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
        viral_score: viralScore,
        views: viewsCount,
        hook: hookPicked,
        niche: niche,
      }),
    )
    $app.save(notif)
  } catch (err) {
    console.log('Erro ao criar alerta de concorrente: ' + err)
  }
}, 'competitors')
