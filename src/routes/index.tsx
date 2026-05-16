import { createFileRoute, Link } from "@tanstack/react-router"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  CheckCircle2Icon,
  FileSearchIcon,
  RouteIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { platformNavItems } from "@/features/platform/data"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button, buttonVariants } from "@/shared/components/shadcn/ui/button"
import { cn } from "@/shared/lib/utils"

export const Route = createFileRoute("/")({ component: LandingPage })

const previewMatches = [
  {
    company: "Kalibrr",
    role: "Frontend Engineer",
    score: 92,
    tone: "bg-accent text-accent-foreground",
  },
  {
    company: "Glints",
    role: "Product Analyst",
    score: 86,
    tone: "bg-[var(--pastel-blue)] text-[var(--pastel-blue-foreground)]",
  },
  {
    company: "Mekari",
    role: "Implementation Consultant",
    score: 81,
    tone: "bg-[var(--pastel-yellow)] text-[var(--pastel-yellow-foreground)]",
  },
]

const pipelineSteps = [
  "CV upload",
  "File validation",
  "n8n proxy",
  "Job ranking",
  "Coaching report",
]

const scopeItems = [
  {
    title: "Jobseeker MVP",
    body: "Landing, CV upload, loading pipeline, result route, reset flow.",
    icon: FileSearchIcon,
  },
  {
    title: "Server proxy",
    body: "N8N webhook tetap server-only melalui POST /api/cv/analyze.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Transient report",
    body: "Analysis result disimpan di sessionStorage tanpa database.",
    icon: RouteIcon,
  },
]

const roadmapItems = [
  {
    label: "Auth dan saved analysis",
    status: "Scaffolded",
    to: "/jobseeker/dashboard",
  },
  { label: "HRD dashboard", status: "Scaffolded", to: "/hrd/portal" },
  {
    label: "STAR interview coach",
    status: "Scaffolded",
    to: "/interview/coach",
  },
  { label: "PDF report export", status: "Queued", to: "/jobseeker/dashboard" },
  {
    label: "Superadmin monitoring",
    status: "Scaffolded",
    to: "/superadmin/monitoring",
  },
]

