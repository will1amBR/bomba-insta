routerAdd('POST', '/backend/v1/leads', (e) => {
  const body = e.requestInfo().body || {}
  const handle = (body.handle || '').trim()
  const links = body.links || []
  const platform = (body.platform || 'instagram').trim()

  if (!handle && (!links || links.length === 0)) {
    return e.badRequestError('Handle ou link é obrigatório')
  }
  if (!Array.isArray(links)) return e.badRequestError('links deve ser uma lista')
  if (links.length > 5) return e.badRequestError('máximo de 5 links')

  const effectiveHandle = handle || (links.length > 0 ? links[0] : '@criador')

  let lead
  try {
    lead = $app.findFirstRecordByData('leads', 'handle', effectiveHandle)
    if (links.length > 0) {
      lead.set('links', JSON.stringify(links))
      $app.save(lead)
    }
  } catch (_) {
    const leadsCol = $app.findCollectionByNameOrId('leads')
    lead = new Record(leadsCol)
    lead.set('handle', effectiveHandle)
    lead.set('links', JSON.stringify(links))
    $app.save(lead)
  }

  // Generate realistic simulated metrics based on handle length / hash
  let seed = 0
  for (let i = 0; i < effectiveHandle.length; i++) {
    seed = (seed * 31 + effectiveHandle.charCodeAt(i)) % 100000
  }
  const followers = 12500 + (seed % 84000)
  const postsCount = 42 + (seed % 180)
  const avgEngagement = (3.4 + (seed % 45) / 10).toFixed(1)
  const viralPotential = 78 + (seed % 20)
  const hookRetention = 62 + (seed % 26)

  return e.json(200, {
    id: lead.id,
    handle: effectiveHandle,
    platform: platform,
    preview: {
      title: 'Diagnóstico Preliminar de ' + effectiveHandle + ' 🚀',
      summary:
        'Encontramos ' +
        followers.toLocaleString('pt-BR') +
        ' seguidores aproximados, ' +
        postsCount +
        ' conteúdos e engajamento médio de ' +
        avgEngagement +
        '%!',
      metrics: {
        followers: followers,
        postsCount: postsCount,
        avgEngagement: avgEngagement + '%',
        viralPotential: viralPotential + '/100',
        hookRetention: hookRetention + '%',
      },
      insights: [
        '⏰ Seu melhor horário de postagem é entre 18h30 e 20h45 (dias úteis têm +34% de retenção)',
        '🎯 Vídeos com hook forte nos primeiros 3s retêm 2.4x mais audiência que a média',
        '🔥 Seu nicho tem alta demanda por tutoriais rápidos e cortes dinâmicos com legenda animada',
        '📈 Taxa de salvamento e compartilhamento tem margem para dobrar com CTAs específicos',
      ],
      note: 'Liberamos a análise completa com roteiros sugeridos, monitoramento de concorrentes e plano de ação de 30 dias.',
    },
  })
})
