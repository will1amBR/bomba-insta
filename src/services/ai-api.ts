import pb from '@/lib/pocketbase/client'

export const askAiAgent = async (message: string, conversationId?: string | null) => {
  return pb.send('/backend/v1/agent-chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getAgentConversations = async () => {
  return pb.send('/backend/v1/chats', { method: 'GET' })
}

export const getAgentMessages = async (conversationId: string) => {
  return pb.send(`/backend/v1/chats/${conversationId}/messages`, { method: 'GET' })
}
