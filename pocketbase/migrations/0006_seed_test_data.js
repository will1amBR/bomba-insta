migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail('william@korenambiental.com')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Criador de Conteúdo Demo')
      app.save(userRecord)
    }
    var userId = userRecord.id

    var trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    var trialEndStr = trialEnd.toISOString().replace('T', ' ').substring(0, 19)
    userRecord.set('trial_end', trialEndStr)
    app.saveNoValidate(userRecord)

    var leadsCol = app.findCollectionByNameOrId('leads')
    var leadExists = false
    try {
      app.findFirstRecordByData('leads', 'handle', '@koren.will')
      leadExists = true
    } catch (_) {}
    if (!leadExists) {
      try {
        app.findFirstRecordByData('leads', 'handle', 'koren.will')
        leadExists = true
      } catch (_) {}
    }
    if (!leadExists) {
      var lead = new Record(leadsCol)
      lead.set('handle', '@koren.will')
      lead.set('links', JSON.stringify(['https://www.instagram.com/koren.will/']))
      app.save(lead)
    }

    var contentsCol = app.findCollectionByNameOrId('contents')
    var additionalContents = [
      {
        title: 'Tutorial: Edição Cinematográfica no Celular em 60 Segundos',
        type: 'video',
        platform: 'youtube_shorts',
        views: 245000,
        likes: 19800,
        comments: 890,
        shares: 5600,
        retention_rate: 78,
        hook_rate: 91,
        watch_time_sec: 42,
        duration_sec: 58,
        posting_date: '2026-07-23 16:00:00',
        viral_score: 95,
        status: 'viral',
        hook_text: 'Ninguém te ensinou essa técnica de edição em 60 segundos!',
        caption: 'Editor de vídeo free + celular = resultado de cinema. Salve esse tutorial!',
        tags: '#tutorial #edicao #cinematografico #youtubeshorts',
      },
      {
        title: 'Vlog: Um Dia na Vida de um Criador de Conteúdo',
        type: 'video',
        platform: 'youtube_shorts',
        views: 3200,
        likes: 180,
        comments: 12,
        shares: 8,
        retention_rate: 18,
        hook_rate: 28,
        watch_time_sec: 10,
        duration_sec: 55,
        posting_date: '2026-07-25 18:00:00',
        viral_score: 22,
        status: 'flop',
        hook_text: 'Oi pessoal, hoje vim mostrar um dia comum na minha vida...',
        caption: 'Vlog do dia. Acordei, tomei café, gravei um pouco...',
        tags: '#vlog #diadia #criadordeconteudo',
      },
    ]

    for (var i = 0; i < additionalContents.length; i++) {
      var item = additionalContents[i]
      var contentExists = false
      try {
        app.findFirstRecordByData('contents', 'title', item.title)
        contentExists = true
      } catch (_) {}
      if (!contentExists) {
        var rec = new Record(contentsCol)
        rec.set('user_id', userId)
        rec.set('title', item.title)
        rec.set('type', item.type)
        rec.set('platform', item.platform)
        rec.set('views', item.views)
        rec.set('likes', item.likes)
        rec.set('comments', item.comments)
        rec.set('shares', item.shares)
        rec.set('retention_rate', item.retention_rate)
        rec.set('hook_rate', item.hook_rate)
        rec.set('watch_time_sec', item.watch_time_sec)
        rec.set('duration_sec', item.duration_sec)
        rec.set('posting_date', item.posting_date)
        rec.set('viral_score', item.viral_score)
        rec.set('status', item.status)
        rec.set('hook_text', item.hook_text)
        rec.set('caption', item.caption)
        rec.set('tags', item.tags)
        app.save(rec)
      }
    }

    var analysesCol = app.findCollectionByNameOrId('analyses')
    var content1 = null,
      content2 = null,
      content3 = null
    try {
      content1 = app.findFirstRecordByData(
        'contents',
        'title',
        '5 Erros no Roteiro que Matam sua Retenção nos primeiros 3s',
      )
    } catch (_) {}
    try {
      content2 = app.findFirstRecordByData(
        'contents',
        'title',
        'Bastidores do Meu Processo de Gravação de Vídeos',
      )
    } catch (_) {}
    try {
      content3 = app.findFirstRecordByData(
        'contents',
        'title',
        'Como Configurar a Câmera do Celular para Qualidade de Cinema',
      )
    } catch (_) {}

    if (content1) {
      var a1Exists = false
      try {
        app.findFirstRecordByData('analyses', 'content_id', content1.id)
        a1Exists = true
      } catch (_) {}
      if (!a1Exists) {
        var a1 = new Record(analysesCol)
        a1.set('user_id', userId)
        a1.set('content_id', content1.id)
        if (content2) {
          a1.set('compared_content_id', content2.id)
        }
        a1.set(
          'summary',
          'O conteúdo viral teve hook_rate de 84% vs 35% do flop. A diferença principal está no gancho visual impactante nos primeiros 3 segundos e no pacing dinâmico com cortes rápidos.',
        )
        a1.set(
          'positive_factors',
          JSON.stringify([
            'Hook visual impactante nos primeiros 3 segundos',
            'Pacing dinâmico com cortes a cada 2.5s',
            'CTA direto e acionável ("Salve esse checklist!")',
            'Uso estratégico de legendas grandes em amarelo e azul',
          ]),
        )
        a1.set(
          'negative_factors',
          JSON.stringify([
            'Duração de 32s poderia ser mais curta (ideal: 25s)',
            'Faltou quebra de padrão visual no meio do vídeo',
            'Sem variação de ângulo de câmera',
          ]),
        )
        a1.set(
          'engagement_diagnosis',
          'Alto engajamento devido ao gancho forte e pacing dinâmico. A retenção de 68% está acima da média do nicho (45%). O CTA gerou 3.890 compartilhamentos, indicando alto valor prático.',
        )
        a1.set('virality_score', 92)
        app.save(a1)
      }
    }

    if (content3) {
      var a2Exists = false
      try {
        app.findFirstRecordByData('analyses', 'content_id', content3.id)
        a2Exists = true
      } catch (_) {}
      if (!a2Exists) {
        var a2 = new Record(analysesCol)
        a2.set('user_id', userId)
        a2.set('content_id', content3.id)
        a2.set(
          'summary',
          'Conteúdo educacional com gancho de curiosidade e entrega rápida de valor. Hook_rate de 89% e retenção de 74% indicam excelência em prender a atenção do início ao fim.',
        )
        a2.set(
          'positive_factors',
          JSON.stringify([
            'Gancho de curiosidade imediato ("Aperte essas 3 configurações agora!")',
            'Entrega de valor rápida e direta em 38 segundos',
            'Tutorial passo a passo claro e replicável',
            'Boa relação duração/conteúdo — sem enrolação',
          ]),
        )
        a2.set(
          'negative_factors',
          JSON.stringify([
            'Poderia ter um CTA mais forte no final',
            'Faltou variação de ângulos de câmera',
            'Legendas poderiam ser mais dinâmicas',
          ]),
        )
        a2.set(
          'engagement_diagnosis',
          'Performance excepcional. O conteúdo combina educação + curiosidade, gerando 8.900 compartilhamentos e alto índice de salvamento. O hook_rate de 89% é referência do nicho.',
        )
        a2.set('virality_score', 96)
        app.save(a2)
      }
    }

    var competitorsCol = app.findCollectionByNameOrId('competitors')
    var comp3Exists = false
    try {
      app.findFirstRecordByData('competitors', 'handle', '@mkdigitalbr')
      comp3Exists = true
    } catch (_) {}
    var comp3Record = null
    if (!comp3Exists) {
      comp3Record = new Record(competitorsCol)
      comp3Record.set('user_id', userId)
      comp3Record.set('channel_name', 'Marketing Digital BR')
      comp3Record.set('handle', '@mkdigitalbr')
      comp3Record.set('platform', 'instagram')
      comp3Record.set('niche', 'Marketing Digital')
      comp3Record.set(
        'notes',
        'Especialista em marketing digital com foco em estratégias de crescimento orgânico e tráfego pago. Conteúdo prático e direto ao ponto.',
      )
      app.save(comp3Record)
    } else {
      try {
        comp3Record = app.findFirstRecordByData('competitors', 'handle', '@mkdigitalbr')
      } catch (_) {}
    }

    if (comp3Record) {
      var insightExists = false
      try {
        app.findFirstRecordByData('competitor_insights', 'competitor_id', comp3Record.id)
        insightExists = true
      } catch (_) {}
      if (!insightExists) {
        var insightsCol = app.findCollectionByNameOrId('competitor_insights')
        var insight = new Record(insightsCol)
        insight.set('user_id', userId)
        insight.set('competitor_id', comp3Record.id)
        insight.set(
          'summary',
          'Marketing Digital BR domina estratégias de crescimento orgânico com conteúdo prático e direto. Seu diferencial está em transformar conceitos complexos de marketing em dicas acionáveis que geram salvamentos e compartilhamentos.',
        )
        insight.set(
          'best_hooks',
          JSON.stringify([
            'O erro que está sabotando suas vendas (você comete isso todo dia)',
            'Ninguém te conta isso sobre tráfego pago...',
            'Esse truque de copywriting dobrou minhas conversões',
          ]),
        )
        insight.set(
          'formats',
          JSON.stringify([
            'Reels tutorial (45-60s)',
            'Carrossel checklist (6-8 slides)',
            'Reels dica rápida (15-20s)',
          ]),
        )
        insight.set(
          'suggested_ideas',
          JSON.stringify([
            'Crie um carrossel checklist dos "7 erros fatais" do seu nicho',
            'Adapte ganchos de curiosidade ("ninguém te conta") para seus Reels',
            'Teste formato de dica rápida (15s) com CTA de comentário',
          ]),
        )
        app.save(insight)
      }
    }

    var existingPlans = app.findRecordsByFilter(
      'action_plans',
      'user_id = "' + userId + '"',
      '-created',
      1,
      0,
    )
    if (existingPlans.length > 0) {
      var plan = existingPlans[0]
      var now = new Date()
      var calPlatforms = ['instagram', 'tiktok', 'youtube_shorts']
      var calTimes = ['19h', '12h', '18h', '20h', '14h', '19h', '21h']
      var calTypes = [
        'Reels educacional',
        'Trend/dança',
        'Tutorial rápido',
        'Bastidores',
        'Dica rápida',
        'Carrossel infográfico',
        'Story interativo',
      ]
      var calendar = []
      for (var j = 0; j < 7; j++) {
        var d = new Date(now.getTime() + j * 86400000)
        var month = d.getMonth() + 1
        var day = d.getDate()
        var dateStr =
          d.getFullYear() +
          '-' +
          (month < 10 ? '0' : '') +
          month +
          '-' +
          (day < 10 ? '0' : '') +
          day
        calendar.push({
          day: dateStr,
          time: calTimes[j],
          platform: calPlatforms[j % 3],
          content_type: calTypes[j],
        })
      }

      plan.set('progress', 0)
      plan.set(
        'goals',
        JSON.stringify([
          {
            id: 'g1',
            title: 'Aumentar Hook Rate para 75%',
            description: 'Nos próximos 5 vídeos, foque em ganchos visuais nos primeiros 3 segundos',
            status: 'pending',
            target: '75% hook rate',
          },
          {
            id: 'g2',
            title: 'Expandir para YouTube Shorts',
            description: 'Adapte 3 dos seus melhores Reels para o formato vertical do YouTube',
            status: 'pending',
            target: '3 shorts publicados',
          },
          {
            id: 'g3',
            title: 'Alcançar 1.000 comentários',
            description: 'Use CTAs que provoquem resposta nos próximos 10 posts',
            status: 'pending',
            target: '1.000 comentários',
          },
          {
            id: 'g4',
            title: 'Analisar 3 concorrentes por semana',
            description: 'Estude ganchos e formatos dos top criadores do nicho',
            status: 'pending',
            target: '3 análises/semana',
          },
        ]),
      )
      plan.set('posting_calendar', JSON.stringify(calendar))
      plan.set(
        'checklist',
        JSON.stringify([
          { id: 'c1', text: 'Gravar 3 variações de hook para cada vídeo', done: false },
          { id: 'c2', text: 'Usar sons em alta do momento', done: false },
          { id: 'c3', text: 'Adicionar legendas dinâmicas em todos os vídeos', done: false },
          { id: 'c4', text: 'Testar formato carrossel 1x por semana', done: false },
          { id: 'c5', text: 'Analisar concorrentes toda segunda-feira', done: false },
          { id: 'c6', text: 'Publicar pelo menos 5x por semana', done: false },
        ]),
      )
      app.save(plan)
    }
  },
  (app) => {},
)
