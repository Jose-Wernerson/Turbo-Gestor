"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Package, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProdutoForm } from "@/components/produto-form";

export default function EstoquePage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);

  async function loadProdutos() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("oficina_id", user.id)
        .order("nome");

      if (error) throw error;

      setProdutos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso",
      });

      loadProdutos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir produto",
        variant: "destructive",
      });
    }
  }

  function handleEdit(produto: any) {
    setSelectedProduto(produto);
    setDialogOpen(true);
  }

  function handleNew() {
    setSelectedProduto(null);
    setDialogOpen(true);
  }

  useEffect(() => {
    loadProdutos();
  }, []);

  const filteredProdutos = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLowStock = (quantidade: number, minimo: number | null) => 
    minimo !== null && quantidade <= minimo;

  const totalProdutos = produtos.length;
  const produtosEstoqueBaixo = produtos.filter(p => isLowStock(p.quantidade, p.quantidade_minima)).length;
  const valorTotal = produtos.reduce((acc, p) => acc + (p.quantidade * (p.preco_custo || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estoque</h1>
          <p className="text-muted-foreground">
            Controle de peças e produtos
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Produtos</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProdutos}</div>
            <p className="text-xs text-slate-400">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Valor Total</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {valorTotal.toFixed(2)}</div>
            <p className="text-xs text-slate-400">valor em estoque</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Alertas</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{produtosEstoqueBaixo}</div>
            <p className="text-xs text-slate-400">produtos com estoque baixo</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar produtos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Produtos Table */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Carregando produtos...</p>
            </div>
          ) : filteredProdutos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">
                {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProdutos.map((produto) => (
                <div
                  key={produto.id}
                  className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{produto.nome}</h3>
                        {isLowStock(produto.quantidade, produto.quantidade_minima) && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div className="flex gap-2 text-sm text-slate-400">
                        {produto.codigo && <span>Código: {produto.codigo}</span>}
                        {produto.fornecedor && <span>• {produto.fornecedor}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-6 items-center">
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Quantidade</p>
                      <p className={`font-bold ${isLowStock(produto.quantidade, produto.quantidade_minima) ? 'text-orange-500' : 'text-white'}`}>
                        {produto.quantidade}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Mínimo</p>
                      <p className="font-medium text-slate-300">{produto.quantidade_minima || '-'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Custo</p>
                      <p className="font-medium text-slate-300">R$ {produto.preco_custo?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Venda</p>
                      <p className="font-bold text-emerald-500">R$ {produto.preco_venda?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEdit(produto)}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Edit className="h-4 w-4 text-slate-300" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDelete(produto.id)}
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

      <ProdutoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        produto={selectedProduto}
        onSuccess={loadProdutos}
      />
    </div>
  );
}
