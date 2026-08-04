routerAdd(
  'GET',
  '/backend/v1/agency/creators',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    const creators = $app.findRecordsByFilter(
      'users',
      "role = 'creator' || role = ''",
      '-created',
      0,
      0,
    )
    const result = creators.map((r) => ({
      id: r.id,
      name: r.getString('name'),
      email: r.getString('email'),
      avatar: r.getString('avatar'),
      trial_end: r.getString('trial_end'),
      role: r.getString('role'),
      created: r.getString('created'),
      updated: r.getString('updated'),
    }))

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
