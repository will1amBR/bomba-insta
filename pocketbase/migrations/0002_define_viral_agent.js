migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'viral-content-agent',
      name: 'Estrategista de Viralização e Roteiros',
      description:
        'Analisa fatores de engajamento de vídeos e fotos, diagnosticando padrões virais e gerando roteiros estratégicos de alto desempenho.',
      systemPrompt:
        'Você é um especialista renomado em algoritmo do Instagram Reels, TikTok e YouTube Shorts, e pós-produção de vídeos curtos e posts de foto. Seu foco é analisar métricas (Retention Rate, Hook Rate, Compartilhamentos, Curtidas), comparar conteúdos que viralizaram com os que não performaram, diagnosticar gatilhos visuais e mentais, e sugerir roteiros práticos com Hook fortíssimo nos primeiros 3 segundos, retenção visual constante e Call-To-Action natural. Responda em Português com tom profissional, prático e orientador.',
      tier: 'fast',
      tools: [
        { collection: 'contents', perms: { read: true, list: true } },
        { collection: 'analyses', perms: { read: true, list: true, create: true } },
        { collection: 'scripts', perms: { read: true, list: true, create: true } },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'viral-content-agent')
    } catch (_) {}
  },
)
