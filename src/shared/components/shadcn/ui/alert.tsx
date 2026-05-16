import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] gap-x-3 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[auto_1fr] [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, className }))}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 font-medium leading-none", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 mt-1 text-muted-foreground text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
