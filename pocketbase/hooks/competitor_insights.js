routerAdd(
  'POST',
  '/backend/v1/competitors/{id}/insights',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    var competitorId = e.request.pathValue('id')
    var competitor
    try {
      competitor = $app.findRecordById('competitors', competitorId)
    } catch (_) {
      return e.notFoundError('Concorrente não encontrado')
    }

    var aiRes = $ai.chat({
      model: 'fast',
      messages: [
        {
          role: 'system',
          content:
            'Você é um analista de concorrentes de mídia social. Retorne estritamente um JSON:\n' +
            '{"summary": "análise do canal", "best_hooks": ["hook 1", "hook 2", "hook 3"], "formats": ["formato 1", "formato 2"], "suggested_ideas": ["ideia 1", "ideia 2", "ideia 3"]}\n' +
            'Responda em Português com linguagem jovem e motivate. Use emojis.',
        },
        {
          role: 'user',
          content:
            'Analise o canal "' +
            competitor.getString('channel_name') +
            '" (' +
            competitor.getString('handle') +
            ') na plataforma ' +
            competitor.getString('platform') +
            '. Nicho: ' +
            competitor.getString('niche') +
            '. Notas: ' +
            competitor.getString('notes'),
        },
      ],
    })

    var rawJson = aiRes.choices[0].message.content
    var parsed = {
      summary: 'Análise do concorrente',
      best_hooks: [],
      formats: [],
      suggested_ideas: [],
    }

    try {
      var clean = rawJson.substring(rawJson.indexOf('{'), rawJson.lastIndexOf('}') + 1)
      if (clean) parsed = JSON.parse(clean)
    } catch (_) {}

    var oldInsights = $app.findRecordsByFilter(
      'competitor_insights',
      'competitor_id = "' + competitorId + '"',
      '-created',
      10,
      0,
    )
    for (var i = 0; i < oldInsights.length; i++) {
      $app.delete(oldInsights[i])
    }

    var col = $app.findCollectionByNameOrId('competitor_insights')
    var record = new Record(col)
    record.set('user_id', userId)
    record.set('competitor_id', competitorId)
    record.set('summary', parsed.summary || '')
    record.set('best_hooks', JSON.stringify(parsed.best_hooks || []))
    record.set('formats', JSON.stringify(parsed.formats || []))
    record.set('suggested_ideas', JSON.stringify(parsed.suggested_ideas || []))
    $app.save(record)

    return e.json(200, {
      id: record.id,
      summary: parsed.summary,
      best_hooks: parsed.best_hooks || [],
      formats: parsed.formats || [],
      suggested_ideas: parsed.suggested_ideas || [],
    })
  },
  $apis.requireAuth(),
)
