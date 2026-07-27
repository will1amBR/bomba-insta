routerAdd(
  'POST',
  '/backend/v1/agent-chat',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')

    const body = e.requestInfo().body || {}
    const message = (body.message || '').trim()
    if (!message) return e.badRequestError('A mensagem é obrigatória')

    try {
      const result = $ai.agent('viral-content-agent').chat({
        user_id: userId,
        conversation_id: body.conversation_id || null,
        message: message,
      })

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        citations: result.citations,
        message_id: result.message_id,
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'Serviço de IA indisponível no momento' })
      }
      return e.json(500, { error: 'Erro ao consultar o assistente de mídia' })
    }
  },
  $apis.requireAuth(),
)
