migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const socialSnapshots = new Collection({
      name: 'social_snapshots',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'snapshot_date', type: 'date' },
        { name: 'platforms_summary', type: 'json' },
        { name: 'ranking', type: 'json' },
        { name: 'gaps', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_snapshots_user ON social_snapshots (user_id)'],
    })
    app.save(socialSnapshots)

    const actionPlans = new Collection({
      name: 'action_plans',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'summary', type: 'text' },
        { name: 'goals', type: 'json' },
        { name: 'posting_calendar', type: 'json' },
        { name: 'checklist', type: 'json' },
        { name: 'progress', type: 'number', min: 0, max: 100 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_action_plans_user ON action_plans (user_id)'],
    })
    app.save(actionPlans)

    const competitors = new Collection({
      name: 'competitors',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'channel_name', type: 'text', required: true },
        { name: 'handle', type: 'text' },
        {
          name: 'platform',
          type: 'select',
          required: true,
          values: ['instagram', 'tiktok', 'youtube_shorts'],
          maxSelect: 1,
        },
        { name: 'niche', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_competitors_user ON competitors (user_id)'],
    })
    app.save(competitors)

    const competitorsId = app.findCollectionByNameOrId('competitors').id
    const competitorInsights = new Collection({
      name: 'competitor_insights',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'competitor_id',
          type: 'relation',
          required: true,
          collectionId: competitorsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'summary', type: 'text' },
        { name: 'best_hooks', type: 'json' },
        { name: 'formats', type: 'json' },
        { name: 'suggested_ideas', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_comp_insights_user ON competitor_insights (user_id)'],
    })
    app.save(competitorInsights)

    // Seed data
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
    } catch (_) {
      return
    }
    const userId = userRecord.id

    // Seed social snapshot
    const snapshotsCol = app.findCollectionByNameOrId('social_snapshots')
    try {
      app.findFirstRecordByData('social_snapshots', 'snapshot_date', '2026-07-27 10:00:00')
    } catch (_) {
      const snap = new Record(snapshotsCol)
      snap.set('user_id', userId)
      snap.set('snapshot_date', '2026-07-27 10:00:00')
      snap.set(
        'platforms_summary',
        JSON.stringify([
          {
            platform: 'instagram',
            total_posts: 12,
            avg_views: 85600,
            avg_likes: 7800,
            avg_comments: 320,
            avg_shares: 1250,
            best_posting_time: '19h-21h',
          },
          {
            platform: 'tiktok',
            total_posts: 8,
            avg_views: 42000,
            avg_likes: 3100,
            avg_comments: 150,
            avg_shares: 480,
            best_posting_time: '12h-14h',
          },
          {
            platform: 'youtube_shorts',
            total_posts: 5,
            avg_views: 18500,
            avg_likes: 1450,
            avg_comments: 85,
            avg_shares: 210,
            best_posting_time: '18h-20h',
          },
        ]),
      )
      snap.set(
        'ranking',
        JSON.stringify([
          { platform: 'instagram', reach: 85600, position: 1 },
          { platform: 'tiktok', reach: 42000, position: 2 },
          { platform: 'youtube_shorts', reach: 18500, position: 3 },
        ]),
      )
      snap.set(
        'gaps',
        'Você está arrasando no Instagram Reels! 🔥 Mas há uma oportunidade gigante no YouTube Shorts — adapte seus melhores hooks para lá!',
      )
      app.save(snap)
    }

    // Seed action plan
    const actionPlansCol = app.findCollectionByNameOrId('action_plans')
    try {
      app.findFirstRecordByData(
        'action_plans',
        'summary',
        'Plano de Ação: Aumentar Hook Rate e Expandir Multiplataforma 🚀',
      )
    } catch (_) {
      const plan = new Record(actionPlansCol)
      plan.set('user_id', userId)
      plan.set('summary', 'Plano de Ação: Aumentar Hook Rate e Expandir Multiplataforma 🚀')
      plan.set(
        'goals',
        JSON.stringify([
          {
            id: 'g1',
            title: 'Aumentar Hook Rate para 75%',
            description: 'Nos próximos 5 vídeos, foque em ganchos visuais nos primeiros 3 segundos',
            status: 'in_progress',
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
        ]),
      )
      plan.set(
        'posting_calendar',
        JSON.stringify([
          { day: 'Segunda', time: '19h', platform: 'instagram', content_type: 'Reels educacional' },
          { day: 'Quarta', time: '12h', platform: 'tiktok', content_type: 'Trend/dança' },
          { day: 'Sexta', time: '19h', platform: 'instagram', content_type: 'Bastidores' },
          {
            day: 'Sábado',
            time: '18h',
            platform: 'youtube_shorts',
            content_type: 'Tutorial rápido',
          },
        ]),
      )
      plan.set(
        'checklist',
        JSON.stringify([
          { id: 'c1', text: 'Gravar 3 variações de hook para cada vídeo', done: false },
          { id: 'c2', text: 'Usar sons em alta do momento', done: true },
          { id: 'c3', text: 'Adicionar legendas dinâmicas em todos os vídeos', done: true },
          { id: 'c4', text: 'Testar formato carrossel 1x por semana', done: false },
        ]),
      )
      plan.set('progress', 35)
      app.save(plan)
    }

    // Seed competitors + insights
    const competitorsCol = app.findCollectionByNameOrId('competitors')
    const insightsCol = app.findCollectionByNameOrId('competitor_insights')

    const seedCompetitors = [
      {
        channel_name: 'Criativo MT',
        handle: '@criativomt',
        platform: 'instagram',
        niche: 'Marketing Digital',
        notes: 'Foco em conteúdo educacional de marketing digital com carrosséis e Reels',
      },
      {
        channel_name: 'Digital Storm',
        handle: '@digitalstorm',
        platform: 'tiktok',
        niche: 'Tecnologia',
        notes: 'Reviews rápidos e dicas de tecnologia com cortes dinâmicos',
      },
    ]

    for (const comp of seedCompetitors) {
      let compRecord
      try {
        compRecord = app.findFirstRecordByData('competitors', 'handle', comp.handle)
      } catch (_) {
        const rec = new Record(competitorsCol)
        rec.set('user_id', userId)
        rec.set('channel_name', comp.channel_name)
        rec.set('handle', comp.handle)
        rec.set('platform', comp.platform)
        rec.set('niche', comp.niche)
        rec.set('notes', comp.notes)
        app.save(rec)
        compRecord = rec
      }

      try {
        app.findFirstRecordByData('competitor_insights', 'competitor_id', compRecord.id)
      } catch (_) {
        const insight = new Record(insightsCol)
        insight.set('user_id', userId)
        insight.set('competitor_id', compRecord.id)
        if (comp.handle === '@criativomt') {
          insight.set(
            'summary',
            'Criativo MT domina o Instagram com ganchos educacionais e CTAs que geram salvamentos. Sua força está em transformar conceitos complexos em visuais simples.',
          )
          insight.set(
            'best_hooks',
            JSON.stringify([
              'Ninguém te conta isso sobre o algoritmo do Instagram...',
              'Esse erro está matando seu engajamento (você faz isso!)',
              'O segredo dos perfis que crescem 10x mais rápido',
            ]),
          )
          insight.set(
            'formats',
            JSON.stringify([
              'Reels educacional (60s)',
              'Carrossel infográfico (8-10 slides)',
              'Reels bastidores (15-30s)',
            ]),
          )
          insight.set(
            'suggested_ideas',
            JSON.stringify([
              'Adapte o formato de carrossel infográfico para seu nicho',
              'Use ganchos que criam urgência ("antes que apaguem")',
              'Teste CTAs de salvamento em vez de comentário',
            ]),
          )
        } else {
          insight.set(
            'summary',
            'Digital Storm bomba no TikTok com reviews ultra-rápidos e cortes dinâmicos a cada 1.5s. A força está na velocidade da informação e uso de trends de áudio.',
          )
          insight.set(
            'best_hooks',
            JSON.stringify([
              'Você precisa ver isso antes de comprar...',
              '3 coisas que ninguém reparou nesse gadget',
              'Esse app vai mudar sua rotina (sério!)',
            ]),
          )
          insight.set(
            'formats',
            JSON.stringify(['Review rápido (15-30s)', 'Top 3/Top 5 listas', 'Unboxing acelerado']),
          )
          insight.set(
            'suggested_ideas',
            JSON.stringify([
              'Adote cortes mais rápidos (a cada 2s) em seus Reels',
              'Crie conteúdo no formato "Top 3" do seu nicho',
              'Use trends de áudio do TikTok também no Instagram',
            ]),
          )
        }
        app.save(insight)
      }
    }
  },
  (app) => {
    const collections = ['competitor_insights', 'competitors', 'action_plans', 'social_snapshots']
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
