import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Users, DollarSign, TrendingUp, Clock, CreditCard, AlertTriangle } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Token secreto - ALTERE ESTE VALOR!
const ADMIN_TOKEN = "turbo102024"; // Mude para algo secreto!

export default async function AdminDashboard({ params }: { params: { token: string } }) {
  // Verificar token de acesso
  if (params.token !== ADMIN_TOKEN) {
    redirect("/");
  }

  const supabase = createServerSupabaseClient();

  // Buscar todas as oficinas
  const { data: oficinas } = await supabase
    .from("oficinas")
    .select("*")
    .order("created_at", { ascending: false });

  if (!oficinas) {
    return <div>Erro ao carregar dados</div>;
  }

  // Calcular estatísticas
  const totalContas = oficinas.length;
  
  const contasEmTrial = oficinas.filter(o => {
    const trialEndsAt = o.trial_ends_at;
    const hasSubscription = o.stripe_subscription_id;
    const isInTrial = trialEndsAt 
      ? new Date(trialEndsAt) > new Date()
      : !hasSubscription;
    return isInTrial;
  }).length;

  const contasPagas = oficinas.filter(o => o.stripe_subscription_id).length;

  // Distribuição por plano
  const planoBasico = oficinas.filter(o => o.plano === "basico").length;
  const planoProfissional = oficinas.filter(o => o.plano === "profissional").length;
  const planoBusiness = oficinas.filter(o => o.plano === "business").length;

  // Receita mensal estimada (apenas assinaturas ativas)
  const receitaMensal = oficinas.reduce((acc, o) => {
    if (!o.stripe_subscription_id) return acc;
    if (o.plano === "basico") return acc + 97;
    if (o.plano === "profissional") return acc + 197;
    if (o.plano === "business") return acc + 500; // valor estimado
    return acc;
  }, 0);

  // Trials expirando em 3 dias
  const trialsExpirando = oficinas.filter(o => {
    if (!o.trial_ends_at) return false;
    const daysRemaining = Math.floor((new Date(o.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining >= 0 && daysRemaining <= 3;
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white">🔐 Painel Admin - Turbo Gestor</h1>
          <p className="text-slate-400 mt-2">Dashboard exclusivo do administrador</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total de Contas</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalContas}</div>
              <p className="text-xs text-slate-400">oficinas cadastradas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Receita Mensal</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">R$ {receitaMensal.toFixed(2)}</div>
              <p className="text-xs text-slate-400">{contasPagas} assinaturas ativas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Em Trial</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{contasEmTrial}</div>
              <p className="text-xs text-slate-400">período de teste</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Trials Expirando</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{trialsExpirando}</div>
              <p className="text-xs text-slate-400">nos próximos 3 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por Plano */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Plano Básico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{planoBasico}</div>
              <p className="text-sm text-slate-400 mt-2">
                R$ 97/mês • {Math.round((planoBasico / totalContas) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Plano Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">{planoProfissional}</div>
              <p className="text-sm text-slate-400 mt-2">
                R$ 197/mês • {Math.round((planoProfissional / totalContas) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Plano Business</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{planoBusiness}</div>
              <p className="text-sm text-slate-400 mt-2">
                Personalizado • {Math.round((planoBusiness / totalContas) * 100)}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Todas as Contas */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Todas as Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {oficinas.map((oficina) => {
                const trialEndsAt = oficina.trial_ends_at;
                const hasSubscription = oficina.stripe_subscription_id;
                const isInTrial = trialEndsAt 
                  ? new Date(trialEndsAt) > new Date()
                  : !hasSubscription;
                
                const daysRemaining = trialEndsAt 
                  ? Math.floor((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <div
                    key={oficina.id}
                    className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-500">
                          {oficina.nome_oficina?.substring(0, 2).toUpperCase() || "??"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{oficina.nome_oficina || "Sem nome"}</p>
                        <p className="text-sm text-slate-400">{oficina.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-xs text-slate-400">Plano</p>
                        <p className="text-sm font-medium text-white capitalize">{oficina.plano}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <p className={`text-sm font-medium ${isInTrial ? 'text-yellow-500' : 'text-emerald-500'}`}>
                          {isInTrial ? (daysRemaining ? `Trial (${daysRemaining}d)` : "Trial") : "Pago"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Cadastro</p>
                        <p className="text-sm text-slate-300">
                          {new Date(oficina.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {oficina.trial_ends_at && isInTrial && (
                        <div>
                          <p className="text-xs text-slate-400">Trial termina</p>
                          <p className="text-sm text-slate-300">
                            {new Date(oficina.trial_ends_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-6">
          <p>🔒 Painel protegido • Mantenha este link em segredo</p>
        </div>
      </div>
    </div>
  );
}
