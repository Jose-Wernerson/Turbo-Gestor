# 🔐 Configuração do Stripe - Turbo Gestor

Este guia mostra como configurar o Stripe para processar pagamentos de assinaturas no Turbo Gestor.

## 📋 Pré-requisitos

- Conta no Stripe ([criar conta](https://dashboard.stripe.com/register))
- Node.js instalado
- Projeto Turbo Gestor configurado

## 🚀 Passo a Passo

### 1. Criar Conta no Stripe

1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta gratuita
3. Complete o processo de verificação

### 2. Obter Chaves da API

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. No menu lateral, clique em **Developers** → **API keys**
3. Você verá duas chaves:
   - **Publishable key** (começa com `pk_test_...`)
   - **Secret key** (começa com `sk_test_...`)

### 3. Configurar Variáveis de Ambiente

Abra o arquivo `.env.local` e adicione suas chaves:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SEU_SECRET_DO_WEBHOOK
```

⚠️ **IMPORTANTE**: 
- Use apenas chaves de **teste** durante desenvolvimento (`pk_test_` e `sk_test_`)
- **NUNCA** commit o arquivo `.env.local` no Git
- Para produção, use as chaves **live** (`pk_live_` e `sk_live_`)

### 4. Configurar Webhook do Stripe

Os webhooks permitem que o Stripe notifique seu sistema quando eventos acontecem (pagamento aprovado, assinatura cancelada, etc).

#### Desenvolvimento Local (com Stripe CLI)

1. **Instalar Stripe CLI**:
   ```bash
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin
   
   # Mac
   brew install stripe/stripe-cli/stripe
   ```

2. **Fazer Login**:
   ```bash
   stripe login
   ```

3. **Iniciar Webhook Local**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copiar o Webhook Secret**:
   - O comando acima exibirá algo como: `whsec_xxxxx`
   - Copie e cole no `.env.local` na variável `STRIPE_WEBHOOK_SECRET`

#### Produção (Vercel/Hospedagem)

1. No [Dashboard do Stripe](https://dashboard.stripe.com), vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/stripe/webhook`
   - **Eventos para escutar**:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
4. Copie o **Signing secret** (começa com `whsec_`)
5. Adicione nas variáveis de ambiente da Vercel

### 5. Adicionar Colunas no Banco de Dados

Execute este SQL no Supabase:

```sql
-- Adicionar colunas do Stripe na tabela oficinas
ALTER TABLE oficinas
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_oficinas_stripe_customer 
ON oficinas(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_oficinas_stripe_subscription 
ON oficinas(stripe_subscription_id);
```

### 6. Testar Integração

#### Cartões de Teste do Stripe

Use estes cartões para testar:

| Número | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | ✅ Pagamento aprovado |
| `4000 0000 0000 0002` | ❌ Cartão recusado |
| `4000 0025 0000 3155` | ⏳ Requer autenticação 3D Secure |

- **Data de validade**: Qualquer data futura (ex: 12/34)
- **CVC**: Qualquer 3 dígitos (ex: 123)
- **CEP**: Qualquer 5 dígitos (ex: 12345)

#### Fluxo de Teste

1. Acesse `/dashboard/planos`
2. Clique em **Fazer Upgrade** no plano Profissional
3. Clique em **Ir para Pagamento**
4. Você será redirecionado para o Stripe Checkout
5. Use um cartão de teste
6. Complete o pagamento
7. Você será redirecionado de volta com confirmação

### 7. Verificar Funcionamento

1. **No Dashboard do Stripe**:
   - Vá em **Payments** para ver o pagamento
   - Vá em **Subscriptions** para ver a assinatura criada

2. **No Supabase**:
   - Verifique se a coluna `plano` foi atualizada
   - Verifique se `stripe_customer_id` e `stripe_subscription_id` foram preenchidos

3. **Webhook Logs**:
   ```bash
   # No terminal onde o stripe listen está rodando
   # Você verá os eventos sendo recebidos
   ```

## 📊 Estrutura de Preços

```typescript
// Definido em: app/api/stripe/create-checkout-session/route.ts
const precos = {
  profissional: 19700, // R$ 197,00 em centavos
  business: 0,         // Personalizado (contato comercial)
};
```

## 🔄 Eventos do Webhook Implementados

| Evento | Ação |
|--------|------|
| `checkout.session.completed` | Atualiza plano da oficina para o plano comprado |
| `customer.subscription.updated` | Atualiza status se assinatura foi cancelada/pausada |
| `customer.subscription.deleted` | Reverte para plano básico |
| `invoice.payment_failed` | Log de erro (pode enviar email) |

## 🛡️ Segurança

✅ **O que já está implementado:**
- Verificação de assinatura do webhook
- Uso de Service Role Key do Supabase para evitar RLS
- Validação de planos permitidos
- Metadata do usuário em todas transações

⚠️ **Recomendações:**
- Use HTTPS em produção
- Configure CORS adequadamente
- Monitore logs de webhook no Stripe Dashboard
- Configure alertas para pagamentos falhados

## 📝 Arquivos Criados

```
app/
├── api/
│   └── stripe/
│       ├── create-checkout-session/
│       │   └── route.ts          # Cria sessão de pagamento
│       └── webhook/
│           └── route.ts          # Processa eventos do Stripe
└── dashboard/
    └── planos/
        └── upgrade/
            └── page.tsx          # Página de upgrade (integrada)
```

## 🐛 Troubleshooting

### Erro: "No such publishable key"
- ✅ Verifique se copiou a chave correta do Dashboard
- ✅ Certifique-se de usar `pk_test_` em desenvolvimento

### Webhook não está funcionando
- ✅ Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- ✅ Em local, certifique-se que `stripe listen` está rodando
- ✅ Verifique os logs do webhook no Dashboard do Stripe

### Pagamento aprovado mas plano não atualiza
- ✅ Verifique se o webhook está configurado corretamente
- ✅ Veja os logs do webhook para erros
- ✅ Certifique-se que as colunas Stripe existem no banco

### Erro 500 na API
- ✅ Verifique se todas as variáveis de ambiente estão definidas
- ✅ Veja os logs do servidor (`npm run dev`)
- ✅ Confirme que as colunas Stripe foram adicionadas no banco

## 🎯 Próximos Passos

Após configurar o Stripe:

1. ✅ Testar com cartão de teste
2. ✅ Verificar webhook funcionando
3. ✅ Testar cancelamento de assinatura
4. ✅ Configurar emails de notificação
5. ✅ Adicionar página de gerenciamento de assinatura
6. ✅ Implementar portal do cliente Stripe (para cancelamento self-service)

## 🔗 Links Úteis

- [Documentação Stripe](https://stripe.com/docs)
- [Dashboard Stripe](https://dashboard.stripe.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Cartões de Teste](https://stripe.com/docs/testing)
- [Webhooks](https://stripe.com/docs/webhooks)

## 💡 Dicas

- Use **modo de teste** durante desenvolvimento
- Configure **alertas** no Stripe para eventos importantes
- Monitore **tentativas de fraude** no Dashboard
- Configure **emails de recibo** automáticos
- Implemente **retry logic** para webhooks falhados

---

**Desenvolvido para Turbo Gestor** 🚀
