migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    // 1. Coleção `notifications`
    const notifications = new Collection({
      name: 'notifications',
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
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: [
            'briefing_new',
            'deliverable_submitted',
            'deliverable_status',
            'system',
            'comparison_alert',
          ],
          maxSelect: 1,
        },
        { name: 'read', type: 'bool' },
        { name: 'link', type: 'text' },
        { name: 'metadata', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_user_read ON notifications (user_id, read)',
        'CREATE INDEX idx_notifications_user_created ON notifications (user_id, created DESC)',
      ],
    })
    app.save(notifications)

    // 2. Coleção `briefing_templates`
    const briefingTemplates = new Collection({
      name: 'briefing_templates',
      type: 'base',
      listRule: '', // público ou todos autenticados
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: false,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'platform',
          type: 'select',
          required: true,
          values: ['instagram', 'tiktok', 'youtube_shorts', 'all'],
          maxSelect: 1,
        },
        {
          name: 'content_type',
          type: 'select',
          values: ['video', 'photo', 'carousel'],
          maxSelect: 1,
        },
        { name: 'hook_suggestion', type: 'text' },
        { name: 'cta_suggestion', type: 'text' },
        { name: 'visual_notes', type: 'text' },
        { name: 'estimated_days', type: 'number' },
        { name: 'is_preset', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_templates_category ON briefing_templates (category)',
        'CREATE INDEX idx_templates_preset ON briefing_templates (is_preset)',
      ],
    })
    app.save(briefingTemplates)

    // 3. Coleção `dev_credentials` (estrutura para scraping / contas de desenvolvedor)
    const devCredentials = new Collection({
      name: 'dev_credentials',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
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
          name: 'platform',
          type: 'select',
          required: true,
          values: ['instagram', 'tiktok', 'youtube', 'meta'],
          maxSelect: 1,
        },
        { name: 'app_id', type: 'text' },
        { name: 'app_secret', type: 'text' },
        { name: 'api_key', type: 'text' },
        { name: 'webhook_verify_token', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['configured', 'pending', 'inactive', 'testing'],
          maxSelect: 1,
        },
        { name: 'quota_limit_daily', type: 'number' },
        { name: 'quota_used_today', type: 'number' },
        { name: 'metadata', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_dev_cred_user ON dev_credentials (user_id)',
        'CREATE INDEX idx_dev_cred_platform ON dev_credentials (platform)',
      ],
    })
    app.save(devCredentials)

    // 4. Seed de Modelos de Briefing Prontos
    const presetTemplates = [
      {
        name: 'Unboxing & Review Sincero 📦',
        category: 'E-commerce & Produtos',
        description:
          'Ideal para lançamentos de produtos físicos, mostrando unboxing dinâmico, primeiras impressões e teste real na prática.',
        platform: 'all',
        content_type: 'video',
        hook_suggestion:
          'Recebi o produto que tá todo mundo falando na gringa... Será que presta ou é golpe?',
        cta_suggestion: 'Cupom de 20% OFF exclusivo no link da minha bio!',
        visual_notes:
          'Cortes rápidos a cada 2 segundos, luz natural ou ring light bem frontal, close-up na textura/embalagem, efeitos sonoros sutis.',
        estimated_days: 3,
        is_preset: true,
      },
      {
        name: 'Tendência / POV Viral 🎭',
        category: 'Entretenimento & Lifestyle',
        description:
          'Aproveita o formato de POV (Point of View) com humor ou identificação imediata para gerar compartilhamentos massivos.',
        platform: 'tiktok',
        content_type: 'video',
        hook_suggestion: 'POV: Você finalmente descobriu o segredo que ninguém no nicho conta...',
        cta_suggestion: 'Manda no grupo daquele seu amigo que precisa ver isso agora! 😂',
        visual_notes:
          'Texto fixo no topo com a premissa, expressão facial marcante nos 3 primeiros segundos, áudio em alta no fundo.',
        estimated_days: 2,
        is_preset: true,
      },
      {
        name: 'Carrossel Educativo Passo a Passo 📚',
        category: 'Infoproduto & B2B',
        description:
          'Post carrossel de alto salvamento ensinando uma solução prática em 5 a 7 slides visuais.',
        platform: 'instagram',
        content_type: 'carousel',
        hook_suggestion: 'Pare de cometer esse erro grave hoje mesmo (Guia Prático em 5 passos):',
        cta_suggestion: 'Salva esse post pra consultar depois e não esquecer!',
        visual_notes:
          'Design minimalista, contraste alto (fundo escuro ou claro), fontes legíveis sem serifa, setas indicando arrastar pro lado.',
        estimated_days: 2,
        is_preset: true,
      },
      {
        name: 'Desafio / Teste de 24 Horas ⏱️',
        category: 'YouTube & Long/Short Form',
        description:
          'Vídeo dinâmico documentando um teste intenso de 24 horas usando uma ferramenta, aplicativo ou rotina nova.',
        platform: 'youtube_shorts',
        content_type: 'video',
        hook_suggestion:
          'Passei 24 horas usando apenas essa ferramenta de IA e esse foi o resultado absurdo:',
        cta_suggestion: 'Se inscreve no canal e comenta qual próximo desafio você quer ver!',
        visual_notes:
          'Cronômetro na tela acelerando o tempo, montagem com música enérgica, resultado mostrado no clímax.',
        estimated_days: 4,
        is_preset: true,
      },
      {
        name: 'Publi Nativo / Storytelling 🎬',
        category: 'Parcerias & Patrocínio',
        description:
          'História real que conecta uma dor genuína à solução trazida pela marca, mantendo alta retenção do público.',
        platform: 'all',
        content_type: 'video',
        hook_suggestion: 'Eu passei meses sofrendo com isso até descobrir essa solução simples...',
        cta_suggestion: 'Clica no botão abaixo para garantir o seu com frete grátis!',
        visual_notes:
          'Tom informal e autêntico de conversa entre amigos, demonstrando a dor no início e o alívio/benefício no final.',
        estimated_days: 5,
        is_preset: true,
      },
    ]

    const templatesCol = app.findCollectionByNameOrId('briefing_templates')
    for (const t of presetTemplates) {
      try {
        const record = new Record(templatesCol)
        record.set('name', t.name)
        record.set('category', t.category)
        record.set('description', t.description)
        record.set('platform', t.platform)
        record.set('content_type', t.content_type)
        record.set('hook_suggestion', t.hook_suggestion)
        record.set('cta_suggestion', t.cta_suggestion)
        record.set('visual_notes', t.visual_notes)
        record.set('estimated_days', t.estimated_days)
        record.set('is_preset', true)
        app.save(record)
      } catch (_) {}
    }

    // 5. Notificação de Boas-Vindas para o usuário inicial se existir
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
      if (user) {
        const notifCol = app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCol)
        notif.set('user_id', user.id)
        notif.set('title', 'Bem-vindo ao ViralMetrics AI! 🚀')
        notif.set(
          'message',
          'Sua conta está ativa com diagnóstico de concorrentes, comparativo lado a lado e gestão de briefings!',
        )
        notif.set('type', 'system')
        notif.set('read', false)
        notif.set('link', '/analise')
        app.save(notif)
      }
    } catch (_) {}
  },
  (app) => {
    const cols = ['dev_credentials', 'briefing_templates', 'notifications']
    for (const name of cols) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
