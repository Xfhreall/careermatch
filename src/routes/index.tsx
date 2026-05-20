import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
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
import { useRef } from "react";
import { toast } from "sonner";

import { RoleRedirectGate } from "@/features/auth/AuthNavButton";
import { AppNavbar } from "@/features/platform/components/AppNavbar";
import {
  BriefcaseBusinessIcon,
  roleDashboardSummaries,
} from "@/features/platform/data";
import { Badge } from "@/shared/components/shadcn/ui/badge";
import { Button, buttonVariants } from "@/shared/components/shadcn/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/ui/field";
import { Input } from "@/shared/components/shadcn/ui/input";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/")({ component: LandingPage });

const previewMatches = [
  {
    company: "Kalibrr",
    role: "Frontend Engineer",
    score: 92,
    tone: "bg-[#efe1d2] text-[#4f3423]",
  },
  {
    company: "Glints",
    role: "Product Analyst",
    score: 86,
    tone: "bg-[#e6d4c1] text-[#452d1e]",
  },
  {
    company: "Mekari",
    role: "Implementation Consultant",
    score: 81,
    tone: "bg-[#dcc0a6] text-[#3f2819]",
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
      "CareerMatch membaca dan memahami secara otomatis seluruh isi CV-mu — mulai dari skill teknis, pengalaman kerja, riwayat pendidikan, hingga sertifikasi dan proyek yang pernah dikerjakan — lalu mengekstraknya menjadi data terstruktur yang siap dianalisis. Sistem AI kami mampu mendeteksi berbagai format CV dan memetakan data ke dalam kategori yang terorganisir, sehingga kamu bisa melihat ringkasan profil secara menyeluruh dalam satu tampilan.",
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

const aboutSignals = [
  {
    value: "10k+",
    label: "CV dipetakan",
    description: "Profil kandidat diproses terstruktur tiap minggu.",
  },
  {
    value: "92%",
    label: "Top-match precision",
    description: "Skor kecocokan tinggi untuk shortlist awal HRD.",
  },
  {
    value: "24h",
    label: "Waktu respon",
    description: "Alur review kandidat dan koordinasi tim lebih cepat.",
  },
];

const featureFlow = [
  {
    title: "Ingest & parse",
    body: "Dokumen CV dibaca, dibersihkan, dan dirapikan ke struktur skill + pengalaman.",
  },
  {
    title: "Scoring engine",
    body: "Model menilai relevansi skill, depth pengalaman, dan konteks peran secara terukur.",
  },
  {
    title: "Actionable output",
    body: "Tim langsung dapat prioritas kandidat, alasan skor, dan area pengembangan.",
  },
];

const testimonials = [
  {
    quote:
      "CareerMatch bantu tim kami potong waktu screening awal hampir setengahnya. Kandidat yang naik ke interview jauh lebih relevan.",
    name: "Rani Puspita",
    role: "Head of Talent Acquisition",
    company: "Mekari",
    impact: "Time-to-shortlist turun 47%",
    metric: "47%",
    metricLabel: "Lebih cepat shortlist kandidat",
    track: "Recruitment Operations",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote:
      "Kami akhirnya punya alasan yang jelas di balik scoring kandidat. Diskusi hiring manager jadi lebih cepat dan objektif.",
    name: "Alvin Pratama",
    role: "People Operations Lead",
    company: "Glints",
    impact: "Alignment hiring panel naik 2.1x",
    metric: "2.1x",
    metricLabel: "Konsensus panel interview naik",
    track: "People Decision Quality",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  },
  {
    quote:
      "Sebagai jobseeker, saya jadi tahu role mana yang paling cocok dan skill gap mana yang perlu dikejar dulu.",
    name: "Salsa Wibowo",
    role: "Product Analyst Candidate",
    company: "CareerMatch User",
    impact: "Interview callback naik 38%",
    metric: "38%",
    metricLabel: "Peningkatan interview callback",
    track: "Candidate Journey",
    avatarUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=80",
  },
];

type ContactFormValues = {
  name: string;
  email: string;
  company: string;
  message: string;
};

function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutSectionRef,
    offset: ["start end", "end start"],
  });
  const scopeParallaxY = [
    useTransform(aboutProgress, [0, 1], [-38, 42]),
    useTransform(aboutProgress, [0, 1], [14, -30]),
    useTransform(aboutProgress, [0, 1], [-10, 24]),
  ];
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.7,
    ease: [0.32, 0.72, 0, 1],
  } as const;
  const reveal = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 28,
    },
    show: { opacity: 1, y: 0 },
  };
  const stagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  } as const;
  const contactForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    } as ContactFormValues,
    onSubmit: async ({ value }) => {
      const subject = encodeURIComponent(
        `CareerMatch inquiry from ${value.name.trim()}`,
      );
      const body = encodeURIComponent(
        `Nama: ${value.name.trim()}\nEmail: ${value.email.trim()}\nPerusahaan: ${value.company.trim() || "-"}\n\nPesan:\n${value.message.trim()}`,
      );
      const mailtoUrl = `mailto:contact@careermatch.id?subject=${subject}&body=${body}`;
      if (typeof window !== "undefined") {
        window.location.href = mailtoUrl;
      }
      toast.success("Draft email siap. Lanjut kirim dari email client.");
    },
  });

  return (
    <main className="min-h-dvh bg-[#f8f3eb] text-[#2e2016]">
      <AppNavbar />
      <RoleRedirectGate />

      {/* Hero */}
      <section
        className="paper-grid pt-16 relative overflow-hidden border-border border-b bg-[#faf5ed]"
        id="home"
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.45 }
              : { opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }
          }
          className="pointer-events-none absolute -top-28 -left-20 size-[24rem] rounded-full bg-[#f6e7d5] blur-3xl"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 9.5,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.4 }
              : { opacity: [0.25, 0.45, 0.25], x: [0, -14, 0], y: [0, 12, 0] }
          }
          className="pointer-events-none absolute right-0 bottom-[-7rem] size-[26rem] rounded-full bg-[#ddc2aa73] blur-3xl"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 10.5,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 grid flex-1 gap-12 py-12 md:grid-cols-[0.92fr_1.08fr] md:items-center lg:py-20">
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
                  Mulai Analisis
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
              whileHover={
                shouldReduceMotion ? undefined : { y: -4, scale: 1.003 }
              }
            >
              <div className="overflow-hidden rounded-[0.35rem] border border-border bg-card">
                <div className="flex items-center justify-between border-border border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-red-400" />
                    <span className="size-2 rounded-full bg-yellow-400" />
                    <span className="size-2 rounded-full bg-green-400" />
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
                        <motion.div
                          className="rounded-lg border border-border bg-background p-3"
                          key={label}
                          whileHover={
                            shouldReduceMotion
                              ? undefined
                              : { y: -2, scale: 1.015 }
                          }
                        >
                          <p className="text-muted-foreground text-xs">
                            {label}
                          </p>
                          <p className="mt-1 font-medium text-xl">{value}</p>
                        </motion.div>
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
                        <motion.div
                          className="grid gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-[1fr_auto]"
                          key={match.role}
                          whileHover={
                            shouldReduceMotion ? undefined : { x: 4, y: -1 }
                          }
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
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid border-border border-t sm:grid-cols-5">
                  {pipelineSteps.map((step, index) => (
                    <motion.div
                      className="flex items-center gap-2 border-border border-b px-4 py-3 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
                      key={step}
                      whileHover={
                        shouldReduceMotion ? undefined : { y: -1, scale: 1.01 }
                      }
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
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        className="relative overflow-hidden border-[#d2c1ad] border-y bg-[#f6ede2] px-4 py-24 sm:px-6 lg:px-8"
        id="about"
        ref={aboutSectionRef}
      >
        <div className="pointer-events-none absolute -top-24 left-[8%] size-72 rounded-full bg-[#fdf5e9] blur-3xl" />
        <div className="pointer-events-none absolute right-[4%] bottom-0 size-80 rounded-full bg-[#e8d2bc4d] blur-3xl" />
        <motion.div
          className="relative z-10 mx-auto max-w-7xl"
          initial="hidden"
          transition={transition}
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="show"
        >
          <div className="grid gap-12 lg:grid-cols-[0.96fr_1.04fr]">
            <motion.div
              className="lg:sticky lg:top-28 lg:self-start"
              variants={reveal}
            >
              <Badge
                className="rounded-full border-[#9f7a5e] bg-[#f8f1e8] px-3 py-1 uppercase tracking-[0.2em]"
                variant="outline"
              >
                Tentang CareerMatch
              </Badge>
              <h2 className="mt-6 text-4xl text-editorial leading-tight md:text-6xl">
                Desain alur rekrutmen yang terasa presisi, hangat, dan bisa
                diandalkan tim.
              </h2>
              <p className="mt-6 max-w-xl text-[#5f4736] leading-8">
                CareerMatch bukan hanya mesin skor. Platform ini merapikan cara
                jobseeker dipetakan dan cara tim HRD memutuskan kandidat, dari
                intake CV sampai prioritas shortlist akhir.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full bg-[#3b271b] text-[#fdf7ef] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#513525]",
                  )}
                  href="#contact"
                >
                  Diskusi kebutuhan tim
                </a>
                <a
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "rounded-full border-[#b9967a] bg-[#f8efe2] text-[#4b3324]",
                  )}
                  href="#features"
                >
                  Lihat arsitektur fitur
                </a>
              </div>
            </motion.div>

            <div className="grid gap-5">
              {scopeItems.map((item, index) => (
                <motion.article
                  className={cn(
                    "relative transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform",
                    index === 1 && "lg:translate-x-8",
                    index === 2 && "lg:-translate-x-4",
                  )}
                  key={item.title}
                  style={{ y: shouldReduceMotion ? 0 : scopeParallaxY[index] }}
                  variants={reveal}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                >
                  <div className="rounded-[2rem] bg-[#c6a98e1a] p-1.5 ring-1 ring-[#8b644a33]">
                    <div className="relative rounded-[calc(2rem-0.375rem)] bg-[#fffdfa] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85)]">
                      <span className="absolute top-5 right-6 font-medium text-[#bca48d] text-xs tracking-[0.24em]">
                        0{index + 1}
                      </span>
                      <div className="flex size-12 items-center justify-center rounded-full border border-[#dbc7b3] bg-[#f5ecdf]">
                        <item.icon
                          aria-hidden="true"
                          className="size-5 text-[#684835]"
                          strokeWidth={1.4}
                        />
                      </div>
                      <h3 className="mt-6 text-2xl text-editorial leading-tight">
                        {item.title}
                      </h3>
                      <p className="mt-4 max-w-2xl text-[#5f4736] leading-7">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          <motion.div
            className="mt-14 rounded-[2rem] bg-[#c6a98d1f] p-1.5 ring-1 ring-[#8a63493d]"
            variants={reveal}
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#fffdfa] p-6 md:p-7">
              <div className="grid gap-3 md:grid-cols-3">
                {aboutSignals.map((item) => (
                  <motion.div
                    className="rounded-2xl border border-[#ddc9b8] bg-[#fff9f0] px-5 py-5"
                    key={item.label}
                    whileHover={
                      shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }
                    }
                  >
                    <p className="font-medium text-3xl text-[#3f291b] text-editorial leading-none">
                      {item.value}
                    </p>
                    <p className="mt-3 font-medium text-[#5e4332] text-sm">
                      {item.label}
                    </p>
                    <p className="mt-2 text-[#7d604a] text-sm leading-6">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section
        className="relative overflow-hidden bg-[#fbf8f2] px-4 py-24 sm:px-6 lg:px-8"
        id="features"
      >
        <div className="pointer-events-none absolute -top-28 right-[12%] size-72 rounded-full bg-[#f7ebde] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[6%] size-96 rounded-full bg-[#e0c6ad40] blur-3xl" />
        <motion.div
          className="relative z-10 mx-auto max-w-7xl"
          initial="hidden"
          transition={transition}
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="show"
        >
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <motion.div variants={reveal}>
              <Badge className="rounded-full bg-[#4b3425] px-3 py-1 text-[#fffaf4] uppercase tracking-[0.2em]">
                Fitur utama
              </Badge>
              <h2 className="mt-6 text-4xl text-editorial leading-tight md:text-6xl">
                Engine rekomendasi yang jelas logikanya, cepat aksi timnya.
              </h2>
              <p className="mt-6 max-w-xl text-[#5f4736] leading-8">
                Setiap modul didesain untuk mengurangi tebak-tebakan saat
                screening. Hasilnya bukan angka mentah, tetapi alasan yang bisa
                dipakai HRD dan jobseeker buat langkah lanjut.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {pipelineSteps.slice(0, 3).map((step, index) => (
                  <motion.div
                    className="flex items-center gap-3 rounded-xl border border-[#dcc8b6] bg-[#fff7ed] px-4 py-3"
                    key={step}
                    whileHover={
                      shouldReduceMotion ? undefined : { x: 3, scale: 1.005 }
                    }
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#3f2a1d] text-[#fff7ed] text-xs">
                      0{index + 1}
                    </span>
                    <span className="font-medium text-[#573d2c] text-sm">
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="h-full self-start rounded-[2rem] bg-[#c6a98d1f] p-1.5 ring-1 ring-[#8a63493d]"
              variants={reveal}
              whileHover={
                shouldReduceMotion ? undefined : { y: -4, scale: 1.003 }
              }
            >
              <div className="flex h-full flex-col rounded-[calc(2rem-0.375rem)] bg-[#fffdfa] p-7 md:p-8">
                <p className="font-medium text-[#7b5d49] text-xs uppercase tracking-[0.2em]">
                  Flagship module
                </p>
                <div className="mt-4 flex size-12 items-center justify-center rounded-full border border-[#ddc8b0] bg-[#f6ede0]">
                  <BrainIcon
                    aria-hidden="true"
                    className="size-5 text-[#6b4b38]"
                    strokeWidth={1.4}
                  />
                </div>
                <h3 className="mt-5 text-3xl text-editorial leading-tight">
                  {featureCards[0]?.title}
                </h3>
                <p className="mt-4 text-[#604938] leading-7">
                  {featureCards[0]?.description}
                </p>
                <div className="mt-auto grid">
                  <div className="mt-auto grid gap-3 sm:grid-cols-3">
                    {[
                      ["Parser", "Skill + experience extraction"],
                      ["Matcher", "Job relevance scoring"],
                      ["Guide", "Gap insight + next move"],
                    ].map(([label, desc]) => (
                      <motion.div
                        className="rounded-xl border border-[#e3d2c2] bg-[#fff8ef] px-3 py-3"
                        key={label}
                        whileHover={
                          shouldReduceMotion
                            ? undefined
                            : { y: -3, scale: 1.01 }
                        }
                      >
                        <p className="font-medium text-[#4a3324] text-sm">
                          {label}
                        </p>
                        <p className="mt-1 text-[#7d604a] text-xs leading-5">
                          {desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Context-aware parser",
                      "Transparent scoring rationale",
                      "Recruiter-first action layer",
                    ].map((item) => (
                      <span
                        className="rounded-full border border-[#dfcebd] bg-[#fff6eb] px-3 py-1.5 text-[#6f5240] text-xs tracking-[0.08em]"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {featureCards.slice(1).map((feature, index) => (
              <motion.article
                className={cn(
                  "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  index === 1 && "md:-translate-y-4",
                )}
                key={feature.title}
                variants={reveal}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -5, scale: 1.006 }
                }
              >
                <div className="h-full rounded-[1.7rem] bg-[#c6a98d1a] p-1 ring-1 ring-[#88614833]">
                  <div className="flex h-full flex-col rounded-[calc(1.7rem-0.25rem)] bg-[#fffefb] p-6">
                    <div className="flex size-11 items-center justify-center rounded-full border border-[#ddc8b0] bg-[#f6ede0]">
                      <feature.icon
                        aria-hidden="true"
                        className="size-5 text-[#6b4b38]"
                        strokeWidth={1.4}
                      />
                    </div>
                    <h3 className="mt-5 text-2xl text-editorial leading-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-[#604938] leading-7">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="mt-14 rounded-[2rem] bg-[#c6a98d1f] p-1.5 ring-1 ring-[#8a63493d]"
            variants={reveal}
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#fffdfa] p-7 md:p-8">
              <h3 className="text-3xl text-editorial leading-tight">
                Workflow yang bisa dibaca semua role.
              </h3>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {featureFlow.map((item, index) => (
                  <motion.div
                    className="rounded-2xl border border-[#dfccba] bg-[#fffaf2] px-5 py-5"
                    key={item.title}
                    whileHover={
                      shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }
                    }
                  >
                    <p className="font-medium text-[#aa8a74] text-xs tracking-[0.2em]">
                      STEP 0{index + 1}
                    </p>
                    <p className="mt-3 font-medium text-[#4a3324] text-editorial text-lg">
                      {item.title}
                    </p>
                    <p className="mt-2 text-[#6f5240] text-sm leading-7">
                      {item.body}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {roleDashboardSummaries.map((item) => (
                  <motion.div
                    className="rounded-2xl border border-[#dfccba] bg-[#fffaf2] px-5 py-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5"
                    key={item.title}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Link
                        className="font-medium hover:underline"
                        to={item.to}
                      >
                        {item.title}
                      </Link>
                      <span className="text-[#6f5240] text-sm">
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden border-[#d9c7b4] border-t bg-[#f7f1e8] px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.42 }
              : { opacity: [0.25, 0.45, 0.25], x: [0, 12, 0], y: [0, -8, 0] }
          }
          className="pointer-events-none absolute top-8 right-[5%] size-64 rounded-full bg-[#ead6c0] blur-3xl"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 9.1,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />
        <motion.div
          className="relative z-10 mx-auto max-w-7xl"
          initial="hidden"
          transition={transition}
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="show"
        >
          <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
            <motion.div
              className="lg:sticky lg:top-28 lg:self-start"
              variants={reveal}
            >
              <Badge
                className="rounded-full border-[#b89578] bg-[#fff5e8] px-3 py-1 text-[#5e4332] uppercase tracking-[0.2em]"
                variant="outline"
              >
                Testimoni
              </Badge>
              <h2 className="mt-5 text-4xl text-editorial leading-tight md:text-6xl">
                Dipakai tim nyata, hasilnya bisa diukur.
              </h2>
              <p className="mt-5 max-w-xl text-[#6e5240] leading-8">
                Masukan dari recruiter dan kandidat yang sudah pakai CareerMatch
                untuk decision flow harian.
              </p>
            </motion.div>

            <div className="flex flex-col gap-5">
              {testimonials.map((item, index) => (
                <motion.article
                  className="w-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  key={item.name}
                  variants={reveal}
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -5, scale: 1.006 }
                  }
                >
                  <div className="h-full rounded-[1.85rem] bg-[#c6a98d1c] p-1.5 ring-1 ring-[#8b634932]">
                    <div className="rounded-[calc(1.85rem-0.375rem)] bg-[#fffdfa] p-5 md:p-6">
                      <div className="grid gap-4 md:grid-cols-[13rem_1fr]">
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-[#e3d2c2] bg-[#fff8ef] p-4">
                            <div className="flex items-center gap-3">
                              <img
                                alt={`Avatar ${item.name}`}
                                className="size-12 rounded-full border border-[#d3baa3] object-cover"
                                decoding="async"
                                loading="lazy"
                                src={item.avatarUrl}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-[#3d291c] text-sm">
                                  {item.name}
                                </p>
                                <p className="truncate text-[#735744] text-xs">
                                  {item.role}
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 text-[#8a6b54] text-[11px] uppercase tracking-[0.18em]">
                              {item.track}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#dbc8b5] bg-[#f7ecde] p-4">
                            <p className="text-[#8f6f58] text-[11px] uppercase tracking-[0.16em]">
                              Impact metric
                            </p>
                            <p className="mt-2 text-3xl text-[#3a2619] text-editorial leading-none">
                              {item.metric}
                            </p>
                            <p className="mt-2 text-[#6e5240] text-xs leading-5">
                              {item.metricLabel}
                            </p>
                            <div className="mt-3 flex gap-1.5">
                              {[
                                "bar-alpha",
                                "bar-beta",
                                "bar-gamma",
                                "bar-delta",
                                "bar-epsilon",
                              ].map((barKey, barIndex) => (
                                <span
                                  className={cn(
                                    "h-1.5 flex-1 rounded-full",
                                    barIndex <= index + 2
                                      ? "bg-[#6a4a35]"
                                      : "bg-[#dac7b5]",
                                  )}
                                  key={`${item.name}-${barKey}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#e6d8c9] bg-[#fffdf9] p-5">
                          <p className="font-medium text-[#9f7b60] text-xs tracking-[0.2em]">
                            VERIFIED TESTIMONY
                          </p>
                          <p className="mt-4 text-2xl text-[#4b3324] text-editorial leading-9">
                            “{item.quote}”
                          </p>
                          <div className="mt-5 flex flex-wrap items-center gap-2 border-[#eadfd2] border-t pt-4">
                            <span className="rounded-full border border-[#dccbb9] bg-[#fff8ef] px-3 py-1 text-[#5a3f2d] text-xs">
                              {item.company}
                            </span>
                            <span className="rounded-full border border-[#dccbb9] bg-[#fff8ef] px-3 py-1 text-[#5a3f2d] text-xs">
                              {item.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact */}
      <section
        className="relative overflow-hidden border-[#7e5a42] border-t bg-[#2c1d13] px-4 py-24 text-[#f8f2e8] sm:px-6 lg:px-8"
        id="contact"
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.28 }
              : { opacity: [0.2, 0.32, 0.2], x: [0, 16, 0], y: [0, -12, 0] }
          }
          className="pointer-events-none absolute -top-20 right-12 size-80 rounded-full bg-[#86654d7a] blur-3xl"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 10.2,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.22 }
              : { opacity: [0.15, 0.28, 0.15], x: [0, -14, 0], y: [0, 10, 0] }
          }
          className="pointer-events-none absolute bottom-0 left-[4%] size-72 rounded-full bg-[#b58f6c52] blur-3xl"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 11.1,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />
        <motion.div
          className="relative z-10 mx-auto max-w-7xl"
          initial="hidden"
          transition={transition}
          variants={stagger}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="show"
        >
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={reveal}
          >
            <Badge
              className="rounded-full border-[#9e7a61] bg-[#3a271c] px-3 py-1 text-[#f9efe2] uppercase tracking-[0.2em]"
              variant="outline"
            >
              Kontak
            </Badge>
            <h2 className="mt-6 text-4xl text-editorial leading-tight md:text-6xl">
              Tertarik bekerja sama?
            </h2>
            <p className="mt-6 text-[#d7c5b2] leading-8">
              Kami terbuka untuk diskusi terkait kerja sama perusahaan,
              implementasi untuk tim HRD, atau informasi lebih lanjut tentang
              fitur dan roadmap CareerMatch.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div className="space-y-4" variants={reveal}>
              {contactInfo.map((item) => (
                <motion.div
                  className="rounded-[1.7rem] bg-[#b8967833] p-1 ring-1 ring-[#bc9b7d5c]"
                  key={item.label}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { x: 3, y: -3, scale: 1.01 }
                  }
                >
                  <div className="rounded-[calc(1.7rem-0.25rem)] bg-[#fffaf2] px-5 py-5">
                    <div className="flex items-center gap-4">
                      <span className="flex size-10 items-center justify-center rounded-full border border-[#8f6e54] bg-[#4b3324]">
                        <item.icon
                          aria-hidden="true"
                          className="size-4 text-[#f7ebdf]"
                          strokeWidth={1.4}
                        />
                      </span>
                      <div>
                        <p className="text-[#352316] text-sm">{item.label}</p>
                        {item.href ? (
                          <a
                            className="font-medium text-[#6a4f3d] hover:underline"
                            href={item.href}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-medium text-[#6a4f3d]">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <p className="max-w-md text-[#cdb8a3] text-sm leading-7">
                Prefer jalur cepat? Kirim konteks singkat lewat email, tim kami
                balas maksimal 1x24 jam kerja.
              </p>
            </motion.div>

            <motion.div
              className="rounded-[2rem] bg-[#b8967833] p-1.5 ring-1 ring-[#bc9b7d5c]"
              variants={reveal}
              whileHover={
                shouldReduceMotion ? undefined : { y: -3, scale: 1.003 }
              }
            >
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#fffaf2] p-7 text-[#352316] md:p-8">
                <h3 className="text-3xl text-editorial leading-tight">
                  Mulai percakapan
                </h3>
                <p className="mt-3 text-[#6a4f3d] text-sm leading-7">
                  Isi form, lalu kami siapkan draft email otomatis agar proses
                  koordinasi lebih cepat.
                </p>

                <form
                  className="mt-8"
                  onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void contactForm.handleSubmit();
                  }}
                >
                  <FieldGroup className="gap-5">
                    <contactForm.Field
                      name="name"
                      validators={{
                        onChange: ({ value }) =>
                          value.trim().length < 2
                            ? "Nama minimal 2 karakter."
                            : undefined,
                      }}
                    >
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="contact-name">Nama</FieldLabel>
                          <Input
                            className="h-11 border-[#cdb8a3] bg-[#fffdf9] focus-visible:ring-[#8b654b]/35"
                            id="contact-name"
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder="Nama lengkap"
                            required
                            value={field.state.value}
                          />
                          {(field.state.meta.errors[0] as
                            | string
                            | undefined) ? (
                            <FieldError>
                              {field.state.meta.errors[0] as string}
                            </FieldError>
                          ) : null}
                        </Field>
                      )}
                    </contactForm.Field>

                    <div className="grid gap-5 md:grid-cols-2">
                      <contactForm.Field
                        name="email"
                        validators={{
                          onChange: ({ value }) =>
                            /^\S+@\S+\.\S+$/.test(value.trim())
                              ? undefined
                              : "Format email tidak valid.",
                        }}
                      >
                        {(field) => (
                          <Field>
                            <FieldLabel htmlFor="contact-email">
                              Email
                            </FieldLabel>
                            <Input
                              className="h-11 border-[#cdb8a3] bg-[#fffdf9] focus-visible:ring-[#8b654b]/35"
                              id="contact-email"
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              placeholder="email@perusahaan.com"
                              required
                              type="email"
                              value={field.state.value}
                            />
                            {(field.state.meta.errors[0] as
                              | string
                              | undefined) ? (
                              <FieldError>
                                {field.state.meta.errors[0] as string}
                              </FieldError>
                            ) : null}
                          </Field>
                        )}
                      </contactForm.Field>

                      <contactForm.Field name="company">
                        {(field) => (
                          <Field>
                            <FieldLabel htmlFor="contact-company">
                              Perusahaan
                            </FieldLabel>
                            <Input
                              className="h-11 border-[#cdb8a3] bg-[#fffdf9] focus-visible:ring-[#8b654b]/35"
                              id="contact-company"
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              placeholder="Nama perusahaan"
                              value={field.state.value}
                            />
                          </Field>
                        )}
                      </contactForm.Field>
                    </div>

                    <contactForm.Field
                      name="message"
                      validators={{
                        onChange: ({ value }) =>
                          value.trim().length < 20
                            ? "Pesan minimal 20 karakter."
                            : undefined,
                      }}
                    >
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="contact-message">
                            Pesan
                          </FieldLabel>
                          <textarea
                            className="min-h-32 w-full rounded-md border border-[#cdb8a3] bg-[#fffdf9] px-3 py-2 text-sm leading-6 outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-3 focus-visible:ring-[#8b654b]/35"
                            id="contact-message"
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder="Ceritakan kebutuhan tim, target timeline, dan konteks kerja sama."
                            required
                            value={field.state.value}
                          />
                          {(field.state.meta.errors[0] as
                            | string
                            | undefined) ? (
                            <FieldError>
                              {field.state.meta.errors[0] as string}
                            </FieldError>
                          ) : null}
                        </Field>
                      )}
                    </contactForm.Field>

                    <contactForm.Subscribe
                      selector={(state) => [
                        state.isSubmitting,
                        state.canSubmit,
                      ]}
                    >
                      {([isSubmitting, canSubmit]) => (
                        <Button
                          className="group h-12 w-full rounded-full bg-[#2f1f14] px-6 text-[#fffaf2] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3c281b] disabled:opacity-70"
                          disabled={isSubmitting || !canSubmit}
                          type="submit"
                        >
                          {isSubmitting
                            ? "Menyiapkan..."
                            : "Siapkan draft email"}
                          <span className="ml-2 flex size-8 items-center justify-center rounded-full bg-[#f3e6d8]/15 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                            <ArrowRightIcon
                              aria-hidden="true"
                              className="size-4"
                            />
                          </span>
                        </Button>
                      )}
                    </contactForm.Subscribe>
                  </FieldGroup>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="border-[#d6c4b1] border-t bg-[#fffaf3] px-4 py-14 sm:px-6 lg:px-8"
        initial="hidden"
        transition={transition}
        variants={stagger}
        viewport={{ once: true, margin: "-60px" }}
        whileInView="show"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
            <motion.div variants={reveal}>
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
            </motion.div>

            <motion.div variants={reveal}>
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
            </motion.div>

            <motion.div variants={reveal}>
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
            </motion.div>
          </div>

          <motion.div
            className="mt-10 flex flex-col items-center justify-between gap-4 border-border border-t pt-8 md:flex-row"
            variants={reveal}
          >
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} CareerMatch. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <motion.a
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-foreground"
                href="https://linkedin.com"
                rel="noopener noreferrer"
                target="_blank"
                whileHover={
                  shouldReduceMotion ? undefined : { y: -2, scale: 1.08 }
                }
              >
                <Building2Icon aria-hidden="true" className="size-5" />
              </motion.a>
              <motion.a
                aria-label="Email"
                className="text-muted-foreground hover:text-foreground"
                href="mailto:contact@careermatch.id"
                whileHover={
                  shouldReduceMotion ? undefined : { y: -2, scale: 1.08 }
                }
              >
                <MailIcon aria-hidden="true" className="size-5" />
              </motion.a>
              <motion.a
                aria-label="Sparkles"
                className="text-muted-foreground hover:text-foreground"
                href="#features"
                whileHover={
                  shouldReduceMotion ? undefined : { y: -2, scale: 1.08 }
                }
              >
                <SparklesIcon aria-hidden="true" className="size-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </main>
  );
}
