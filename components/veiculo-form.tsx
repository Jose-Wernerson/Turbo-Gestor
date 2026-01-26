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
import { usePlanLimit } from "@/hooks/use-plan-limit";
import { PlanLimitModal } from "./plan-limit-modal";

interface VeiculoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veiculo?: any;
  onSuccess: () => void;
}

export function VeiculoForm({ open, onOpenChange, veiculo, onSuccess }: VeiculoFormProps) {
  const { toast } = useToast();
  const { canAdd, message, limitInfo } = usePlanLimit("veiculos");
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cliente_id: "",
    placa: "",
    marca: "",
    modelo: "",
    ano: "",
    cor: "",
    tipo: "carro",
  });

  useEffect(() => {
    if (open) {
      loadClientes();
      if (veiculo) {
        setFormData({
          cliente_id: veiculo.cliente_id || "",
          placa: veiculo.placa || "",
          marca: veiculo.marca || "",
          modelo: veiculo.modelo || "",
          ano: veiculo.ano?.toString() || "",
          cor: veiculo.cor || "",
          tipo: veiculo.tipo || "carro",
        });
      } else {
        setFormData({
          cliente_id: "",
          placa: "",
          marca: "",
          modelo: "",
          ano: "",
          cor: "",
          tipo: "carro",
        });
      }
    }
  }, [open, veiculo]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Verificar limite apenas ao criar novo veículo
    if (!veiculo && !canAdd) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const veiculoData = {
        cliente_id: formData.cliente_id,
        placa: formData.placa.toUpperCase(),
        marca: formData.marca,
        modelo: formData.modelo,
        ano: parseInt(formData.ano),
        cor: formData.cor,
        tipo: formData.tipo,
        oficina_id: user.id, // TODO: usar oficina_id real
      };

      if (veiculo) {
        const { error } = await supabase
          .from("veiculos")
          .update(veiculoData)
          .eq("id", veiculo.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Veículo atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("veiculos")
          .insert(veiculoData);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Veículo cadastrado com sucesso",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar veículo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{veiculo ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          <DialogDescription>
            {veiculo ? "Atualize as informações do veículo" : "Cadastre um novo veículo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="cliente_id" className="text-sm font-medium">
                Cliente *
              </label>
              <select
                id="cliente_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.cliente_id}
                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="placa" className="text-sm font-medium">
                  Placa
                </label>
                <Input
                  id="placa"
                  placeholder="ABC1D23"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="tipo" className="text-sm font-medium">
                  Tipo
                </label>
                <select
                  id="tipo"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                  <option value="caminhao">Caminhão</option>
                  <option value="van">Van</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="marca" className="text-sm font-medium">
                  Marca
                </label>
                <Input
                  id="marca"
                  placeholder="Ex: Toyota"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="modelo" className="text-sm font-medium">
                  Modelo
                </label>
                <Input
                  id="modelo"
                  placeholder="Ex: Corolla"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="ano" className="text-sm font-medium">
                  Ano
                </label>
                <Input
                  id="ano"
                  type="number"
                  placeholder="2023"
                  min="1900"
                  max="2100"
                  value={formData.ano}
                  onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="cor" className="text-sm font-medium">
                  Cor
                </label>
                <Input
                  id="cor"
                  placeholder="Ex: Prata"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                />
              </div>
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

      <PlanLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        message={message}
        currentCount={limitInfo?.current}
        limit={limitInfo?.limit}
      />
    </Dialog>
  );
}
