import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import type { ContentRecord } from '@/types/content'

interface ViralMetricsChartProps {
  contents: ContentRecord[]
}

export function ViralMetricsChart({ contents }: ViralMetricsChartProps) {
  const chartData = contents.slice(0, 7).map((c) => ({
    title: c.title.length > 20 ? c.title.substring(0, 18) + '...' : c.title,
    viral_score: c.viral_score || 50,
    hook_rate: c.hook_rate || 0,
    retention_rate: c.retention_rate || 0,
    status: c.status,
  }))

  const chartConfig = {
    viral_score: {
      label: 'Pontuação Viral',
      color: 'hsl(var(--chart-1))',
    },
    hook_rate: {
      label: 'Taxa de Hook (3s)',
      color: 'hsl(var(--chart-2))',
    },
  }

  return (
    <div className="w-full h-[260px] pt-2">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis
              dataKey="title"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="viral_score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                let fill = '#a855f7'
                if (entry.status === 'viral') fill = '#10b981'
                if (entry.status === 'flop') fill = '#f43f5e'
                return <Cell key={`cell-${index}`} fill={fill} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
