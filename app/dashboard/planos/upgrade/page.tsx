"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const plano = searchParams.get("plano");
  const [loading, setLoading] = useState(false);

  const planosInfo: Record<string, any> = {
    profissional: {
      nome: "Profissional",
      valor: "R$ 197",
      periodo: "/mês",
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
    },
    business: {
      nome: "Business",
      valor: "Personalizado",
      periodo: "",
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
    },
  };

  const planoSelecionado = plano ? planosInfo[plano] : null;

  async function handleConfirmarUpgrade() {
    if (!plano) return;

    setLoading(true);
    try {
      // Criar sessão de checkout do Stripe
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plano }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      // Redirecionar para o checkout do Stripe
      const stripe = await stripePromise;
      if (stripe && data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  if (!planoSelecionado) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Plano não encontrado</h1>
          <p className="text-muted-foreground">
            O plano selecionado não existe
          </p>
        </div>
        <Link href="/dashboard/planos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos planos
          </Button>
        </Link>
      </div>
    );
  }

  // Se for Business, mostrar página de contato
  if (plano === "business") {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/dashboard/planos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Plano Business - Contato Comercial</CardTitle>
            <CardDescription>
              Entre em contato com nossa equipe de vendas para uma proposta personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">O que está incluso:</h3>
                <ul className="space-y-2">
                  {planoSelecionado.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold">Entre em contato:</h3>
                <div className="space-y-2 text-sm">
                  <p>📧 Email: <a href="mailto:vendas@turbogestor.com" className="text-primary hover:underline">vendas@turbogestor.com</a></p>
                  <p>📱 WhatsApp: <a href="https://wa.me/5511999999999" className="text-primary hover:underline">(11) 99999-9999</a></p>
                  <p>📞 Telefone: <a href="tel:+551140004000" className="text-primary hover:underline">(11) 4000-4000</a></p>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Agendar Demonstração
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/planos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Upgrade</CardTitle>
            <CardDescription>
              Você está fazendo upgrade para o plano {planoSelecionado.nome}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{planoSelecionado.nome}</h3>
                  <p className="text-sm text-muted-foreground">Plano mensal</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{planoSelecionado.valor}</p>
                  {planoSelecionado.periodo && (
                    <p className="text-sm text-muted-foreground">{planoSelecionado.periodo}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Recursos inclusos:</h4>
                <ul className="space-y-2">
                  {planoSelecionado.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>🔒 Pagamento Seguro:</strong> Você será redirecionado para a página de pagamento segura do Stripe. Aceitamos todas as principais bandeiras de cartão.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard/planos" className="flex-1">
                <Button variant="outline" className="w-full" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                onClick={handleConfirmarUpgrade}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Ir para Pagamento"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
