"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Wrench, Edit, Trash2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ServicoForm } from "@/components/servico-form";

export default function ServicosPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedServico, setSelectedServico] = useState<any>(null);

  async function loadServicos() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .eq("oficina_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setServicos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar serviços",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      const { error } = await supabase
        .from("servicos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Serviço excluído com sucesso",
      });

      loadServicos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir serviço",
        variant: "destructive",
      });
    }
  }

  function handleEdit(servico: any) {
    setSelectedServico(servico);
    setDialogOpen(true);
  }

  function handleNew() {
    setSelectedServico(null);
    setDialogOpen(true);
  }

  useEffect(() => {
    loadServicos();
  }, []);

  const filteredServicos = servicos.filter((servico) =>
    servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar serviços..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Serviços Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando serviços...</p>
        </div>
      ) : filteredServicos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServicos.map((servico) => (
            <Card key={servico.id} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white">{servico.nome}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(servico)}
                      className="hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4 text-slate-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(servico.id)}
                      className="hover:bg-slate-700"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {servico.descricao && (
                  <p className="text-sm text-slate-300 line-clamp-2">{servico.descricao}</p>
                )}
                <div className="pt-2 border-t border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Preço:</span>
                    <span className="text-lg font-bold text-emerald-500">
                      R$ {servico.preco.toFixed(2)}
                    </span>
                  </div>
                  {servico.duracao_estimada && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Duração:</span>
                      <span className="text-sm font-medium text-slate-300 flex items-center gap-1">
                        <div className="h-6 w-6 rounded bg-blue-500/10 flex items-center justify-center">
                          <Clock className="h-3 w-3 text-blue-500" />
                        </div>
                        {servico.duracao_estimada} min
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServicoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        servico={selectedServico}
        onSuccess={loadServicos}
      />
    </div>
  );
}
