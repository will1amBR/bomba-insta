routerAdd(
  'POST',
  '/backend/v1/generate-script',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const topic = body.topic || 'Estratégia de Conteúdo'
    const platform = body.platform || 'instagram'
    const format = body.format || 'video'
    const objective = body.objective || 'Ganhar seguidores e ter alta retenção'

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
          content: `Crie um roteiro viral para a plataforma ${platform} no formato ${format}. Tópico: ${topic}. Objetivo: ${objective}.`,
        },
      ],
    })

    let rawJson = aiRes.choices[0].message.content
    let parsed = {
      title: `Roteiro Viral: ${topic}`,
      hook_headline: 'Se você quer crescer no digital, pare de cometer esse erro agora!',
      body_outline:
        '1. Apresente a dor principal.\n2. Mostre o passo a passo de correção.\n3. Entregue um elemento surpresa.',
      cta: 'Salve para não esquecer e siga para mais conteúdos de valor!',
      visual_notes: 'Cortes rápidos, legenda animada e som promocional em alta.',
      estimated_duration: 30,
      viral_potential_score: 88,
    }

    try {
      const clean = rawJson.substring(rawJson.indexOf('{'), rawJson.lastIndexOf('}') + 1)
      if (clean) parsed = JSON.parse(clean)
    } catch (_) {}

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
      ...parsed,
    })
  },
  $apis.requireAuth(),
)
