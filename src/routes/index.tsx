import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRightIcon,
  BarChart3Icon,
  BrainIcon,
  Building2Icon,
  CheckCircle2Icon,
  FileSearchIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RouteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";

import { RoleRedirectGate } from "@/features/auth/AuthNavButton";
import { AppNavbar } from "@/features/platform/components/AppNavbar";
import {
  implementationMilestones,
  roleDashboardSummaries,
} from "@/features/platform/data";
import { BriefcaseBusinessIcon } from "@/features/platform/data";
import { Badge } from "@/shared/components/shadcn/ui/badge";
import { Button, buttonVariants } from "@/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/ui/card";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/")({ component: LandingPage });

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
];

const pipelineSteps = [
  "Upload CV",
  "Analisis aman",
  "Cocokkan pekerjaan",
  "Skor & alasan",
  "Saran berikutnya",
];

const scopeItems = [
  {
    title: "Untuk pencari kerja",
    body: "Upload CV, ketahui posisi yang sesuai, lihat celah skill yang perlu dikembangkan, dan lacak progres lamaran secara terstruktur.",
    icon: FileSearchIcon,
  },
  {
    title: "Untuk tim rekrutmen",
    body: "Kelola lowongan dan lihat kandidat berdasarkan kecocokan skill dan pengalaman, tanpa perlu menganalisis CV secara manual.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Untuk admin platform",
    body: "Pantau alur kerja, kelola approval HRD, konfigurasi model scoring, dan kontrol akses pengguna serta lowongan.",
    icon: RouteIcon,
  },
];

const featureCards = [
  {
    icon: BrainIcon,
    title: "Analisis CV berbasis AI",
    description:
      "CareerMatch membaca dan memahami skill, pengalaman, serta kualifikasi dari CV-mu secara otomatis.",
  },
  {
    icon: TargetIcon,
    title: "Skor kecocokan akurat",
    description:
      "Setiap lowongan diberi skor berdasarkan seberapa cocok profilmu, lengkap dengan alasan di balik setiap penilaian.",
  },
  {
    icon: BarChart3Icon,
    title: "Saran pengembangan skill",
    description:
      "Identifikasi celah kompetensi dan dapatkan rekomendasi langkah konkret untuk meningkatkan peluangmu.",
  },
  {
    icon: UsersIcon,
    title: "Dashboard multi-peran",
    description:
      "Antarmuka terpisah untuk jobseeker, HRD, dan admin -- masing-masing dengan fitur yang relevan.",
  },
];

const contactInfo = [
  {
    icon: MailIcon,
    label: "Email",
    value: "contact@careermatch.id",
    href: "mailto:contact@careermatch.id",
  },
  {
    icon: PhoneIcon,
    label: "Telepon",
    value: "+62 812-3456-7890",
    href: "tel:+6281234567890",
  },
  {
    icon: MapPinIcon,
    label: "Alamat",
    value: "Jakarta, Indonesia",
    href: undefined,
  },
];

