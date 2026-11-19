import type { NicheMetrics } from '@/services/niche-benchmark'

export interface NichePdfData {
  benchmark: NicheMetrics
  userName?: string
  userEmail?: string
}

const verdictLabel = (verdict: string) => {
  if (verdict === 'dominando') return '🔥 Dominando o Nicho'
  if (verdict === 'precisa_ajustes') return '🛠️ Precisa de Ajustes'
  return '⚡ Competitivo no Nicho'
}

const fmt = (n: number) => (n || 0).toLocaleString('pt-BR')

const statusInfo = (
  status: 'above' | 'below' | 'equal',
  diffPct: number,
): { label: string; color: string; icon: string } => {
  if (status === 'above')
    return { label: `Acima (+${Math.abs(diffPct)}%)`, color: '#059669', icon: '▲' }
  if (status === 'below') return { label: `Abaixo (${diffPct}%)`, color: '#e11d48', icon: '▼' }
  return { label: `Na média (${diffPct >= 0 ? '+' : ''}${diffPct}%)`, color: '#64748b', icon: '▬' }
}

export function generateNicheReportPdf(data: NichePdfData) {
  const printWindow = window.open('', '_blank', 'width=950,height=1100')
  if (!printWindow) {
    alert('Por favor, permita popups para gerar e visualizar o relatório em PDF.')
    return
  }

  const { benchmark, userName = 'Criador', userEmail = '' } = data

  const rows = [
    {
      label: 'Visualizações Médias (Views)',
      icon: '👁️',
      user: fmt(benchmark.userAvgViews),
      niche: fmt(benchmark.nicheAvgViews),
      status: benchmark.viewsStatus,
      diffPct: benchmark.viewsDiffPct,
    },
    {
      label: 'Curtidas Médias',
      icon: '❤️',
      user: fmt(benchmark.userAvgLikes),
      niche: fmt(benchmark.nicheAvgLikes),
      status: benchmark.likesStatus,
      diffPct: benchmark.likesDiffPct,
    },
    {
      label: 'Comentários Médios',
      icon: '💬',
      user: fmt(benchmark.userAvgComments),
      niche: fmt(benchmark.nicheAvgComments),
      status: benchmark.commentsStatus,
      diffPct: benchmark.commentsDiffPct,
    },
    {
      label: 'Compartilhamentos',
      icon: '🔁',
      user: fmt(benchmark.userAvgShares),
      niche: fmt(benchmark.nicheAvgShares),
      status: benchmark.sharesStatus,
      diffPct: benchmark.sharesDiffPct,
    },
    {
      label: 'Taxa de Engajamento',
      icon: '📈',
      user: `${benchmark.userAvgEngagementRate}%`,
      niche: `${benchmark.nicheAvgEngagementRate}%`,
      status: benchmark.engagementStatus,
      diffPct: benchmark.engagementDiffPct,
    },
    {
      label: 'Hook Rate (Retenção 3s)',
      icon: '⚡',
      user: `${benchmark.userAvgHookRate}%`,
      niche: `${benchmark.nicheAvgHookRate}%`,
      status: benchmark.hookRateStatus,
      diffPct: benchmark.hookRateDiffPct,
    },
    {
      label: 'Taxa de Retenção Média',
      icon: '⏱️',
      user: `${benchmark.userAvgRetentionRate}%`,
      niche: `${benchmark.nicheAvgRetentionRate}%`,
      status: benchmark.retentionStatus,
      diffPct: benchmark.retentionDiffPct,
    },
    {
      label: 'Pontuação Viral (Viral Score)',
      icon: '🔥',
      user: `${benchmark.userAvgViralScore}/100`,
      niche: `${benchmark.nicheAvgViralScore}/100`,
      status: benchmark.viralScoreStatus,
      diffPct: benchmark.viralScoreDiffPct,
    },
  ]

  const tableRows = rows
    .map((r) => {
      const st = statusInfo(r.status, r.diffPct)
      return `
        <tr>
          <td>${r.icon} ${r.label}</td>
          <td style="text-align:right; font-weight:700;">${r.user}</td>
          <td style="text-align:right;">${r.niche}</td>
          <td style="text-align:right; font-weight:700; color:${st.color};">${st.icon} ${st.label}</td>
        </tr>`
    })
    .join('')

  const insightsHtml = (benchmark.insights || [])
    .map(
      (i) => `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:3px solid #7c3aed; border-radius:8px; padding:8px 12px; margin-bottom:8px; font-size:11px;">
          ${i}
        </div>`,
    )
    .join('')

  const hooksHtml = (benchmark.topKeywordsOrHooks || []).length
    ? (benchmark.topKeywordsOrHooks || [])
        .map(
          (h) => `
            <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:8px 12px; margin-bottom:6px; font-size:11px;">
              🎣 ${h}
            </div>`,
        )
        .join('')
    : '<p style="font-size:11px; color:#64748b;">Nenhum hook validado de concorrentes registrado ainda. Adicione concorrentes e gere insights para ver os ganchos que mais funcionam no seu nicho.</p>'

  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Nicho ViralMetrics AI - ${benchmark.nicheName}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b; background: #ffffff; line-height: 1.5; margin: 0; padding: 24px; font-size: 12px;
        }
        .header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;
        }
        .logo { font-size: 20px; font-weight: 800; color: #0f172a; }
        .badge { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
        .section-title {
          font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 20px; margin-bottom: 10px;
          padding-bottom: 4px; border-bottom: 1px solid #e2e8f0;
        }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .card {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;
        }
        .card .label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
        .card .value { font-size: 20px; font-weight: 800; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th {
          background: #0f172a; color: #ffffff; font-size: 11px; text-align: left;
          padding: 8px 10px; font-weight: 700;
        }
        th.r { text-align: right; }
        td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .verdict {
          display: inline-block; border-radius: 9999px; padding: 6px 14px; font-size: 13px;
          font-weight: 800; color: #ffffff; background: #7c3aed;
        }
        .footer {
          margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 10px;
          display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🔥 ViralMetrics AI — Relatório de Nicho</div>
        <div class="badge">${dateStr}</div>
      </div>

      <p style="font-size: 11px; color: #64748b; margin: 0 0 14px 0;">
        Criador: <strong style="color:#0f172a;">${userName}</strong>${userEmail ? ' • ' + userEmail : ''} •
        Nicho analisado: <strong style="color:#0f172a;">${benchmark.nicheName}</strong> •
        Base: ${benchmark.userCount} conteúdos do criador vs. ${benchmark.nicheCompetitorsCount} concorrentes do nicho
      </p>

      <div class="grid-4">
        <div class="card">
          <div class="label">Score Geral</div>
          <div class="value" style="color:#7c3aed;">${benchmark.overallScore}/100</div>
        </div>
        <div class="card">
          <div class="label">Veredito</div>
          <div class="value" style="font-size:13px; margin-top:6px;"><span class="verdict">${verdictLabel(benchmark.overallVerdict)}</span></div>
        </div>
        <div class="card">
          <div class="label">Conteúdos Virais</div>
          <div class="value" style="color:#059669;">${benchmark.userViralCount} 🚀</div>
        </div>
        <div class="card">
          <div class="label">Flops</div>
          <div class="value" style="color:#e11d48;">${benchmark.userFlopCount}</div>
        </div>
      </div>

      <div class="section-title">⚔️ Criador vs. Média do Nicho (8 métricas)</div>
      <table>
        <thead>
          <tr>
            <th>Métrica</th>
            <th class="r">Seu Criador</th>
            <th class="r">Média do Nicho</th>
            <th class="r">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="section-title">💡 Recomendações da IA</div>
      ${insightsHtml || '<p style="font-size:11px; color:#64748b;">Sem recomendações no momento.</p>'}

      <div class="section-title">🎣 Hooks Validados no Nicho</div>
      ${hooksHtml}

      <div class="footer">
        <span>ViralMetrics AI — Relatório de Benchmark por Nicho</span>
        <span>Confidencial • Gerado automaticamente</span>
      </div>
    </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
