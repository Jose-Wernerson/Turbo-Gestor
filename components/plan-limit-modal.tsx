"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PlanLimitModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  currentCount?: number;
  limit?: number;
}

export function PlanLimitModal({
  open,
  onClose,
  message,
  currentCount,
  limit,
}: PlanLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle>Limite do Plano Atingido</DialogTitle>
              <DialogDescription className="mt-1">
                Você chegou ao limite do seu plano atual
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">{message}</p>
            {limit !== undefined && currentCount !== undefined && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all"
                    style={{ width: `${Math.min((currentCount / limit) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {currentCount}/{limit}
                </span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-medium mb-2">💎 Desbloqueie mais recursos</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>✓ Clientes e veículos ilimitados</li>
              <li>✓ Estoque completo</li>
              <li>✓ Relatórios avançados</li>
              <li>✓ Suporte prioritário</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Voltar
            </Button>
            <Link href="/dashboard/planos" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Ver Planos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
