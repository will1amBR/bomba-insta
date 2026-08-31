import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCompetitors, createCompetitor, deleteCompetitor } from '@/services/competitors'
import type { CompetitorRecord, CompetitorInsightRecord, ContentPlatform } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Crosshair, PlusCircle, Trash2, Eye, ExternalLink, Sparkles } from 'lucide-react'
import { getCompetitorInsights } from '@/services/competitors'
import { CompetitorComparison } from '@/components/CompetitorComparison'
import { getContents } from '@/services/contents'
import type { ContentRecord } from '@/types/content'

export default function Competitors() {
  const [competitors, setCompetitors] = useState<CompetitorRecord[]>([])
  const [insights, setInsights] = useState<CompetitorInsightRecord[]>([])
  const [contents, setContents] = useState<ContentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    channel_name: '',
    handle: '',
    platform: 'instagram' as ContentPlatform,
    niche: '',
    notes: '',
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [comps, ins, conts] = await Promise.all([
        getCompetitors(),
        getCompetitorInsights(),
        getContents(),
      ])
      setCompetitors(comps)
      setInsights(ins)
      setContents(conts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('competitor_insights', () => {
    loadData()
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.channel_name.trim()) {
      toast({ title: 'Preencha o nome do canal', variant: 'destructive' })
      return
    }
    try {
      await createCompetitor(form)
      toast({ title: 'Concorrente adicionado! 🎯' })
      setOpen(false)
      setForm({ channel_name: '', handle: '', platform: 'instagram', niche: '', notes: '' })
      loadData()
    } catch {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCompetitor(id)
      toast({ title: 'Removido!' })
      loadData()
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Crosshair className="w-7 h-7 text-secondary" />
            Concorrentes 📡
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Espie o que os melhores estão fazendo e roube as ideias certas! 👀
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-secondary text-white">
              <PlusCircle className="w-4 h-4" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Concorrente 🎯</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <Label>Nome do Canal</Label>
                <Input
                  value={form.channel_name}
                  onChange={(e) => setForm({ ...form, channel_name: e.target.value })}
                  placeholder="Ex: Criativo MT"
                  required
                />
              </div>
              <div>
                <Label>Handle</Label>
                <Input
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  placeholder="@usuario"
                />
              </div>
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
                <Label>Nicho</Label>
                <Input
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="Ex: Marketing Digital"
                />
              </div>
              <div>
                <Label>Notas</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Observações sobre o canal"
                />
              </div>
              <Button type="submit" className="w-full bg-secondary text-white">
                Adicionar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Side-by-side comparison table directly in Competitors page */}
      {competitors.length > 0 && (
        <div className="mt-4">
          <CompetitorComparison
            userContents={contents}
            competitors={competitors}
            competitorInsights={insights}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
      ) : competitors.length === 0 ? (
        <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            Nenhum concorrente ainda. Adicione o primeiro! 🚀
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((comp) => {
            const insight = insights.find((i) => i.competitor_id === comp.id)
            return (
              <Card key={comp.id} className="hover:shadow-elevation transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{comp.channel_name}</h3>
                      <p className="text-xs text-muted-foreground">{comp.handle}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {comp.platform.replace('_', ' ')}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(comp.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {comp.niche && (
                    <span className="text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                      {comp.niche}
                    </span>
                  )}
                  {insight ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1">
                        <Eye className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {insight.summary}
                      </p>
                      {Array.isArray(insight.best_hooks) && insight.best_hooks[0] && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded text-xs">
                          <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Top hook:
                          </span>
                          <p className="italic mt-0.5">"{insight.best_hooks[0]}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Sem insights ainda — gere na página de detalhes!
                    </p>
                  )}
                  <Link to={`/concorrentes/${comp.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      Ver detalhes <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