function LandingPage() {
  const shouldReduceMotion = useReducedMotion()
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.42,
    ease: [0.16, 1, 0.3, 1],
  } as const
  const reveal = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 18,
    },
    show: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="paper-grid border-border border-b bg-background">
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <motion.nav
            animate="show"
            className="flex h-20 items-center justify-between border-border border-b bg-background/80"
            initial="hidden"
            transition={transition}
            variants={reveal}
          >
            <Link className="flex items-center gap-3 font-medium" to="/">
              <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-card">
                <BriefcaseBusinessIcon aria-hidden="true" className="size-4" />
              </span>
              CareerMatch
            </Link>
            <div className="hidden items-center gap-1 lg:flex">
              {platformNavItems.slice(1).map((item) => (
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "ghost" })
                  )}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              to="/jobseeker/analyze"
            >
              Analyze
            </Link>
          </motion.nav>

          <div className="grid flex-1 gap-12 py-12 md:grid-cols-[0.92fr_1.08fr] md:items-center lg:py-20">
            <motion.div
              animate="show"
              className="flex max-w-3xl flex-col gap-8"
              initial="hidden"
              transition={{
                ...transition,
                delay: shouldReduceMotion ? 0 : 0.06,
              }}
              variants={reveal}
            >
              <div className="flex flex-col gap-5">
                <Badge className="bg-card" variant="outline">
                  MVP Jobseeker
                </Badge>
                <div className="flex flex-col gap-3">
                  <h1 className="text-6xl text-editorial leading-none md:text-8xl">
                    CareerMatch
                  </h1>
                  <p className="max-w-2xl text-balance font-medium text-2xl leading-9 md:text-3xl">
                    Analisis CV yang mengubah output AI menjadi ranking
                    pekerjaan, skill gap, dan coaching karier.
                  </p>
                </div>
                <p className="max-w-2xl text-muted-foreground leading-8">
                  MVP ini fokus pada satu alur jobseeker: upload CV, proses
                  melalui server proxy, lalu baca hasil pada halaman analisis
                  yang bisa dibagikan lewat route.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  nativeButton={false}
                  render={<Link to="/jobseeker/analyze" />}
                  size="lg"
                >
                  Analisis CV
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary-foreground/10">
                    <ArrowRightIcon aria-hidden="true" className="size-4" />
                  </span>
                </Button>
                <a
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" })
                  )}
                  href="#scope"
                >
                  Lihat scope
                </a>
              </div>
            </motion.div>

            <motion.div
              animate="show"
              className="rounded-lg border border-border bg-background p-1"
              initial="hidden"
              transition={{
                ...transition,
                delay: shouldReduceMotion ? 0 : 0.14,
              }}
              variants={reveal}
            >
              <div className="overflow-hidden rounded-[0.35rem] border border-border bg-card">
                <div className="flex items-center justify-between border-border border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[var(--pastel-red)]" />
                    <span className="size-2 rounded-full bg-[var(--pastel-yellow)]" />
                    <span className="size-2 rounded-full bg-[var(--pastel-green)]" />
                  </div>
                  <span className="text-muted-foreground text-xs">
                    analysis/cv-0248
                  </span>
                </div>

                <div className="grid gap-0 md:grid-cols-[0.86fr_1.14fr]">
                  <div className="border-border border-b p-5 md:border-r md:border-b-0">
                    <p className="text-muted-foreground text-sm">Candidate</p>
                    <h2 className="mt-2 font-medium text-2xl leading-8">
                      Frontend profile with SaaS implementation experience
                    </h2>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {[
                        ["Skills", "18"],
                        ["Years", "4.5"],
                        ["Matches", "12"],
                        ["Top score", "92%"],
                      ].map(([label, value]) => (
                        <div
                          className="rounded-lg border border-border bg-background p-3"
                          key={label}
                        >
                          <p className="text-muted-foreground text-xs">
                            {label}
                          </p>
                          <p className="mt-1 font-medium text-xl">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Ranked job matches
                        </p>
                        <p className="font-medium">Pipeline ready</p>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">
                        Normalized
                      </Badge>
                    </div>

                    <div className="mt-5 flex flex-col gap-3">
                      {previewMatches.map((match, index) => (
                        <div
                          className="grid gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-[1fr_auto]"
                          key={match.role}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">
                                0{index + 1}
                              </span>
                              <p className="truncate font-medium">
                                {match.role}
                              </p>
                            </div>
                            <p className="mt-1 text-muted-foreground text-sm">
                              {match.company}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "flex h-9 min-w-16 items-center justify-center rounded-md px-3 font-medium text-sm",
                              match.tone
                            )}
                          >
                            {match.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid border-border border-t sm:grid-cols-5">
                  {pipelineSteps.map((step, index) => (
                    <div
                      className="flex items-center gap-2 border-border border-b px-4 py-3 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
                      key={step}
                    >
                      <CheckCircle2Icon
                        aria-hidden="true"
                        className={cn(
                          "size-4",
                          index < 3
                            ? "text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-border border-b bg-card/70 px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          transition={transition}
          viewport={{ once: true, margin: "-80px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-xl">
            <Badge variant="outline">Product flow</Badge>
            <h2 className="mt-5 text-4xl text-editorial leading-tight md:text-6xl">
              Single path, complete enough for MVP review.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {scopeItems.map((item) => (
              <div
                className="rounded-lg border border-border bg-background p-6"
                key={item.title}
              >
                <item.icon aria-hidden="true" className="size-5" />
                <h3 className="mt-6 font-medium text-xl">{item.title}</h3>
                <p className="mt-3 text-muted-foreground text-sm leading-7">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8" id="scope">
        <motion.div
          className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          transition={transition}
          viewport={{ once: true, margin: "-80px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="rounded-lg border border-border bg-card p-8">
            <Badge className="bg-accent text-accent-foreground">
              Included now
            </Badge>
            <h2 className="mt-6 text-4xl text-editorial leading-tight">
              PRD sections 1-14 are implemented for the jobseeker MVP.
            </h2>
            <p className="mt-5 text-muted-foreground leading-8">
              The app includes multipage routing, TanStack form validation,
              request mutation state, result normalization, result storage, safe
              report rendering, and product analytics events.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-8">
            <Badge className="bg-[var(--pastel-yellow)] text-[var(--pastel-yellow-foreground)]">
              Future phases
            </Badge>
            <h2 className="mt-6 text-4xl text-editorial leading-tight">
              PRD sections 15-18 stay visible as roadmap, not hidden work.
            </h2>
            <div className="mt-6 grid gap-2">
              {roadmapItems.map((item) => (
                <div
                  className="flex items-center justify-between gap-4 border-border border-b py-3 last:border-b-0"
                  key={item.label}
                >
                  <Link className="font-medium hover:underline" to={item.to}>
                    {item.label}
                  </Link>
                  <span className="text-muted-foreground text-sm">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
