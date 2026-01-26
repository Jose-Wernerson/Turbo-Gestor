"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function SuccessNotification({ plano }: { plano: string }) {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "🎉 Pagamento confirmado!",
      description: `Seu plano foi atualizado para ${plano.charAt(0).toUpperCase() + plano.slice(1)} com sucesso!`,
      duration: 5000,
    });

    // Limpar URL
    router.replace("/dashboard/planos");
  }, [plano, toast, router]);

  return null;
}
