-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Faturas são visíveis pela oficina" ON faturas;
DROP POLICY IF EXISTS "Faturas podem ser criadas pela oficina" ON faturas;
DROP POLICY IF EXISTS "Faturas podem ser atualizadas pela oficina" ON faturas;
DROP POLICY IF EXISTS "Faturas podem ser deletadas pela oficina" ON faturas;

-- Política de SELECT
CREATE POLICY "Faturas são visíveis pela oficina"
ON faturas FOR SELECT
USING (auth.uid() = oficina_id);

-- Política de INSERT
CREATE POLICY "Faturas podem ser criadas pela oficina"
ON faturas FOR INSERT
WITH CHECK (auth.uid() = oficina_id);

-- Política de UPDATE
CREATE POLICY "Faturas podem ser atualizadas pela oficina"
ON faturas FOR UPDATE
USING (auth.uid() = oficina_id)
WITH CHECK (auth.uid() = oficina_id);

-- Política de DELETE
CREATE POLICY "Faturas podem ser deletadas pela oficina"
ON faturas FOR DELETE
USING (auth.uid() = oficina_id);
