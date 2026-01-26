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

interface FaturaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fatura?: any;
  onSuccess: () => void;
}

export function FaturaForm({ open, onOpenChange, fatura, onSuccess }: FaturaFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    numero: "",
    cliente_id: "",
    observacoes: "",
    valor_total: "",
    valor_desconto: "",
    status: "pendente",
    data_vencimento: "",
    forma_pagamento: "",
  });

  useEffect(() => {
    if (open) {
      loadClientes();
      if (fatura) {
        setFormData({
          numero: fatura.numero || "",
          cliente_id: fatura.cliente_id || "",
          observacoes: fatura.observacoes || "",
          valor_total: fatura.valor_total?.toString() || "",
          valor_desconto: fatura.valor_desconto?.toString() || "",
          status: fatura.status || "pendente",
          data_vencimento: fatura.data_vencimento ? fatura.data_vencimento.split('T')[0] : "",
          forma_pagamento: fatura.forma_pagamento || "",
        });
      } else {
        // Gerar número automático para nova fatura
        const numeroFatura = `FAT-${Date.now()}`;
        setFormData({
          numero: numeroFatura,
          cliente_id: "",
          observacoes: "",
          valor_total: "",
          valor_desconto: "",
          status: "pendente",
          data_vencimento: "",
          forma_pagamento: "",
        });
      }
    }
  }, [open, fatura]);

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

  function handleClienteChange(clienteId: string) {
    setFormData({ ...formData, cliente_id: clienteId });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const valorTotal = parseFloat(formData.valor_total);
      const valorDesconto = formData.valor_desconto ? parseFloat(formData.valor_desconto) : 0;
      const valorFinal = valorTotal - valorDesconto;

      const faturaData = {
        numero: formData.numero,
        cliente_id: formData.cliente_id,
        observacoes: formData.observacoes || null,
        valor_total: valorTotal,
        valor_desconto: valorDesconto,
        valor_final: valorFinal,
        status: formData.status,
        data_vencimento: formData.data_vencimento ? new Date(formData.data_vencimento).toISOString() : null,
        forma_pagamento: formData.forma_pagamento || null,
        oficina_id: user.id,
      };

      if (fatura) {
        const { error } = await supabase
          .from("faturas")
          .update(faturaData)
          .eq("id", fatura.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Fatura atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("faturas")
          .insert(faturaData);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Fatura criada com sucesso",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar fatura",
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
          <DialogTitle>{fatura ? "Editar Fatura" : "Nova Fatura"}</DialogTitle>
          <DialogDescription>
            {fatura ? "Atualize as informações da fatura" : "Cadastre uma nova fatura"}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="numero" className="text-sm font-medium">
                  Número da Fatura *
                </label>
                <Input
                  id="numero"
                  placeholder="FAT-001"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  required
                  disabled={!!fatura}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="forma_pagamento" className="text-sm font-medium">
                  Forma de Pagamento
                </label>
                <select
                  id="forma_pagamento"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="observacoes" className="text-sm font-medium">
                Observações
              </label>
              <textarea
                id="observacoes"
                placeholder="Observações sobre a fatura..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label htmlFor="valor_total" className="text-sm font-medium">
                  Valor Total (R$) *
                </label>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="valor_desconto" className="text-sm font-medium">
                  Desconto (R$)
                </label>
                <Input
                  id="valor_desconto"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.valor_desconto}
                  onChange={(e) => setFormData({ ...formData, valor_desconto: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Valor Final (R$)</label>
                <Input
                  type="text"
                  value={
                    formData.valor_total && !isNaN(parseFloat(formData.valor_total))
                      ? (
                          parseFloat(formData.valor_total) -
                          (formData.valor_desconto && !isNaN(parseFloat(formData.valor_desconto))
                            ? parseFloat(formData.valor_desconto)
                            : 0)
                        ).toFixed(2)
                      : "0.00"
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="data_vencimento" className="text-sm font-medium">
                  Data de Vencimento
                </label>
                <Input
                  id="data_vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                />
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
                  <option value="pendente">Pendente</option>
                  <option value="paga">Paga</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="vencida">Vencida</option>
                </select>
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
    </Dialog>
  );
}
