export const PLAN_LIMITS = {
  trial: {
    name: "Teste Grátis",
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
    name: "Básico",
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
    name: "Profissional",
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
    name: "Business",
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

export type PlanKey = keyof typeof PLAN_LIMITS;
export type ResourceKey = "clientes" | "veiculos" | "produtos" | "servicos" | "usuarios";

export interface LimitCheckResult {
  allowed: boolean;
  message?: string;
  limit?: number;
  current?: number;
}

export function checkLimit(
  plano: string,
  resource: string,
  currentCount: number
): LimitCheckResult {
  const limits = PLAN_LIMITS[plano as PlanKey];

  if (!limits) {
    return {
      allowed: false,
      message: "Plano inválido",
    };
  }

  const limit = limits[resource as keyof typeof limits];

  // Verificar recursos booleanos (layouts, api, etc)
  if (typeof limit === "boolean") {
    return {
      allowed: limit,
      message: limit
        ? undefined
        : `Este recurso está disponível apenas no plano Business`,
    };
  }

  // Verificar limites numéricos
  if (typeof limit === "number") {
    if (currentCount >= limit) {
      const planName = limits.name;
      const resourceName = getResourceName(resource);

      return {
        allowed: false,
        message: `Você atingiu o limite de ${limit} ${resourceName} do plano ${planName}`,
        limit,
        current: currentCount,
      };
    }

    return {
      allowed: true,
      limit,
      current: currentCount,
    };
  }

  return { allowed: true };
}

function getResourceName(resource: string): string {
  const names: Record<string, string> = {
    clientes: "clientes",
    veiculos: "veículos",
    produtos: "produtos",
    servicos: "serviços",
    usuarios: "usuários",
  };
  return names[resource] || resource;
}

export function getPlanLimits(plano: string) {
  return PLAN_LIMITS[plano as PlanKey] || PLAN_LIMITS.basico;
}

export function isTrialExpired(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) < new Date();
}

export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const now = new Date();
  const end = new Date(trialEndsAt);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
