import { Badge } from "@/shared/components/shadcn/ui/badge"

import { AppNavbar } from "./AppNavbar"

export function PlatformHeader({
  eyebrow,
  title,
  description,
  showNavbar = true,
}: {
  description: string
  eyebrow: string
  showNavbar?: boolean
  title: string
}) {
  return (
    <header className="border-border border-b bg-background/85">
      {showNavbar ? <AppNavbar /> : null}
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
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
