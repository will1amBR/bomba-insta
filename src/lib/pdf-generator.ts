import type {
  ContentRecord,
  CompetitorRecord,
  CompetitorInsightRecord,
  ActionPlanRecord,
  AnalysisRecord,
} from '@/types/content'

export interface ReportData {
  userName?: string
  userEmail?: string
  contents: ContentRecord[]
  competitors: CompetitorRecord[]
  competitorInsights?: CompetitorInsightRecord[]
  actionPlan?: ActionPlanRecord | null
  latestAnalysis?: AnalysisRecord | null
}

export function generateReportPdf(data: ReportData) {
  const printWindow = window.open('', '_blank', 'width=950,height=1100')
  if (!printWindow) {
    alert('Por favor, permita popups para gerar e visualizar o relatório em PDF.')
    return
  }

  const {
    userName = 'Criador / Agência',
    userEmail = '',
    contents = [],
    competitors = [],
    actionPlan = null,
    latestAnalysis = null,
  } = data

  const totalPosts = contents.length
  const totalViews = contents.reduce((a, b) => a + (b.views || 0), 0)
  const totalLikes = contents.reduce((a, b) => a + (b.likes || 0), 0)
  const totalComments = contents.reduce((a, b) => a + (b.comments || 0), 0)
  const avgHook = totalPosts
    ? Math.round(contents.reduce((a, b) => a + (b.hook_rate || 0), 0) / totalPosts)
    : 0
  const avgRetention = totalPosts
    ? Math.round(contents.reduce((a, b) => a + (b.retention_rate || 0), 0) / totalPosts)
    : 0
  const viralCount = contents.filter((c) => c.status === 'viral').length

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
      <title>Relatório Executivo ViralMetrics AI - ${userName}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          background: #ffffff;
          line-height: 1.5;
          margin: 0;
          padding: 24px;
          font-size: 12px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .badge {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 20px;
          margin-bottom: 12px;
          padding-bottom: 4px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
        }
        .card-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 600;
        }
        .card-val {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        th {
          background: #f1f5f9;
          color: #334155;
          font-weight: 700;
          text-align: left;
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
        }
        td {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        tr:nth-child(even) td {
          background: #fcfcfd;
        }
        .tag-viral {
          background: #dcfce7;
          color: #15803d;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .tag-flop {
          background: #fee2e2;
          color: #b91c1c;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .tag-standard {
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .action-plan-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 20px;
        }
        .action-plan-title {
          font-weight: 700;
          color: #166534;
          margin-bottom: 6px;
          font-size: 12px;
        }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
        }
        .print-btn-bar {
          position: sticky;
          top: 0;
          background: #0f172a;
          color: white;
          padding: 10px 20px;
          margin: -24px -24px 24px -24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-print {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          font-size: 12px;
        }
        .btn-print:hover {
          background: #1d4ed8;
        }
        @media print {
          .print-btn-bar {
            display: none !important;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar">
        <span>📄 Relatório Oficial de Métricas & Conteúdo — Pronto para Imprimir / Salvar em PDF</span>
        <button class="btn-print" onclick="window.print()">Salvar como PDF / Imprimir 🖨️</button>
      </div>

      <div class="header">
        <div>
          <div class="logo">
            🔥 ViralMetrics AI
          </div>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 11px;">
            Diagnóstico de Desempenho & Inteligência Competitiva
          </p>
        </div>
        <div style="text-align: right;">
          <span class="badge">Relatório para Clientes</span>
          <p style="margin: 4px 0 0 0; font-weight: 600; color: #334155;">${userName}</p>
          <p style="margin: 0; color: #94a3b8; font-size: 10px;">${dateStr}</p>
        </div>
      </div>

      <!-- Métricas Resumo -->
      <div class="section-title">📊 1. Resumo Geral de Desempenho</div>
      <div class="grid-4">
        <div class="card">
          <div class="card-label">Total de Views</div>
          <div class="card-val">${totalViews.toLocaleString()}</div>
        </div>
        <div class="card">
          <div class="card-label">Hook Rate Médio (3s)</div>
          <div class="card-val" style="color: #d97706;">${avgHook}%</div>
        </div>
        <div class="card">
          <div class="card-label">Retenção Média</div>
          <div class="card-val" style="color: #7c3aed;">${avgRetention}%</div>
        </div>
        <div class="card">
          <div class="card-label">Vídeos Virais</div>
          <div class="card-val" style="color: #16a34a;">${viralCount} de ${totalPosts}</div>
        </div>
      </div>

      <!-- Tabela de Conteúdos -->
      <div class="section-title">🎬 2. Análise de Conteúdos Publicados</div>
      <table>
        <thead>
          <tr>
            <th>Título do Conteúdo</th>
            <th>Plataforma</th>
            <th>Formato</th>
            <th>Views</th>
            <th>Hook (3s)</th>
            <th>Retenção</th>
            <th>Score Viral</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            contents.length === 0
              ? `<tr><td colspan="8" style="text-align:center;">Nenhum conteúdo registrado ainda.</td></tr>`
              : contents
                  .slice(0, 10)
                  .map(
                    (c) => `
              <tr>
                <td style="font-weight: 600;">${c.title}</td>
                <td>${c.platform.toUpperCase()}</td>
                <td>${c.type}</td>
                <td>${(c.views || 0).toLocaleString()}</td>
                <td>${c.hook_rate || 0}%</td>
                <td>${c.retention_rate || 0}%</td>
                <td style="font-weight: 700;">${c.viral_score || 0}/100</td>
                <td>
                  <span class="${
                    c.status === 'viral'
                      ? 'tag-viral'
                      : c.status === 'flop'
                        ? 'tag-flop'
                        : 'tag-standard'
                  }">${c.status.toUpperCase()}</span>
                </td>
              </tr>
            `,
                  )
                  .join('')
          }
        </tbody>
      </table>

      <!-- Comparativo com Concorrentes -->
      ${
        competitors.length > 0
          ? `
        <div class="section-title">⚔️ 3. Radar de Concorrência & Benchmarking</div>
        <table>
          <thead>
            <tr>
              <th>Canal / Concorrente</th>
              <th>Handle</th>
              <th>Plataforma</th>
              <th>Nicho</th>
              <th>Status do Radar</th>
            </tr>
          </thead>
          <tbody>
            ${competitors
              .map(
                (comp) => `
              <tr>
                <td style="font-weight: 600;">${comp.channel_name}</td>
                <td>${comp.handle}</td>
                <td>${comp.platform.toUpperCase()}</td>
                <td>${comp.niche || 'Geral'}</td>
                <td style="color: #2563eb; font-weight: 600;">✓ Monitorado</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      `
          : ''
      }

      <!-- Plano de Ação Estratégico -->
      ${
        actionPlan
          ? `
        <div class="section-title">🎯 4. Plano de Ação & Próximos Passos Recomendados</div>
        <div class="action-plan-box">
          <div class="action-plan-title">💡 Diretriz Estratégica: ${actionPlan.summary}</div>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #374151;">
            Progresso Geral de Metas: <strong>${actionPlan.progress}% Concluído</strong>
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
            ${(Array.isArray(actionPlan.goals) ? actionPlan.goals : [])
              .slice(0, 4)
              .map(
                (g) => `
              <div style="background: white; padding: 8px; border-radius: 6px; border: 1px solid #dcfce7;">
                <strong>${g.title}</strong>
                <p style="margin: 2px 0 0 0; font-size: 10px; color: #6b7280;">${g.description}</p>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <div class="footer">
        <span>ViralMetrics AI — Relatório Gerado Automaticamente</span>
        <span>Página 1 de 1 • Confidencial</span>
      </div>
    </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
