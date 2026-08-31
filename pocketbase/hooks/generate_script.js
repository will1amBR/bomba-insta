routerAdd(
  'POST',
  '/backend/v1/generate-script',
  (e) => {
    const authRecord = e.auth
    const userId = authRecord ? authRecord.id : ''
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const topic = body.topic || 'Estratégia de Conteúdo'
    const platform = body.platform || 'instagram'
    const format = body.format || 'video'
    const objective = body.objective || 'Ganhar seguidores e ter alta retenção'

    let parsed = {
      title: 'Roteiro Viral: ' + topic,
      hook_headline: 'Se você quer crescer no digital, pare de cometer esse erro agora!',
      body_outline:
        '1. Apresente a dor principal em 5 segundos.\n2. Mostre o passo a passo de correção com cortes ágeis.\n3. Entregue uma dica bônus inesperada.',
      cta: 'Salve este vídeo para aplicar no seu próximo post e siga para mais!',
      visual_notes: 'Cortes rápidos a cada 2s, legenda dinâmica animada e música em alta ao fundo.',
      estimated_duration: 30,
      viral_potential_score: 88,
    }

    try {
      const userPrompt =
        'Crie um roteiro viral para a plataforma ' +
        platform +
        ' no formato ' +
        format +
        '. Tópico: ' +
        topic +
        '. Objetivo: ' +
        objective +
        '.'

      const aiRes = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um roteirista sênior de vídeos virais para Reels, TikTok e Shorts. Gere um roteiro pronto para gravar. Retorne estritamente um JSON no seguinte formato:\n' +
              '{\n' +
              '  "title": "Título chamativo do roteiro",\n' +
              '  "hook_headline": "Ganchos e frases dos primeiros 3 segundos (Audio + Texto na tela)",\n' +
              '  "body_outline": "Desenvolvimento do vídeo em 3 a 4 tópicos com trocas de imagem a cada 2s",\n' +
              '  "cta": "Chamada para ação de alto impacto",\n' +
              '  "visual_notes": "Instruções de edição, enquadramento, cortes e efeitos sonoros",\n' +
              '  "estimated_duration": 30,\n' +
              '  "viral_potential_score": 92\n' +
              '}',
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
          if (jsonResult.title) parsed.title = jsonResult.title
          if (jsonResult.hook_headline) parsed.hook_headline = jsonResult.hook_headline
          if (jsonResult.body_outline) parsed.body_outline = jsonResult.body_outline
          if (jsonResult.cta) parsed.cta = jsonResult.cta
          if (jsonResult.visual_notes) parsed.visual_notes = jsonResult.visual_notes
          if (typeof jsonResult.estimated_duration === 'number')
            parsed.estimated_duration = jsonResult.estimated_duration
          if (typeof jsonResult.viral_potential_score === 'number')
            parsed.viral_potential_score = jsonResult.viral_potential_score
        }
      }
    } catch (aiErr) {
      console.log('Aviso: $ai.chat falhou em generate-script: ' + aiErr)
    }

    const scriptsCol = $app.findCollectionByNameOrId('scripts')
    const record = new Record(scriptsCol)
    record.set('user_id', userId)
    record.set('title', parsed.title)
    record.set('topic', topic)
    record.set('platform', platform)
    record.set('format', format)
    record.set('hook_headline', parsed.hook_headline)
    record.set('body_outline', parsed.body_outline)
    record.set('cta', parsed.cta)
    record.set('visual_notes', parsed.visual_notes)
    record.set('estimated_duration', parsed.estimated_duration)
    record.set('viral_potential_score', parsed.viral_potential_score)
    record.set('status', 'draft')

    $app.save(record)

    return e.json(200, {
      id: record.id,
      title: parsed.title,
      hook_headline: parsed.hook_headline,
      body_outline: parsed.body_outline,
      cta: parsed.cta,
      visual_notes: parsed.visual_notes,
      estimated_duration: parsed.estimated_duration,
      viral_potential_score: parsed.viral_potential_score,
    })
  },
  $apis.requireAuth(),
)
