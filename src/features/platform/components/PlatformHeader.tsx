import { Link } from "@tanstack/react-router"
import { BriefcaseBusinessIcon } from "lucide-react"

import { Badge } from "@/shared/components/shadcn/ui/badge"
import { buttonVariants } from "@/shared/components/shadcn/ui/button"
import { cn } from "@/shared/lib/utils"

import { platformNavItems } from "../data"

export function PlatformHeader({
  eyebrow,
  title,
  description,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <header className="border-border border-b bg-background/85">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link className="flex items-center gap-3 font-medium" to="/">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-card">
              <BriefcaseBusinessIcon aria-hidden="true" className="size-4" />
            </span>
            CareerMatch
          </Link>
          <nav className="flex gap-2 overflow-x-auto">
            {platformNavItems.map((item) => (
              <Link
                className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="max-w-4xl">
          <Badge className="bg-card" variant="outline">
            {eyebrow}
          </Badge>
          <h1 className="mt-5 text-5xl text-editorial leading-tight md:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground leading-8">
            {description}
          </p>
        </div>
      </div>
    </header>
  )
}
