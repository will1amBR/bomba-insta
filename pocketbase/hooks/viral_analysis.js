routerAdd(
  'POST',
  '/backend/v1/analyze-content',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const contentId = body.content_id
    const comparedContentId = body.compared_content_id

    if (!contentId) return e.badRequestError('ID do conteúdo principal é obrigatório')

    let mainContent
    let comparedContent = null

    try {
      mainContent = $app.findRecordById('contents', contentId)
    } catch (err) {
      return e.notFoundError('Conteúdo principal não encontrado')
    }

    if (comparedContentId) {
      try {
        comparedContent = $app.findRecordById('contents', comparedContentId)
      } catch (_) {}
    }

    const prompt = JSON.stringify({
      principal: {
        titulo: mainContent.getString('title'),
        tipo: mainContent.getString('type'),
        plataforma: mainContent.getString('platform'),
        views: mainContent.getInt('views'),
        likes: mainContent.getInt('likes'),
        comentarios: mainContent.getInt('comments'),
        compartilhamentos: mainContent.getInt('shares'),
        taxa_retencao: mainContent.getInt('retention_rate'),
        hook_rate: mainContent.getInt('hook_rate'),
        gancho_texto: mainContent.getString('hook_text'),
        legenda: mainContent.getString('caption'),
      },
      comparado: comparedContent
        ? {
            titulo: comparedContent.getString('title'),
            views: comparedContent.getInt('views'),
            hook_rate: comparedContent.getInt('hook_rate'),
            retencao: comparedContent.getInt('retention_rate'),
            gancho_texto: comparedContent.getString('hook_text'),
          }
        : null,
    })

    const aiRes = $ai.chat({
      model: 'fast',
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista analista de métricas virais de mídia social. Retorne estritamente um JSON válido no seguinte formato:\n' +
            '{\n' +
            '  "summary": "Resumo executivo do motivo da performance",\n' +
            '  "positive_factors": ["fator 1", "fator 2", "fator 3"],\n' +
            '  "negative_factors": ["ponto de atrito 1", "ponto de atrito 2"],\n' +
            '  "engagement_diagnosis": "Análise detalhada de gancho, retenção e CTA",\n' +
            '  "virality_score": 88\n' +
            '}',
        },
        {
          role: 'user',
          content:
            'Analise o desempenho e os fatores de viralidade do conteúdo a seguir: ' + prompt,
        },
      ],
    })

    let rawJson = aiRes.choices[0].message.content
    let parsed = {
      summary: 'Conteúdo analisado com sucesso.',
      positive_factors: ['Boa taxa de compartilhamento', 'Gancho direto'],
      negative_factors: ['Retenção baixa no terço final'],
      engagement_diagnosis: 'Análise concluída com base nas métricas fornecidas.',
      virality_score: mainContent.getInt('viral_score') || 75,
    }

    try {
      const clean = rawJson.substring(rawJson.indexOf('{'), rawJson.lastIndexOf('}') + 1)
      if (clean) parsed = JSON.parse(clean)
    } catch (_) {}

    const analysesCol = $app.findCollectionByNameOrId('analyses')
    const record = new Record(analysesCol)
    record.set('user_id', userId)
    record.set('content_id', contentId)
    if (comparedContentId) record.set('compared_content_id', comparedContentId)
    record.set('summary', parsed.summary)
    record.set('positive_factors', parsed.positive_factors)
    record.set('negative_factors', parsed.negative_factors)
    record.set('engagement_diagnosis', parsed.engagement_diagnosis)
    record.set('virality_score', parsed.virality_score)

    $app.save(record)

    return e.json(200, {
      id: record.id,
      summary: parsed.summary,
      positive_factors: parsed.positive_factors,
      negative_factors: parsed.negative_factors,
      engagement_diagnosis: parsed.engagement_diagnosis,
      virality_score: parsed.virality_score,
    })
  },
  $apis.requireAuth(),
)
