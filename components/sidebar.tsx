"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  Calendar,
  Package,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  { name: "Veículos", href: "/dashboard/veiculos", icon: Car },
  { name: "Serviços", href: "/dashboard/servicos", icon: Wrench },
  { name: "Agendamentos", href: "/dashboard/agendamentos", icon: Calendar },
  { name: "Estoque", href: "/dashboard/estoque", icon: Package },
  { name: "Faturas", href: "/dashboard/faturas", icon: FileText },
  { name: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-card border-r transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden text-muted-foreground hover:text-foreground"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <Image 
            src="/logo.webp" 
            alt="Turbo Gestor" 
            width={32} 
            height={32}
            priority
            className="rounded-lg object-contain"
          />
          <span className="text-xl font-bold">Turbo Gestor</span>
        </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

        {/* Footer */}
        <div className="border-t p-3 space-y-1">
          <Link
            href="/dashboard/configuracoes"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-5 w-5" />
            Configurações
          </Link>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleLogout}
            disabled={signingOut}
          >
            <LogOut className="h-5 w-5" />
            {signingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </>
  );
}
