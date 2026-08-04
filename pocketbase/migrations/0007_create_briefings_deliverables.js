migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const usersCol = app.findCollectionByNameOrId(usersId)
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['creator', 'agency'],
          maxSelect: 1,
        }),
      )
    }
    app.save(usersCol)

    const briefings = new Collection({
      name: 'briefings',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (agency_id = @request.auth.id || influencer_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (agency_id = @request.auth.id || influencer_id = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (agency_id = @request.auth.id || influencer_id = @request.auth.id)",
      deleteRule: "@request.auth.id != '' && agency_id = @request.auth.id",
      fields: [
        {
          name: 'agency_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'influencer_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'platform',
          type: 'select',
          required: true,
          values: ['instagram', 'tiktok', 'youtube_shorts'],
          maxSelect: 1,
        },
        {
          name: 'content_type',
          type: 'select',
          values: ['video', 'photo', 'carousel'],
          maxSelect: 1,
        },
        { name: 'hook', type: 'text' },
        { name: 'cta', type: 'text' },
        { name: 'visual_notes', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['draft', 'sent', 'in_progress', 'delivered', 'approved'],
          maxSelect: 1,
        },
        { name: 'due_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_briefings_agency ON briefings (agency_id)',
        'CREATE INDEX idx_briefings_influencer ON briefings (influencer_id)',
      ],
    })
    app.save(briefings)

    const briefingsId = app.findCollectionByNameOrId('briefings').id

    const deliverables = new Collection({
      name: 'deliverables',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (influencer_id = @request.auth.id || agency_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (influencer_id = @request.auth.id || agency_id = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (influencer_id = @request.auth.id || agency_id = @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (influencer_id = @request.auth.id || agency_id = @request.auth.id)",
      fields: [
        {
          name: 'influencer_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'agency_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'briefing_id',
          type: 'relation',
          required: true,
          collectionId: briefingsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'link', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'submitted', 'approved', 'rejected'],
          maxSelect: 1,
        },
        { name: 'feedback', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_deliverables_influencer ON deliverables (influencer_id)',
        'CREATE INDEX idx_deliverables_briefing ON deliverables (briefing_id)',
      ],
    })
    app.save(deliverables)

    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
      user.set('role', 'creator')
      app.saveNoValidate(user)
    } catch (_) {}

    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
      const userId = user.id
      const briefingsCol = app.findCollectionByNameOrId('briefings')

      let briefing
      try {
        briefing = app.findFirstRecordByData('briefings', 'title', 'Reels Produto X — Outubro')
      } catch (_) {
        briefing = new Record(briefingsCol)
        briefing.set('agency_id', userId)
        briefing.set('influencer_id', userId)
        briefing.set('title', 'Reels Produto X — Outubro')
        briefing.set(
          'description',
          'Criar um Reels vibrante mostrando o produto X em acao. Focar nos primeiros 3 segundos com um hook forte!',
        )
        briefing.set('platform', 'instagram')
        briefing.set('content_type', 'video')
        briefing.set('hook', 'Voce nao vai acreditar no que esse produto faz...')
        briefing.set('cta', 'Link na bio!')
        briefing.set('visual_notes', 'Cores quentes, transicoes rapidas, texto dinamico na tela')
        briefing.set('status', 'sent')
        briefing.set('due_date', '2026-08-15')
        app.save(briefing)
      }

      const delCol = app.findCollectionByNameOrId('deliverables')
      try {
        app.findFirstRecordByData('deliverables', 'briefing_id', briefing.id)
      } catch (_) {
        const del = new Record(delCol)
        del.set('influencer_id', userId)
        del.set('agency_id', userId)
        del.set('briefing_id', briefing.id)
        del.set('title', 'Reels Produto X — Versao 1')
        del.set('link', 'https://instagram.com/reel/exemplo123')
        del.set('status', 'submitted')
        app.save(del)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('deliverables'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('briefings'))
    } catch (_) {}
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      const roleField = usersCol.fields.getByName('role')
      if (roleField) usersCol.fields.remove(roleField)
      app.save(usersCol)
    } catch (_) {}
  },
)
