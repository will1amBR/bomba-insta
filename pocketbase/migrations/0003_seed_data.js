migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail('william@korenambiental.com')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Criador de Conteúdo Demo')
      app.save(userRecord)
    }

    const userId = userRecord.id
    const contentsCol = app.findCollectionByNameOrId('contents')

    const sampleContents = [
      {
        title: '5 Erros no Roteiro que Matam sua Retenção nos primeiros 3s',
        type: 'video',
        platform: 'instagram',
        views: 185400,
        likes: 14200,
        comments: 620,
        shares: 3890,
        retention_rate: 68,
        hook_rate: 84,
        watch_time_sec: 24,
        duration_sec: 32,
        viral_score: 92,
        status: 'viral',
        hook_text:
          'Pare de cometer esse erro nos primeiros 3 segundos se quiser passar de 100k views!',
        caption: 'Seu vídeo não entrega porque o gancho é fraco. Salve esse checklist!',
        tags: '#roteiro #viral #engajamento #reels',
      },
      {
        title: 'Bastidores do Meu Processo de Gravação de Vídeos',
        type: 'video',
        platform: 'tiktok',
        views: 8900,
        likes: 410,
        comments: 28,
        shares: 15,
        retention_rate: 22,
        hook_rate: 35,
        watch_time_sec: 8,
        duration_sec: 45,
        viral_score: 34,
        status: 'flop',
        hook_text:
          'Oi gente, hoje vou mostrar um pouco da minha rotina de gravação aqui no estúdio...',
        caption: 'Vlog de quarta-feira arrumando a iluminação e gravando reels.',
        tags: '#vlog #rotina #estudio',
      },
      {
        title: 'Como Configurar a Câmera do Celular para Qualidade de Cinema',
        type: 'video',
        platform: 'instagram',
        views: 312000,
        likes: 28400,
        comments: 1120,
        shares: 8900,
        retention_rate: 74,
        hook_rate: 89,
        watch_time_sec: 29,
        duration_sec: 38,
        viral_score: 96,
        status: 'viral',
        hook_text: 'Aperte essas 3 configurações agora no seu iPhone antes de gravar!',
        caption: 'Configure 4K 30fps e desligue o HDR de vídeo no iOS. Passo a passo simples!',
        tags: '#dicasdecamera #reels #tutorial #qualidade',
      },
      {
        title: 'Carrossel: Guia Definitivo de Gatilhos Mentais para Posts',
        type: 'carousel',
        platform: 'instagram',
        views: 45200,
        likes: 3800,
        comments: 240,
        shares: 1250,
        retention_rate: 61,
        hook_rate: 72,
        watch_time_sec: 0,
        duration_sec: 0,
        viral_score: 78,
        status: 'standard',
        hook_text: 'Deslize para ver os 7 gatilhos visuais que prendem a atenção.',
        caption: 'Carrossel de 8 páginas explicativo com design clean.',
        tags: '#carrossel #design #gatilhos',
      },
      {
        title: 'Foto do Setup Minimalista com Iluminação RGB',
        type: 'photo',
        platform: 'instagram',
        views: 12400,
        likes: 1850,
        comments: 84,
        shares: 95,
        retention_rate: 45,
        hook_rate: 52,
        watch_time_sec: 0,
        duration_sec: 0,
        viral_score: 55,
        status: 'standard',
        hook_text: 'Setup atualizado para 2026.',
        caption: 'Mesa de madeira maciça + monitor ultrawide. Gostaram?',
        tags: '#setup #workspace #minimalismo',
      },
    ]

    for (const item of sampleContents) {
      try {
        app.findFirstRecordByData('contents', 'title', item.title)
      } catch (_) {
        const rec = new Record(contentsCol)
        rec.set('user_id', userId)
        rec.set('title', item.title)
        rec.set('type', item.type)
        rec.set('platform', item.platform)
        rec.set('views', item.views)
        rec.set('likes', item.likes)
        rec.set('comments', item.comments)
        rec.set('shares', item.shares)
        rec.set('retention_rate', item.retention_rate)
        rec.set('hook_rate', item.hook_rate)
        rec.set('watch_time_sec', item.watch_time_sec)
        rec.set('duration_sec', item.duration_sec)
        rec.set('viral_score', item.viral_score)
        rec.set('status', item.status)
        rec.set('hook_text', item.hook_text)
        rec.set('caption', item.caption)
        rec.set('tags', item.tags)
        rec.set('posting_date', '2026-07-20 12:00:00')
        app.save(rec)
      }
    }

    const scriptsCol = app.findCollectionByNameOrId('scripts')
    const sampleScript = {
      title: 'Roteiro: A Fórmula do Gancho Irresistível nos 3 Segundos',
      topic: 'Engajamento e Criação de Conteúdo',
      platform: 'instagram',
      format: 'video',
      hook_headline: 'Se você faz isso na intro do seu vídeo, as pessoas vão arrastar para cima!',
      body_outline:
        '1. Mostre um problema comum (ex: queda repentina nas visualizações).\n2. Revele a solução em 3 passos rápidos (Gancho visual, Pacing dinâmico, Quebra de padrão).\n3. Dê uma dica extra bônus no meio do vídeo para manter o tempo de exibição alto.',
      cta: "Comente 'ROTEIRO' que te envio o modelo completo no seu direct!",
      visual_notes:
        'Corte rápido a cada 2.5 segundos, legendas grandes dinâmicas em amarelo e azul, zoom in nos momentos chave.',
      estimated_duration: 30,
      viral_potential_score: 94,
      status: 'approved',
    }

    try {
      app.findFirstRecordByData('scripts', 'title', sampleScript.title)
    } catch (_) {
      const sRec = new Record(scriptsCol)
      sRec.set('user_id', userId)
      sRec.set('title', sampleScript.title)
      sRec.set('topic', sampleScript.topic)
      sRec.set('platform', sampleScript.platform)
      sRec.set('format', sampleScript.format)
      sRec.set('hook_headline', sampleScript.hook_headline)
      sRec.set('body_outline', sampleScript.body_outline)
      sRec.set('cta', sampleScript.cta)
      sRec.set('visual_notes', sampleScript.visual_notes)
      sRec.set('estimated_duration', sampleScript.estimated_duration)
      sRec.set('viral_potential_score', sampleScript.viral_potential_score)
      sRec.set('status', sampleScript.status)
      app.save(sRec)
    }
  },
  (app) => {},
)
