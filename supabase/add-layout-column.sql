-- Adicionar coluna layout na tabela oficinas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'oficinas' 
        AND column_name = 'layout'
    ) THEN
        ALTER TABLE oficinas 
        ADD COLUMN layout VARCHAR(20) DEFAULT 'compacto';
    END IF;
END $$;

-- Valores possíveis: compacto, confortavel, espacoso, moderno
COMMENT ON COLUMN oficinas.layout IS 'Layout do sistema: compacto, confortavel, espacoso, moderno';
