-- Renomear coluna data_hora para data_agendamento na tabela agendamentos
-- Execute este script no SQL Editor do Supabase

-- Renomear a coluna
ALTER TABLE agendamentos 
RENAME COLUMN data_hora TO data_agendamento;

-- Adicionar políticas RLS se não existirem
DROP POLICY IF EXISTS "Users can view own agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Users can insert own agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Users can update own agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Users can delete own agendamentos" ON agendamentos;

-- SELECT: Usuários podem ver agendamentos da sua oficina
CREATE POLICY "Users can view own agendamentos" ON agendamentos
  FOR SELECT USING (auth.uid() = oficina_id);

-- INSERT: Usuários podem inserir agendamentos na sua oficina
CREATE POLICY "Users can insert own agendamentos" ON agendamentos
  FOR INSERT WITH CHECK (auth.uid() = oficina_id);

-- UPDATE: Usuários podem atualizar agendamentos da sua oficina
CREATE POLICY "Users can update own agendamentos" ON agendamentos
  FOR UPDATE USING (auth.uid() = oficina_id);

-- DELETE: Usuários podem deletar agendamentos da sua oficina
CREATE POLICY "Users can delete own agendamentos" ON agendamentos
  FOR DELETE USING (auth.uid() = oficina_id);
