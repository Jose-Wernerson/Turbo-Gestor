"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { LayoutProvider } from "@/contexts/layout-context";
import { TrialGuard } from "@/components/trial-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <LayoutProvider>
      <TrialGuard>
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            mobileOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)} 
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header onMenuClick={() => setMobileMenuOpen(true)} />
            <main className="flex-1 overflow-y-auto bg-muted/30 dashboard-main">
              {children}
            </main>
          </div>
        </div>
      </TrialGuard>
    </LayoutProvider>
  );
}
