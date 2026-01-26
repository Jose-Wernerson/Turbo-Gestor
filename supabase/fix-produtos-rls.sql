-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Produtos são visíveis pela oficina" ON produtos;
DROP POLICY IF EXISTS "Produtos podem ser criados pela oficina" ON produtos;
DROP POLICY IF EXISTS "Produtos podem ser atualizados pela oficina" ON produtos;
DROP POLICY IF EXISTS "Produtos podem ser deletados pela oficina" ON produtos;

-- Política de SELECT
CREATE POLICY "Produtos são visíveis pela oficina"
ON produtos FOR SELECT
USING (auth.uid() = oficina_id);

-- Política de INSERT
CREATE POLICY "Produtos podem ser criados pela oficina"
ON produtos FOR INSERT
WITH CHECK (auth.uid() = oficina_id);

-- Política de UPDATE
CREATE POLICY "Produtos podem ser atualizados pela oficina"
ON produtos FOR UPDATE
USING (auth.uid() = oficina_id)
WITH CHECK (auth.uid() = oficina_id);

-- Política de DELETE
CREATE POLICY "Produtos podem ser deletados pela oficina"
ON produtos FOR DELETE
USING (auth.uid() = oficina_id);
