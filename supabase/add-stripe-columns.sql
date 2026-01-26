-- Adicionar colunas do Stripe na tabela oficinas
ALTER TABLE oficinas
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_oficinas_stripe_customer 
ON oficinas(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_oficinas_stripe_subscription 
ON oficinas(stripe_subscription_id);

-- Comentários nas colunas
COMMENT ON COLUMN oficinas.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN oficinas.stripe_subscription_id IS 'ID da assinatura ativa no Stripe';
