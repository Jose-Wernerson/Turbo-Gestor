-- Adicionar coluna plano na tabela oficinas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'oficinas' 
        AND column_name = 'plano'
    ) THEN
        ALTER TABLE oficinas 
        ADD COLUMN plano VARCHAR(20) DEFAULT 'basico';
    END IF;
END $$;

-- Atualizar valores possíveis: basico, profissional, business
COMMENT ON COLUMN oficinas.plano IS 'Plano da oficina: basico, profissional, business';
