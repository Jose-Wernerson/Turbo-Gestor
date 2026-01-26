import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, DollarSign, Calendar, Package, Wrench } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function RelatoriosPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Período do mês atual
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Receita do mês
  const { data: faturasRecebidas } = await supabase
    .from("faturas")
    .select("valor_total")
    .eq("oficina_id", user.id)
    .eq("status", "paga")
    .gte("created_at", inicioMes.toISOString())
    .lte("created_at", fimMes.toISOString());

  const receitaMensal = faturasRecebidas?.reduce((acc, f) => acc + (f.valor_total || 0), 0) || 0;

  // Clientes atendidos no mês
  const { data: agendamentosMes } = await supabase
    .from("agendamentos")
    .select("cliente_id, status")
    .eq("oficina_id", user.id)
    .gte("data_agendamento", inicioMes.toISOString())
    .lte("data_agendamento", fimMes.toISOString());

  const clientesAtendidos = new Set(agendamentosMes?.map(a => a.cliente_id)).size;

  // Agendamentos realizados
  const totalAgendamentos = agendamentosMes?.length || 0;

  // Ticket médio
  const ticketMedio = totalAgendamentos > 0 ? receitaMensal / totalAgendamentos : 0;

  // Serviços mais realizados
  const { data: servicosRealizados } = await supabase
    .from("agendamentos")
    .select(`
      servico_id,
      servicos (nome)
    `)
    .eq("oficina_id", user.id)
    .gte("data_agendamento", inicioMes.toISOString())
    .lte("data_agendamento", fimMes.toISOString());

  const servicosCount: Record<string, { nome: string; count: number }> = {};
  servicosRealizados?.forEach(item => {
    const nome = Array.isArray(item.servicos)
      ? ((item.servicos as { nome?: string }[])[0]?.nome || "Sem serviço")
      : ((item.servicos as { nome?: string } | undefined)?.nome || "Sem serviço");
    if (!servicosCount[nome]) {
      servicosCount[nome] = { nome, count: 0 };
    }
    servicosCount[nome].count++;
  });

  const topServicos = Object.values(servicosCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxServicos = topServicos[0]?.count || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">
          Análises e insights do seu negócio
        </p>
      </div>

      {/* Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Receita Mensal</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {receitaMensal.toFixed(2)}</div>
            <p className="text-xs text-slate-400">
              Faturas pagas neste mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Clientes Atendidos</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{clientesAtendidos}</div>
            <p className="text-xs text-slate-400">
              Clientes únicos neste mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Agendamentos</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalAgendamentos}</div>
            <p className="text-xs text-slate-400">
              Realizados neste mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Ticket Médio</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {ticketMedio.toFixed(2)}</div>
            <p className="text-xs text-slate-400">
              Por agendamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Serviços Mais Realizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topServicos.length > 0 ? (
              topServicos.map((servico, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-purple-500/10 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="text-sm font-medium text-white">{servico.nome}</span>
                    </div>
                    <span className="text-sm text-slate-400">{servico.count}x</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(servico.count / maxServicos) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nenhum serviço realizado neste mês</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Status dos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Agendados</span>
                <span className="text-sm text-slate-400">
                  {agendamentosMes?.filter((a: any) => a.status === "agendado").length || 0}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: totalAgendamentos > 0
                      ? `${((agendamentosMes?.filter((a: any) => a.status === "agendado").length || 0) / totalAgendamentos) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Concluídos</span>
                <span className="text-sm text-slate-400">
                  {agendamentosMes?.filter((a: any) => a.status === "concluido").length || 0}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: totalAgendamentos > 0
                      ? `${((agendamentosMes?.filter((a: any) => a.status === "concluido").length || 0) / totalAgendamentos) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Cancelados</span>
                <span className="text-sm text-slate-400">
                  {agendamentosMes?.filter((a: any) => a.status === "cancelado").length || 0}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: totalAgendamentos > 0
                      ? `${((agendamentosMes?.filter((a: any) => a.status === "cancelado").length || 0) / totalAgendamentos) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
