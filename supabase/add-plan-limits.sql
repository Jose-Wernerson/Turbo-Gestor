-- 1. Adicionar colunas de controle de trial e contadores
ALTER TABLE oficinas
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_clientes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_veiculos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_produtos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_servicos INTEGER DEFAULT 0;

-- 2. Atualizar contadores existentes
UPDATE oficinas o
SET total_clientes = (SELECT COUNT(*) FROM clientes WHERE oficina_id = o.id);

UPDATE oficinas o
SET total_veiculos = (SELECT COUNT(*) FROM veiculos WHERE oficina_id = o.id);

UPDATE oficinas o
SET total_produtos = (SELECT COUNT(*) FROM produtos WHERE oficina_id = o.id);

UPDATE oficinas o
SET total_servicos = (SELECT COUNT(*) FROM servicos WHERE oficina_id = o.id);

-- 3. Função para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION atualizar_contadores()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'clientes' THEN
            UPDATE oficinas SET total_clientes = total_clientes + 1 
            WHERE id = NEW.oficina_id;
        ELSIF TG_TABLE_NAME = 'veiculos' THEN
            UPDATE oficinas SET total_veiculos = total_veiculos + 1 
            WHERE id = NEW.oficina_id;
        ELSIF TG_TABLE_NAME = 'produtos' THEN
            UPDATE oficinas SET total_produtos = total_produtos + 1 
            WHERE id = NEW.oficina_id;
        ELSIF TG_TABLE_NAME = 'servicos' THEN
            UPDATE oficinas SET total_servicos = total_servicos + 1 
            WHERE id = NEW.oficina_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'clientes' THEN
            UPDATE oficinas SET total_clientes = GREATEST(0, total_clientes - 1) 
            WHERE id = OLD.oficina_id;
        ELSIF TG_TABLE_NAME = 'veiculos' THEN
            UPDATE oficinas SET total_veiculos = GREATEST(0, total_veiculos - 1) 
            WHERE id = OLD.oficina_id;
        ELSIF TG_TABLE_NAME = 'produtos' THEN
            UPDATE oficinas SET total_produtos = GREATEST(0, total_produtos - 1) 
            WHERE id = OLD.oficina_id;
        ELSIF TG_TABLE_NAME = 'servicos' THEN
            UPDATE oficinas SET total_servicos = GREATEST(0, total_servicos - 1) 
            WHERE id = OLD.oficina_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar triggers para cada tabela
DROP TRIGGER IF EXISTS trigger_contar_clientes ON clientes;
CREATE TRIGGER trigger_contar_clientes
AFTER INSERT OR DELETE ON clientes
FOR EACH ROW EXECUTE FUNCTION atualizar_contadores();

DROP TRIGGER IF EXISTS trigger_contar_veiculos ON veiculos;
CREATE TRIGGER trigger_contar_veiculos
AFTER INSERT OR DELETE ON veiculos
FOR EACH ROW EXECUTE FUNCTION atualizar_contadores();

DROP TRIGGER IF EXISTS trigger_contar_produtos ON produtos;
CREATE TRIGGER trigger_contar_produtos
AFTER INSERT OR DELETE ON produtos
FOR EACH ROW EXECUTE FUNCTION atualizar_contadores();

DROP TRIGGER IF EXISTS trigger_contar_servicos ON servicos;
CREATE TRIGGER trigger_contar_servicos
AFTER INSERT OR DELETE ON servicos
FOR EACH ROW EXECUTE FUNCTION atualizar_contadores();

-- 5. Comentários
COMMENT ON COLUMN oficinas.trial_ends_at IS 'Data de término do período de teste grátis';
COMMENT ON COLUMN oficinas.total_clientes IS 'Contador de clientes cadastrados';
COMMENT ON COLUMN oficinas.total_veiculos IS 'Contador de veículos cadastrados';
COMMENT ON COLUMN oficinas.total_produtos IS 'Contador de produtos em estoque';
COMMENT ON COLUMN oficinas.total_servicos IS 'Contador de serviços cadastrados';
