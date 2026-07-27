import { useEffect, useState } from 'react'
import { getScripts, updateScriptStatus, deleteScript } from '@/services/scripts'
import { getContentIdeas, generateIdeas } from '@/services/ideas'
import type { ScriptRecord, ContentIdea } from '@/types/content'
import { ScriptCard } from '@/components/ScriptCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { Lightbulb, FileText, Sparkles, Plus, Wand2 } from 'lucide-react'

export default function ScriptsLibrary() {
  const [scripts, setScripts] = useState<ScriptRecord[]>([])
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingIdeas, setGeneratingIdeas] = useState(false)
  const [nicheInput, setNicheInput] = useState('Marketing & Redes Sociais')

  const loadAll = async () => {
    try {
      setLoading(true)
      const [sList, iList] = await Promise.all([getScripts(), getContentIdeas()])
      setScripts(sList)
      setIdeas(iList)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'approved' | 'produced') => {
    try {
      await updateScriptStatus(id, newStatus)
      toast({ title: 'Status Atualizado!' })
      loadAll()
    } catch (err) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteScript(id)
      toast({ title: 'Roteiro Removido' })
      loadAll()
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleGenerateMoreIdeas = async () => {
    if (!nicheInput.trim()) return
    setGeneratingIdeas(true)
    try {
      await generateIdeas(nicheInput)
      toast({ title: 'Novas ideias sugeridas com sucesso!' })
      loadAll()
    } catch (err) {
      toast({ title: 'Erro ao sugerir ideias', variant: 'destructive' })
    } finally {
      setGeneratingIdeas(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Lightbulb className="w-7 h-7 text-amber-500 fill-amber-500" />
          Biblioteca de Roteiros & Ideias Virais
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie seus roteiros em produção e descubra novas ideias validadas pela IA.
        </p>
      </div>

      <Tabs defaultValue="scripts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="scripts" className="gap-2">
            <FileText className="w-4 h-4" />
            Roteiros ({scripts.length})
          </TabsTrigger>
          <TabsTrigger value="ideas" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Ideias ({ideas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scripts" className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando roteiros...</div>
          ) : scripts.length === 0 ? (
            <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center space-y-2">
              <p className="text-muted-foreground text-sm">Nenhum roteiro na biblioteca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ideas" className="space-y-4">
          <div className="bg-card p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-3">
            <Input
              placeholder="Digite seu nicho..."
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              className="text-xs h-9"
            />
            <Button
              onClick={handleGenerateMoreIdeas}
              disabled={generatingIdeas}
              className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold h-9 text-xs gap-1.5 whitespace-nowrap"
            >
              <Wand2 className="w-3.5 h-3.5" />
              {generatingIdeas ? 'Buscando Tendências...' : 'Sugerir Novas Ideias'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-card p-4 rounded-xl border shadow-subtle space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500/15 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                    {idea.category} • {idea.format}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-foreground">{idea.title}</h3>
                <p className="text-muted-foreground">{idea.reasoning}</p>

                {idea.hook_examples && (
                  <div className="bg-muted/50 p-2 rounded border space-y-1">
                    <span className="font-semibold text-foreground text-[11px]">
                      Exemplos de Gancho:
                    </span>
                    {(Array.isArray(idea.hook_examples) ? idea.hook_examples : []).map((h, idx) => (
                      <p key={idx} className="italic text-muted-foreground">
                        • "{h}"
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
