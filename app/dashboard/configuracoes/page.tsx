import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { LayoutSelector } from "@/components/layout-selector";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ConfiguracoesPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar dados da oficina
  const { data: oficina } = await supabase
    .from("oficinas")
    .select("*")
    .eq("id", user.id)
    .single();

  const planoAtual = oficina?.plano || "basico";
  const temPlanoBusinesss = planoAtual === "business";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua oficina
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Plano Atual</p>
          <p className="text-sm font-semibold capitalize">{planoAtual}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados da Oficina */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Oficina</CardTitle>
            <CardDescription>
              Informações básicas da sua oficina
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">
                  Nome da Oficina
                </label>
                <Input
                  id="nome"
                  defaultValue={oficina?.nome || ""}
                  placeholder="Nome da oficina"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cnpj" className="text-sm font-medium">
                  CNPJ
                </label>
                <Input
                  id="cnpj"
                  defaultValue={oficina?.cnpj || ""}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="telefone" className="text-sm font-medium">
                  Telefone
                </label>
                <Input
                  id="telefone"
                  defaultValue={oficina?.telefone || ""}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endereco" className="text-sm font-medium">
                  Endereço
                </label>
                <Input
                  id="endereco"
                  defaultValue={oficina?.endereco || ""}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <Button type="submit" className="w-full">
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil do Usuário</CardTitle>
            <CardDescription>
              Suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email
                </label>
                <Input
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="nome_usuario" className="text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="nome_usuario"
                  defaultValue={user.user_metadata?.nome || ""}
                  placeholder="Seu nome"
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Alterar Senha</h4>
                <div className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Nova senha"
                  />
                  <Input
                    type="password"
                    placeholder="Confirmar nova senha"
                  />
                </div>
              </div>

              <Button className="w-full">
                Atualizar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Personalize a aparência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tema
                </label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>

              {/* Layout - Apenas para plano Business */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Layout do Sistema
                  </label>
                  <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-semibold">
                    BUSINESS
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Escolha o layout que melhor se adapta ao seu fluxo de trabalho
                </p>
                
                {/* Verificar se o usuário tem plano Business */}
                {temPlanoBusinesss ? (
                  <LayoutSelector layoutAtual={oficina?.layout || "compacto"} />
                ) : (
                  <div className="relative">
                    <div className="space-y-3 opacity-50 pointer-events-none blur-sm">
                      <div className="flex items-center gap-3 p-4 border-2 rounded-lg">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Compacto</p>
                          <p className="text-xs text-muted-foreground">Mais informações em menos espaço</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border-2 rounded-lg">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Confortável</p>
                          <p className="text-xs text-muted-foreground">Equilíbrio entre espaço e informação</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/95 backdrop-blur-sm border-2 border-primary rounded-lg p-6 text-center max-w-xs">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-sm mb-2">Recurso Exclusivo</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Personalize o layout do sistema com o plano Business
                        </p>
                        <Link href="/dashboard/planos">
                          <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                            Fazer Upgrade
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure como deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Novos Agendamentos</p>
                  <p className="text-xs text-muted-foreground">Receba notificações de novos agendamentos</p>
                </div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Estoque Baixo</p>
                  <p className="text-xs text-muted-foreground">Alertas quando produtos estiverem acabando</p>
                </div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Faturas Vencidas</p>
                  <p className="text-xs text-muted-foreground">Notificações de faturas vencidas</p>
                </div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
