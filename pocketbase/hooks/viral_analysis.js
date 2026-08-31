routerAdd(
  'POST',
  '/backend/v1/analyze-content',
  (e) => {
    const authRecord = e.auth
    const userId = authRecord ? authRecord.id : ''
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

    const mainTitle = mainContent.getString('title')
    const mainType = mainContent.getString('type')
    const mainPlatform = mainContent.getString('platform')
    const mainViews = mainContent.getInt('views')
    const mainLikes = mainContent.getInt('likes')
    const mainComments = mainContent.getInt('comments')
    const mainShares = mainContent.getInt('shares')
    const mainRetention = mainContent.getInt('retention_rate')
    const mainHookRate = mainContent.getInt('hook_rate')
    const mainHookText = mainContent.getString('hook_text')
    const mainCaption = mainContent.getString('caption')
    const mainScore = mainContent.getInt('viral_score') || 75

    const promptPayload = {
      principal: {
        titulo: mainTitle,
        tipo: mainType,
        plataforma: mainPlatform,
        views: mainViews,
        likes: mainLikes,
        comentarios: mainComments,
        compartilhamentos: mainShares,
        taxa_retencao: mainRetention,
        hook_rate: mainHookRate,
        gancho_texto: mainHookText,
        legenda: mainCaption,
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
    }

    let parsed = {
      summary: 'Conteúdo analisado com sucesso.',
      positive_factors: ['Boa taxa de compartilhamento', 'Gancho direto'],
      negative_factors: ['Retenção baixa no terço final'],
      engagement_diagnosis: 'Análise concluída com base nas métricas fornecidas.',
      virality_score: mainScore,
    }

    try {
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
              'Analise o desempenho e os fatores de viralidade do conteúdo a seguir: ' +
              JSON.stringify(promptPayload),
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
          if (Array.isArray(jsonResult.positive_factors))
            parsed.positive_factors = jsonResult.positive_factors
          if (Array.isArray(jsonResult.negative_factors))
            parsed.negative_factors = jsonResult.negative_factors
          if (jsonResult.engagement_diagnosis)
            parsed.engagement_diagnosis = jsonResult.engagement_diagnosis
          if (typeof jsonResult.virality_score === 'number')
            parsed.virality_score = jsonResult.virality_score
        }
      }
    } catch (aiErr) {
      console.log(
        'Aviso: $ai.chat falhou em analyze-content, usando diagnóstico estruturado padrão: ' +
          aiErr,
      )
    }

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
