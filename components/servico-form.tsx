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

interface ServicoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servico?: any;
  onSuccess: () => void;
}

export function ServicoForm({ open, onOpenChange, servico, onSuccess }: ServicoFormProps) {
  const { toast } = useToast();
  const { canAdd, message, limitInfo } = usePlanLimit("servicos");
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    duracao_estimada: "",
  });

  useEffect(() => {
    if (open) {
      if (servico) {
        setFormData({
          nome: servico.nome || "",
          descricao: servico.descricao || "",
          preco: servico.preco?.toString() || "",
          duracao_estimada: servico.duracao_estimada?.toString() || "",
        });
      } else {
        setFormData({
          nome: "",
          descricao: "",
          preco: "",
          duracao_estimada: "",
        });
      }
    }
  }, [open, servico]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Verificar limite apenas ao criar novo serviço
    if (!servico && !canAdd) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const servicoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        duracao_estimada: formData.duracao_estimada ? parseInt(formData.duracao_estimada) : null,
        oficina_id: user.id, // TODO: usar oficina_id real
      };

      if (servico) {
        const { error } = await supabase
          .from("servicos")
          .update(servicoData)
          .eq("id", servico.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Serviço atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("servicos")
          .insert(servicoData);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Serviço cadastrado com sucesso",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar serviço",
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
          <DialogTitle>{servico ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          <DialogDescription>
            {servico ? "Atualize as informações do serviço" : "Cadastre um novo serviço"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="nome" className="text-sm font-medium">
                Nome do Serviço *
              </label>
              <Input
                id="nome"
                placeholder="Ex: Troca de óleo"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="descricao" className="text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="descricao"
                placeholder="Descreva o serviço..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="preco" className="text-sm font-medium">
                  Preço (R$) *
                </label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="duracao_estimada" className="text-sm font-medium">
                  Duração (minutos)
                </label>
                <Input
                  id="duracao_estimada"
                  type="number"
                  min="0"
                  placeholder="60"
                  value={formData.duracao_estimada}
                  onChange={(e) => setFormData({ ...formData, duracao_estimada: e.target.value })}
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
