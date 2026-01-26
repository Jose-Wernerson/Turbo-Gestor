# 🎯 Sistema de Funcionalidades por Plano - Turbo Gestor

## 📊 Estado Atual (O que está implementado)

### ✅ Implementado:
- Sistema de planos (básico, profissional, business)
- Detecção do plano do usuário
- Bloqueio de layouts personalizados (apenas Business)
- Páginas de upgrade
- Integração Stripe

### ❌ NÃO Implementado:
- Período de teste grátis (7 dias)
- Limites de uso por plano
- Bloqueio de funcionalidades por plano
- Contagem de uso (clientes, veículos, etc)
- Mensagens de upgrade quando atinge limite

---

## 🆓 TESTE GRÁTIS (7 dias)

### Como Deveria Funcionar:

```
NOVO CADASTRO
    ↓
PERÍODO: 7 dias
PLANO: Profissional (trial)
STATUS: trial_active
    ↓
Dia 7 → Email: "Seu teste expira amanhã"
    ↓
Dia 8 → Bloqueio + Tela: "Escolha um plano"
```

### Funcionalidades no Teste Grátis:
✅ TUDO do plano Profissional por 7 dias:
- Clientes ilimitados
- Veículos ilimitados
- Todos os 6 módulos CRUD
- Agendamentos ilimitados
- Estoque completo
- Faturas ilimitadas
- Relatórios completos

❌ NÃO inclui no teste:
- Layouts personalizados (Business)
- Múltiplas filiais (Business)
- API de integração (Business)

---

## 💎 FUNCIONALIDADES POR PLANO

### 🔵 BÁSICO (R$ 97/mês)

#### ✅ Limitações:
| Recurso | Limite |
|---------|--------|
| Clientes | 50 |
| Veículos | 100 |
| Usuários | 1 |
| Estoque (produtos) | 100 itens |
| Agendamentos/mês | 200 |
| Faturas/mês | 100 |
| Serviços cadastrados | 50 |

#### ✅ Funcionalidades:
- ✅ Gestão de Clientes (até 50)
- ✅ Gestão de Veículos (até 100)
- ✅ Gestão de Serviços (até 50)
- ✅ Agendamentos Básicos (até 200/mês)
- ✅ Estoque Simples (até 100 produtos)
- ✅ Faturas Básicas (até 100/mês)
- ✅ Relatórios Básicos (últimos 30 dias)
- ✅ Suporte por Email
- ❌ Layouts Personalizados
- ❌ Múltiplos Usuários
- ❌ Backup Automático
- ❌ WhatsApp Business

#### 🚫 Bloqueios:
Ao atingir limite, mostrar modal:
```
"Você atingiu o limite de 50 clientes do Plano Básico"
[Ver Planos] [Fazer Upgrade]
```

---

### 🟣 PROFISSIONAL (R$ 197/mês)

#### ✅ Limitações:
| Recurso | Limite |
|---------|--------|
| Clientes | Ilimitado |
| Veículos | Ilimitado |
| Usuários | 3 |
| Estoque (produtos) | Ilimitado |
| Agendamentos/mês | Ilimitado |
| Faturas/mês | Ilimitado |
| Serviços cadastrados | Ilimitado |

#### ✅ Funcionalidades:
- ✅ Tudo do Básico SEM limites
- ✅ Até 3 usuários simultâneos
- ✅ Relatórios Avançados (período customizado)
- ✅ Gráficos e Dashboards
- ✅ Backup Automático Diário
- ✅ Integração WhatsApp Business
- ✅ Suporte Prioritário
- ✅ Notificações Push
- ❌ Layouts Personalizados (Business)
- ❌ Múltiplas Filiais (Business)
- ❌ API de Integração (Business)

---

### 🟠 BUSINESS (A partir de R$ 497/mês)

#### ✅ Sem Limitações:
- ∞ Tudo ilimitado
- ∞ Usuários ilimitados
- ∞ Filiais ilimitadas

#### ✅ Funcionalidades Exclusivas:
- ✅ Tudo do Profissional
- ✅ **Layouts Personalizados** (4 opções)
- ✅ **Múltiplas Filiais**
- ✅ **API de Integração**
- ✅ **Relatórios Personalizados**
- ✅ **Suporte Dedicado 24/7**
- ✅ **Gerente de Conta**
- ✅ **Treinamento Personalizado**
- ✅ **White Label** (seu logo)
- ✅ **Prioridade em Features**

---

## 🔒 IMPLEMENTAÇÃO DE RESTRIÇÕES

### 1. Tabela de Controle de Uso

```sql
-- Adicionar na tabela oficinas
ALTER TABLE oficinas
ADD COLUMN trial_ends_at TIMESTAMP,
ADD COLUMN total_clientes INTEGER DEFAULT 0,
ADD COLUMN total_veiculos INTEGER DEFAULT 0,
ADD COLUMN total_produtos INTEGER DEFAULT 0,
ADD COLUMN total_servicos INTEGER DEFAULT 0;

-- Trigger para contar automaticamente
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
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'clientes' THEN
            UPDATE oficinas SET total_clientes = total_clientes - 1 
            WHERE id = OLD.oficina_id;
        ELSIF TG_TABLE_NAME = 'veiculos' THEN
            UPDATE oficinas SET total_veiculos = total_veiculos - 1 
            WHERE id = OLD.oficina_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contar_clientes
AFTER INSERT OR DELETE ON clientes
FOR EACH ROW EXECUTE FUNCTION atualizar_contadores();

CREATE TRIGGER trigger_contar_veiculos
AFTER INSERT OR DELETE ON veiculos
FOR EACH ROW EXECUTE FUNCTION atualizar_contadores();
```

