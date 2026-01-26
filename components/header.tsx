"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<{ email: string; nome?: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser({
          email: authUser.email || "",
          nome: authUser.user_metadata?.nome
        });
      }
    }
    
    loadUser();
  }, []);
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      {/* Menu mobile + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">
              {user?.nome || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email || "carregando..."}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.nome ? user.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "U"}
            </span>
          </div>
        </div>
        
        {/* Avatar mobile */}
        <div className="md:hidden h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-medium text-primary">
            {user?.nome ? user.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "U"}
          </span>
        </div>
      </div>
    </header>
  );
}
