import { useState } from 'react'
import { askAiAgent } from '@/services/ai-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react'

interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
}

export default function AiStrategist() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Olá! Sou seu Estrategista de Conteúdo Viral. Como posso te ajudar hoje? Posso analisar seu gancho de 3s, sugerir áudios em alta, ou avaliar por que seu último vídeo não entregou.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input
    setInput('')
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await askAiAgent(userMsg, conversationId)
      if (res.conversation_id) setConversationId(res.conversation_id)

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: res.content || 'Resposta gerada.',
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: 'Desculpe, ocorreu um erro ao consultar a IA.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-rose-500" />
          Assistente Estrategista de IA
        </h1>
        <p className="text-muted-foreground text-xs">
          Tire dúvidas em tempo real sobre retenção, gatilhos mentais e algoritmo do Reels/TikTok.
        </p>
      </div>

      <div className="bg-card rounded-xl border shadow-subtle flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                  m.sender === 'user'
                    ? 'bg-rose-600'
                    : 'bg-gradient-to-tr from-amber-500 to-violet-600'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-rose-600 text-white rounded-tr-none'
                    : 'bg-muted border text-foreground rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
              Estrategista pensando...
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
          <Input
            placeholder="Digite sua dúvida ou cole seu roteiro para revisão..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-xs"
          />
          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="bg-rose-600 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
