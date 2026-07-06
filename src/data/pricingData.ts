type PricingOption = {
  id: string;
  label: string;
  setupMin: number;
  setupMax: number;
  setupText?: string;
  recurringMin: number;
  recurringMax: number;
  recurringText?: string;
  timeMin?: number;
  timeMax?: number;
  isDefault?: boolean;
};

type PricingVariable = {
  id: string;
  name: string;
  options: PricingOption[];
};

export type PricingCategory = {
  id: string;
  title: string;
  description: string;
  variables: PricingVariable[];
};

export const pricingData: PricingCategory[] = [
  {
    id: "landing-pages",
    title: "Landing Pages",
    description: "Escolha o formato ideal para sua presença digital. Foque em captar leads com alto nível de exclusividade de design.",
    variables: [
      {
        id: "design",
        name: "Design e UI/UX",
        options: [
          { id: "template", label: "Template Customizado (Rápido)", setupMin: 800, setupMax: 1200, setupText: "Base", recurringMin: 0, recurringMax: 0, timeMin: 2, timeMax: 4, isDefault: true },
          { id: "exclusivo", label: "Design Exclusivo (Figma do zero)", setupMin: 2000, setupMax: 3200, recurringMin: 0, recurringMax: 0, timeMin: 5, timeMax: 8 }
        ]
      },
      {
        id: "gestao",
        name: "Gestão de Conteúdo",
        options: [
          { id: "estatica", label: "Sem painel (Página Estática)", setupMin: -200, setupMax: -200, setupText: "Desconto de R$ 200", recurringMin: 0, recurringMax: 0, timeMin: 0, timeMax: 0, isDefault: true },
          { id: "cms", label: "Painel CMS (WordPress/Headless)", setupMin: 500, setupMax: 500, recurringMin: 0, recurringMax: 0, timeMin: 1, timeMax: 3 }
        ]
      },
      {
        id: "hospedagem",
        name: "Hospedagem e Domínio",
        options: [
          { id: "basica", label: "Infraestrutura Básica (Vercel/Netlify)", setupMin: 0, setupMax: 0, recurringMin: 50, recurringMax: 80, timeMin: 0, timeMax: 1, isDefault: true }
        ]
      }
    ]
  },
  {
    id: "e-commerce",
    title: "E-commerce",
    description: "Lojas virtuais completas para escalar suas vendas online. Defina o nível de exclusividade do design e as integrações.",
    variables: [
      {
        id: "design",
        name: "Design e UI/UX",
        options: [
          { id: "template", label: "Template Customizado (Rápido)", setupMin: 1500, setupMax: 2500, setupText: "Base", recurringMin: 0, recurringMax: 0, timeMin: 5, timeMax: 7, isDefault: true },
          { id: "exclusivo", label: "Design Exclusivo (Figma do zero)", setupMin: 2700, setupMax: 4500, recurringMin: 0, recurringMax: 0, timeMin: 10, timeMax: 15 }
        ]
      },
      {
        id: "pagamento",
        name: "Integração de Pagamento",
        options: [
          { id: "padrao", label: "Checkout Padrão (Stripe, Mercado Pago)", setupMin: 0, setupMax: 0, setupText: "Incluso", recurringMin: 0, recurringMax: 0, recurringText: "Taxas do gateway", timeMin: 1, timeMax: 2, isDefault: true },
          { id: "assinatura", label: "Assinaturas/Pagamento Recorrente", setupMin: 400, setupMax: 400, recurringMin: 0, recurringMax: 0, timeMin: 2, timeMax: 3 }
        ]
      },
      {
        id: "hospedagem",
        name: "Hospedagem e Domínio",
        options: [
          { id: "basica", label: "Infraestrutura Básica", setupMin: 0, setupMax: 0, recurringMin: 50, recurringMax: 80, timeMin: 0, timeMax: 1, isDefault: true },
          { id: "dedicado", label: "Servidor Dedicado/VPS", setupMin: 200, setupMax: 200, recurringMin: 150, recurringMax: 300, timeMin: 1, timeMax: 2 }
        ]
      }
    ]
  },
  {
    id: "aplicativos",
    title: "Aplicativos",
    description: "Aplicativos PWA ou MVP Híbrido com interfaces modernas. Defina as integrações necessárias.",
    variables: [
      {
        id: "design",
        name: "Design e UI/UX",
        options: [
          { id: "padrao", label: "Design Padrão (Até 5 Telas Base)", setupMin: 4000, setupMax: 7500, setupText: "Base", recurringMin: 0, recurringMax: 0, timeMin: 7, timeMax: 10, isDefault: true },
          { id: "exclusivo", label: "Design Exclusivo (Figma do zero)", setupMin: 5200, setupMax: 9500, recurringMin: 0, recurringMax: 0, timeMin: 10, timeMax: 15 }
        ]
      },
      {
        id: "backend",
        name: "Backend e Banco de Dados",
        options: [
          { id: "basica", label: "Backend Serverless Integrado", setupMin: 0, setupMax: 0, setupText: "Incluso", recurringMin: 100, recurringMax: 200, timeMin: 2, timeMax: 3, isDefault: true },
          { id: "dedicado", label: "Backend Dedicado/Customizado", setupMin: 1500, setupMax: 2500, recurringMin: 300, recurringMax: 600, timeMin: 5, timeMax: 10 }
        ]
      }
    ]
  },
  {
    id: "automacoes",
    title: "Automações para WhatsApp e Voice Tuning",
    description: "Transforme seu atendimento com automação. Selecione a forma de conexão com o WhatsApp, o nível de inteligência do bot (de menus simples a conversas naturais via IA) e se deseja recursos avançados, como áudio humanizado e integração com seu CRM.",
    variables: [
      {
        id: "infra-api",
        name: "Infraestrutura de API",
        options: [
          { id: "evolution", label: "Conexão via QR Code (Evolution API/Baixo custo)", setupMin: 400, setupMax: 400, recurringMin: 80, recurringMax: 80, recurringText: "VPS Cloud: ~R$ 80 / mês", timeMin: 1, timeMax: 2, isDefault: true },
          { id: "cloud", label: "WhatsApp Cloud API Oficial (Meta)", setupMin: 600, setupMax: 600, recurringMin: 0, recurringMax: 0, recurringText: "Pagamento por conversa à Meta", timeMin: 2, timeMax: 3 }
        ]
      },
      {
        id: "inteligencia",
        name: "Inteligência do Bot",
        options: [
          { id: "arvore", label: "Árvore de Decisão Simples (Menu 1, 2, 3)", setupMin: 500, setupMax: 800, recurringMin: 0, recurringMax: 0, timeMin: 2, timeMax: 3, isDefault: true },
          { id: "ia", label: "Agente IA Natural (LLM com contexto do negócio)", setupMin: 1200, setupMax: 2000, recurringMin: 0, recurringMax: 0, recurringText: "API OpenAI/Anthropic (Variável)", timeMin: 3, timeMax: 5 }
        ]
      },
      {
        id: "voice",
        name: "Voice Tuning / Áudio",
        options: [
          { id: "sem", label: "Sem Áudio", setupMin: 0, setupMax: 0, recurringMin: 0, recurringMax: 0, timeMin: 0, timeMax: 0, isDefault: true },
          { id: "tts", label: "TTS Padrão (Texto para Voz básico)", setupMin: 300, setupMax: 300, recurringMin: 0, recurringMax: 0, recurringText: "Custos API Google/AWS", timeMin: 1, timeMax: 2 },
          { id: "clonagem", label: "Clonagem e Voz Humanizada (ElevenLabs)", setupMin: 800, setupMax: 800, recurringMin: 110, recurringMax: 110, recurringText: "~R$ 110/mês (Assinatura ElevenLabs)", timeMin: 2, timeMax: 3 }
        ]
      },
      {
        id: "crm",
        name: "Integração CRM",
        options: [
          { id: "sheets", label: "Planilhas Google (Google Sheets)", setupMin: 150, setupMax: 150, recurringMin: 0, recurringMax: 0, recurringText: "Gratuito", timeMin: 1, timeMax: 1, isDefault: true },
          { id: "mercado", label: "CRMs de Mercado (HubSpot, RD Station)", setupMin: 600, setupMax: 1200, recurringMin: 0, recurringMax: 0, recurringText: "Assinatura da plataforma", timeMin: 2, timeMax: 4 }
        ]
      }
    ]
  },
  {
    id: "sistemas-web",
    title: "Sistemas Web, Backend e Extração de Dados",
    description: "Soluções sob medida para lidar com dados e processos complexos. Indique se precisa de captura de dados (scraping) pontual ou recorrente, a robustez necessária para o banco de dados e como deseja visualizar essas informações.",
    variables: [
      {
        id: "escopo",
        name: "Escopo de Scraper/Extração",
        options: [
          { id: "unica", label: "Raspagem Única (Script sob demanda)", setupMin: 400, setupMax: 700, recurringMin: 200, recurringMax: 200, recurringText: "R$ 200 / mês (Manutenção)", timeMin: 1, timeMax: 3, isDefault: true },
          { id: "recorrente", label: "Sistema de Extração Recorrente (Diário/Semanal)", setupMin: 800, setupMax: 1500, recurringMin: 250, recurringMax: 250, recurringText: "VPS + Manutenção: ~R$ 250 / mês", timeMin: 3, timeMax: 5 }
        ]
      },
      {
        id: "complexidade",
        name: "Complexidade do Alvo",
        options: [
          { id: "simples", label: "Site de Acesso Público Simples", setupMin: 0, setupMax: 0, setupText: "Incluso no Setup", recurringMin: 0, recurringMax: 0, timeMin: 0, timeMax: 0, isDefault: true },
          { id: "antibot", label: "Site com Proteção Anti-Bot / Captchas", setupMin: 500, setupMax: 1000, recurringMin: 100, recurringMax: 100, recurringText: "Proxies/Anti-captcha: ~R$ 100/mês", timeMin: 2, timeMax: 4 }
        ]
      },
      {
        id: "backend",
        name: "Backend & Banco de Dados",
        options: [
          { id: "sqlite", label: "API Simples com SQLite / JSON", setupMin: 1000, setupMax: 1500, recurringMin: 0, recurringMax: 0, timeMin: 2, timeMax: 4, isDefault: true },
          { id: "postgres", label: "Backend Completo com PostgreSQL / MongoDB", setupMin: 3000, setupMax: 5000, recurringMin: 80, recurringMax: 200, recurringText: "DB Cloud: R$ 80 - R$ 200 / mês", timeMin: 5, timeMax: 10 }
        ]
      },
      {
        id: "painel",
        name: "Painel de Visualização",
        options: [
          { id: "csv", label: "Exportação direta para CSV/Excel", setupMin: 0, setupMax: 0, recurringMin: 0, recurringMax: 0, timeMin: 0, timeMax: 0, isDefault: true },
          { id: "dashboard", label: "Dashboard Web Customizado (Gráficos/Tabelas)", setupMin: 1200, setupMax: 2500, recurringMin: 0, recurringMax: 0, timeMin: 3, timeMax: 6 }
        ]
      }
    ]
  },
  {
    id: "agentes-corporativos",
    title: "Agentes Corporativos Internos",
    description: "Potencialize sua equipe com um assistente inteligente. Defina o volume e a fonte dos documentos que a IA deve aprender (Base de Conhecimento), a privacidade do modelo e onde sua equipe irá interagir com ele (Slack, Teams ou plataforma própria).",
    variables: [
      {
        id: "rag",
        name: "Base de Conhecimento (RAG)",
        options: [
          { id: "estatico", label: "Arquivos Estáticos (Até 50 PDFs/Docs)", setupMin: 1500, setupMax: 2000, recurringMin: 0, recurringMax: 100, recurringText: "Banco Vetorial (Pinecone): Grátis/R$100", timeMin: 2, timeMax: 4, isDefault: true },
          { id: "dinamico", label: "Sincronização Dinâmica (Google Drive/Notion)", setupMin: 1800, setupMax: 2500, recurringMin: 0, recurringMax: 0, timeMin: 4, timeMax: 7 }
        ]
      },
      {
        id: "llm",
        name: "Modelo de Linguagem (LLM)",
        options: [
          { id: "proprietaria", label: "APIs Proprietárias (GPT-4o, Claude 3.5)", setupMin: 0, setupMax: 0, setupText: "Incluso no Setup", recurringMin: 0, recurringMax: 0, recurringText: "Custo de uso da API (Variável)", timeMin: 0, timeMax: 0, isDefault: true },
          { id: "opensource", label: "Open-Source Local (Llama 3 - Maior Privacidade)", setupMin: 2500, setupMax: 2500, recurringMin: 400, recurringMax: 400, recurringText: "Servidor GPU: R$ 400+ / mês", timeMin: 3, timeMax: 5 }
        ]
      },
      {
        id: "interface",
        name: "Interface do Agente",
        options: [
          { id: "slack", label: "Integrado ao Slack / Microsoft Teams / Discord", setupMin: 600, setupMax: 1000, recurringMin: 0, recurringMax: 0, timeMin: 1, timeMax: 3, isDefault: true },
          { id: "web", label: "Plataforma Web Interna Exclusiva (Autenticada)", setupMin: 1500, setupMax: 3000, recurringMin: 80, recurringMax: 80, recurringText: "Hospedagem Web: ~R$ 80 / mês", timeMin: 4, timeMax: 7 }
        ]
      },
      {
        id: "acessos",
        name: "Controle de Acessos",
        options: [
          { id: "unico", label: "Acesso Único (Todos veem tudo)", setupMin: 0, setupMax: 0, recurringMin: 0, recurringMax: 0, timeMin: 0, timeMax: 0, isDefault: true },
          { id: "permissoes", label: "Permissões por Cargo/Setor", setupMin: 800, setupMax: 800, recurringMin: 0, recurringMax: 0, timeMin: 2, timeMax: 3 }
        ]
      }
    ]
  },
  {
    id: "workflows",
    title: "Workflows de Back-Office Autônomos",
    description: "Elimine tarefas manuais e repetitivas. Escolha o motor de automação ideal para o seu negócio, a complexidade dos fluxos operacionais e se a IA deve tomar decisões autônomas ao longo do processo.",
    variables: [
      {
        id: "motor",
        name: "Motor de Orquestração",
        options: [
          { id: "nocode", label: "Ferramentas No-Code/Low-Code (Make, Zapier)", setupMin: 600, setupMax: 1200, recurringMin: 150, recurringMax: 150, recurringText: "Assinatura da Ferramenta: ~R$ 150/mês", timeMin: 1, timeMax: 3, isDefault: true },
          { id: "n8n", label: "n8n Self-Hosted (Sem limite de execuções)", setupMin: 1500, setupMax: 2000, recurringMin: 100, recurringMax: 100, recurringText: "VPS Servidor: ~R$ 100 / mês", timeMin: 2, timeMax: 4 },
          { id: "serverless", label: "Código Customizado e Arquitetura Serverless", setupMin: 3000, setupMax: 5000, recurringMin: 0, recurringMax: 0, recurringText: "AWS/GCP: Variável", timeMin: 5, timeMax: 10 }
        ]
      },
      {
        id: "complexidade",
        name: "Complexidade do Fluxo",
        options: [
          { id: "simples", label: "Simples (A → B, ex: Email para Planilha)", setupMin: 400, setupMax: 400, setupText: "R$ 400 / fluxo", recurringMin: 0, recurringMax: 0, timeMin: 1, timeMax: 2, isDefault: true },
          { id: "moderado", label: "Moderado (A → B → C, com condicionais)", setupMin: 800, setupMax: 800, setupText: "R$ 800 / fluxo", recurringMin: 0, recurringMax: 0, timeMin: 2, timeMax: 4 },
          { id: "complexo", label: "Complexo (Múltiplas APIs, Tratamento de Erros)", setupMin: 1500, setupMax: 1500, setupText: "R$ 1.500+ / fluxo", recurringMin: 0, recurringMax: 0, timeMin: 3, timeMax: 7 }
        ]
      },
      {
        id: "autonomia",
        name: "Nível de Autonomia",
        options: [
          { id: "parametrizado", label: "Fluxo 100% Parametrizado (Regras Fixas)", setupMin: 0, setupMax: 0, setupText: "Incluso", recurringMin: 0, recurringMax: 0, timeMin: 0, timeMax: 0, isDefault: true },
          { id: "ia", label: "Decisões baseadas em IA (Análise de faturas, etc.)", setupMin: 600, setupMax: 600, setupText: "+ R$ 600 / nó de IA", recurringMin: 0, recurringMax: 0, recurringText: "Custo API de IA", timeMin: 1, timeMax: 3 }
        ]
      }
    ]
  },
  {
    id: "suporte",
    title: "Suporte e Manutenção",
    description: "Garanta a estabilidade, segurança e evolução contínua do seu projeto após a entrega. Escolha o nível de acompanhamento adequado à criticidade da sua operação. (Transversal para todos os projetos)",
    variables: [
      {
        id: "sla",
        name: "Nível de SLA",
        options: [
          { id: "sem", label: "Sem Manutenção (Entrega de Código/Fluxo)", setupMin: 0, setupMax: 0, recurringMin: 0, recurringMax: 0, timeMin: 0, timeMax: 0, isDefault: true },
          { id: "basico", label: "Básico (Monitoramento e Correção de Bugs - 48h)", setupMin: 0, setupMax: 0, recurringMin: 500, recurringMax: 500, recurringText: "R$ 500 / mês", timeMin: 0, timeMax: 0 },
          { id: "premium", label: "Premium (Prioridade, pequenos ajustes contínuos)", setupMin: 0, setupMax: 0, recurringMin: 1200, recurringMax: 1200, recurringText: "R$ 1.200 / mês", timeMin: 0, timeMax: 0 }
        ]
      }
    ]
  }
];