### 2. Arquivo de Limites (lib/plan-limits.ts)

```typescript
export const PLAN_LIMITS = {
  trial: {
    clientes: 999999,
    veiculos: 999999,
    usuarios: 3,
    produtos: 999999,
    servicos: 999999,
    layouts: false,
    multiFilial: false,
    api: false,
  },
  basico: {
    clientes: 50,
    veiculos: 100,
    usuarios: 1,
    produtos: 100,
    servicos: 50,
    layouts: false,
    multiFilial: false,
    api: false,
  },
  profissional: {
    clientes: 999999,
    veiculos: 999999,
    usuarios: 3,
    produtos: 999999,
    servicos: 999999,
    layouts: false,
    multiFilial: false,
    api: false,
  },
  business: {
    clientes: 999999,
    veiculos: 999999,
    usuarios: 999999,
    produtos: 999999,
    servicos: 999999,
    layouts: true,
    multiFilial: true,
    api: true,
  },
};

export function checkLimit(
  plano: string,
  resource: string,
  currentCount: number
): { allowed: boolean; message?: string } {
  const limits = PLAN_LIMITS[plano as keyof typeof PLAN_LIMITS];
  
  if (!limits) {
    return { allowed: false, message: "Plano inválido" };
  }

  const limit = limits[resource as keyof typeof limits];
  
  if (typeof limit === 'boolean') {
    return {
      allowed: limit,
      message: limit ? undefined : `Recurso disponível apenas no plano Business`,
    };
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      message: `Você atingiu o limite de ${limit} ${resource} do plano ${plano}`,
    };
  }

  return { allowed: true };
}
```

### 3. Hook de Verificação (hooks/use-plan-limit.ts)

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkLimit } from "@/lib/plan-limits";

export function usePlanLimit(resource: string) {
  const [canAdd, setCanAdd] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPlanLimit() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: oficina } = await supabase
        .from("oficinas")
        .select("plano, total_clientes, total_veiculos, total_produtos")
        .eq("id", user.id)
        .single();

      if (!oficina) return;

      const currentCount = oficina[`total_${resource}` as keyof typeof oficina] as number;
      const result = checkLimit(oficina.plano, resource, currentCount);

      setCanAdd(result.allowed);
      setMessage(result.message || "");
      setLoading(false);
    }

    checkPlanLimit();
  }, [resource]);

  return { canAdd, message, loading };
}
```

### 4. Componente de Bloqueio

```typescript
// components/plan-limit-modal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function PlanLimitModal({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Limite do Plano Atingido
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Voltar
            </Button>
            <Link href="/dashboard/planos" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                Fazer Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 5. Uso nos Formulários

```typescript
// Exemplo: app/dashboard/clientes/cliente-form.tsx
import { usePlanLimit } from "@/hooks/use-plan-limit";
import { PlanLimitModal } from "@/components/plan-limit-modal";

export function ClienteForm() {
  const { canAdd, message } = usePlanLimit("clientes");
  const [showLimitModal, setShowLimitModal] = useState(false);

  function handleSubmit() {
    if (!canAdd) {
      setShowLimitModal(true);
      return;
    }
    // ... continuar com o cadastro
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* ... campos do formulário */}
      </form>
      
      <PlanLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        message={message}
      />
    </>
  );
}
```

---

## 📊 RESUMO COMPARATIVO

| Funcionalidade | Teste Grátis | Básico | Profissional | Business |
|----------------|--------------|--------|--------------|----------|
| Duração | 7 dias | ∞ | ∞ | ∞ |
| Clientes | ∞ | 50 | ∞ | ∞ |
| Veículos | ∞ | 100 | ∞ | ∞ |
| Usuários | 3 | 1 | 3 | ∞ |
| Estoque | ∞ | 100 | ∞ | ∞ |
| Serviços | ∞ | 50 | ∞ | ∞ |
| Relatórios | Avançado | Básico | Avançado | Personalizado |
| WhatsApp | ✅ | ❌ | ✅ | ✅ |
| Layouts | ❌ | ❌ | ❌ | ✅ |
| Multi-Filial | ❌ | ❌ | ❌ | ✅ |
| API | ❌ | ❌ | ❌ | ✅ |
| Suporte | Chat | Email | Prioritário | Dedicado 24/7 |

---

## 🎯 QUER QUE EU IMPLEMENTE ISSO?

Posso implementar agora:

1. **Período de teste grátis** (7 dias)
2. **Limites por plano** (contadores automáticos)
3. **Bloqueios de funcionalidades**
4. **Modais de upgrade** ao atingir limite
5. **Email de aviso** (teste expirando)

**Me confirma se quer que eu implemente?** 🚀
