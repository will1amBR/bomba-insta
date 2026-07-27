import { useState } from 'react'
import { createContent } from '@/services/contents'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { PlusCircle, Flame } from 'lucide-react'
import type { ContentType, ContentPlatform, ViralStatus } from '@/types/content'

interface AddContentModalProps {
  onSuccess: () => void
}

export function AddContentModal({ onSuccess }: AddContentModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<ContentType>('video')
  const [platform, setPlatform] = useState<ContentPlatform>('instagram')
  const [views, setViews] = useState('10000')
  const [likes, setLikes] = useState('800')
  const [comments, setComments] = useState('45')
  const [shares, setShares] = useState('120')
  const [retentionRate, setRetentionRate] = useState('50')
  const [hookRate, setHookRate] = useState('70')
  const [durationSec, setDurationSec] = useState('30')
  const [status, setStatus] = useState<ViralStatus>('standard')
  const [hookText, setHookText] = useState('')
  const [caption, setCaption] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor preencha o título do conteúdo.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const vScore = Math.min(
        100,
        Math.round(
          Number(retentionRate) * 0.4 + Number(hookRate) * 0.4 + Math.min(Number(shares) / 50, 20),
        ),
      )

      await createContent({
        title,
        type,
        platform,
        views: Number(views) || 0,
        likes: Number(likes) || 0,
        comments: Number(comments) || 0,
        shares: Number(shares) || 0,
        retention_rate: Number(retentionRate) || 0,
        hook_rate: Number(hookRate) || 0,
        duration_sec: Number(durationSec) || 0,
        watch_time_sec: Math.round((Number(durationSec) * Number(retentionRate)) / 100),
        status,
        viral_score: vScore,
        hook_text: hookText,
        caption,
        posting_date: new Date().toISOString(),
      })

      toast({ title: 'Sucesso!', description: 'Conteúdo registrado e pronto para análise.' })
      setOpen(false)
      onSuccess()
    } catch (err) {
      toast({
        title: 'Erro ao criar',
        description: 'Não foi possível registrar o conteúdo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-rose-600 to-violet-600 text-white gap-2 shadow-md hover:opacity-95">
          <PlusCircle className="w-4 h-4" />
          Novo Conteúdo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Flame className="w-5 h-5 text-rose-500" />
            Cadastrar Novo Vídeo / Foto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm mt-2">
          <div>
            <Label htmlFor="title">Título ou Ideia do Post</Label>
            <Input
              id="title"
              placeholder="Ex: 3 Segredos para aumentar a retenção"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo de Mídia</Label>
              <Select value={type} onValueChange={(v) => setType(v as ContentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo (Reels / TikTok)</SelectItem>
                  <SelectItem value="photo">Foto Única</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Plataforma</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as ContentPlatform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube_shorts">YouTube Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="hookText">Gancho Inicial (Texto nos primeiros 3s)</Label>
            <Input
              id="hookText"
              placeholder="Ex: Pare de cometer esse erro agora..."
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="views">Visualizações</Label>
              <Input
                id="views"
                type="number"
                value={views}
                onChange={(e) => setViews(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="likes">Curtidas</Label>
              <Input
                id="likes"
                type="number"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shares">Compartilhamentos</Label>
              <Input
                id="shares"
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="comments">Comentários</Label>
              <Input
                id="comments"
                type="number"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          {type === 'video' && (
            <div className="grid grid-cols-3 gap-3 bg-muted/40 p-3 rounded-lg border">
              <div>
                <Label htmlFor="hookRate" className="text-xs">
                  Hook Rate (3s %)
                </Label>
                <Input
                  id="hookRate"
                  type="number"
                  value={hookRate}
                  onChange={(e) => setHookRate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="retentionRate" className="text-xs">
                  Retenção Média %
                </Label>
                <Input
                  id="retentionRate"
                  type="number"
                  value={retentionRate}
                  onChange={(e) => setRetentionRate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="durationSec" className="text-xs">
                  Duração (s)
                </Label>
                <Input
                  id="durationSec"
                  type="number"
                  value={durationSec}
                  onChange={(e) => setDurationSec(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Classificação Geral de Desempenho</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ViralStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viral">🔥 Viralizou (Alta entrega)</SelectItem>
                <SelectItem value="standard">⚡ Padrão / Médio</SelectItem>
                <SelectItem value="flop">🛑 Flop (Baixo engajamento)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="caption">Legenda / Transcrição Rápida</Label>
            <Textarea
              id="caption"
              placeholder="Cole a legenda ou resumo do roteiro aqui..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-600 to-violet-600 text-white font-bold"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Conteúdo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
