migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    // 1. Coleção `plans`
    const plans = new Collection({
      name: 'plans',
      type: 'base',
      listRule: '', // público para qualquer um ver os planos
      viewRule: '', // público
      createRule: null, // superusers / migrations only
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'price', type: 'number', required: true, min: 0 },
        { name: 'currency', type: 'text' },
        { name: 'interval', type: 'text' },
        { name: 'features', type: 'json' },
        { name: 'trial_days', type: 'number', min: 0 },
        { name: 'stripe_price_id', type: 'text' },
        { name: 'mercadopago_plan_id', type: 'text' },
        { name: 'badge', type: 'text' },
        { name: 'highlight', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_plans_slug ON plans (slug)'],
    })
    app.save(plans)

    const plansColId = app.findCollectionByNameOrId('plans').id

    // 2. Coleção `subscriptions`
    const subscriptions = new Collection({
      name: 'subscriptions',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: null,
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
          name: 'plan_id',
          type: 'relation',
          required: false,
          collectionId: plansColId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['trialing', 'active', 'past_due', 'canceled', 'expired', 'incomplete'],
          maxSelect: 1,
        },
        {
          name: 'provider',
          type: 'select',
          values: ['stripe', 'mercadopago', 'system'],
          maxSelect: 1,
        },
        { name: 'trial_ends_at', type: 'date' },
        { name: 'current_period_ends_at', type: 'date' },
        { name: 'stripe_customer_id', type: 'text' },
        { name: 'stripe_subscription_id', type: 'text' },
        { name: 'mercadopago_subscription_id', type: 'text' },
        { name: 'mercadopago_payer_id', type: 'text' },
        { name: 'cancel_at_period_end', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_subscriptions_user ON subscriptions (user_id)',
        'CREATE INDEX idx_subscriptions_status ON subscriptions (status)',
      ],
    })
    app.save(subscriptions)

    // 3. Coleção `social_tokens`
    const socialTokens = new Collection({
      name: 'social_tokens',
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
          values: ['instagram', 'tiktok', 'youtube'],
          maxSelect: 1,
        },
        { name: 'platform_user_id', type: 'text' },
        { name: 'platform_username', type: 'text' },
        { name: 'access_token', type: 'text', required: true },
        { name: 'refresh_token', type: 'text' },
        { name: 'token_type', type: 'text' },
        { name: 'scope', type: 'text' },
        { name: 'expires_at', type: 'date' },
        { name: 'profile_picture_url', type: 'text' },
        { name: 'metadata', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_social_tokens_user ON social_tokens (user_id)',
        'CREATE INDEX idx_social_tokens_platform ON social_tokens (platform)',
      ],
    })
    app.save(socialTokens)

    // Seed initial plans
    const seededPlans = [
      {
        name: 'Básico',
        slug: 'basico',
        price: 29,
        currency: 'BRL',
        interval: 'month',
        trial_days: 7,
        badge: 'Para Iniciantes 🌱',
        highlight: false,
        stripe_price_id: 'price_basico_29',
        mercadopago_plan_id: 'mp_plan_basico_29',
        features: [
          'Até 1 perfil conectado',
          'Análise de até 30 vídeos/mês',
          'Diagnóstico de Hook Rate (3s)',
          '5 Roteiros Virais por IA / mês',
          'Mapeamento de 2 concorrentes',
          'Suporte via e-mail',
        ],
      },
      {
        name: 'Profissional',
        slug: 'profissional',
        price: 79,
        currency: 'BRL',
        interval: 'month',
        trial_days: 7,
        badge: 'Mais Popular 🔥',
        highlight: true,
        stripe_price_id: 'price_pro_79',
        mercadopago_plan_id: 'mp_plan_pro_79',
        features: [
          'Tudo do plano Básico',
          'Até 3 perfis conectados',
          'Análise Ilimitada de vídeos e carrosséis',
          'Roteiros Ilimitados com IA Estrategista',
          'Radar com até 10 concorrentes em tempo real',
          'Plano de Ação de 30 Dias personalizado',
          'Conexão Oficial Instagram Graph & TikTok',
          'Suporte Prioritário via WhatsApp ⚡',
        ],
      },
      {
        name: 'Premium',
        slug: 'premium',
        price: 149,
        currency: 'BRL',
        interval: 'month',
        trial_days: 7,
        badge: 'Agências & Creators TOP 🚀',
        highlight: false,
        stripe_price_id: 'price_premium_149',
        mercadopago_plan_id: 'mp_plan_premium_149',
        features: [
          'Tudo do plano Profissional',
          'Perfis Ilimitados conectados',
          'Portal da Agência & Gestão de Briefings',
          'Aprovação de Entregáveis e Feedback em vídeo',
          'Relatórios White-label em PDF/Exportação',
          'Radar de Concorrentes Ilimitado',
          'Acesso antecipado a novos modelos de IA',
          'Gerente de Conta dedicado 👑',
        ],
      },
    ]

    for (const p of seededPlans) {
      try {
        const record = new Record(plans)
        record.set('name', p.name)
        record.set('slug', p.slug)
        record.set('price', p.price)
        record.set('currency', p.currency)
        record.set('interval', p.interval)
        record.set('trial_days', p.trial_days)
        record.set('badge', p.badge)
        record.set('highlight', p.highlight)
        record.set('stripe_price_id', p.stripe_price_id)
        record.set('mercadopago_plan_id', p.mercadopago_plan_id)
        record.set('features', JSON.stringify(p.features))
        app.save(record)
      } catch (_) {}
    }

    // Give existing admin / user an active trialing subscription if user exists
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
      if (admin) {
        const proPlan = app.findFirstRecordByData('plans', 'slug', 'profissional')
        const sub = new Record(subscriptions)
        sub.set('user_id', admin.id)
        if (proPlan) sub.set('plan_id', proPlan.id)
        sub.set('status', 'trialing')
        sub.set('provider', 'system')
        const trialDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        sub.set('trial_ends_at', trialDate.toISOString().replace('T', ' ').substring(0, 19))
        app.save(sub)
      }
    } catch (_) {}
  },
  (app) => {
    const cols = ['social_tokens', 'subscriptions', 'plans']
    for (const name of cols) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
