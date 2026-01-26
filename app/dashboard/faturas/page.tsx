"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, FileText, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { FaturaForm } from "@/components/fatura-form";

export default function FaturasPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [faturas, setFaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<any>(null);

  async function loadFaturas() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("faturas")
        .select(`
          *,
          clientes (nome)
        `)
        .eq("oficina_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFaturas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar faturas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta fatura?")) return;

    try {
      const { error } = await supabase
        .from("faturas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Fatura excluída com sucesso",
      });

      loadFaturas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir fatura",
        variant: "destructive",
      });
    }
  }

  function handleEdit(fatura: any) {
    setSelectedFatura(fatura);
    setDialogOpen(true);
  }

  function handleNew() {
    setSelectedFatura(null);
    setDialogOpen(true);
  }

  useEffect(() => {
    loadFaturas();
  }, []);

  const filteredFaturas = faturas.filter((fatura) =>
    fatura.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fatura.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paga":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "pendente":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "vencida":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "cancelada":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paga":
        return "Paga";
      case "pendente":
        return "Pendente";
      case "vencida":
        return "Vencida";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const totalFaturado = faturas
    .filter(f => f.status === "paga")
    .reduce((acc, f) => acc + (f.valor_total || 0), 0);

  const totalPendente = faturas
    .filter(f => f.status === "pendente")
    .reduce((acc, f) => acc + (f.valor_total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faturas</h1>
          <p className="text-muted-foreground">
            Gerencie as faturas e recebimentos
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Fatura
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Faturado</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              R$ {totalFaturado.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">faturas pagas este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">A Receber</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              R$ {totalPendente.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">faturas pendentes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Faturas</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{faturas.length}</div>
            <p className="text-xs text-slate-400">emitidas este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar faturas..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Faturas Table */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Faturas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Carregando faturas...</p>
            </div>
          ) : filteredFaturas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">
                {searchTerm ? "Nenhuma fatura encontrada" : "Nenhuma fatura cadastrada"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaturas.map((fatura) => (
                <div
                  key={fatura.id}
                  className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{fatura.clientes?.nome || "N/A"}</h3>
                      <p className="text-sm text-slate-400">
                        Fatura Nº {fatura.numero}
                      </p>
                      {fatura.observacoes && (
                        <p className="text-xs text-slate-500 mt-1">{fatura.observacoes.slice(0, 50)}...</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Data</p>
                      <p className="font-medium text-slate-300">{new Date(fatura.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    {fatura.data_vencimento && (
                      <div className="text-center">
                        <p className="text-sm text-slate-400">Vencimento</p>
                        <p className="font-medium text-slate-300">{new Date(fatura.data_vencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Valor</p>
                      <p className="font-bold text-emerald-500">R$ {fatura.valor_total?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(fatura.status)}`}>
                        {getStatusLabel(fatura.status)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEdit(fatura)}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Edit className="h-4 w-4 text-slate-300" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDelete(fatura.id)}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FaturaForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fatura={selectedFatura}
        onSuccess={loadFaturas}
      />
    </div>
  );
}
