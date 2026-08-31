routerAdd(
  'POST',
  '/backend/v1/competitors/{id}/insights',
  (e) => {
    const authRecord = e.auth
    const userId = authRecord ? authRecord.id : ''
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const competitorId = e.request.pathValue('id')
    let competitor
    try {
      competitor = $app.findRecordById('competitors', competitorId)
    } catch (_) {
      return e.notFoundError('Concorrente não encontrado')
    }

    const channelName = competitor.getString('channel_name')
    const handle = competitor.getString('handle')
    const platform = competitor.getString('platform')
    const niche = competitor.getString('niche')
    const notes = competitor.getString('notes')

    let parsed = {
      summary: 'Análise estratégica do perfil ' + channelName + ' no ' + platform + ' 🚀',
      best_hooks: [
        'Como triplicar seu engajamento sem mudar seu formato básico',
        'O erro número 1 que criadores cometem nos primeiros 3 segundos',
        'O passo a passo simples para reter mais de 65% da audiência',
      ],
      formats: ['Vídeos curtos de até 30s', 'Carrosséis visuais diretos'],
      suggested_ideas: [
        'Análise de bastidores do seu nicho',
        'Tutorial rápido com gancho de dor nos 3s iniciais',
        'Comparativo de antes e depois com dados reais',
      ],
    }

    try {
      const aiRes = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um analista de concorrentes de mídia social. Retorne estritamente um JSON:\n' +
              '{"summary": "análise do canal", "best_hooks": ["hook 1", "hook 2", "hook 3"], "formats": ["formato 1", "formato 2"], "suggested_ideas": ["ideia 1", "ideia 2", "ideia 3"]}\n' +
              'Responda em Português com linguagem jovem e motivadora. Use emojis.',
          },
          {
            role: 'user',
            content:
              'Analise o canal "' +
              channelName +
              '" (' +
              handle +
              ') na plataforma ' +
              platform +
              '. Nicho: ' +
              niche +
              '. Notas: ' +
              notes,
          },
        ],
      })

      const rawJson = aiRes.choices[0].message.content
      const startIdx = rawJson.indexOf('{')
      const endIdx = rawJson.lastIndexOf('}')
      if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        const clean = rawJson.substring(startIdx, endIdx + 1)
        const jsonResult = JSON.parse(clean)
        if (jsonResult && typeof jsonResult === 'object') {
          if (jsonResult.summary) parsed.summary = jsonResult.summary
          if (Array.isArray(jsonResult.best_hooks)) parsed.best_hooks = jsonResult.best_hooks
          if (Array.isArray(jsonResult.formats)) parsed.formats = jsonResult.formats
          if (Array.isArray(jsonResult.suggested_ideas))
            parsed.suggested_ideas = jsonResult.suggested_ideas
        }
      }
    } catch (aiErr) {
      console.log('Aviso: $ai.chat falhou em competitor insights: ' + aiErr)
    }

    try {
      const oldInsights = $app.findRecordsByFilter(
        'competitor_insights',
        'competitor_id = "' + competitorId + '"',
        '-created',
        10,
        0,
      )
      for (let i = 0; i < oldInsights.length; i++) {
        $app.delete(oldInsights[i])
      }
    } catch (_) {}

    const col = $app.findCollectionByNameOrId('competitor_insights')
    const record = new Record(col)
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
