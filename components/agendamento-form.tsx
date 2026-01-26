"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AgendamentoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento?: any;
  onSuccess: () => void;
}

export function AgendamentoForm({ open, onOpenChange, agendamento, onSuccess }: AgendamentoFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cliente_id: "",
    veiculo_id: "",
    servico_id: "",
    data_agendamento: "",
    hora_agendamento: "",
    status: "agendado",
    observacoes: "",
  });

  useEffect(() => {
    if (open) {
      loadClientes();
      loadServicos();
      if (agendamento) {
        const dataHora = new Date(agendamento.data_agendamento);
        const data = dataHora.toISOString().split('T')[0];
        const hora = dataHora.toTimeString().slice(0, 5);
        
        setFormData({
          cliente_id: agendamento.cliente_id || "",
          veiculo_id: agendamento.veiculo_id || "",
          servico_id: agendamento.servico_id || "",
          data_agendamento: data,
          hora_agendamento: hora,
          status: agendamento.status || "agendado",
          observacoes: agendamento.observacoes || "",
        });
        
        if (agendamento.cliente_id) {
          loadVeiculos(agendamento.cliente_id);
        }
      } else {
        setFormData({
          cliente_id: "",
          veiculo_id: "",
          servico_id: "",
          data_agendamento: "",
          hora_agendamento: "",
          status: "agendado",
          observacoes: "",
        });
        setVeiculos([]);
      }
    }
  }, [open, agendamento]);

  async function loadClientes() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome")
        .eq("oficina_id", user.id)
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar clientes:", error);
    }
  }

  async function loadVeiculos(clienteId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("veiculos")
        .select("id, placa, marca, modelo")
        .eq("cliente_id", clienteId)
        .eq("oficina_id", user.id)
        .order("placa");

      if (error) throw error;
      setVeiculos(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar veículos:", error);
    }
  }

  async function loadServicos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("servicos")
        .select("id, nome, preco")
        .eq("oficina_id", user.id)
        .order("nome");

      if (error) throw error;
      setServicos(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar serviços:", error);
    }
  }

  function handleClienteChange(clienteId: string) {
    setFormData({ ...formData, cliente_id: clienteId, veiculo_id: "" });
    setVeiculos([]);
    if (clienteId) {
      loadVeiculos(clienteId);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Validar data não pode ser passada
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataAgendamento = new Date(formData.data_agendamento);
      dataAgendamento.setHours(0, 0, 0, 0);

      if (dataAgendamento < hoje) {
        toast({
          title: "Data inválida",
          description: "Não é possível agendar em datas passadas.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validar horário entre 07:00 e 18:00
      const [hora, minuto] = formData.hora_agendamento.split(':').map(Number);
      if (hora < 7 || hora >= 18) {
        toast({
          title: "Horário inválido",
          description: "O horário deve ser entre 07:00 e 18:00.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const dataHoraAgendamento = new Date(`${formData.data_agendamento}T${formData.hora_agendamento}`);

      const agendamentoData = {
        cliente_id: formData.cliente_id,
        veiculo_id: formData.veiculo_id,
        servico_id: formData.servico_id,
        data_agendamento: dataHoraAgendamento.toISOString(),
        status: formData.status,
        observacoes: formData.observacoes || null,
        oficina_id: user.id,
      };

      if (agendamento) {
        const { error } = await supabase
          .from("agendamentos")
          .update(agendamentoData)
          .eq("id", agendamento.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Agendamento atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("agendamentos")
          .insert(agendamentoData);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Agendamento criado com sucesso",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar agendamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{agendamento ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>
            {agendamento ? "Atualize as informações do agendamento" : "Cadastre um novo agendamento"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="cliente_id" className="text-sm font-medium">
                  Cliente *
                </label>
                <select
                  id="cliente_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.cliente_id}
                  onChange={(e) => handleClienteChange(e.target.value)}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="veiculo_id" className="text-sm font-medium">
                  Veículo *
                </label>
                <select
                  id="veiculo_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.veiculo_id}
                  onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                  required
                  disabled={!formData.cliente_id}
                >
                  <option value="">Selecione um veículo</option>
                  {veiculos.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.marca} {veiculo.modelo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="servico_id" className="text-sm font-medium">
                Serviço *
              </label>
              <select
                id="servico_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.servico_id}
                onChange={(e) => setFormData({ ...formData, servico_id: e.target.value })}
                required
              >
                <option value="">Selecione um serviço</option>
                {servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} - R$ {servico.preco.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="data_agendamento" className="text-sm font-medium">
                  Data *
                </label>
                <Input
                  id="data_agendamento"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.data_agendamento}
                  onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="hora_agendamento" className="text-sm font-medium">
                  Hora *
                </label>
                <select
                  id="hora_agendamento"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.hora_agendamento}
                  onChange={(e) => setFormData({ ...formData, hora_agendamento: e.target.value })}
                  required
                >
                  <option value="">Selecione o horário</option>
                  <option value="07:00">07:00</option>
                  <option value="07:30">07:30</option>
                  <option value="08:00">08:00</option>
                  <option value="08:30">08:30</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="12:00">12:00</option>
                  <option value="12:30">12:30</option>
                  <option value="13:00">13:00</option>
                  <option value="13:30">13:30</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                  <option value="17:00">17:00</option>
                  <option value="17:30">17:30</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status *
              </label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="agendado">Agendado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="observacoes" className="text-sm font-medium">
                Observações
              </label>
              <textarea
                id="observacoes"
                placeholder="Observações sobre o agendamento..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
