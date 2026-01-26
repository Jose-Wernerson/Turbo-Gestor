"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { checkLimit, LimitCheckResult, isTrialExpired } from "@/lib/plan-limits";

export function usePlanLimit(resource: "clientes" | "veiculos" | "produtos" | "servicos") {
  const [canAdd, setCanAdd] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [limitInfo, setLimitInfo] = useState<LimitCheckResult | null>(null);

  useEffect(() => {
    async function checkPlanLimit() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: oficina } = await supabase
          .from("oficinas")
          .select("plano, trial_ends_at, total_clientes, total_veiculos, total_produtos, total_servicos")
          .eq("id", user.id)
          .single();

        if (!oficina) {
          setLoading(false);
          return;
        }

        // Verificar se trial expirou
        if (isTrialExpired(oficina.trial_ends_at) && oficina.plano === "basico") {
          setCanAdd(false);
          setMessage("Seu período de teste expirou. Escolha um plano para continuar.");
          setLoading(false);
          return;
        }

        const columnMap: Record<string, keyof typeof oficina> = {
          clientes: "total_clientes",
          veiculos: "total_veiculos",
          produtos: "total_produtos",
          servicos: "total_servicos",
        };

        const column = columnMap[resource];
        const currentCount = (oficina[column] as number) || 0;

        const result = checkLimit(oficina.plano, resource, currentCount);

        setCanAdd(result.allowed);
        setMessage(result.message || "");
        setLimitInfo(result);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao verificar limite:", error);
        setLoading(false);
      }
    }

    checkPlanLimit();
  }, [resource]);

  return { canAdd, message, loading, limitInfo };
}
