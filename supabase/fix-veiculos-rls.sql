-- Políticas RLS para a tabela VEICULOS
-- Execute este script no SQL Editor do Supabase

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own veiculos" ON veiculos;
DROP POLICY IF EXISTS "Users can insert own veiculos" ON veiculos;
DROP POLICY IF EXISTS "Users can update own veiculos" ON veiculos;
DROP POLICY IF EXISTS "Users can delete own veiculos" ON veiculos;

-- SELECT: Usuários podem ver veículos da sua oficina
CREATE POLICY "Users can view own veiculos" ON veiculos
  FOR SELECT USING (auth.uid() = oficina_id);

-- INSERT: Usuários podem inserir veículos na sua oficina
CREATE POLICY "Users can insert own veiculos" ON veiculos
  FOR INSERT WITH CHECK (auth.uid() = oficina_id);

-- UPDATE: Usuários podem atualizar veículos da sua oficina
CREATE POLICY "Users can update own veiculos" ON veiculos
  FOR UPDATE USING (auth.uid() = oficina_id);

-- DELETE: Usuários podem deletar veículos da sua oficina
CREATE POLICY "Users can delete own veiculos" ON veiculos
  FOR DELETE USING (auth.uid() = oficina_id);
