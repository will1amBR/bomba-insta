routerAdd(
  'GET',
  '/backend/v1/agency/creators/{creatorId}',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const creatorId = e.request.pathValue('creatorId')
    let creator
    try {
      creator = $app.findRecordById('users', creatorId)
    } catch (err) {
      return e.notFoundError('Creator not found')
    }

    let contents = []
    try {
      contents = $app.findRecordsByFilter(
        'contents',
        'user_id = "' + creatorId + '"',
        '-created',
        0,
        0,
      )
    } catch (err) {}

    let briefingsCount = 0
    try {
      briefingsCount = $app.findRecordsByFilter(
        'briefings',
        'influencer_id = "' + creatorId + '"',
        '-created',
        0,
        0,
      ).length
    } catch (err) {}

    let deliverablesCount = 0
    try {
      deliverablesCount = $app.findRecordsByFilter(
        'deliverables',
        'influencer_id = "' + creatorId + '"',
        '-created',
        0,
        0,
      ).length
    } catch (err) {}

    return e.json(200, {
      creator: {
        id: creator.id,
        name: creator.getString('name'),
        email: creator.getString('email'),
        avatar: creator.getString('avatar'),
        trial_end: creator.getString('trial_end'),
        role: creator.getString('role'),
        created: creator.getString('created'),
      },
      contents: contents.map((r) => ({
        id: r.id,
        title: r.getString('title'),
        type: r.getString('type'),
        platform: r.getString('platform'),
        views: r.getInt('views'),
        likes: r.getInt('likes'),
        status: r.getString('status'),
        viral_score: r.getInt('viral_score'),
        hook_rate: r.getInt('hook_rate'),
        retention_rate: r.getInt('retention_rate'),
        created: r.getString('created'),
      })),
      briefingsCount: briefingsCount,
      deliverablesCount: deliverablesCount,
    })
  },
  $apis.requireAuth(),
)
