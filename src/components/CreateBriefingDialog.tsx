import { useState } from 'react'
import { createBriefing } from '@/services/briefings'
import type { ContentPlatform, ContentType } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { PlusCircle } from 'lucide-react'

interface Props {
  influencerId: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function CreateBriefingDialog({ influencerId, onSuccess, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    platform: 'instagram' as ContentPlatform,
    content_type: 'video' as ContentType,
    hook: '',
    cta: '',
    visual_notes: '',
    due_date: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast({ title: 'Titulo e obrigatorio', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await createBriefing({ ...form, influencer_id: influencerId, status: 'sent' })
      toast({ title: 'Briefing enviado! 📋✨' })
      setOpen(false)
      setForm({
        title: '',
        description: '',
        platform: 'instagram',
        content_type: 'video',
        hook: '',
        cta: '',
        visual_notes: '',
        due_date: '',
      })
      onSuccess?.()
    } catch {
      toast({ title: 'Erro ao criar briefing', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-primary text-white">
            <PlusCircle className="w-4 h-4" /> Novo Briefing
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Briefing 📋</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <Label>Titulo *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Reels Produto X"
              required
            />
          </div>
          <div>
            <Label>Descricao</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detalhes do briefing..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Plataforma</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm({ ...form, platform: v as ContentPlatform })}
              >
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
            <div>
              <Label>Formato</Label>
              <Select
                value={form.content_type}
                onValueChange={(v) => setForm({ ...form, content_type: v as ContentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="photo">Foto</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Hook (gancho)</Label>
            <Input
              value={form.hook}
              onChange={(e) => setForm({ ...form, hook: e.target.value })}
              placeholder="Ex: Voce nao vai acreditar..."
            />
          </div>
          <div>
            <Label>CTA</Label>
            <Input
              value={form.cta}
              onChange={(e) => setForm({ ...form, cta: e.target.value })}
              placeholder="Ex: Link na bio!"
            />
          </div>
          <div>
            <Label>Notas visuais</Label>
            <Textarea
              value={form.visual_notes}
              onChange={(e) => setForm({ ...form, visual_notes: e.target.value })}
              placeholder="Cores, transicoes, estilo..."
              rows={2}
            />
          </div>
          <div>
            <Label>Prazo</Label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-white">
            {loading ? 'Enviando...' : 'Enviar Briefing 🚀'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
