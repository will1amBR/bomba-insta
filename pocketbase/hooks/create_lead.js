routerAdd('POST', '/backend/v1/leads', (e) => {
  const body = e.requestInfo().body || {}
  const handle = (body.handle || '').trim()
  const links = body.links || []

  if (!handle) return e.badRequestError('handle é obrigatório')
  if (!Array.isArray(links)) return e.badRequestError('links deve ser uma lista')
  if (links.length > 5) return e.badRequestError('máximo de 5 links')

  const leadsCol = $app.findCollectionByNameOrId('leads')
  const record = new Record(leadsCol)
  record.set('handle', handle)
  record.set('links', JSON.stringify(links))
  $app.save(record)

  return e.json(200, {
    id: record.id,
    handle: handle,
    preview: {
      title: '🔍 Analisamos seus links e identificamos padrões promissores!',
      insights: [
        '📈 Seus posts têm potencial para alto engajamento',
        '⏰ Horário ideal: 18h–21h',
        '🎯 Seu nicho tem alta viralização no formato vídeo',
        '💡 Dica: use ganchos nos primeiros 3 segundos',
      ],
      note: 'Crie sua conta gratuita para ver a análise completa e receber sugestões personalizadas.',
    },
  })
})
