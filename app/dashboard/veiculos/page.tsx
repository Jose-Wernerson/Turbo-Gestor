"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Car, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { VeiculoForm } from "@/components/veiculo-form";

export default function VeiculosPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<any>(null);

  async function loadVeiculos() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("veiculos")
        .select(`
          *,
          clientes (
            nome
          )
        `)
        .eq("oficina_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVeiculos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar veículos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;

    try {
      const { error } = await supabase
        .from("veiculos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Veículo excluído com sucesso",
      });

      loadVeiculos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir veículo",
        variant: "destructive",
      });
    }
  }

  function handleEdit(veiculo: any) {
    setSelectedVeiculo(veiculo);
    setDialogOpen(true);
  }

  function handleNew() {
    setSelectedVeiculo(null);
    setDialogOpen(true);
  }

  useEffect(() => {
    loadVeiculos();
  }, []);

  const filteredVeiculos = veiculos.filter((veiculo) =>
    veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie os veículos cadastrados
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por placa, modelo..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Veículos Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando veículos...</p>
        </div>
      ) : filteredVeiculos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhum veículo encontrado" : "Nenhum veículo cadastrado"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVeiculos.map((veiculo) => (
            <Card key={veiculo.id} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Car className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{veiculo.placa}</CardTitle>
                      <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded inline-block">
                        {veiculo.tipo}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(veiculo)}
                      className="hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4 text-slate-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(veiculo.id)}
                      className="hover:bg-slate-700"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Car className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{veiculo.marca} {veiculo.modelo}</p>
                    <p className="text-xs text-slate-400">Ano {veiculo.ano} • {veiculo.cor || "Sem cor"}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Proprietário</p>
                  <p className="text-sm font-medium text-slate-300">{veiculo.clientes?.nome || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VeiculoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        veiculo={selectedVeiculo}
        onSuccess={loadVeiculos}
      />
    </div>
  );
}
