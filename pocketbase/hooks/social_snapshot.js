routerAdd(
  'POST',
  '/backend/v1/social-snapshot',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const contents = $app.findRecordsByFilter(
      'contents',
      'user_id = "' + userId + '"',
      '-created',
      500,
      0,
    )

    var platforms = {}
    for (var i = 0; i < contents.length; i++) {
      var c = contents[i]
      var platform = c.getString('platform')
      if (!platforms[platform]) {
        platforms[platform] = {
          total_posts: 0,
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_shares: 0,
        }
      }
      var p = platforms[platform]
      p.total_posts++
      p.total_views += c.getInt('views')
      p.total_likes += c.getInt('likes')
      p.total_comments += c.getInt('comments')
      p.total_shares += c.getInt('shares')
    }

    var platformsSummary = []
    var keys = Object.keys(platforms)
    for (var j = 0; j < keys.length; j++) {
      var plat = keys[j]
      var d = platforms[plat]
      var n = d.total_posts || 1
      platformsSummary.push({
        platform: plat,
        total_posts: d.total_posts,
        avg_views: Math.round(d.total_views / n),
        avg_likes: Math.round(d.total_likes / n),
        avg_comments: Math.round(d.total_comments / n),
        avg_shares: Math.round(d.total_shares / n),
        best_posting_time: '19h-21h',
      })
    }

    var ranking = []
    var sorted = platformsSummary.slice().sort(function (a, b) {
      return b.avg_views - a.avg_views
    })
    for (var k = 0; k < sorted.length; k++) {
      ranking.push({ platform: sorted[k].platform, reach: sorted[k].avg_views, position: k + 1 })
    }

    var gaps = ''
    if (keys.length < 3) {
      var missing = ['instagram', 'tiktok', 'youtube_shorts'].filter(function (p) {
        return !platforms[p]
      })
      gaps = 'Você ainda não tem conteúdo em: ' + missing.join(', ') + '. Que tal expandir? 🚀'
    } else {
      gaps = 'Você está presente em todas as plataformas! Continue consistente! 🔥'
    }

    var col = $app.findCollectionByNameOrId('social_snapshots')
    var record = new Record(col)
    record.set('user_id', userId)
    record.set('snapshot_date', new Date().toISOString())
    record.set('platforms_summary', JSON.stringify(platformsSummary))
    record.set('ranking', JSON.stringify(ranking))
    record.set('gaps', gaps)
    $app.save(record)

    return e.json(200, {
      id: record.id,
      snapshot_date: record.getString('snapshot_date'),
      platforms_summary: platformsSummary,
      ranking: ranking,
      gaps: gaps,
    })
  },
  $apis.requireAuth(),
)
