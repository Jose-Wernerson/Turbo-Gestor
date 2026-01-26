-- Adicionar coluna 'tipo' na tabela veiculos
-- Execute este script no SQL Editor do Supabase

-- Adicionar a coluna tipo se não existir
ALTER TABLE veiculos 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'carro';

-- Tornar as colunas opcionais (remover NOT NULL)
ALTER TABLE veiculos 
ALTER COLUMN marca DROP NOT NULL,
ALTER COLUMN modelo DROP NOT NULL,
ALTER COLUMN ano DROP NOT NULL,
ALTER COLUMN placa DROP NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN veiculos.tipo IS 'Tipo de veículo: carro, moto, caminhao, van';