function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.42,
    ease: [0.16, 1, 0.3, 1],
  } as const;
  const reveal = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 18,
    },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <AppNavbar />
      <RoleRedirectGate />

      {/* Hero */}
      <section
        className="paper-grid border-border border-b bg-background"
        id="home"
      >
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <motion.div
            animate="show"
            className="-mx-4 sm:-mx-6 lg:-mx-8"
            initial="hidden"
            transition={transition}
            variants={reveal}
          ></motion.div>

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
                  CareerMatch
                </Badge>
                <div className="flex flex-col gap-3">
                  <h1 className="text-6xl text-editorial leading-none md:text-8xl">
                    CareerMatch
                  </h1>
                  <p className="max-w-2xl font-medium text-2xl leading-9 md:text-3xl">
                    Kesempatan kerja terbaik, dimulai dari CV yang tepat.
                  </p>
                </div>
                <p className="max-w-2xl text-muted-foreground leading-8">
                  CareerMatch menganalisis skill dan pengalamanmu untuk
                  merekomendasikan posisi yang paling relevan, menampilkan skor
                  kecocokan, dan memberi tahu langkah yang perlu diambil
                  selanjutnya.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  nativeButton={false}
                  render={<Link to="/jobseeker/dashboard" />}
                  size="lg"
                >
                  Mulai dari dashboard
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary-foreground/10">
                    <ArrowRightIcon aria-hidden="true" className="size-4" />
                  </span>
                </Button>
                <a
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                  )}
                  href="#features"
                >
                  Lihat fitur
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
                    <p className="text-muted-foreground text-sm">Profil</p>
                    <h2 className="mt-2 font-medium text-2xl leading-8">
                      Profil frontend dengan pengalaman produk SaaS
                    </h2>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {[
                        ["Skill", "18"],
                        ["Pengalaman", "4.5"],
                        ["Cocok", "12"],
                        ["Skor", "92%"],
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
                          Rekomendasi pekerjaan
                        </p>
                        <p className="font-medium">Siap dibuka</p>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">
                        Tersimpan
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
                              match.tone,
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
                            : "text-muted-foreground",
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

      {/* About */}
      <section
        className="border-border border-b bg-card/50 px-4 py-20 sm:px-6 lg:px-8"
        id="about"
      >
        <motion.div
          className="mx-auto max-w-7xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          transition={transition}
          viewport={{ once: true, margin: "-80px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline">Tentang CareerMatch</Badge>
            <h2 className="mt-5 text-4xl text-editorial leading-tight md:text-5xl">
              Platform lengkap untuk menemukan dan menempatkan talenta terbaik.
            </h2>
            <p className="mt-5 text-muted-foreground leading-8">
              CareerMatch dibangun untuk menjembatani kesenjangan antara pencari
              kerja dan perusahaan. Dengan analisis berbasis AI, kami membantu
              setiap pengguna memahami kekuatan mereka dan menemukan peluang
              yang paling sesuai.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {scopeItems.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <item.icon
                    aria-hidden="true"
                    className="size-6 text-muted-foreground"
                  />
                  <CardTitle className="mt-4 text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-7 text-base">
                    {item.body}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" id="features">
        <motion.div
          className="mx-auto max-w-7xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          transition={transition}
          viewport={{ once: true, margin: "-80px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="bg-accent text-accent-foreground">
              Fitur utama
            </Badge>
            <h2 className="mt-5 text-4xl text-editorial leading-tight md:text-5xl">
              Analisis otomatis, rekomendasi yang relevan.
            </h2>
            <p className="mt-5 text-muted-foreground leading-8">
              Tidak perlu menebak-nebak posisi yang tepat. CareerMatch membaca
              kekuatan CV-mu, mencocokkan dengan lowongan yang tersedia, dan
              menampilkan alasan di balik setiap rekomendasi.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon
                    aria-hidden="true"
                    className="size-6 text-muted-foreground"
                  />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-7">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-14 rounded-lg border border-border bg-card/70 p-8">
            <h3 className="font-medium text-xl">
              Akses langsung ke fitur sesuai peranmu.
            </h3>
            <div className="mt-6 grid gap-2 md:grid-cols-3">
              {roleDashboardSummaries.map((item) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-5 py-4"
                  key={item.title}
                >
                  <Link className="font-medium hover:underline" to={item.to}>
                    {item.title}
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

      {/* Milestones */}
      <section className="border-border border-t px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-7xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          transition={transition}
          viewport={{ once: true, margin: "-80px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline">Milestone</Badge>
            <h2 className="mt-5 text-4xl text-editorial leading-tight md:text-5xl">
              Fitur yang sudah aktif.
            </h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {implementationMilestones.map((item) => (
              <div
                className="rounded-lg border border-border bg-card p-5"
                key={item.area}
              >
                <Badge variant="outline">Aktif</Badge>
                <p className="mt-5 text-muted-foreground text-sm">
                  {item.area}
                </p>
                <h2 className="mt-2 font-medium text-xl">{item.title}</h2>
                <div className="mt-5 flex flex-col gap-2">
                  {item.items.slice(0, 3).map((detail) => (
                    <div className="flex gap-2 text-sm" key={detail}>
                      <CheckCircle2Icon
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                      />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contact */}
      <section
        className="border-border border-t bg-card/50 px-4 py-20 sm:px-6 lg:px-8"
        id="contact"
      >
        <motion.div
          className="mx-auto max-w-7xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          transition={transition}
          viewport={{ once: true, margin: "-80px" }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline">Kontak</Badge>
            <h2 className="mt-5 text-4xl text-editorial leading-tight md:text-5xl">
              Tertarik bekerja sama?
            </h2>
            <p className="mt-5 text-muted-foreground leading-8">
              Kami terbuka untuk diskusi terkait kerja sama perusahaan,
              implementasi untuk tim HRD, atau informasi lebih lanjut tentang
              fitur dan roadmap CareerMatch.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {contactInfo.map((item) => (
              <Card key={item.label}>
                <CardHeader>
                  <item.icon
                    aria-hidden="true"
                    className="size-6 text-muted-foreground"
                  />
                  <CardTitle className="mt-4">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.href ? (
                    <a
                      className="text-muted-foreground hover:text-foreground hover:underline"
                      href={item.href}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">{item.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-border border-t bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-card">
                  <BriefcaseBusinessIcon
                    aria-hidden="true"
                    className="size-4"
                  />
                </span>
                <span className="font-medium">CareerMatch</span>
              </div>
              <p className="mt-4 max-w-sm text-muted-foreground text-sm leading-7">
                Platform pencocokan CV dan lowongan berbasis AI untuk pencari
                kerja, tim rekrutmen, dan admin.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Navigasi</h3>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { href: "/#home", label: "Home" },
                  { href: "/#about", label: "About" },
                  { href: "/#features", label: "Features" },
                  { href: "/#contact", label: "Contact" },
                ].map((item) => (
                  <a
                    className="text-muted-foreground text-sm hover:text-foreground hover:underline"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm">Dashboard</h3>
              <div className="mt-4 flex flex-col gap-2">
                {roleDashboardSummaries.map((item) => (
                  <Link
                    className="text-muted-foreground text-sm hover:text-foreground hover:underline"
                    key={item.title}
                    to={item.to}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-border border-t pt-8 md:flex-row">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} CareerMatch. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-foreground"
                href="https://linkedin.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Building2Icon aria-hidden="true" className="size-5" />
              </a>
              <a
                aria-label="Email"
                className="text-muted-foreground hover:text-foreground"
                href="mailto:contact@careermatch.id"
              >
                <MailIcon aria-hidden="true" className="size-5" />
              </a>
              <a
                aria-label="Sparkles"
                className="text-muted-foreground hover:text-foreground"
                href="#features"
              >
                <SparklesIcon aria-hidden="true" className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
