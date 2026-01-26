-- Turbo Gestor Database Schema
-- Execute este script no SQL Editor do Supabase

-- Tabela de Usuários (já existe no Supabase Auth, mas podemos estender)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  tipo VARCHAR(20) DEFAULT 'admin', -- admin, mecânico, atendente
  oficina_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Oficinas (multi-tenant)
CREATE TABLE IF NOT EXISTS oficinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(9),
  plano VARCHAR(20) DEFAULT 'free', -- free, basic, premium
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(9),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INTEGER NOT NULL,
  placa VARCHAR(10) NOT NULL,
  cor VARCHAR(50),
  chassi VARCHAR(50),
  km_atual INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Serviços (catálogo)
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100), -- revisão, manutenção, reparo, etc
  preco DECIMAL(10,2) NOT NULL,
  duracao_estimada INTEGER, -- em minutos
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id),
  veiculo_id UUID REFERENCES veiculos(id),
  servico_id UUID REFERENCES servicos(id),
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_estimada INTEGER, -- em minutos
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, confirmado, em_andamento, concluido, cancelado
  observacoes TEXT,
  mecanico_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos/Peças (Estoque)
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  codigo_barras VARCHAR(50),
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_minima INTEGER DEFAULT 5,
  preco_custo DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  fornecedor VARCHAR(255),
  localizacao VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Ordens de Serviço
CREATE TABLE IF NOT EXISTS ordens_servico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE CASCADE,
  numero VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  veiculo_id UUID REFERENCES veiculos(id),
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_previsao TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'aberta', -- aberta, em_andamento, aguardando_pecas, concluida, cancelada
  km_entrada INTEGER,
  observacoes TEXT,
  diagnostico TEXT,
  mecanico_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens da Ordem de Serviço (Serviços)
CREATE TABLE IF NOT EXISTS os_servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id),
  descricao VARCHAR(255),
  quantidade INTEGER DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens da Ordem de Serviço (Produtos/Peças)
CREATE TABLE IF NOT EXISTS os_produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  descricao VARCHAR(255),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Faturas
CREATE TABLE IF NOT EXISTS faturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE CASCADE,
  numero VARCHAR(50) UNIQUE NOT NULL,
  ordem_servico_id UUID REFERENCES ordens_servico(id),
  cliente_id UUID REFERENCES clientes(id),
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_vencimento TIMESTAMP WITH TIME ZONE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_final DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, paga, vencida, cancelada
  forma_pagamento VARCHAR(50), -- dinheiro, cartao, pix, boleto
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- entrada, saida, ajuste
  quantidade INTEGER NOT NULL,
  motivo VARCHAR(255),
  ordem_servico_id UUID REFERENCES ordens_servico(id),
  usuario_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_clientes_oficina ON clientes(oficina_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_oficina ON veiculos(oficina_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente ON veiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_oficina ON agendamentos(oficina_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_produtos_oficina ON produtos(oficina_id);
CREATE INDEX IF NOT EXISTS idx_os_oficina ON ordens_servico(oficina_id);
CREATE INDEX IF NOT EXISTS idx_faturas_oficina ON faturas(oficina_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ajustar conforme necessidade)
-- Exemplo: usuários só podem ver dados da sua oficina
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
