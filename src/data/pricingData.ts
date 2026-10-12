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

// Faixas iniciais por escopo. Referências: docs/pricing-market.md.
export const pricingData: PricingCategory[] = [
  {
    "id": "landing-pages",
    "title": "Landing pages",
    "description": "Escolha o formato ideal para sua presença digital. Foque em captar leads com alto nível de exclusividade de design.",
    "variables": [
      {
        "id": "design",
        "name": "Design e UI/UX",
        "options": [
          {
            "id": "template",
            "label": "Design sob medida (até 6 seções)",
            "setupMin": 3600,
            "setupMax": 5500,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 10,
            "timeMax": 15,
            "isDefault": true
          },
          {
            "id": "exclusivo",
            "label": "Design sob medida (até 12 seções)",
            "setupMin": 5500,
            "setupMax": 8500,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 15,
            "timeMax": 25
          }
        ]
      },
      {
        "id": "gestao",
        "name": "Gestão de Conteúdo",
        "options": [
          {
            "id": "estatica",
            "label": "Sem painel (página estática)",
            "setupMin": 0,
            "setupMax": 0,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 0,
            "timeMax": 0,
            "isDefault": true,
            "setupText": "Incluso"
          },
          {
            "id": "cms",
            "label": "Painel de conteúdo (CMS)",
            "setupMin": 1500,
            "setupMax": 3000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 3,
            "timeMax": 7
          }
        ]
      },
      {
        "id": "hospedagem",
        "name": "Hospedagem e Domínio",
        "options": [
          {
            "id": "basica",
            "label": "Infraestrutura Básica (Vercel/Netlify)",
            "setupMin": 0,
            "setupMax": 0,
            "recurringMin": 50,
            "recurringMax": 80,
            "timeMin": 0,
            "timeMax": 1,
            "isDefault": true,
            "setupText": "Incluso"
          }
        ]
      }
    ]
  },
  {
    "id": "e-commerce",
    "title": "E-commerce",
    "description": "Lojas virtuais completas para escalar suas vendas online. Defina o nível de exclusividade do design e as integrações.",
    "variables": [
      {
        "id": "design",
        "name": "Design e UI/UX",
        "options": [
          {
            "id": "template",
            "label": "Loja personalizada em plataforma existente",
            "setupMin": 8000,
            "setupMax": 14000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 20,
            "timeMax": 35,
            "isDefault": true
          },
          {
            "id": "exclusivo",
            "label": "Loja sob medida com design exclusivo",
            "setupMin": 18000,
            "setupMax": 35000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 40,
            "timeMax": 65
          }
        ]
      },
      {
        "id": "pagamento",
        "name": "Integração de Pagamento",
        "options": [
          {
            "id": "padrao",
            "label": "Checkout Padrão (Stripe, Mercado Pago)",
            "setupMin": 0,
            "setupMax": 0,
            "setupText": "Incluso",
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Taxas do gateway",
            "timeMin": 1,
            "timeMax": 2,
            "isDefault": true
          },
          {
            "id": "assinatura",
            "label": "Assinaturas e pagamento recorrente",
            "setupMin": 3000,
            "setupMax": 6000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 5,
            "timeMax": 10
          }
        ]
      },
      {
        "id": "hospedagem",
        "name": "Hospedagem e Domínio",
        "options": [
          {
            "id": "basica",
            "label": "Infraestrutura Básica",
            "setupMin": 0,
            "setupMax": 0,
            "recurringMin": 50,
            "recurringMax": 80,
            "timeMin": 0,
            "timeMax": 1,
            "isDefault": true,
            "setupText": "Incluso"
          },
          {
            "id": "dedicado",
            "label": "Servidor Dedicado/VPS",
            "setupMin": 600,
            "setupMax": 1200,
            "recurringMin": 150,
            "recurringMax": 300,
            "timeMin": 1,
            "timeMax": 2
          }
        ]
      }
    ]
  },
  {
    "id": "automacoes",
    "title": "Automação",
    "description": "Transforme seu atendimento com automação. Selecione a forma de conexão com o WhatsApp, o nível de inteligência do bot (de menus simples a conversas naturais via IA) e se deseja recursos avançados, como áudio humanizado e integração com seu CRM.",
    "variables": [
      {
        "id": "infra-api",
        "name": "Infraestrutura de API",
        "options": [
          {
            "id": "evolution",
            "label": "Conexão via QR Code (Evolution API/Baixo custo)",
            "setupMin": 800,
            "setupMax": 1200,
            "recurringMin": 80,
            "recurringMax": 80,
            "recurringText": "Infraestrutura ou licença estimada; consumo pode variar",
            "timeMin": 1,
            "timeMax": 2,
            "isDefault": true
          },
          {
            "id": "cloud",
            "label": "WhatsApp Cloud API Oficial (Meta)",
            "setupMin": 1200,
            "setupMax": 1800,
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Tarifas da Meta por categoria e volume de mensagens",
            "timeMin": 2,
            "timeMax": 3
          }
        ]
      },
      {
        "id": "inteligencia",
        "name": "Inteligência do Bot",
        "options": [
          {
            "id": "arvore",
            "label": "Fluxo de atendimento com menus",
            "setupMin": 3500,
            "setupMax": 6000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 7,
            "timeMax": 12,
            "isDefault": true
          },
          {
            "id": "ia",
            "label": "Agente de IA com contexto do negócio",
            "setupMin": 8000,
            "setupMax": 14000,
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "API OpenAI/Anthropic (Variável)",
            "timeMin": 15,
            "timeMax": 25
          }
        ]
      },
      {
        "id": "voice",
        "name": "Voice Tuning / Áudio",
        "options": [
          {
            "id": "sem",
            "label": "Sem Áudio",
            "setupMin": 0,
            "setupMax": 0,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 0,
            "timeMax": 0,
            "isDefault": true,
            "setupText": "Incluso"
          },
          {
            "id": "tts",
            "label": "Respostas em áudio com voz padrão",
            "setupMin": 1500,
            "setupMax": 3000,
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Custos API Google/AWS",
            "timeMin": 3,
            "timeMax": 5
          },
          {
            "id": "clonagem",
            "label": "Voz personalizada com autorização de uso",
            "setupMin": 2500,
            "setupMax": 5000,
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Licença e consumo do provedor de voz à parte",
            "timeMin": 5,
            "timeMax": 10
          }
        ]
      },
      {
        "id": "crm",
        "name": "Integração CRM",
        "options": [
          {
            "id": "sheets",
            "label": "Planilhas Google (Google Sheets)",
            "setupMin": 400,
            "setupMax": 800,
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Gratuito",
            "timeMin": 1,
            "timeMax": 1,
            "isDefault": true
          },
          {
            "id": "mercado",
            "label": "CRMs de Mercado (HubSpot, RD Station)",
            "setupMin": 2000,
            "setupMax": 4000,
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Assinatura da plataforma",
            "timeMin": 2,
            "timeMax": 4
          }
        ]
      }
    ]
  },
  {
    "id": "analytics-dashboards-bi",
    "title": "Analytics e BI",
    "description": "Implementação de GA4, eventos, pixels, funis, dashboards executivos, relatórios automáticos e painéis operacionais para acompanhar vendas, marketing e operação com clareza.",
    "variables": [
      {
        "id": "instrumentacao",
        "name": "Instrumentação de Dados",
        "options": [
          {
            "id": "essencial",
            "label": "GA4 e eventos essenciais",
            "setupMin": 1200,
            "setupMax": 2000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 3,
            "timeMax": 5,
            "isDefault": true
          },
          {
            "id": "avancada",
            "label": "GTM, pixels, funis e eventos avançados",
            "setupMin": 2500,
            "setupMax": 4500,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 5,
            "timeMax": 10
          }
        ]
      },
      {
        "id": "dashboard",
        "name": "Dashboard e Visualização",
        "options": [
          {
            "id": "looker",
            "label": "Dashboard em Looker Studio ou Sheets",
            "setupMin": 2800,
            "setupMax": 5000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 7,
            "timeMax": 12,
            "isDefault": true
          },
          {
            "id": "custom",
            "label": "Dashboard web com design exclusivo",
            "setupMin": 7500,
            "setupMax": 13500,
            "recurringMin": 80,
            "recurringMax": 200,
            "recurringText": "Hospedagem/DB: R$ 80 - R$ 200 / mês",
            "timeMin": 15,
            "timeMax": 25
          }
        ]
      },
      {
        "id": "integracoes",
        "name": "Integrações de Fonte de Dados",
        "options": [
          {
            "id": "basicas",
            "label": "Site, landing page ou e-commerce",
            "setupMin": 0,
            "setupMax": 0,
            "setupText": "Incluso",
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 0,
            "timeMax": 0,
            "isDefault": true
          },
          {
            "id": "multifonte",
            "label": "CRM, ERP, planilhas e banco de dados",
            "setupMin": 3000,
            "setupMax": 6500,
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Custos de conectores, se houver",
            "timeMin": 5,
            "timeMax": 12
          }
        ]
      },
      {
        "id": "relatorios",
        "name": "Relatórios Automáticos",
        "options": [
          {
            "id": "sem",
            "label": "Sem relatórios automáticos",
            "setupMin": 0,
            "setupMax": 0,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 0,
            "timeMax": 0,
            "isDefault": true,
            "setupText": "Incluso"
          },
          {
            "id": "mensal",
            "label": "Relatórios mensais por e-mail ou WhatsApp",
            "setupMin": 400,
            "setupMax": 800,
            "recurringMin": 150,
            "recurringMax": 300,
            "recurringText": "R$ 150 - R$ 300 / mês",
            "timeMin": 1,
            "timeMax": 2
          }
        ]
      }
    ]
  },
  {
    "id": "sistemas-web",
    "title": "Sistemas web",
    "description": "Soluções sob medida para lidar com dados e processos complexos. Indique se precisa de captura de dados (scraping) pontual ou recorrente, a robustez necessária para o banco de dados e como deseja visualizar essas informações.",
    "variables": [
      {
        "id": "escopo",
        "name": "Escopo de Scraper/Extração",
        "options": [
          {
            "id": "unica",
            "label": "Raspagem Única (Script sob demanda)",
            "setupMin": 1500,
            "setupMax": 2500,
            "recurringMin": 200,
            "recurringMax": 200,
            "recurringText": "R$ 200 / mês (Manutenção)",
            "timeMin": 1,
            "timeMax": 3,
            "isDefault": true
          },
          {
            "id": "recorrente",
            "label": "Sistema de Extração Recorrente (Diário/Semanal)",
            "setupMin": 3000,
            "setupMax": 5000,
            "recurringMin": 250,
            "recurringMax": 250,
            "recurringText": "Infraestrutura ou licença estimada; consumo pode variar",
            "timeMin": 3,
            "timeMax": 5
          }
        ]
      },
      {
        "id": "complexidade",
        "name": "Complexidade do Alvo",
        "options": [
          {
            "id": "simples",
            "label": "Site de Acesso Público Simples",
            "setupMin": 0,
            "setupMax": 0,
            "setupText": "Incluso no Setup",
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 0,
            "timeMax": 0,
            "isDefault": true
          },
          {
            "id": "antibot",
            "label": "Site com Proteção Anti-Bot / Captchas",
            "setupMin": 2000,
            "setupMax": 4000,
            "recurringMin": 100,
            "recurringMax": 100,
            "recurringText": "Infraestrutura ou licença estimada; consumo pode variar",
            "timeMin": 2,
            "timeMax": 4
          }
        ]
      },
      {
        "id": "backend",
        "name": "Backend & Banco de Dados",
        "options": [
          {
            "id": "sqlite",
            "label": "API Simples com SQLite / JSON",
            "setupMin": 4000,
            "setupMax": 6000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 2,
            "timeMax": 4,
            "isDefault": true
          },
          {
            "id": "postgres",
            "label": "Backend Completo com PostgreSQL / MongoDB",
            "setupMin": 7000,
            "setupMax": 12000,
            "recurringMin": 80,
            "recurringMax": 200,
            "recurringText": "DB Cloud: R$ 80 - R$ 200 / mês",
            "timeMin": 5,
            "timeMax": 10
          }
        ]
      },
      {
        "id": "painel",
        "name": "Painel de Visualização",
        "options": [
          {
            "id": "csv",
            "label": "Exportação direta para CSV/Excel",
            "setupMin": 0,
            "setupMax": 0,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 0,
            "timeMax": 0,
            "isDefault": true,
            "setupText": "Incluso"
          },
          {
            "id": "dashboard",
            "label": "Dashboard Web Customizado (Gráficos/Tabelas)",
            "setupMin": 4000,
            "setupMax": 7000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 3,
            "timeMax": 6
          }
        ]
      }
    ]
  },
  {
    "id": "agentes-corporativos",
    "title": "Agentes de IA",
    "description": "Potencialize sua equipe com um assistente inteligente. Defina o volume e a fonte dos documentos que a IA deve aprender (Base de Conhecimento), a privacidade do modelo e onde sua equipe irá interagir com ele (Slack, Teams ou plataforma própria).",
    "variables": [
      {
        "id": "rag",
        "name": "Base de Conhecimento (RAG)",
        "options": [
          {
            "id": "estatico",
            "label": "Até 50 documentos selecionados",
            "setupMin": 8000,
            "setupMax": 14000,
            "recurringMin": 0,
            "recurringMax": 100,
            "recurringText": "Banco Vetorial (Pinecone): Grátis/R$100",
            "timeMin": 15,
            "timeMax": 25,
            "isDefault": true
          },
          {
            "id": "dinamico",
            "label": "Sincronização com até duas fontes de dados",
            "setupMin": 16000,
            "setupMax": 28000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 25,
            "timeMax": 40
          }
        ]
      },
      {
        "id": "llm",
        "name": "Modelo de Linguagem (LLM)",
        "options": [
          {
            "id": "proprietaria",
            "label": "API de IA gerenciada",
            "setupMin": 0,
            "setupMax": 0,
            "setupText": "Incluso no Setup",
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Custo de uso da API (Variável)",
            "timeMin": 0,
            "timeMax": 0,
            "isDefault": true
          },
          {
            "id": "opensource",
            "label": "Modelo aberto em infraestrutura dedicada",
            "setupMin": 5000,
            "setupMax": 10000,
            "recurringMin": 0,
            "recurringMax": 0,
            "recurringText": "Infraestrutura GPU sob consulta",
            "timeMin": 7,
            "timeMax": 15
          }
        ]
      },
      {
        "id": "interface",
        "name": "Interface do Agente",
        "options": [
          {
            "id": "slack",
            "label": "Um canal: Slack, Teams ou Discord",
            "setupMin": 2000,
            "setupMax": 4000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 5,
            "timeMax": 10,
            "isDefault": true
          },
          {
            "id": "web",
            "label": "Interface web exclusiva com autenticação",
            "setupMin": 5000,
            "setupMax": 9000,
            "recurringMin": 80,
            "recurringMax": 80,
            "recurringText": "Infraestrutura ou licença estimada; consumo pode variar",
            "timeMin": 10,
            "timeMax": 20
          }
        ]
      },
      {
        "id": "acessos",
        "name": "Controle de Acessos",
        "options": [
          {
            "id": "unico",
            "label": "Acesso Único (Todos veem tudo)",
            "setupMin": 0,
            "setupMax": 0,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 0,
            "timeMax": 0,
            "isDefault": true,
            "setupText": "Incluso"
          },
          {
            "id": "permissoes",
            "label": "Permissões por cargo ou setor",
            "setupMin": 2500,
            "setupMax": 5000,
            "recurringMin": 0,
            "recurringMax": 0,
            "timeMin": 5,
            "timeMax": 10
          }
        ]
      }
    ]
  }
];
