# Scripts SQL para executar no Supabase

Execute estes scripts no SQL Editor do Supabase na ordem abaixo:

## ✅ Scripts que devem estar executados:

### 1. Schema inicial
- [ ] `schema.sql` - Estrutura completa do banco

### 2. Correções de RLS (Row Level Security)
- [ ] `fix-clientes-rls.sql` - Políticas para clientes
- [ ] `fix-veiculos-rls.sql` - Políticas para veículos  
- [ ] `fix-agendamentos.sql` - Renomeia coluna + políticas
- [ ] `fix-produtos-rls.sql` - Políticas para produtos
- [ ] `fix-faturas-rls.sql` - Políticas para faturas

### 3. Adições de colunas
- [ ] `add-veiculo-tipo.sql` - Adiciona coluna 'tipo' em veículos
- [ ] `add-plano-column.sql` - Adiciona coluna 'plano' em oficinas
- [ ] `add-layout-column.sql` - Adiciona coluna 'layout' em oficinas

## 📋 Checklist de verificação:

Para verificar se está tudo OK, execute:

```sql
-- 1. Verificar se oficinas tem as colunas plano e layout
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'oficinas' 
AND column_name IN ('plano', 'layout');

-- 2. Verificar se veículos tem coluna tipo
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'veiculos' 
AND column_name = 'tipo';

-- 3. Verificar políticas RLS nas tabelas principais
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('clientes', 'veiculos', 'servicos', 'agendamentos', 'produtos', 'faturas', 'oficinas')
ORDER BY tablename;

-- 4. Verificar se sua oficina está configurada
SELECT id, nome, plano, layout FROM oficinas WHERE id = auth.uid();
```

## 🔧 Se algo estiver faltando:

Execute os scripts correspondentes em ordem.
