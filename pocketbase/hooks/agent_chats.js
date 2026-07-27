routerAdd(
  'GET',
  '/backend/v1/chats',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')
    return e.json(
      200,
      $ai.agent('viral-content-agent').listConversations({ user_id: userId, limit: 20 }),
    )
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/chats/{conversationId}/messages',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')
    const conversationId = e.request.pathValue('conversationId')
    try {
      return e.json(
        200,
        $ai.agent('viral-content-agent').listMessages({
          conversation_id: conversationId,
          user_id: userId,
        }),
      )
    } catch (err) {
      return e.json(404, { error: 'Conversa não encontrada' })
    }
  },
  $apis.requireAuth(),
)
