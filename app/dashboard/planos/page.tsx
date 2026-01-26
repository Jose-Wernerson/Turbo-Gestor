import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import Link from "next/link";
import { SuccessNotification } from "./success-notification";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlanosPage({
  searchParams,
}: {
  searchParams: { success?: string; plano?: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: oficina } = await supabase
    .from("oficinas")
    .select("*")
    .eq("id", user.id)
    .single();

  // Normalizar o plano (pode vir como "Free" de contas antigas)
  let planoAtual = oficina?.plano || "basico";
  if (planoAtual.toLowerCase() === "free") {
    planoAtual = "basico";
  }
  
  const trialEndsAt = oficina?.trial_ends_at;
  const hasStripeSubscription = oficina?.stripe_subscription_id;
  
  // Verificar se está em período de teste
  // Se não tem trial_ends_at mas também não tem stripe_subscription_id, está em trial
  const isInTrial = trialEndsAt 
    ? new Date(trialEndsAt) > new Date()
    : !hasStripeSubscription; // Se não tem trial_ends_at e não tem assinatura, está em trial indefinido
    
  const trialDaysRemaining = trialEndsAt && isInTrial
    ? Math.floor((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : isInTrial ? null : 0; // null = trial sem data definida

  const planos = [
    {
      nome: "Básico",
      valor: "R$ 97",
      periodo: "/mês",
      descricao: "Ideal para oficinas pequenas começando a se organizar",
      features: [
        "Até 50 clientes",
        "Até 30 veículos",
        "Gestão de serviços",
        "Agendamentos básicos",
        "1 usuário",
        "Suporte por email",
      ],
      id: "basico",
      destaque: false,
    },
    {
      nome: "Profissional",
      valor: "R$ 197",
      periodo: "/mês",
      descricao: "Para oficinas em crescimento que precisam de mais recursos",
      features: [
        "Clientes ilimitados",
        "Veículos ilimitados",
        "Gestão completa de estoque",
        "Agendamentos avançados",
        "Até 3 usuários",
        "Relatórios detalhados",
        "Suporte prioritário",
        "Integração WhatsApp",
      ],
      id: "profissional",
      destaque: true,
    },
    {
      nome: "Business",
      valor: "Personalizado",
      periodo: "",
      descricao: "Solução completa para grandes oficinas e redes",
      features: [
        "Tudo do Profissional",
        "Usuários ilimitados",
        "Multi-filial",
        "Layouts personalizáveis",
        "API de integração",
        "Suporte 24/7",
        "Treinamento da equipe",
        "Gerente de conta dedicado",
      ],
      id: "business",
      destaque: false,
    },
  ];

  return (
    <div className="space-y-6">
      {searchParams.success === "true" && searchParams.plano && (
        <SuccessNotification plano={searchParams.plano} />
      )}
      
      <div>
        <h1 className="text-3xl font-bold">Planos e Assinaturas</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e escolha o plano ideal
        </p>
      </div>

      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
          <CardDescription>
            {isInTrial ? (
              <>
                Você está em <span className="font-semibold">período de teste de 7 dias</span> do plano{" "}
                <span className="font-semibold capitalize">{planoAtual}</span>
              </>
            ) : (
              <>
                Você está no plano <span className="font-semibold capitalize">{planoAtual}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status da assinatura</p>
              <p className="text-lg font-semibold text-green-600">
                {isInTrial 
                  ? trialDaysRemaining 
                    ? `Trial (${trialDaysRemaining} dias restantes)` 
                    : "Trial Ativo"
                  : "Ativa"
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isInTrial ? "Trial termina em" : "Próxima cobrança"}
              </p>
              <p className="text-lg font-semibold">
                {isInTrial 
                  ? trialEndsAt 
                    ? new Date(trialEndsAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : "Assine um plano"
                  : "25 de fevereiro de 2026"
                }
              </p>
            </div>
          </div>
          {isInTrial && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-600">
                {trialDaysRemaining 
                  ? `💡 Aproveite o período de teste grátis! Após ${trialDaysRemaining} dias, você precisará escolher um plano para continuar usando o Turbo Gestor.`
                  : "💡 Você está usando o Turbo Gestor gratuitamente. Assine um plano para continuar aproveitando todos os recursos!"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade de Planos */}
      <div className="grid gap-6 md:grid-cols-3">
        {planos.map((plano) => {
          const isAtual = plano.id === planoAtual && !isInTrial;
          const isPossivel = 
            isInTrial || // Durante trial, todos os upgrades estão disponíveis
            (planoAtual === "basico" && plano.id !== "basico") ||
            (planoAtual === "profissional" && plano.id === "business") ||
            (planoAtual === "business" && plano.id !== "business");

          return (
            <Card
              key={plano.id}
              className={
                plano.destaque
                  ? "border-2 border-primary relative"
                  : isAtual
                  ? "border-2 border-green-600"
                  : ""
              }
            >
              {plano.destaque && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Mais Popular
                </div>
              )}
              {isAtual && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Plano Atual
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plano.nome}</CardTitle>
                <CardDescription>{plano.descricao}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plano.valor}</span>
                  {plano.periodo && (
                    <span className="text-muted-foreground">{plano.periodo}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plano.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isAtual ? (
                  <Button className="w-full" disabled>
                    Plano Atual
                  </Button>
                ) : isPossivel ? (
                  <Link href={`/dashboard/planos/upgrade?plano=${plano.id}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      {plano.id === "business" ? "Falar com Vendas" : "Fazer Upgrade"}
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Não Disponível
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Posso cancelar a qualquer momento?</h3>
            <p className="text-sm text-muted-foreground">
              Sim, você pode cancelar sua assinatura a qualquer momento. Seus dados ficarão salvos por 30 dias.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Como funciona o upgrade?</h3>
            <p className="text-sm text-muted-foreground">
              Ao fazer upgrade, você paga apenas a diferença proporcional até a próxima cobrança.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Posso fazer downgrade?</h3>
            <p className="text-sm text-muted-foreground">
              Sim, o downgrade será efetivado na próxima renovação para não perder o período já pago.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
