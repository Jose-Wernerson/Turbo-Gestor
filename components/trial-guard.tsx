"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [trialStatus, setTrialStatus] = useState<"loading" | "active" | "expired">("loading");

  useEffect(() => {
    async function checkTrial() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: oficina } = await supabase
        .from("oficinas")
        .select("trial_ends_at, stripe_subscription_id")
        .eq("id", user.id)
        .single();

      const trialEndsAt = oficina?.trial_ends_at;
      const hasSubscription = oficina?.stripe_subscription_id;
      
      const trialExpired = trialEndsAt 
        ? new Date(trialEndsAt) < new Date()
        : false;

      // Se trial expirou e não tem assinatura
      if (trialExpired && !hasSubscription) {
        setTrialStatus("expired");
      } else {
        setTrialStatus("active");
      }
    }

    checkTrial();
  }, []);

  // Mostrar loading
  if (trialStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // Se trial expirou e não está na página de planos, mostrar bloqueio
  if (trialStatus === "expired" && !pathname.includes("/planos")) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-2xl w-full bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
            <CardTitle className="text-2xl text-white">Período de Teste Expirado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-slate-300">
                Seu período de teste de 7 dias terminou!
              </p>
              <p className="text-slate-400 text-sm">
                Para continuar usando o Turbo Gestor e gerenciando sua oficina, 
                escolha um dos nossos planos e tenha acesso completo a todas as funcionalidades.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-400">
                  <p className="font-semibold mb-1">Seus dados estão seguros!</p>
                  <p className="text-blue-300">
                    Todos os seus clientes, veículos e serviços cadastrados estão salvos. 
                    Assim que assinar um plano, você terá acesso imediato a tudo.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard/planos" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Ver Planos e Assinar
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  supabase.auth.signOut();
                  router.push("/login");
                }}
                className="border-slate-600"
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Trial ativo ou está na página de planos - mostrar conteúdo normal
  return <>{children}</>;
}
