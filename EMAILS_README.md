# 📧 Sistema de Emails Automatizados - Turbo Gestor

## Configuração do Resend

### 1. Criar conta no Resend
1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita (3000 emails/mês)
3. Verifique seu email

### 2. Obter API Key
1. Faça login no Resend
2. Vá em **API Keys**
3. Clique em **Create API Key**
4. Copie a chave gerada

### 3. Configurar domínio (opcional)
Para usar seu próprio domínio (ex: `emails@turbogestor.com`):
1. Vá em **Domains** no Resend
2. Clique em **Add Domain**
3. Digite seu domínio
4. Configure os registros DNS conforme instruções

**Modo desenvolvimento:** Use o domínio padrão do Resend (`onboarding@resend.dev`)

### 4. Adicionar API Key no projeto
No arquivo `.env.local`, adicione:
```bash
RESEND_API_KEY=re_sua_chave_aqui
```

## Emails Implementados

### 1. ✅ Email de Boas-Vindas
**Quando:** Ao criar uma nova conta
**Template:** `welcome-email.tsx`
**Rota:** `/api/emails/welcome`
**Conteúdo:**
- Mensagem de boas-vindas
- Informações sobre o trial de 7 dias
- Lista de recursos disponíveis
- Botão para acessar o dashboard

### 2. ⏰ Email de Trial Expirando
**Quando:** 3 dias e 1 dia antes do trial expirar
**Template:** `trial-expiring-email.tsx`
**Rota:** `/api/emails/trial-expiring`
**Conteúdo:**
- Alerta sobre dias restantes
- Comparação de planos
- Botão para assinar

### 3. 🚀 Email de Trial Expirado
**Quando:** Quando o trial expira
**Template:** `trial-expired-email.tsx`
**Rota:** `/api/emails/trial-expired`
**Conteúdo:**
- Informação sobre expiração
- Oferta especial de 20% de desconto
- Planos com preços promocionais
- Botão para assinar

### 4. 💳 Email de Confirmação de Pagamento
**Quando:** Ao completar uma assinatura no Stripe
**Template:** `payment-confirmation-email.tsx`
**Rota:** `/api/emails/payment-confirmation`
**Conteúdo:**
- Confirmação de pagamento
- Detalhes do plano e valor
- Data da próxima cobrança
- Recursos liberados
- Botão para acessar dashboard

## Automatização com Cron Jobs

### Rota de Cron
`/api/cron/trial-emails`

Essa rota deve ser executada **diariamente** para:
- Enviar emails para trials que expiram em 3 dias
- Enviar emails para trials que expiram em 1 dia
- Enviar emails para trials já expirados

### Configurar Cron Job (Vercel)

1. No arquivo `vercel.json`, adicione:
```json
{
  "crons": [{
    "path": "/api/cron/trial-emails",
    "schedule": "0 10 * * *"
  }]
}
```
Isso executa todos os dias às 10h.

2. A rota está protegida com `CRON_SECRET`:
```bash
CRON_SECRET=turbo_cron_secret_2025
```

### Testar Cron Manualmente

```bash
curl -X POST http://localhost:3000/api/cron/trial-emails \
  -H "Authorization: Bearer turbo_cron_secret_2025"
```

### Configurar Cron Job (outro serviço)

Use serviços como:
- **Cron-job.org** (gratuito)
- **EasyCron** (gratuito até 80 jobs/dia)
- **GitHub Actions** (workflows agendados)

Configure para fazer requisição POST diária para:
```
https://seu-dominio.com/api/cron/trial-emails
```

Com header:
```
Authorization: Bearer turbo_cron_secret_2025
```

## Estrutura de Arquivos

```
components/emails/
├── welcome-email.tsx              # Template de boas-vindas
├── trial-expiring-email.tsx       # Template de trial expirando
├── trial-expired-email.tsx        # Template de trial expirado
└── payment-confirmation-email.tsx # Template de confirmação

lib/
└── email.ts                       # Funções de envio

app/api/emails/
├── welcome/route.ts               # Rota de boas-vindas
├── trial-expiring/route.ts        # Rota de trial expirando
├── trial-expired/route.ts         # Rota de trial expirado
└── payment-confirmation/route.ts  # Rota de confirmação

app/api/cron/
└── trial-emails/route.ts          # Cron job automático
```

## Customização de Templates

Os templates usam **React Email** e **@react-email/components**.

Para editar um template:
1. Abra o arquivo em `components/emails/`
2. Edite o conteúdo HTML/React
3. Customize os estilos inline
4. Salve e reinicie o servidor

### Preview de Emails (Desenvolvimento)

Instale a CLI do React Email:
```bash
npx react-email dev
```

Acesse: `http://localhost:3001`

## Testes

### Testar Email de Boas-Vindas
```bash
curl -X POST http://localhost:3000/api/emails/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","nome":"Seu Nome"}'
```

### Testar Email de Trial Expirando
```bash
curl -X POST http://localhost:3000/api/emails/trial-expiring \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","nome":"Seu Nome","diasRestantes":3}'
```

### Testar Email de Trial Expirado
```bash
curl -X POST http://localhost:3000/api/emails/trial-expired \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","nome":"Seu Nome"}'
```

## Monitoramento

No painel do Resend você pode ver:
- Emails enviados
- Taxa de entrega
- Bounces e reclamações
- Logs detalhados

## Limites do Plano Gratuito

- **3.000 emails/mês**
- **100 emails/dia**
- 1 domínio verificado

Para mais, upgrade para plano pago ($20/mês = 50k emails).

## Próximos Passos

- [ ] Adicionar analytics de abertura/clique
- [ ] Criar template de recuperação de senha
- [ ] Implementar newsletter
- [ ] Adicionar emails de faturas mensais
- [ ] Template de cancelamento de assinatura
