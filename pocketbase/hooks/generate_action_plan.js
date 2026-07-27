routerAdd(
  'POST',
  '/backend/v1/action-plan',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    var analysisContext = ''

    if (body.analysis_id) {
      try {
        var analysis = $app.findRecordById('analyses', body.analysis_id)
        analysisContext = JSON.stringify({
          summary: analysis.getString('summary'),
          positive_factors: analysis.get('positive_factors'),
          negative_factors: analysis.get('negative_factors'),
          virality_score: analysis.getInt('virality_score'),
        })
      } catch (_) {}
    }

    var aiRes = $ai.chat({
      model: 'fast',
      messages: [
        {
          role: 'system',
          content:
            'Você é um estrategista de conteúdo viral. Crie um plano de ação prático e motivador. Retorne estritamente um JSON no formato:\n' +
            '{"summary": "resumo do plano", "goals": [{"id": "g1", "title": "objetivo", "description": "detalhe", "status": "pending", "target": "meta"}], "posting_calendar": [{"day": "Segunda", "time": "19h", "platform": "instagram", "content_type": "tipo"}], "checklist": [{"id": "c1", "text": "item", "done": false}]}\n' +
            'Responda em Português com linguagem jovem e motivadora. Use emojis.',
        },
        {
          role: 'user',
          content:
            'Crie um plano de ação baseado nesta análise: ' +
            (analysisContext ||
              'Crie um plano geral para crescer nas redes sociais com foco em retenção e hook rate.'),
        },
      ],
    })

    var rawJson = aiRes.choices[0].message.content
    var parsed = {
      summary: 'Plano de Ação Gerado 🚀',
      goals: [],
      posting_calendar: [],
      checklist: [],
    }

    try {
      var clean = rawJson.substring(rawJson.indexOf('{'), rawJson.lastIndexOf('}') + 1)
      if (clean) parsed = JSON.parse(clean)
    } catch (_) {}

    var col = $app.findCollectionByNameOrId('action_plans')
    var record = new Record(col)
    record.set('user_id', userId)
    record.set('summary', parsed.summary || 'Plano de Ação')
    record.set('goals', JSON.stringify(parsed.goals || []))
    record.set('posting_calendar', JSON.stringify(parsed.posting_calendar || []))
    record.set('checklist', JSON.stringify(parsed.checklist || []))
    record.set('progress', 0)
    $app.save(record)

    return e.json(200, {
      id: record.id,
      summary: parsed.summary,
      goals: parsed.goals || [],
      posting_calendar: parsed.posting_calendar || [],
      checklist: parsed.checklist || [],
      progress: 0,
    })
  },
  $apis.requireAuth(),
)
