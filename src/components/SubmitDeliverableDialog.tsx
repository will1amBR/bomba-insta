import { useState } from 'react'
import { createDeliverable } from '@/services/deliverables'
import { SmartHandleInput } from '@/components/SmartHandleInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import type { BriefingRecord } from '@/types/content'
import { Upload } from 'lucide-react'

interface Props {
  briefing: BriefingRecord
  onSuccess?: () => void
}

export function SubmitDeliverableDialog({ briefing, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({ title: 'Titulo e obrigatorio', variant: 'destructive' })
      return
    }
    if (!link.trim()) {
      toast({ title: 'Cole o link da entrega', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await createDeliverable({
        title,
        link,
        briefing_id: briefing.id,
        agency_id: briefing.agency_id,
        status: 'submitted',
      })
      toast({ title: 'Entrega enviada! 🎉' })
      setOpen(false)
      setTitle('')
      setLink('')
      onSuccess?.()
    } catch {
      toast({ title: 'Erro ao enviar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-primary to-violet-600 text-white"
        >
          <Upload className="w-3.5 h-3.5" /> Entregar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Entrega 📦</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <Label>Titulo da entrega *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reels Produto X — Versao 1"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label>Link do conteudo *</Label>
            <div className="mt-1">
              <SmartHandleInput
                value={link}
                onChange={(val) => setLink(val)}
                placeholder="Cole o link (Instagram, TikTok, YouTube...)"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              A plataforma e detectada automaticamente! 🪄
            </p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-violet-600 text-white"
          >
            {loading ? 'Enviando...' : 'Enviar Entrega 🚀'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
