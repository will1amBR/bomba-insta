import { useState, useEffect } from 'react'
import { createBriefing } from '@/services/briefings'
import { getBriefingTemplates } from '@/services/briefing-templates'
import type { ContentPlatform, ContentType, BriefingTemplateRecord } from '@/types/content'
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
import { PlusCircle, Sparkles, LayoutTemplate, Clock, Wand2 } from 'lucide-react'

interface Props {
  influencerId: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function CreateBriefingDialog({ influencerId, onSuccess, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<BriefingTemplateRecord[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom')
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

  useEffect(() => {
    if (open) {
      getBriefingTemplates()
        .then(setTemplates)
        .catch(() => {})
    }
  }, [open])

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (templateId === 'custom') {
      return
    }

    const t = templates.find((item) => item.id === templateId)
    if (!t) return

    // Calculate default due date based on template estimated days
    let dueDateStr = form.due_date
    if (t.estimated_days && !form.due_date) {
      const d = new Date()
      d.setDate(d.getDate() + t.estimated_days)
      dueDateStr = d.toISOString().split('T')[0]
    }

    setForm({
      title: t.name.replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').trim(),
      description: t.description || '',
      platform: t.platform === 'all' ? 'instagram' : (t.platform as ContentPlatform),
      content_type: t.content_type || 'video',
      hook: t.hook_suggestion || '',
      cta: t.cta_suggestion || '',
      visual_notes: t.visual_notes || '',
      due_date: dueDateStr,
    })

    toast({
      title: 'Modelo aplicado! ✨',
      description: `Template "${t.name}" preenchido nos campos.`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await createBriefing({ ...form, influencer_id: influencerId, status: 'sent' })
      toast({ title: 'Briefing enviado com sucesso! 📋🚀' })
      setOpen(false)
      setSelectedTemplateId('custom')
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
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            Criar Briefing para Creator 📋
          </DialogTitle>
        </DialogHeader>

        {/* Template Selector Card */}
        <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-amber-500/10 p-3.5 rounded-xl border border-primary/20 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Usar Modelo Pré-pronto (Templates de Agência):
            </label>
            <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
              Economize tempo ⚡
            </span>
          </div>

          <Select value={selectedTemplateId} onValueChange={handleSelectTemplate}>
            <SelectTrigger className="bg-background text-xs h-9">
              <SelectValue placeholder="Escolha um modelo ou comece do zero..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">✏️ Criar do zero (Sem template)</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} • {t.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTemplateId !== 'custom' && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-1">
              <Wand2 className="w-3.5 h-3.5 text-primary" />
              <span>Campos pré-preenchidos. Você pode editar qualquer informação abaixo!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm pt-1">
          <div>
            <Label className="text-xs font-semibold">Título do Briefing *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Reels Unboxing Produto X"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Objetivo & Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explique a mensagem principal, objetivo e diretrizes..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Plataforma</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm({ ...form, platform: v as ContentPlatform })}
              >
                <SelectTrigger className="text-xs">
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
              <Label className="text-xs font-semibold">Formato</Label>
              <Select
                value={form.content_type}
                onValueChange={(v) => setForm({ ...form, content_type: v as ContentType })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo (Reels / TikTok / Shorts)</SelectItem>
                  <SelectItem value="carousel">Carrossel de Imagens</SelectItem>
                  <SelectItem value="photo">Foto Estática / Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gancho Sugerido (Hook 3s)
            </Label>
            <Input
              value={form.hook}
              onChange={(e) => setForm({ ...form, hook: e.target.value })}
              placeholder="Ex: Você não vai acreditar no que esse produto faz..."
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Chamada para Ação (CTA)</Label>
            <Input
              value={form.cta}
              onChange={(e) => setForm({ ...form, cta: e.target.value })}
              placeholder="Ex: Use o cupom VIRAL20 no link da bio!"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Diretrizes Visuais & Estilo</Label>
            <Textarea
              value={form.visual_notes}
              onChange={(e) => setForm({ ...form, visual_notes: e.target.value })}
              placeholder="Cores da marca, cortes rápidos, iluminação, trilha sonora..."
              rows={2}
            />
          </div>

          <div>
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Prazo de Entrega
            </Label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold h-10 shadow-md"
          >
            {loading ? 'Enviando Briefing...' : 'Enviar Briefing ao Creator 🚀'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
