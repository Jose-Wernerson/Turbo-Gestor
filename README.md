# 🚗 Turbo Gestor

Sistema completo de gestão para oficinas mecânicas. Gerencie clientes, veículos, agendamentos, estoque, faturas e muito mais em uma plataforma moderna e intuitiva.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard Interativo**: Visão geral com métricas principais
- **Gestão de Clientes**: Cadastro completo com histórico
- **Controle de Veículos**: Registro detalhado de veículos dos clientes
- **Catálogo de Serviços**: Gerenciamento de serviços oferecidos
- **Sistema de Agendamentos**: Calendário de serviços
- **Controle de Estoque**: Gestão de peças e produtos com alertas
- **Faturas**: Emissão e controle de pagamentos
- **Relatórios**: Análises e insights do negócio

### 🎯 Recursos Principais
- 🎨 Interface moderna e responsiva
- 🌐 SEO otimizado para melhor posicionamento no Google
- 💳 Integração com Stripe para pagamentos
- 🔐 Autenticação segura com Supabase
- 📊 Dashboard com métricas em tempo real
- 📱 Design mobile-first
- 🇧🇷 Interface 100% em Português

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui + Radix UI
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Pagamentos**: Stripe
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase
- Conta no Stripe (para pagamentos)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <repo-url>
cd turbo-gestor
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua-chave-publica-stripe
STRIPE_SECRET_KEY=sua-chave-secreta-stripe
STRIPE_WEBHOOK_SECRET=seu-webhook-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Configure o banco de dados**

No painel do Supabase, execute o SQL em `supabase/schema.sql` para criar as tabelas.

5. **Execute o projeto**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
turbo-gestor/
├── app/                      # App Router do Next.js
│   ├── dashboard/           # Páginas do dashboard
│   │   ├── clientes/       # Módulo de clientes
│   │   ├── veiculos/       # Módulo de veículos
│   │   ├── servicos/       # Módulo de serviços
│   │   ├── agendamentos/   # Módulo de agendamentos
│   │   ├── estoque/        # Módulo de estoque
│   │   ├── faturas/        # Módulo de faturas
│   │   └── relatorios/     # Módulo de relatórios
│   ├── layout.tsx          # Layout raiz
│   └── page.tsx            # Landing page
├── components/              # Componentes React
│   ├── ui/                 # Componentes base (shadcn/ui)
│   ├── sidebar.tsx         # Sidebar de navegação
│   └── header.tsx          # Header do dashboard
├── lib/                     # Utilitários e configurações
│   ├── utils.ts            # Funções utilitárias
│   ├── supabase.ts         # Cliente Supabase
│   └── stripe.ts           # Cliente Stripe
├── supabase/               # Configurações do banco
│   └── schema.sql          # Schema do banco de dados
└── public/                 # Arquivos estáticos
```

## 🎨 Componentes UI

O projeto utiliza **shadcn/ui**, uma coleção de componentes reutilizáveis construídos com Radix UI e Tailwind CSS.

Componentes principais:
- Button
- Card
- Input
- Dialog
- Select
- Toast
- Tabs

## 🗄️ Banco de Dados

### Principais Tabelas
- **oficinas**: Dados das oficinas (multi-tenant)
- **profiles**: Perfis de usuários
- **clientes**: Cadastro de clientes
- **veiculos**: Veículos dos clientes
- **servicos**: Catálogo de serviços
- **agendamentos**: Agendamentos de serviços
- **produtos**: Controle de estoque
- **ordens_servico**: Ordens de serviço
- **faturas**: Faturas e recebimentos
- **movimentacoes_estoque**: Histórico de movimentações

## 💳 Integração com Stripe

O sistema está preparado para aceitar pagamentos via Stripe:
- Assinaturas recorrentes (planos)
- Pagamentos únicos
- Gerenciamento de clientes
- Webhooks para sincronização

## 🔐 Autenticação

Utiliza Supabase Auth com suporte a:
- Email/Senha
- Login social (Google, GitHub, etc.)
- Reset de senha
- Row Level Security (RLS)

## 📈 SEO

O projeto está otimizado para SEO:
- Metadata configurado em cada página
- Open Graph tags
- Sitemap.xml (a implementar)
- Robots.txt (a implementar)
- URLs amigáveis
- Performance otimizada

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel deploy
```

### Outras Plataformas
O projeto pode ser deployado em qualquer plataforma que suporte Next.js 14:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linter
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@turbogestor.com
- Website: https://turbogestor.com

---

Desenvolvido com ❤️ para oficinas que querem crescer
