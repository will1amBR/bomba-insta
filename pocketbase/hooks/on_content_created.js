// Alertas de nicho: ao criar um conteúdo, compara as métricas médias do criador
// com a média do nicho (mesma lógica de src/services/niche-benchmark.ts) e cria
// notificações do tipo "niche_alert" para métricas abaixo da média.
// IMPORTANTE: sem spread operators (runtime Goja gera __spreadValues e quebra).
// IMPORTANTE: e.next() em finally — todo hook é uma chain desde o PocketBase v0.23.
// IMPORTANTE: toda a lógica inline no callback (sem funções top-level, exigência da JSVM).

onRecordAfterCreateSuccess((e) => {
  const content = e.record
  try {
    if (!content) return

    const userId = content.getString('user_id')
    if (!userId) return

    // 1. Conteúdos do usuário (para as métricas do criador)
    const userContents = $app.findRecordsByFilter(
      'contents',
      'user_id = "' + userId + '"',
      '',
      0,
      0,
    )
    if (!userContents || userContents.length === 0) return

    // 2. Nicho do criador: primeiro nicho definido nos concorrentes (padrão do app)
    const userCompetitors = $app.findRecordsByFilter(
      'competitors',
      'user_id = "' + userId + '"',
      '',
      0,
      0,
    )
    let nicheName = 'Geral'
    if (userCompetitors && userCompetitors.length > 0) {
      const n = userCompetitors[0].getString('niche')
      if (n) nicheName = n
    }
    const normNiche = nicheName.trim().toLowerCase()

    // 3. Média do criador
    let tViews = 0
    let tLikes = 0
    let tComments = 0
    let tShares = 0
    let tHook = 0
    let tRetention = 0
    let tScore = 0
    for (let i = 0; i < userContents.length; i++) {
      tViews += userContents[i].getInt('views') || 0
      tLikes += userContents[i].getInt('likes') || 0
      tComments += userContents[i].getInt('comments') || 0
      tShares += userContents[i].getInt('shares') || 0
      tHook += userContents[i].getInt('hook_rate') || 0
      tRetention += userContents[i].getInt('retention_rate') || 0
      tScore += userContents[i].getInt('viral_score') || 0
    }
    const count = userContents.length
    const uViews = Math.round(tViews / count)
    const uLikes = Math.round(tLikes / count)
    const uComments = Math.round(tComments / count)
    const uShares = Math.round(tShares / count)
    const uEngagement =
      uViews > 0 ? Number((((uLikes + uComments + uShares) / uViews) * 100).toFixed(1)) : 0
    const uHook = Math.round(tHook / count)
    const uRetention = Math.round(tRetention / count)
    const uScore = Math.round(tScore / count)

    // 4. Benchmark do nicho: mesma modelagem de niche-benchmark.ts
    const nicheCompetitors = []
    if (userCompetitors && userCompetitors.length > 0) {
      for (let i = 0; i < userCompetitors.length; i++) {
        const cn = (userCompetitors[i].getString('niche') || '').toLowerCase()
        if (
          !normNiche ||
          normNiche === 'geral' ||
          cn.includes(normNiche) ||
          normNiche.includes(cn)
        ) {
          nicheCompetitors.push(userCompetitors[i])
        }
      }
    }

    let nViews = 48500
    let nLikes = 2850
    let nComments = 195
    let nShares = 420
    let nHook = 66
    let nRetention = 48
    let nScore = 72

    if (nicheCompetitors.length > 0) {
      let sViews = 0
      let sLikes = 0
      let sComments = 0
      let sShares = 0
      let sHook = 0
      let sRetention = 0
      let sScore = 0
      for (let i = 0; i < nicheCompetitors.length; i++) {
        const seedStr =
          nicheCompetitors[i].getString('channel_name') +
          (nicheCompetitors[i].getString('niche') || '')
        let seed = 0
        for (let j = 0; j < seedStr.length; j++) seed += seedStr.charCodeAt(j)
        const baseViews = 24000 + (seed % 65000)
        const baseLikes = Math.round(baseViews * (0.055 + (seed % 35) / 1000))
        sViews += baseViews
        sLikes += baseLikes
        sComments += Math.round(baseLikes * 0.075)
        sShares += Math.round(baseLikes * 0.11)
        sHook += 58 + (seed % 28)
        sRetention += 42 + (seed % 26)
        sScore += 65 + (seed % 28)
      }
      const len = nicheCompetitors.length
      nViews = Math.round(sViews / len)
      nLikes = Math.round(sLikes / len)
      nComments = Math.round(sComments / len)
      nShares = Math.round(sShares / len)
      nHook = Math.round(sHook / len)
      nRetention = Math.round(sRetention / len)
      nScore = Math.round(sScore / len)
    }

    const nEngagement =
      nViews > 0 ? Number((((nLikes + nComments + nShares) / nViews) * 100).toFixed(1)) : 0

    // 5. Métricas abaixo da média (mesma régua do relatório: > 3% de diferença)
    const below = []
    const check = function (label, icon, uVal, nVal, unit) {
      if (nVal === 0) return
      const diffPct = Math.round(((uVal - nVal) / nVal) * 100)
      if (diffPct < -3) {
        below.push({
          label: label,
          icon: icon,
          user_value: uVal,
          niche_value: nVal,
          diff_pct: diffPct,
          unit: unit || '',
        })
      }
    }
    check('Visualizações', '👁️', uViews, nViews)
    check('Curtidas', '❤️', uLikes, nLikes)
    check('Comentários', '💬', uComments, nComments)
    check('Compartilhamentos', '🔁', uShares, nShares)
    check('Taxa de Engajamento', '📈', uEngagement, nEngagement, '%')
    check('Hook Rate', '⚡', uHook, nHook, '%')
    check('Retenção Média', '⏱️', uRetention, nRetention, '%')
    check('Viral Score', '🔥', uScore, nScore, '/100')

    if (below.length === 0) return

    // 6. Dedup: se já existe alerta de nicho nas últimas 24h, não repete
    const recent = $app.findRecordsByFilter(
      'notifications',
      'user_id = "' + userId + '" && type = "niche_alert"',
      '-created',
      1,
      0,
    )
    if (recent && recent.length > 0) {
      const last = recent[0]
      const lastCreated = new Date(last.getString('created')).getTime()
      const now = new Date().getTime()
      const hours24 = 24 * 60 * 60 * 1000
      if (now - lastCreated < hours24) return
    }

    // 7. Monta mensagem
    const parts = []
    for (let i = 0; i < below.length && i < 4; i++) {
      parts.push(below[i].icon + ' ' + below[i].label + ' (' + below[i].diff_pct + '% vs. nicho)')
    }
    const suffix = below.length > 4 ? ' e mais ' + (below.length - 4) + ' métrica(s)' : ''

    const notifCol = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifCol)
    notif.set('user_id', userId)
    notif.set('title', '📉 Alerta de Nicho: ' + below.length + ' métrica(s) abaixo da média')
    notif.set(
      'message',
      'No nicho "' +
        nicheName +
        '", seu desempenho está abaixo da média em: ' +
        parts.join(', ') +
        suffix +
        '. Veja o comparativo completo no Relatório de Nicho! 📊',
    )
    notif.set('type', 'niche_alert')
    notif.set('read', false)
    notif.set('link', '/nicho')
    notif.set(
      'metadata',
      JSON.stringify({
        niche: nicheName,
        metrics_below: below,
        trigger_content_id: content.id,
      }),
    )
    $app.save(notif)
    console.log(
      'Alerta de nicho criado para usuário ' + userId + ' (' + below.length + ' métricas abaixo)',
    )
  } catch (err) {
    console.log('Erro ao processar alerta de nicho: ' + err)
  } finally {
    e.next()
  }
}, 'contents')
