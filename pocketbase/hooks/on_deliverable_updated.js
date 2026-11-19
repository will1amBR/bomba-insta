// IMPORTANTE: e.next() em finally — todo hook é uma chain desde o PocketBase v0.23.
// IMPORTANTE: toda a lógica inline no callback (sem funções top-level, exigência da JSVM).

onRecordAfterUpdateSuccess((e) => {
  try {
    const deliverable = e.record
    if (!deliverable) return

    const oldStatus = e.oldRecord ? e.oldRecord.getString('status') : ''
    const newStatus = deliverable.getString('status')
    if (oldStatus === newStatus) return

    const agencyId = deliverable.getString('agency_id')
    const influencerId = deliverable.getString('influencer_id')
    const title = deliverable.getString('title') || 'Entrega'

    // 1. Se a entrega foi aprovada
    if (newStatus === 'approved') {
      // Notificar Agência se aprovado pelo cliente/influencer ou em geral
      if (agencyId) {
        try {
          let influencerName = 'O criador'
          try {
            const infRecord = $app.findFirstRecordByData('_pb_users_auth_', 'id', influencerId)
            if (infRecord) {
              influencerName =
                infRecord.getString('name') || infRecord.getString('email') || influencerName
            }
          } catch (_) {}

          const notifCol = $app.findCollectionByNameOrId('notifications')
          const notif = new Record(notifCol)
          notif.set('user_id', agencyId)
          notif.set('title', 'Entrega Aprovada! 🎉✅')
          notif.set(
            'message',
            'A entrega "' +
              title +
              '" foi APROVADA com sucesso por ' +
              influencerName +
              '! Status atualizado no painel.',
          )
          notif.set('type', 'deliverable_status')
          notif.set('read', false)
          notif.set('link', '/agencia')
          notif.set(
            'metadata',
            JSON.stringify({
              deliverable_id: deliverable.id,
              influencer_id: influencerId,
              status: 'approved',
            }),
          )
          $app.save(notif)
        } catch (err) {
          console.log('Erro ao notificar agência sobre aprovação: ' + err)
        }
      }

      // Também atualizar o status do briefing correspondente para 'approved' se existir briefing
      const briefingId = deliverable.getString('briefing_id')
      if (briefingId) {
        try {
          const briefing = $app.findFirstRecordByData('briefings', 'id', briefingId)
          if (briefing && briefing.getString('status') !== 'approved') {
            briefing.set('status', 'approved')
            $app.save(briefing)
          }
        } catch (err) {
          console.log('Erro ao atualizar status do briefing: ' + err)
        }
      }
    } else if (newStatus === 'rejected') {
      // Se foi rejeitada, notificar influenciador ou agência
      if (influencerId) {
        try {
          const notifCol = $app.findCollectionByNameOrId('notifications')
          const notif = new Record(notifCol)
          notif.set('user_id', influencerId)
          notif.set('title', 'Ajustes Solicitados na Entrega ✏️')
          notif.set(
            'message',
            'A entrega "' + title + '" precisa de revisão. Veja o feedback no seu portal!',
          )
          notif.set('type', 'deliverable_status')
          notif.set('read', false)
          notif.set('link', '/portal')
          notif.set(
            'metadata',
            JSON.stringify({
              deliverable_id: deliverable.id,
              status: 'rejected',
            }),
          )
          $app.save(notif)
        } catch (err) {
          console.log('Erro ao notificar rejeição: ' + err)
        }
      }
    }
  } catch (hookErr) {
    console.log('Erro no hook on_deliverable_updated: ' + hookErr)
  } finally {
    e.next()
  }
}, 'deliverables')
