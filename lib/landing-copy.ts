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
    contact: string;
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
      "Turn Instagram comments into conversations with keyword-triggered DMs, personalized replies, and trackable links.",
    skipContent: "Skip to content",
    nav: {
      homeAria: "TakeChat home",
      mainAria: "Main navigation",
      how: "How it works",
      setup: "Features",
      contact: "Contact",
      signIn: "Sign in",
      getStarted: "Get started",
    },
    hero: {
      title: ["Turn Instagram comments", "into conversations."],
      description:
        "Create keyword-based campaigns for your posts and reels. TakeChat automatically sends a personalized DM with the link, guide, or offer your audience asked for.",
      setup: "Start using TakeChat",
      how: "See how it works",
      note: "Automate replies, share links, and follow every campaign.",
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
      delivered: "Reply sent automatically",
      caption: "Example content. Your keywords, your message, your links.",
    },
    principles: [
      "Automatic private replies",
      "Personalized campaigns",
      "Trackable links",
      "No password sharing",
    ],
    how: {
      title: "How it works",
      description:
        "Share a product link, deliver a guide, or answer a common question. Choose what triggers each campaign and customize the reply your audience receives.",
      steps: [
        {
          title: "Connect your account",
          description:
            "Connect an Instagram Business or Creator account to get started.",
        },
        {
          title: "Set up a campaign",
          description:
            "Choose a post or reel, add keywords, and write the private reply. Add a public reply or tracked link buttons if you need them.",
        },
        {
          title: "TakeChat handles the rest",
          description:
            "When someone comments with a campaign keyword, TakeChat sends your reply automatically. Follow message delivery and link clicks from the campaign.",
        },
      ],
    },
    features: {
      title: "Automate replies and keep every campaign on track.",
      cards: [
        {
          title: "Personalized DMs and links",
          description:
            "Write your own messages, personalize them with a username, and use up to two tracked link buttons.",
        },
        {
          title: "Comments, DMs, and Stories",
          description:
            "Start campaigns from post comments, incoming DMs, and text replies to Stories.",
        },
        {
          title: "Inbox in one place",
          description:
            "Read conversations and reply from TakeChat within Instagram’s messaging window.",
        },
        {
          title: "Campaign tracking",
          description:
            "See sent, skipped, and failed messages with reasons. Track link clicks back to a campaign.",
        },
      ],
    },
    setup: {
      title: "The right reply starts with a keyword.",
      description:
        "Choose a post or reel, define the keyword, and prepare the DM. When someone comments, TakeChat sends it automatically.",
      connectTitle: "From campaign setup to follow-up",
      apiLabel: "Comment → private reply",
      accountDescription:
        "Personalize the message, add up to two tracked link buttons, and optionally publish a public reply. Then follow message delivery and link clicks by campaign.",
      detailsLink: "Start using TakeChat",
      note: "You choose which posts, keywords, and replies belong to each campaign.",
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
            "Instagram Business and Creator accounts. Personal accounts are not supported.",
        },
        {
          title: "Can I customize the reply?",
          description:
            "Yes. Write a private message, personalize it with the commenter’s username, add up to two tracked link buttons, and optionally enable a public comment reply.",
        },
        {
          title: "How can I follow campaign results?",
          description:
            "See which messages were sent, skipped, or failed and why. TakeChat also attributes tracked link clicks to the campaign.",
        },
      ],
    },
    closing: {
      title: "Spend less time repeating replies.",
      description:
        "Create a campaign, choose its keywords, and let TakeChat send the right reply automatically.",
      setup: "Start using TakeChat",
      contact: "Talk to our team",
    },
    footer: {
      description: "Automatic replies to Instagram post comments.",
      navAria: "Footer navigation",
      setup: "Access TakeChat",
      privacy: "Privacy",
      terms: "Terms",
      dataDeletion: "Data deletion",
    },
  },
  "pt-BR": {
    metadataTitle: "TakeChat — respostas a comentários no Instagram",
    metadataDescription:
      "Transforme comentários do Instagram em conversas com DMs por palavra-chave, mensagens personalizadas e links rastreáveis.",
    skipContent: "Pular para o conteúdo",
    nav: {
      homeAria: "Página inicial do TakeChat",
      mainAria: "Navegação principal",
      how: "Como funciona",
      setup: "Recursos",
      contact: "Contato",
      signIn: "Entrar",
      getStarted: "Começar",
    },
    hero: {
      title: ["Transforme comentários", "em conversas no Instagram."],
      description:
        "Crie campanhas por palavra-chave para suas publicações e reels. O TakeChat envia automaticamente uma DM personalizada com o link, material ou oferta que seu público pediu.",
      setup: "Começar a usar o TakeChat",
      how: "Veja como funciona",
      note: "Automatize respostas, compartilhe links e acompanhe cada campanha.",
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
      delivered: "Resposta enviada automaticamente",
      caption: "Exemplo. Suas palavras-chave, mensagens e links.",
    },
    principles: [
      "Respostas privadas automáticas",
      "Campanhas personalizadas",
      "Links rastreáveis",
      "Sem compartilhar senhas",
    ],
    how: {
      title: "Como funciona",
      description:
        "Compartilhe um link de produto, entregue um guia ou responda a uma dúvida comum. Escolha o que aciona cada campanha e personalize a mensagem que seu público recebe.",
      steps: [
        {
          title: "Conecte sua conta",
          description:
            "Conecte uma conta Business ou Creator do Instagram para começar.",
        },
        {
          title: "Configure uma campanha",
          description:
            "Escolha uma publicação ou reel, adicione palavras-chave e escreva a resposta privada. Se quiser, inclua uma resposta pública ou botões com links rastreáveis.",
        },
        {
          title: "O TakeChat cuida do restante",
          description:
            "Quando alguém comenta uma palavra-chave da campanha, o TakeChat envia sua resposta automaticamente. Acompanhe os envios e cliques nos links pela campanha.",
        },
      ],
    },
    features: {
      title: "Automatize respostas e acompanhe cada campanha.",
      cards: [
        {
          title: "DMs e links personalizados",
          description:
            "Escreva suas mensagens, personalize-as com o nome de usuário e use até dois botões com links rastreáveis.",
        },
        {
          title: "Comentários, DMs e Stories",
          description:
            "Inicie campanhas por comentários em publicações, DMs recebidas e respostas de texto aos Stories.",
        },
        {
          title: "Caixa de entrada em um só lugar",
          description:
            "Leia conversas e responda pelo TakeChat dentro da janela de mensagens do Instagram.",
        },
        {
          title: "Acompanhamento das campanhas",
          description:
            "Veja mensagens enviadas, ignoradas ou com falha e os respectivos motivos. Acompanhe os cliques nos links até a campanha.",
        },
      ],
    },
    setup: {
      title: "A resposta certa começa com uma palavra-chave.",
      description:
        "Escolha uma publicação ou reel, defina a palavra-chave e prepare a DM. Quando alguém comentar, o TakeChat envia automaticamente.",
      connectTitle: "Da campanha ao acompanhamento",
      apiLabel: "Comentário → resposta privada",
      accountDescription:
        "Personalize a mensagem, inclua até dois botões com links rastreáveis e, se quiser, publique também uma resposta ao comentário. Depois, acompanhe envios e cliques por campanha.",
      detailsLink: "Começar a usar o TakeChat",
      note: "Você escolhe quais publicações, palavras-chave e respostas fazem parte de cada campanha.",
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
            "Contas Instagram Business e Creator. Contas pessoais não são aceitas.",
        },
        {
          title: "Posso personalizar a resposta?",
          description:
            "Sim. Escreva a mensagem privada, personalize com o nome de usuário, adicione até dois botões com links rastreáveis e, se quiser, ative uma resposta pública ao comentário.",
        },
        {
          title: "Como acompanho os resultados da campanha?",
          description:
            "Veja quais mensagens foram enviadas, ignoradas ou falharam e os motivos. Os cliques nos links rastreáveis também ficam associados à campanha.",
        },
      ],
    },
    closing: {
      title: "Passe menos tempo repetindo respostas.",
      description:
        "Crie uma campanha, escolha as palavras-chave e deixe o TakeChat enviar a resposta certa automaticamente.",
      setup: "Começar a usar o TakeChat",
      contact: "Fale com a nossa equipe",
    },
    footer: {
      description: "Respostas automáticas a comentários nas publicações do Instagram.",
      navAria: "Navegação do rodapé",
      setup: "Acessar o TakeChat",
      privacy: "Privacidade",
      terms: "Termos",
      dataDeletion: "Exclusão de dados",
    },
  },
} satisfies Record<LandingLocale, LandingCopy>;
