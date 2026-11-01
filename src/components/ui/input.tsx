import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-control w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1 text-campo md:text-control transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-control file:font-medium file:text-foreground placeholder:text-texto-terciario focus-visible:border-acento-texto focus-visible:ring-3 focus-visible:ring-acento/55 dark:focus-visible:border-acento dark:focus-visible:ring-acento/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
