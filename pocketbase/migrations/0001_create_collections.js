migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const contents = new Collection({
      name: 'contents',
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
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['video', 'photo', 'carousel'],
          maxSelect: 1,
        },
        {
          name: 'platform',
          type: 'select',
          required: true,
          values: ['instagram', 'tiktok', 'youtube_shorts'],
          maxSelect: 1,
        },
        { name: 'views', type: 'number', min: 0 },
        { name: 'likes', type: 'number', min: 0 },
        { name: 'comments', type: 'number', min: 0 },
        { name: 'shares', type: 'number', min: 0 },
        { name: 'retention_rate', type: 'number', min: 0, max: 100 },
        { name: 'hook_rate', type: 'number', min: 0, max: 100 },
        { name: 'watch_time_sec', type: 'number', min: 0 },
        { name: 'duration_sec', type: 'number', min: 0 },
        { name: 'posting_date', type: 'date' },
        { name: 'viral_score', type: 'number', min: 0, max: 100 },
        { name: 'status', type: 'select', values: ['viral', 'standard', 'flop'], maxSelect: 1 },
        { name: 'hook_text', type: 'text' },
        { name: 'caption', type: 'text' },
        { name: 'tags', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_contents_user ON contents (user_id)',
        'CREATE INDEX idx_contents_status ON contents (status)',
      ],
    })
    app.save(contents)

    const contentsColId = app.findCollectionByNameOrId('contents').id

    const analyses = new Collection({
      name: 'analyses',
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
          name: 'content_id',
          type: 'relation',
          required: true,
          collectionId: contentsColId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'compared_content_id',
          type: 'relation',
          required: false,
          collectionId: contentsColId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'summary', type: 'text' },
        { name: 'positive_factors', type: 'json' },
        { name: 'negative_factors', type: 'json' },
        { name: 'engagement_diagnosis', type: 'text' },
        { name: 'virality_score', type: 'number', min: 0, max: 100 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_analyses_user ON analyses (user_id)'],
    })
    app.save(analyses)

    const scripts = new Collection({
      name: 'scripts',
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
        { name: 'topic', type: 'text' },
        {
          name: 'platform',
          type: 'select',
          required: true,
          values: ['instagram', 'tiktok', 'youtube_shorts'],
          maxSelect: 1,
        },
        {
          name: 'format',
          type: 'select',
          required: true,
          values: ['video', 'photo', 'carousel'],
          maxSelect: 1,
        },
        { name: 'hook_headline', type: 'text' },
        { name: 'body_outline', type: 'text' },
        { name: 'cta', type: 'text' },
        { name: 'visual_notes', type: 'text' },
        { name: 'estimated_duration', type: 'number', min: 0 },
        { name: 'viral_potential_score', type: 'number', min: 0, max: 100 },
        { name: 'status', type: 'select', values: ['draft', 'approved', 'produced'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_scripts_user ON scripts (user_id)'],
    })
    app.save(scripts)

    const contentIdeas = new Collection({
      name: 'content_ideas',
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
        { name: 'category', type: 'text' },
        { name: 'format', type: 'text' },
        { name: 'reasoning', type: 'text' },
        { name: 'hook_examples', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_ideas_user ON content_ideas (user_id)'],
    })
    app.save(contentIdeas)
  },
  (app) => {
    const collections = ['content_ideas', 'scripts', 'analyses', 'contents']
    for (const colName of collections) {
      try {
        const col = app.findCollectionByNameOrId(colName)
        app.delete(col)
      } catch (_) {}
    }
  },
)
