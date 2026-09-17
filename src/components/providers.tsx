"use client";

import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/feedback/toast";
import { TooltipProvider } from "@/components/feedback/tooltip";

/** attribute="class" pone `.dark` en <html>, que es lo que espera el @custom-variant de globals.css. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delay={300}>
        <ToastProvider>{children}</ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
