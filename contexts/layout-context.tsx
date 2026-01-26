"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Layout = "compacto" | "confortavel" | "espacoso" | "moderno";

interface LayoutContextType {
  layout: Layout;
  setLayout: (layout: Layout) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  layout: "compacto",
  setLayout: () => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayoutState] = useState<Layout>("compacto");

  useEffect(() => {
    async function loadLayout() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("oficinas")
        .select("layout")
        .eq("id", user.id)
        .single();

      if (data?.layout) {
        setLayoutState(data.layout);
        applyLayoutStyles(data.layout);
      }
    }

    loadLayout();
  }, []);

  const setLayout = (newLayout: Layout) => {
    setLayoutState(newLayout);
    applyLayoutStyles(newLayout);
  };

  function applyLayoutStyles(layout: Layout) {
    const root = document.documentElement;
    
    // Remover classes antigas
    root.classList.remove("layout-compacto", "layout-confortavel", "layout-espacoso", "layout-moderno");
    
    // Adicionar nova classe
    root.classList.add(`layout-${layout}`);

    // Aplicar variáveis CSS
    switch (layout) {
      case "compacto":
        root.style.setProperty("--spacing-card", "1rem");
        root.style.setProperty("--spacing-section", "1.5rem");
        root.style.setProperty("--card-padding", "1rem");
        root.style.setProperty("--font-size-base", "0.875rem");
        break;
      case "confortavel":
        root.style.setProperty("--spacing-card", "1.5rem");
        root.style.setProperty("--spacing-section", "2rem");
        root.style.setProperty("--card-padding", "1.5rem");
        root.style.setProperty("--font-size-base", "1rem");
        break;
      case "espacoso":
        root.style.setProperty("--spacing-card", "2rem");
        root.style.setProperty("--spacing-section", "2.5rem");
        root.style.setProperty("--card-padding", "2rem");
        root.style.setProperty("--font-size-base", "1rem");
        break;
      case "moderno":
        root.style.setProperty("--spacing-card", "1.5rem");
        root.style.setProperty("--spacing-section", "2rem");
        root.style.setProperty("--card-padding", "1.5rem");
        root.style.setProperty("--font-size-base", "1rem");
        break;
    }
  }

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
