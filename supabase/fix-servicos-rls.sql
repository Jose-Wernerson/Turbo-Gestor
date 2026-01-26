-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Serviços são visíveis pela oficina" ON servicos;
DROP POLICY IF EXISTS "Serviços podem ser criados pela oficina" ON servicos;
DROP POLICY IF EXISTS "Serviços podem ser atualizados pela oficina" ON servicos;
DROP POLICY IF EXISTS "Serviços podem ser deletados pela oficina" ON servicos;

-- Política de SELECT
CREATE POLICY "Serviços são visíveis pela oficina"
ON servicos FOR SELECT
USING (auth.uid() = oficina_id);

-- Política de INSERT
CREATE POLICY "Serviços podem ser criados pela oficina"
ON servicos FOR INSERT
WITH CHECK (auth.uid() = oficina_id);

-- Política de UPDATE
CREATE POLICY "Serviços podem ser atualizados pela oficina"
ON servicos FOR UPDATE
USING (auth.uid() = oficina_id)
WITH CHECK (auth.uid() = oficina_id);

-- Política de DELETE
CREATE POLICY "Serviços podem ser deletados pela oficina"
ON servicos FOR DELETE
USING (auth.uid() = oficina_id);
