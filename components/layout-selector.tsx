"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useLayout } from "@/contexts/layout-context";

interface LayoutSelectorProps {
  layoutAtual?: string;
}

export function LayoutSelector({ layoutAtual = "compacto" }: LayoutSelectorProps) {
  const [selectedLayout, setSelectedLayout] = useState(layoutAtual);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { setLayout } = useLayout();

  async function handleAplicarLayout() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("oficinas")
        .update({ layout: selectedLayout })
        .eq("id", user.id);

      if (error) throw error;

      // Aplicar layout imediatamente
      setLayout(selectedLayout as any);

      toast({
        title: "Layout atualizado!",
        description: `Layout ${selectedLayout} aplicado com sucesso`,
      });

      // Pequeno delay para mostrar o toast antes de recarregar
      setTimeout(() => router.refresh(), 800);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar layout",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      <label className="relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
        <input
          type="radio"
          name="layout"
          value="compacto"
          checked={selectedLayout === "compacto"}
          onChange={(e) => setSelectedLayout(e.target.value)}
          className="h-4 w-4"
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Compacto</p>
          <p className="text-xs text-muted-foreground">Mais informações em menos espaço</p>
        </div>
      </label>

      <label className="relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
        <input
          type="radio"
          name="layout"
          value="confortavel"
          checked={selectedLayout === "confortavel"}
          onChange={(e) => setSelectedLayout(e.target.value)}
          className="h-4 w-4"
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Confortável</p>
          <p className="text-xs text-muted-foreground">Equilíbrio entre espaço e informação</p>
        </div>
      </label>

      <label className="relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
        <input
          type="radio"
          name="layout"
          value="espacoso"
          checked={selectedLayout === "espacoso"}
          onChange={(e) => setSelectedLayout(e.target.value)}
          className="h-4 w-4"
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Espaçoso</p>
          <p className="text-xs text-muted-foreground">Mais espaço entre elementos, melhor legibilidade</p>
        </div>
      </label>

      <label className="relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
        <input
          type="radio"
          name="layout"
          value="moderno"
          checked={selectedLayout === "moderno"}
          onChange={(e) => setSelectedLayout(e.target.value)}
          className="h-4 w-4"
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Moderno</p>
          <p className="text-xs text-muted-foreground">Design minimalista com animações suaves</p>
        </div>
      </label>

      <Button 
        className="w-full mt-2" 
        onClick={handleAplicarLayout}
        disabled={loading}
      >
        {loading ? "Aplicando..." : "Aplicar Layout"}
      </Button>
    </div>
  );
}
