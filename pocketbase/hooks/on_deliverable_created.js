onRecordAfterCreateSuccess((e) => {
  const deliverable = e.record
  if (!deliverable) return

  const agencyId = deliverable.getString('agency_id')
  const influencerId = deliverable.getString('influencer_id')
  const title = deliverable.getString('title') || 'Nova Entrega'

  // Notificar a agência
  if (agencyId) {
    try {
      let influencerName = 'O criador'
      try {
        const infUser = $app.findCollectionByNameOrId('_pb_users_auth_')
        const infRecord = $app.findFirstRecordByData('_pb_users_auth_', 'id', influencerId)
        if (infRecord) {
          influencerName =
            infRecord.getString('name') || infRecord.getString('email') || influencerName
        }
      } catch (_) {}

      const notifCol = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifCol)
      notif.set('user_id', agencyId)
      notif.set('title', 'Nova Entrega Enviada! 🎬')
      notif.set(
        'message',
        influencerName + ' enviou uma entrega para: "' + title + '". Revise no painel da agência!',
      )
      notif.set('type', 'deliverable_submitted')
      notif.set('read', false)
      notif.set('link', '/agencia')
      notif.set(
        'metadata',
        JSON.stringify({ deliverable_id: deliverable.id, influencer_id: influencerId }),
      )
      $app.save(notif)
    } catch (err) {
      console.log('Erro ao criar notificação de entrega: ' + err)
    }
  }
}, 'deliverables')
