migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const usersCol = app.findCollectionByNameOrId(usersId)
    if (!usersCol.fields.getByName('trial_end')) {
      usersCol.fields.add(new DateField({ name: 'trial_end' }))
    }
    app.save(usersCol)

    const leads = new Collection({
      name: 'leads',
      type: 'base',
      listRule: null,
      viewRule: null,
      createRule: '',
      updateRule: "@request.auth.id != ''",
      deleteRule: null,
      fields: [
        { name: 'handle', type: 'text', required: true },
        { name: 'links', type: 'json' },
        {
          name: 'user_id',
          type: 'relation',
          required: false,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_leads_user ON leads (user_id)'],
    })
    app.save(leads)
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      const trialField = usersCol.fields.getByName('trial_end')
      if (trialField) usersCol.fields.remove(trialField)
      app.save(usersCol)
    } catch (_) {}

    try {
      const col = app.findCollectionByNameOrId('leads')
      app.delete(col)
    } catch (_) {}
  },
)
