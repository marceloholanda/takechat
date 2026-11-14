export type LandingLocale = "en" | "pt-BR";

type LandingCard = {
  title: string;
  description: string;
};

export type LandingCopy = {
  metadataTitle: string;
  metadataDescription: string;
  skipContent: string;
  nav: {
    homeAria: string;
    mainAria: string;
    how: string;
    setup: string;
    contact: string;
    githubAria: string;
    signIn: string;
    getStarted: string;
  };
  hero: {
    title: [string, string];
    description: string;
    setup: string;
    how: string;
    note: string;
  };
  preview: {
    ariaLabel: string;
    heading: string;
    accountName: string;
    accountHandle: string;
    active: string;
    campaign: string;
    postPrompt: [string, string];
    keywordLabel: string;
    keyword: string;
    commenter: string;
    comment: string;
    matched: string;
    privateReply: string;
    sender: string;
    message: string;
    link: string;
    delivered: string;
    caption: string;
  };
  principles: string[];
  how: {
    title: string;
    description: string;
    steps: LandingCard[];
  };
  features: {
    title: string;
    cards: LandingCard[];
  };
  technical: {
    title: [string, string];
    description: string;
    sourceLink: string;
    runtime: Array<{
      label: string;
      title: string;
      description: string;
    }>;
  };
  setup: {
    title: string;
    description: string;
    connectTitle: string;
    apiLabel: string;
    accountDescription: string;
    detailsLink: string;
    note: string;
  };
  faq: {
    title: string;
    items: LandingCard[];
  };
  closing: {
    title: string;
    description: string;
    setup: string;
    star: string;
  };
  footer: {
    description: string;
    navAria: string;
    setup: string;
    privacy: string;
    terms: string;
    dataDeletion: string;
  };
};

