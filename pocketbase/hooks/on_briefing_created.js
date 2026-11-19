// IMPORTANTE: e.next() em finally — todo hook é uma chain desde o PocketBase v0.23.
// IMPORTANTE: toda a lógica inline no callback (sem funções top-level, exigência da JSVM).

onRecordAfterCreateSuccess((e) => {
  try {
    const briefing = e.record
    if (!briefing) return

    const influencerId = briefing.getString('influencer_id')
    const agencyId = briefing.getString('agency_id')
    const title = briefing.getString('title') || 'Novo Briefing'

    // Notificar o influencer
    if (influencerId) {
      try {
        const notifCol = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCol)
        notif.set('user_id', influencerId)
        notif.set('title', 'Novo Briefing da Agência! 📋')
        notif.set(
          'message',
          'Você recebeu um novo briefing: "' +
            title +
            '". Acesse seu portal para conferir os detalhes!',
        )
        notif.set('type', 'briefing_new')
        notif.set('read', false)
        notif.set('link', '/portal')
        notif.set('metadata', JSON.stringify({ briefing_id: briefing.id, agency_id: agencyId }))
        $app.save(notif)
      } catch (err) {
        console.log('Erro ao criar notificação de briefing: ' + err)
      }
    }
  } catch (hookErr) {
    console.log('Erro no hook on_briefing_created: ' + hookErr)
  } finally {
    e.next()
  }
}, 'briefings')
