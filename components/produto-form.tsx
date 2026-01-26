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

interface ProdutoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: any;
  onSuccess: () => void;
}

export function ProdutoForm({ open, onOpenChange, produto, onSuccess }: ProdutoFormProps) {
  const { toast } = useToast();
  const { canAdd, message, limitInfo } = usePlanLimit("produtos");
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    codigo_barras: "",
    quantidade: "",
    quantidade_minima: "",
    preco_custo: "",
    preco_venda: "",
    fornecedor: "",
  });

  useEffect(() => {
    if (open) {
      if (produto) {
        setFormData({
          nome: produto.nome || "",
          descricao: produto.descricao || "",
          codigo_barras: produto.codigo_barras || "",
          quantidade: produto.quantidade?.toString() || "",
          quantidade_minima: produto.quantidade_minima?.toString() || "",
          preco_custo: produto.preco_custo?.toString() || "",
          preco_venda: produto.preco_venda?.toString() || "",
          fornecedor: produto.fornecedor || "",
        });
      } else {
        setFormData({
          nome: "",
          descricao: "",
          codigo_barras: "",
          quantidade: "",
          quantidade_minima: "",
          preco_custo: "",
          preco_venda: "",
          fornecedor: "",
        });
      }
    }
  }, [open, produto]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Verificar limite apenas ao criar novo produto
    if (!produto && !canAdd) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const produtoData = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        codigo_barras: formData.codigo_barras || null,
        quantidade: parseInt(formData.quantidade),
        quantidade_minima: formData.quantidade_minima ? parseInt(formData.quantidade_minima) : null,
        preco_custo: formData.preco_custo ? parseFloat(formData.preco_custo) : null,
        preco_venda: formData.preco_venda ? parseFloat(formData.preco_venda) : null,
        fornecedor: formData.fornecedor || null,
        oficina_id: user.id,
      };

      if (produto) {
        const { error } = await supabase
          .from("produtos")
          .update(produtoData)
          .eq("id", produto.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("produtos")
          .insert(produtoData);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Produto cadastrado com sucesso",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar produto",
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
          <DialogTitle>{produto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {produto ? "Atualize as informações do produto" : "Cadastre um novo produto no estoque"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="nome" className="text-sm font-medium">
                  Nome do Produto *
                </label>
                <Input
                  id="nome"
                  placeholder="Ex: Óleo Motor 5W30"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="codigo_barras" className="text-sm font-medium">
                  Código de Barras
                </label>
                <Input
                  id="codigo_barras"
                  placeholder="Ex: 7891234567890"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="descricao" className="text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="descricao"
                placeholder="Descrição do produto..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="quantidade" className="text-sm font-medium">
                  Quantidade em Estoque *
                </label>
                <Input
                  id="quantidade"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="quantidade_minima" className="text-sm font-medium">
                  Quantidade Mínima
                </label>
                <Input
                  id="quantidade_minima"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantidade_minima}
                  onChange={(e) => setFormData({ ...formData, quantidade_minima: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="preco_custo" className="text-sm font-medium">
                  Preço de Custo (R$)
                </label>
                <Input
                  id="preco_custo"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.preco_custo}
                  onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="preco_venda" className="text-sm font-medium">
                  Preço de Venda (R$)
                </label>
                <Input
                  id="preco_venda"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.preco_venda}
                  onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="fornecedor" className="text-sm font-medium">
                Fornecedor
              </label>
              <Input
                id="fornecedor"
                placeholder="Nome do fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
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