export const landingCopy = {
  en: {
    metadataTitle: "TakeChat — Instagram comment replies",
    metadataDescription:
      "Configure automatic replies to Instagram post comments with Meta’s official API.",
    skipContent: "Skip to content",
    nav: {
      homeAria: "TakeChat home",
      mainAria: "Main navigation",
      how: "How it works",
      setup: "Self-host it",
      contact: "Contact",
      githubAria: "View TakeChat on GitHub",
      signIn: "Sign in",
      getStarted: "Get started",
    },
    hero: {
      title: ["Turn Instagram comments", "into private replies."],
      description:
        "When someone comments a keyword on your post or reel, TakeChat automatically sends them a DM. Free, open source, and self-hosted.",
      setup: "Set up TakeChat",
      how: "See how it works",
      note: "Free software. Self-hosted. Your infrastructure.",
    },
    preview: {
      ariaLabel:
        "Example campaign: a GUIDE comment triggers a private reply with a guide link",
      heading: "Campaign preview",
      accountName: "Sunday studio",
      accountHandle: "@sunday.studio · Instagram",
      active: "Active",
      campaign: "Campaign: New drop",
      postPrompt: ["Comment GUIDE below", "and I’ll send you the link."],
      keywordLabel: "Keyword:",
      keyword: "GUIDE",
      commenter: "maya.creates",
      comment: "GUIDE! need this 😍",
      matched: "matched",
      privateReply: "Private reply",
      sender: "Sunday studio → Maya",
      message: "Hey Maya! Here’s the link 👇",
      link: "Shop the new drop",
      delivered: "Sent through the official Instagram API",
      caption: "Example content. Your keywords, your message, your links.",
    },
    principles: [
      "MIT licensed",
      "Official Instagram API",
      "No password sharing",
      "Your campaigns, in your database",
    ],
    how: {
      title: "How it works",
      description:
        "Send a product link, share a resource, or deliver your latest guide. You decide what starts the conversation and what happens next.",
      steps: [
        {
          title: "Connect your account",
          description:
            "Sign in through the TakeChat Meta app and connect an Instagram Business or Creator account.",
        },
        {
          title: "Set up a campaign",
          description:
            "Choose a post or reel, add keywords, and write the private reply. Add a public reply or tracked link buttons if you need them.",
        },
        {
          title: "TakeChat handles the rest",
          description:
            "Incoming events trigger your campaigns. A Cloudflare Worker queues, rate-limits, and logs each send, with retries and comment reconciliation.",
        },
      ],
    },
    features: {
      title: "Features",
      cards: [
        {
          title: "Custom reply messages",
          description:
            "Write your own messages, personalize them with a username, and use up to two tracked link buttons.",
        },
        {
          title: "Multiple triggers",
          description:
            "Start campaigns from post comments, incoming DMs, and text replies to Stories.",
        },
        {
          title: "Inbox",
          description:
            "Read conversations and reply from TakeChat within Instagram’s messaging window.",
        },
        {
          title: "Delivery logs",
          description:
            "See sent, skipped, and failed messages with reasons. Track link clicks back to a campaign.",
        },
      ],
    },
    technical: {
      title: ["Open code.", "A system you can inspect."],
      description:
        "TakeChat manages campaigns, keyword matching, Cloudflare Queues, retries, logs, and the inbox. Instagram connections and replies use Meta’s official API.",
      sourceLink: "Explore the source",
      runtime: [
        {
          label: "Web app",
          title: "Next.js + React",
          description: "Dashboard and incoming events",
        },
        {
          label: "Background worker",
          title: "Cloudflare Workers + Queues",
          description: "Queued delivery and reconciliation",
        },
        {
          label: "Your data",
          title: "Supabase Postgres + Cloudflare Queues",
          description: "Campaigns, accounts, logs, and queue",
        },
      ],
    },
    setup: {
      title: "TakeChat runs on Cloudflare and Supabase.",
      description:
        "Connect your Instagram professional account through the separate TakeChat Meta app. Cloudflare Workers runs the app and queue; Supabase stores campaigns, accounts, and logs.",
      connectTitle: "Connect through Meta",
      apiLabel: "Official Instagram API",
      accountDescription:
        "Sign in with an Instagram account added as a tester to the TakeChat app, then choose the professional profile whose comments TakeChat should handle.",
      detailsLink: "Deployment and setup details",
      note: "Instagram account requirements, permissions, messaging windows, and rate limits apply.",
    },
    faq: {
      title: "FAQ",
      items: [
        {
          title: "What does TakeChat do?",
          description:
            "TakeChat matches comments on selected Instagram posts to campaign keywords and sends the configured private reply. You can also enable a public comment reply.",
        },
        {
          title: "Which Instagram accounts can I connect?",
          description:
            "Instagram Business and Creator accounts. Personal accounts are not supported. Connections use Meta’s official API.",
        },
        {
          title: "Can I use it before Meta App Review?",
          description:
            "The app is in development mode for internal use. Only accounts added as testers can connect until Meta grants the access required for a public launch.",
        },
        {
          title: "What does hosting cost?",
          description:
            "TakeChat uses Cloudflare Workers, Cloudflare Queues, and a Supabase Postgres schema. Actual charges depend on your account plans and usage.",
        },
      ],
    },
    closing: {
      title: "Set up your first campaign",
      description: "Clone it, connect Instagram, and write your first reply.",
      setup: "Set up TakeChat",
      star: "Star on GitHub",
    },
    footer: {
      description: "Automatic replies to Instagram post comments.",
      navAria: "Footer navigation",
      setup: "Setup guide",
      privacy: "Privacy",
      terms: "Terms",
      dataDeletion: "Data deletion",
    },
  },
  "pt-BR": {
    metadataTitle: "TakeChat — respostas a comentários no Instagram",
    metadataDescription:
      "Configure respostas automáticas aos comentários nas publicações do Instagram usando a API oficial da Meta.",
    skipContent: "Pular para o conteúdo",
    nav: {
      homeAria: "Página inicial do TakeChat",
      mainAria: "Navegação principal",
      how: "Como funciona",
      setup: "Hospede por conta própria",
      contact: "Contato",
      githubAria: "Ver TakeChat no GitHub",
      signIn: "Entrar",
      getStarted: "Começar",
    },
    hero: {
      title: ["Transforme comentários", "do Instagram em DMs."],
      description:
        "Quando alguém comenta uma palavra-chave na sua publicação ou reel, o TakeChat envia uma DM automaticamente. Gratuito, de código aberto e auto-hospedado.",
      setup: "Configurar o TakeChat",
      how: "Veja como funciona",
      note: "Software gratuito. Auto-hospedado. Na sua infraestrutura.",
    },
    preview: {
      ariaLabel:
        "Exemplo de campanha: um comentário com GUIA aciona uma resposta privada com um link",
      heading: "Prévia da campanha",
      accountName: "Estúdio Sunday",
      accountHandle: "@sunday.studio · Instagram",
      active: "Ativa",
      campaign: "Campanha: Nova coleção",
      postPrompt: ["Comente GUIA abaixo", "e eu envio o link."],
      keywordLabel: "Palavra-chave:",
      keyword: "GUIA",
      commenter: "maya.cria",
      comment: "GUIA! quero ver 😍",
      matched: "identificada",
      privateReply: "Resposta privada",
      sender: "Estúdio Sunday → Maya",
      message: "Oi, Maya! Aqui está o link 👇",
      link: "Ver a nova coleção",
      delivered: "Enviado pela API oficial do Instagram",
      caption: "Exemplo. Suas palavras-chave, mensagens e links.",
    },
    principles: [
      "Licença MIT",
      "API oficial do Instagram",
      "Sem compartilhar senhas",
      "Suas campanhas no seu banco de dados",
    ],
    how: {
      title: "Como funciona",
      description:
        "Envie um link de produto, compartilhe um recurso ou entregue seu guia mais recente. Você escolhe o que inicia a conversa e o que acontece depois.",
      steps: [
        {
          title: "Conecte sua conta",
          description:
            "Entre pelo app da Meta do TakeChat e conecte uma conta profissional do Instagram, Business ou Creator.",
        },
        {
          title: "Configure uma campanha",
          description:
            "Escolha uma publicação ou reel, adicione palavras-chave e escreva a resposta privada. Se quiser, inclua uma resposta pública ou botões com links rastreáveis.",
        },
        {
          title: "O TakeChat cuida do restante",
          description:
            "Os eventos recebidos acionam suas campanhas. Um Worker da Cloudflare enfileira, limita a taxa e registra cada envio, com novas tentativas e reconciliação de comentários.",
        },
      ],
    },
    features: {
      title: "Recursos",
      cards: [
        {
          title: "Mensagens personalizadas",
          description:
            "Escreva suas mensagens, personalize-as com o nome de usuário e use até dois botões com links rastreáveis.",
        },
        {
          title: "Vários gatilhos",
          description:
            "Inicie campanhas por comentários em publicações, DMs recebidas e respostas de texto aos Stories.",
        },
        {
          title: "Caixa de entrada",
          description:
            "Leia conversas e responda pelo TakeChat dentro da janela de mensagens do Instagram.",
        },
        {
          title: "Registros de envio",
          description:
            "Veja mensagens enviadas, ignoradas ou com falha e os respectivos motivos. Acompanhe os cliques nos links até a campanha.",
        },
      ],
    },
    technical: {
      title: ["Código aberto.", "Um sistema que você pode inspecionar."],
      description:
        "O TakeChat gerencia campanhas, correspondência de palavras-chave, Cloudflare Queues, novas tentativas, registros e caixa de entrada. As conexões e respostas do Instagram usam a API oficial da Meta.",
      sourceLink: "Explore o código",
      runtime: [
        {
          label: "Aplicação web",
          title: "Next.js + React",
          description: "Painel e eventos recebidos",
        },
        {
          label: "Worker em segundo plano",
          title: "Cloudflare Workers + Queues",
          description: "Envios em fila e reconciliação",
        },
        {
          label: "Seus dados",
          title: "Supabase Postgres + Cloudflare Queues",
          description: "Campanhas, contas, registros e fila",
        },
      ],
    },
    setup: {
      title: "O TakeChat funciona na Cloudflare e no Supabase.",
      description:
        "Conecte sua conta profissional do Instagram pelo app da Meta do TakeChat. A Cloudflare Workers executa o app e a fila; o Supabase armazena campanhas, contas e registros.",
      connectTitle: "Conecte pela Meta",
      apiLabel: "API oficial do Instagram",
      accountDescription:
        "Entre com uma conta do Instagram adicionada como testadora no app do TakeChat e escolha o perfil profissional cujos comentários o TakeChat deve gerenciar.",
      detailsLink: "Detalhes de implantação e configuração",
      note: "Aplicam-se os requisitos de conta do Instagram, permissões, janelas de mensagens e limites de taxa.",
    },
    faq: {
      title: "Perguntas frequentes",
      items: [
        {
          title: "O que o TakeChat faz?",
          description:
            "O TakeChat compara comentários em publicações selecionadas do Instagram com as palavras-chave das campanhas e envia a resposta privada configurada. Também é possível ativar uma resposta pública ao comentário.",
        },
        {
          title: "Quais contas do Instagram posso conectar?",
          description:
            "Contas Instagram Business e Creator. Contas pessoais não são aceitas. As conexões usam a API oficial da Meta.",
        },
        {
          title: "Posso usar antes da análise do app pela Meta?",
          description:
            "O app está em modo de desenvolvimento para uso interno. Apenas contas adicionadas como testadoras podem conectar até a Meta conceder o acesso necessário para um lançamento público.",
        },
        {
          title: "Quanto custa a hospedagem?",
          description:
            "O TakeChat usa Cloudflare Workers, Cloudflare Queues e um schema Postgres no Supabase. Os custos reais dependem do plano da conta e do uso.",
        },
      ],
    },
    closing: {
      title: "Configure sua primeira campanha",
      description: "Clone o projeto, conecte o Instagram e escreva sua primeira resposta.",
      setup: "Configurar o TakeChat",
      star: "Favoritar no GitHub",
    },
    footer: {
      description: "Respostas automáticas a comentários nas publicações do Instagram.",
      navAria: "Navegação do rodapé",
      setup: "Guia de configuração",
      privacy: "Privacidade",
      terms: "Termos",
      dataDeletion: "Exclusão de dados",
    },
  },
} satisfies Record<LandingLocale, LandingCopy>;
