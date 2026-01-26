import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Turbo Gestor - Sistema de Gestão para Oficinas",
  description: "Sistema completo de gestão para oficinas mecânicas. Gerencie clientes, veículos, serviços, agendamentos, estoque e faturas de forma eficiente.",
  keywords: ["gestão de oficina", "sistema para oficina mecânica", "gerenciamento de oficina", "software oficina", "gestão automotiva"],
  authors: [{ name: "Turbo Gestor" }],
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Turbo Gestor - Sistema de Gestão para Oficinas",
    description: "Sistema completo de gestão para oficinas mecânicas",
    type: "website",
    url: appUrl,
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Turbo Gestor Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
