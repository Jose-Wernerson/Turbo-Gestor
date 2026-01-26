-- Políticas RLS para a tabela CLIENTES
-- Execute este script no SQL Editor do Supabase

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own clientes" ON clientes;
DROP POLICY IF EXISTS "Users can insert own clientes" ON clientes;
DROP POLICY IF EXISTS "Users can update own clientes" ON clientes;
DROP POLICY IF EXISTS "Users can delete own clientes" ON clientes;

-- SELECT: Usuários podem ver clientes da sua oficina
CREATE POLICY "Users can view own clientes" ON clientes
  FOR SELECT USING (auth.uid() = oficina_id);

-- INSERT: Usuários podem inserir clientes na sua oficina
CREATE POLICY "Users can insert own clientes" ON clientes
  FOR INSERT WITH CHECK (auth.uid() = oficina_id);

-- UPDATE: Usuários podem atualizar clientes da sua oficina
CREATE POLICY "Users can update own clientes" ON clientes
  FOR UPDATE USING (auth.uid() = oficina_id);

-- DELETE: Usuários podem deletar clientes da sua oficina
CREATE POLICY "Users can delete own clientes" ON clientes
  FOR DELETE USING (auth.uid() = oficina_id);
