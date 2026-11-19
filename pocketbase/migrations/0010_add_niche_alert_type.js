migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('notifications')
    const typeField = col.fields.getByName('type')
    if (typeField && typeField.values && typeField.values.indexOf('niche_alert') === -1) {
      typeField.values.push('niche_alert')
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('notifications')
    const typeField = col.fields.getByName('type')
    if (typeField && typeField.values) {
      const idx = typeField.values.indexOf('niche_alert')
      if (idx !== -1) {
        typeField.values.splice(idx, 1)
        app.save(col)
      }
    }
  },
)
