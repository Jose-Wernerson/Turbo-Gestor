"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar as CalendarIcon, Clock, User, Car, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AgendamentoForm } from "@/components/agendamento-form";

export default function AgendamentosPage() {
  const { toast } = useToast();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  async function loadAgendamentos() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          *,
          clientes (nome),
          veiculos (placa, marca, modelo),
          servicos (nome, preco)
        `)
        .eq("oficina_id", user.id)
        .order("data_agendamento", { ascending: true });

      if (error) throw error;

      setAgendamentos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar agendamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

    try {
      const { error } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Agendamento excluído com sucesso",
      });

      loadAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir agendamento",
        variant: "destructive",
      });
    }
  }

  function handleEdit(agendamento: any) {
    setSelectedAgendamento(agendamento);
    setDialogOpen(true);
  }

  function handleNew() {
    setSelectedAgendamento(null);
    setDialogOpen(true);
  }

  useEffect(() => {
    loadAgendamentos();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-500";
      case "em_andamento":
        return "bg-yellow-500";
      case "concluido":
        return "bg-green-500";
      case "cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "em_andamento":
        return "Em Andamento";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos de serviços
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Agendamentos List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      ) : agendamentos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum agendamento cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {agendamentos.map((agendamento) => {
            const { date, time } = formatDateTime(agendamento.data_agendamento);
            return (
              <Card key={agendamento.id} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center min-w-[100px] bg-blue-500/10 rounded-lg p-3">
                      <CalendarIcon className="h-4 w-4 text-blue-500 mb-1" />
                      <span className="text-sm font-medium text-slate-300">{date}</span>
                      <Clock className="h-4 w-4 text-blue-500 mt-2 mb-1" />
                      <span className="text-lg font-bold text-white">{time}</span>
                    </div>
                    
                    <div className={`w-1 h-20 rounded ${getStatusColor(agendamento.status)}`} />
                    
                    <div className="flex-1 grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Cliente</p>
                          <p className="font-medium text-white">{Array.isArray(agendamento.clientes)
                            ? (agendamento.clientes[0]?.nome || "N/A")
                            : (agendamento.clientes?.nome || "N/A")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Car className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Veículo</p>
                          <p className="font-medium text-white text-sm">
                            {agendamento.veiculos?.placa || "N/A"} - {agendamento.veiculos?.marca} {agendamento.veiculos?.modelo}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-slate-400">Serviço</p>
                        <p className="font-medium text-white">{agendamento.servicos?.nome || "N/A"}</p>
                        <p className="text-sm text-emerald-500 font-medium">
                          R$ {agendamento.servicos?.preco?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(agendamento.status)}`}>
                        {getStatusLabel(agendamento.status)}
                      </span>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEdit(agendamento)}
                          className="border-slate-600 hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4 text-slate-300" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDelete(agendamento.id)}
                          className="border-slate-600 hover:bg-slate-700"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {agendamento.observacoes && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Observações:</p>
                      <p className="text-sm text-slate-300">{agendamento.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AgendamentoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agendamento={selectedAgendamento}
        onSuccess={loadAgendamentos}
      />
    </div>
  );
}
