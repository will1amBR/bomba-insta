routerAdd(
  'POST',
  '/backend/v1/suggest-ideas',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const niche = body.niche || 'Criação de Conteúdo & Marketing Digital'

    const aiRes = $ai.chat({
      model: 'fast',
      messages: [
        {
          role: 'system',
          content:
            'Você é um diretor criativo de conteúdo viral. Sugira 4 ideias de posts com alto potencial de engajamento e compartilhamento. Retorne estritamente um JSON no seguinte formato:\n' +
            '{\n' +
            '  "ideas": [\n' +
            '    {\n' +
            '      "title": "Título da ideia",\n' +
            '      "category": "Educacional / Polêmico / Bastidores / Tutorial",\n' +
            '      "format": "Vídeo Curto / Carrossel",\n' +
            '      "reasoning": "Por que essa ideia tem alta probabilidade de viralizar",\n' +
            '      "hook_examples": ["Gancho Opção 1", "Gancho Opção 2"]\n' +
            '    }\n' +
            '  ]\n' +
            '}',
        },
        {
          role: 'user',
          content: `Gere ideias de conteúdo para o nicho de: ${niche}`,
        },
      ],
    })

    let rawJson = aiRes.choices[0].message.content
    let parsed = {
      ideas: [
        {
          title: '3 Truques de Edição para triplicar a retenção',
          category: 'Tutorial',
          format: 'Vídeo Curto',
          reasoning: 'Gera curiosidade imediata e ensina habilidades altamente praticadas.',
          hook_examples: [
            'Você ainda edita do jeito antigo?',
            'O segredo dos grandes criadores revelado.',
          ],
        },
      ],
    }

    try {
      const clean = rawJson.substring(rawJson.indexOf('{'), rawJson.lastIndexOf('}') + 1)
      if (clean) parsed = JSON.parse(clean)
    } catch (_) {}

    const ideasCol = $app.findCollectionByNameOrId('content_ideas')
    for (const idea of parsed.ideas || []) {
      try {
        const rec = new Record(ideasCol)
        rec.set('user_id', userId)
        rec.set('title', idea.title)
        rec.set('category', idea.category)
        rec.set('format', idea.format)
        rec.set('reasoning', idea.reasoning)
        rec.set('hook_examples', idea.hook_examples)
        $app.save(rec)
      } catch (_) {}
    }

    return e.json(200, parsed)
  },
  $apis.requireAuth(),
)
