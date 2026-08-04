import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCreators, type CreatorRecord } from '@/services/agency'
import { getBriefings } from '@/services/briefings'
import { getDeliverables } from '@/services/deliverables'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRealtime } from '@/hooks/use-realtime'
import { Users, FileText, Package, ArrowRight, Search } from 'lucide-react'

export default function AgencyDashboard() {
  const [creators, setCreators] = useState<CreatorRecord[]>([])
  const [briefings, setBriefings] = useState<any[]>([])
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadData = async () => {
    try {
      const [creatorsData, briefingsData, deliverablesData] = await Promise.all([
        getCreators(),
        getBriefings(),
        getDeliverables(),
      ])
      setCreators(creatorsData)
      setBriefings(briefingsData)
      setDeliverables(deliverablesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('briefings', () => loadData())
  useRealtime('deliverables', () => loadData())

  const filteredCreators = creators.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  )

  const pendingDeliverables = deliverables.filter((d) => d.status === 'submitted')

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" /> Portal da Agência 🏢
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie seus influencers, briefings e entregas num so lugar 🚀
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Influencers</p>
                <p className="text-2xl font-extrabold">{creators.length}</p>
              </div>
              <Users className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Briefings</p>
                <p className="text-2xl font-extrabold">{briefings.length}</p>
              </div>
              <FileText className="w-5 h-5 text-violet-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Entregas Pendentes</p>
                <p className="text-2xl font-extrabold text-amber-600">
                  {pendingDeliverables.length}
                </p>
              </div>
              <Package className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Buscar influencer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Carregando...</div>
      ) : filteredCreators.length === 0 ? (
        <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Nenhum influencer cadastrado ainda 📭</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCreators.map((creator) => {
            const creatorBriefings = briefings.filter((b) => b.influencer_id === creator.id)
            const creatorDeliverables = deliverables.filter((d) => d.influencer_id === creator.id)
            return (
              <Card key={creator.id} className="hover:shadow-elevation transition-all">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{creator.name || creator.email}</h3>
                      <p className="text-xs text-muted-foreground">{creator.email}</p>
                    </div>
                    <Link to={`/agencia/clientes/${creator.id}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        Ver perfil <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded font-medium">
                      {creatorBriefings.length} briefings
                    </span>
                    <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-medium">
                      {creatorDeliverables.length} entregas
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
