"use client";

import { ThemeProvider } from "next-themes";
import { DisenoProvider } from "@/components/diseno";
import { ToastProvider } from "@/components/feedback/toast";
import { TooltipProvider } from "@/components/feedback/tooltip";
import { ProveedorMovimiento } from "@/components/movimiento";

/** attribute="class" pone `.dark` en <html>, que es lo que espera el @custom-variant de src/styles/theme.css. `DisenoProvider` maneja `data-diseno`. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DisenoProvider>
        <ProveedorMovimiento>
          <TooltipProvider delay={300}>
            <ToastProvider>{children}</ToastProvider>
          </TooltipProvider>
        </ProveedorMovimiento>
      </DisenoProvider>
    </ThemeProvider>
  );
}
