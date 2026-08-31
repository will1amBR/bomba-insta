routerAdd(
  'POST',
  '/backend/v1/action-plan',
  (e) => {
    const authRecord = e.auth
    const userId = authRecord ? authRecord.id : ''
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    let analysisContext = ''

    if (body.analysis_id) {
      try {
        const analysis = $app.findRecordById('analyses', body.analysis_id)
        analysisContext = JSON.stringify({
          summary: analysis.getString('summary'),
          positive_factors: analysis.get('positive_factors'),
          negative_factors: analysis.get('negative_factors'),
          virality_score: analysis.getInt('virality_score'),
        })
      } catch (_) {}
    }

    let parsed = {
      summary: 'Plano Estratégico de Crescimento & Retenção 🚀',
      goals: [
        {
          id: 'g1',
          title: 'Aumentar Hook Rate para > 70%',
          description:
            'Otimizar os primeiros 3 segundos com quebra de padrão visual e texto na tela.',
          status: 'pending',
          target: 'Taxa de 70% nos próximos 5 vídeos',
        },
        {
          id: 'g2',
          title: 'Consistência de Postagens',
          description: 'Publicar nos horários de pico (18h-20h) 4x por semana.',
          status: 'pending',
          target: '4 posts por semana',
        },
      ],
      posting_calendar: [
        {
          day: 'Segunda-feira',
          time: '19h00',
          platform: 'instagram',
          content_type: 'Reels - Tutorial Rápido',
        },
        {
          day: 'Quarta-feira',
          time: '18h30',
          platform: 'tiktok',
          content_type: 'Vídeo Curto - Erros Comuns',
        },
        {
          day: 'Sexta-feira',
          time: '20h00',
          platform: 'instagram',
          content_type: 'Carrossel Educativo',
        },
      ],
      checklist: [
        { id: 'c1', text: 'Adicionar legenda dinâmica nos primeiros 3 segundos', done: false },
        { id: 'c2', text: 'Inserir CTA claro para salvamento no terço final', done: false },
        { id: 'c3', text: 'Ajustar iluminação e cortes a cada 2.5 segundos', done: false },
      ],
    }

    try {
      const userPrompt = analysisContext
        ? 'Crie um plano de ação baseado nesta análise de conteúdo: ' + analysisContext
        : 'Crie um plano geral para crescer nas redes sociais com foco em retenção e hook rate.'

      const aiRes = $ai.chat({
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
            content: userPrompt,
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
          if (Array.isArray(jsonResult.goals)) parsed.goals = jsonResult.goals
          if (Array.isArray(jsonResult.posting_calendar))
            parsed.posting_calendar = jsonResult.posting_calendar
          if (Array.isArray(jsonResult.checklist)) parsed.checklist = jsonResult.checklist
        }
      }
    } catch (aiErr) {
      console.log('Aviso: $ai.chat falhou em action plan: ' + aiErr)
    }

    const col = $app.findCollectionByNameOrId('action_plans')
    const record = new Record(col)
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
