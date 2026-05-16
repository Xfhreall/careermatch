import type * as React from "react"

import { cn } from "@/shared/lib/utils"

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  const normalizedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={normalizedValue}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-sm bg-secondary",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
      />
    </div>
  )
}

export { Progress }
