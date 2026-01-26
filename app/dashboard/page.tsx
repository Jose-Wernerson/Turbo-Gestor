import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, CreditCard, TrendingUp, Video, User, AlertTriangle, Bell } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
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

  const receitaTotal = faturasRecebidas?.reduce((acc, f) => acc + (f.valor_total || 0), 0) || 0;

  // Despesas (simular por enquanto)
  const despesas = receitaTotal * 0.35;
  const margemLucro = receitaTotal - despesas;
  const margemPorcentagem = receitaTotal > 0 ? ((margemLucro / receitaTotal) * 100).toFixed(1) : 0;

  // Agendamentos de hoje
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const { data: agendamentosHoje } = await supabase
    .from("agendamentos")
    .select(`
      id,
      data_agendamento,
      observacoes,
      clientes (nome)
    `)
    .eq("oficina_id", user.id)
    .gte("data_agendamento", hoje.toISOString())
    .lt("data_agendamento", amanha.toISOString())
    .order("data_agendamento", { ascending: true })
    .limit(3);

  // Produtos com estoque baixo
  const { data: todosProdutos } = await supabase
    .from("produtos")
    .select("id, nome, quantidade, quantidade_minima")
    .eq("oficina_id", user.id);

  const produtosEstoqueBaixo = todosProdutos?.filter(
    (p) => p.quantidade <= p.quantidade_minima
  ).slice(0, 3) || [];

  // Clientes recentes
  const { data: clientesRecentes } = await supabase
    .from("clientes")
    .select("id, nome, email, created_at")
    .eq("oficina_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Calcular taxa de ocupação (agendamentos / slots disponíveis)
  const { data: totalAgendamentosMes } = await supabase
    .from("agendamentos")
    .select("id", { count: "exact" })
    .eq("oficina_id", user.id)
    .gte("data_agendamento", inicioMes.toISOString())
    .lte("data_agendamento", fimMes.toISOString());

  const diasUteis = 22; // aproximadamente
  const slotsDisponiveis = diasUteis * 8; // 8 slots por dia
  const taxaOcupacao = Math.min(((totalAgendamentosMes?.length || 0) / slotsDisponiveis) * 100, 100).toFixed(0);

  function getStatusBadge(quantidade: number, minima: number) {
    const percentual = (quantidade / minima) * 100;
    if (percentual <= 30) return { label: "CRÍTICO", class: "bg-red-500 text-white" };
    if (percentual <= 60) return { label: "ALTO", class: "bg-orange-500 text-white" };
    return { label: "MÉDIO", class: "bg-yellow-500 text-white" };
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo(a), {user.email?.split('@')[0]}
        </p>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Resumo Financeiro */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-white">Resumo Financeiro</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Receita Total</p>
                <p className="text-lg font-bold text-white">${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <span className="text-xs font-medium text-emerald-500">↑ +20,1%</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-pink-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Despesas</p>
                <p className="text-lg font-bold text-white">${despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <span className="text-xs font-medium text-pink-500">↓ -5,4%</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Margem de Lucro</p>
                <p className="text-lg font-bold text-white">${margemLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <span className="text-xs font-medium text-emerald-500">↑ +{margemPorcentagem}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos de Hoje */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-white">Agendamentos de Hoje</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Video className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {agendamentosHoje && agendamentosHoje.length > 0 ? (
              agendamentosHoje.map((agendamento) => (
                <div key={agendamento.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {Array.isArray(agendamento.clientes)
                        ? (agendamento.clientes[0]?.nome || "Cliente")
                        : (agendamento.clientes?.nome || "Cliente")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {agendamento.observacoes || "Serviço agendado"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-white">
                      {formatTime(agendamento.data_agendamento)}
                    </p>
                    <p className="text-xs text-slate-400">1h</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum agendamento hoje</p>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Baixo Estoque */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-white">Alertas de Baixo Estoque</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {produtosEstoqueBaixo.length > 0 ? (
              produtosEstoqueBaixo.map((produto) => {
                const status = getStatusBadge(produto.quantidade, produto.quantidade_minima);
                const percentual = Math.min((produto.quantidade / produto.quantidade_minima) * 100, 100);
                
                return (
                  <div key={produto.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{produto.nome}</p>
                          <p className="text-xs text-slate-400">Mín: {produto.quantidade_minima} un.</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500" 
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">→ {produto.quantidade} un.</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Estoque em níveis adequados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid Secundário */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Clientes Recentes */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-white">Clientes Recentes</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-pink-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientesRecentes && clientesRecentes.length > 0 ? (
              clientesRecentes.map((cliente) => (
                <div key={cliente.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-pink-500/10">
                    <AvatarFallback className="bg-pink-500 text-white text-sm">
                      {getInitials(cliente.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{cliente.nome}</p>
                    <p className="text-xs text-slate-400 truncate">{cliente.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 font-medium">
                    Ativo
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum cliente cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Indicadores de Desempenho */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-white">Indicadores de Desempenho</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Taxa de Ocupação</p>
                <span className="text-2xl font-bold text-white">{taxaOcupacao}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" 
                  style={{ width: `${taxaOcupacao}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Satisfação do Cliente</p>
                <span className="text-2xl font-bold text-white">94%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                  style={{ width: "94%" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Tempo Médio de Serviço</p>
                <span className="text-2xl font-bold text-white">2.5h</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-white">Alertas</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center relative">
              <Bell className="h-5 w-5 text-red-500" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {produtosEstoqueBaixo.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {produtosEstoqueBaixo.length > 0 ? (
              produtosEstoqueBaixo.slice(0, 2).map((produto) => (
                <div key={produto.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Estoque crítico</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {produto.nome} com apenas {produto.quantidade} unidades
                    </p>
                    <p className="text-xs text-slate-500 mt-1">5 min atrás</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Sistema atualizado</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Novas funcionalidades disponíveis
                    </p>
                    <p className="text-xs text-slate-500 mt-1">1h atrás</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
