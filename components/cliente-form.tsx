"use client";

import { useState } from "react";
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

interface ClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: any;
  onSuccess: () => void;
}

export function ClienteForm({ open, onOpenChange, cliente, onSuccess }: ClienteFormProps) {
  const { toast } = useToast();
  const { canAdd, message, limitInfo } = usePlanLimit("clientes");
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: cliente?.nome || "",
    email: cliente?.email || "",
    telefone: cliente?.telefone || "",
    cpf: cliente?.cpf || "",
    endereco: cliente?.endereco || "",
    cidade: cliente?.cidade || "",
    estado: cliente?.estado || "",
    cep: cliente?.cep || "",
    observacoes: cliente?.observacoes || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Verificar limite apenas ao criar novo cliente
    if (!cliente && !canAdd) {
      setShowLimitModal(true);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Por enquanto, vamos usar o user.id como oficina_id temporário
      // TODO: Criar oficina ao cadastrar e linkar ao user
      const oficina_id = user.id;

      if (cliente) {
        // Atualizar
        const { error } = await supabase
          .from("clientes")
          .update(formData)
          .eq("id", cliente.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Cliente atualizado com sucesso",
        });
      } else {
        // Criar
        const { error } = await supabase
          .from("clientes")
          .insert([{ ...formData, oficina_id }]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Cliente criado com sucesso",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente abaixo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="nome" className="block text-sm font-medium mb-2">
                Nome Completo *
              </label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium mb-2">
                Telefone *
              </label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium mb-2">
                CPF
              </label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="cep" className="block text-sm font-medium mb-2">
                CEP
              </label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="endereco" className="block text-sm font-medium mb-2">
                Endereço
              </label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium mb-2">
                Cidade
              </label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium mb-2">
                Estado
              </label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                maxLength={2}
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="observacoes" className="block text-sm font-medium mb-2">
                Observações
              </label>
              <textarea
                id="observacoes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
