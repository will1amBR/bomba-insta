routerAdd(
  'POST',
  '/backend/v1/suggest-ideas',
  (e) => {
    const authRecord = e.auth
    const userId = authRecord ? authRecord.id : ''
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const niche = body.niche || 'Criação de Conteúdo & Marketing Digital'

    let parsed = {
      ideas: [
        {
          title: '3 Truques de Edição para triplicar a retenção',
          category: 'Tutorial',
          format: 'Vídeo Curto',
          reasoning: 'Gera curiosidade imediata e ensina habilidades altamente práticas.',
          hook_examples: [
            'Você ainda edita do jeito antigo?',
            'O segredo dos grandes criadores revelado em 3 passos.',
          ],
        },
        {
          title: 'O Maior Erro que Criadores Cometem no Primeiro Segundo',
          category: 'Educacional',
          format: 'Vídeo Curto',
          reasoning: 'Ataca uma dor latente e gera alto índice de salvamentos.',
          hook_examples: [
            'Pare de começar seus vídeos dando bom dia!',
            'Seus vídeos não entregam por causa dessa frase inicial.',
          ],
        },
        {
          title: 'Bastidores de Produção: Do Roteiro à Gravação em 15 Minutos',
          category: 'Bastidores',
          format: 'Carrossel',
          reasoning: 'Humaniza a marca pessoal e constrói autoridade autêntica.',
          hook_examples: [
            'Como eu organizo minha semana de conteúdo sem pirar.',
            'Meu fluxo exato de gravação em 3 etapas simples.',
          ],
        },
        {
          title: 'Por Que o Alcance Orgânico Mudou e O Que Fazer Agora',
          category: 'Polêmico',
          format: 'Vídeo Curto',
          reasoning: 'Tópico de alta relevância com gatilho de novidade e urgência.',
          hook_examples: [
            'O algoritmo não morreu, você só está usando métricas erradas.',
            'A métrica que o algoritmo prioriza este mês.',
          ],
        },
      ],
    }

    try {
      const userPrompt = 'Gere ideias de conteúdo para o nicho de: ' + niche

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
        if (jsonResult && typeof jsonResult === 'object' && Array.isArray(jsonResult.ideas)) {
          parsed.ideas = jsonResult.ideas
        }
      }
    } catch (aiErr) {
      console.log('Aviso: $ai.chat falhou em suggest-ideas: ' + aiErr)
    }

    const ideasCol = $app.findCollectionByNameOrId('content_ideas')
    const ideasList = Array.isArray(parsed.ideas) ? parsed.ideas : []
    for (let i = 0; i < ideasList.length; i++) {
      const idea = ideasList[i]
      try {
        const rec = new Record(ideasCol)
        rec.set('user_id', userId)
        rec.set('title', idea.title || 'Nova Ideia')
        rec.set('category', idea.category || 'Geral')
        rec.set('format', idea.format || 'Vídeo Curto')
        rec.set('reasoning', idea.reasoning || '')
        rec.set('hook_examples', JSON.stringify(idea.hook_examples || []))
        $app.save(rec)
      } catch (_) {}
    }

    return e.json(200, parsed)
  },
  $apis.requireAuth(),
)
