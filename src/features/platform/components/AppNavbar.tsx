import { Link } from "@tanstack/react-router"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { AuthNavButton } from "@/features/auth/components/AuthNavButton"
import { cn } from "@/shared/lib/utils"

import { BriefcaseBusinessIcon } from "../data"

const navItems = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#features", label: "Features" },
  { href: "/#contact", label: "Contact" },
] as const

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
}

const listVariants = {
  closed: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.07,
    },
  },
}

const itemVariants = {
  closed: { opacity: 0, y: 20 },
  open: { opacity: 1, y: 0 },
}

export function AppNavbar() {
  const shouldReduceMotion = useReducedMotion()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isShrunk, setIsShrunk] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHref, setActiveHref] = useState("/#home")
  const lastScrollY = useRef(0)
  const scrollY = useScroll().scrollY

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current
    setIsScrolled(latest > 16)

    if (!shouldReduceMotion) {
      if (latest > previous && latest > 90) {
        setIsShrunk(true)
      } else if (latest < previous - 8) {
        setIsShrunk(false)
      }
    }

    lastScrollY.current = latest
  })

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleEscape)
    }
  }, [mobileOpen])

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace("/#", ""))
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    const setActiveSection = (sectionId: string) => {
      const nextHref = `/#${sectionId}`
      setActiveHref((previous) => (previous === nextHref ? previous : nextHref))
    }

    const setFromHash = () => {
      const hash = window.location.hash.replace("#", "")
      if (!hash || !sectionIds.includes(hash)) {
        setActiveSection("home")
        return
      }
      setActiveSection(hash)
    }

    const setFromViewport = () => {
      if (sections.length === 0) {
        return
      }

      const viewportMarker = Math.min(
        260,
        Math.max(112, Math.round(window.innerHeight * 0.34))
      )
      let currentSection = sections[0]?.id ?? "home"

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= viewportMarker) {
          currentSection = section.id
        }
      }

      const scrollBottom = window.innerHeight + window.scrollY
      const fullHeight = document.documentElement.scrollHeight
      if (fullHeight - scrollBottom < 20) {
        currentSection = sections[sections.length - 1]?.id ?? currentSection
      }

      setActiveSection(currentSection)
    }

    const observer =
      sections.length > 0
        ? new IntersectionObserver(
            (entries) => {
              const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                  (first, second) =>
                    second.intersectionRatio - first.intersectionRatio
                )[0]

              if (visible) {
                setActiveSection((visible.target as HTMLElement).id)
              }
            },
            {
              root: null,
              rootMargin: "-26% 0px -56% 0px",
              threshold: [0.16, 0.4, 0.72],
            }
          )
        : null

    setFromHash()
    setFromViewport()

    for (const section of sections) {
      observer?.observe(section)
    }

    window.addEventListener("hashchange", setFromHash)
    window.addEventListener("scroll", setFromViewport, { passive: true })
    window.addEventListener("resize", setFromViewport)

    return () => {
      observer?.disconnect()
      window.removeEventListener("hashchange", setFromHash)
      window.removeEventListener("scroll", setFromViewport)
      window.removeEventListener("resize", setFromViewport)
    }
  }, [])

  const handleNavClick = () => setMobileOpen(false)

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <motion.nav
          animate={{
            marginTop: isScrolled ? 12 : 20,
            width: isScrolled
              ? "min(1024px, calc(100% - 1.5rem))"
              : "min(1200px, calc(100% - 1.5rem))",
          }}
          className={cn(
            "pointer-events-auto relative mx-auto border border-[#d8c6b2]/70 bg-[#fffaf2]/90 shadow-[0_22px_55px_-32px_rgba(78,51,32,0.45)] backdrop-blur-xl",
            isScrolled ? "rounded-[2.2rem]" : "rounded-[2.4rem]"
          )}
          initial={false}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.7, ease: [0.32, 0.72, 0, 1] }
          }
        >
          <div
            className={cn(
              "mx-auto flex w-full items-center px-4 sm:px-5 lg:px-6",
              isShrunk ? "h-[3.45rem]" : "h-[3.9rem]"
            )}
          >
            <Link className="group flex items-center gap-2.5" to="/">
              <span
                className={cn(
                  "flex items-center justify-center rounded-full border border-[#cdb8a3] bg-[#f6ede2] text-[#5f402d] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  isShrunk ? "size-8" : "size-9"
                )}
              >
                <BriefcaseBusinessIcon
                  aria-hidden="true"
                  className={cn(
                    "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    isShrunk ? "size-3.5" : "size-4"
                  )}
                  strokeWidth={1.5}
                />
              </span>
              <span className="font-medium text-[#3c281a] text-sm sm:text-base">
                CareerMatch
              </span>
            </Link>

            <div className="mx-auto hidden items-center gap-1.5 md:flex">
              {navItems.map((item) => {
                const isActive = activeHref === item.href
                return (
                  <a
                    className={cn(
                      "relative rounded-full px-4 py-2 font-medium text-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      isActive
                        ? "text-[#2e1e13]"
                        : "text-[#674a37] hover:bg-[#efe2d4] hover:text-[#2e1e13]"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {isActive ? (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-[#ecdcc8]"
                        layoutId="active-desktop-nav-item"
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { duration: 0.42, ease: [0.32, 0.72, 0, 1] }
                        }
                      />
                    ) : null}
                    <span className="relative z-10">{item.label}</span>
                  </a>
                )
              })}
            </div>

            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <div className="hidden sm:block">
                <AuthNavButton />
              </div>

              <button
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="group relative flex size-10 items-center justify-center rounded-full border border-[#d0bda8] bg-[#f8ede1] text-[#563a29] md:hidden"
                onClick={() => setMobileOpen((previous) => !previous)}
                type="button"
              >
                <span className="sr-only">Toggle navigation</span>
                <motion.span
                  animate={
                    mobileOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }
                  }
                  className="absolute h-[1.5px] w-4 rounded-full bg-current"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.46, ease: [0.32, 0.72, 0, 1] }
                  }
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="absolute h-[1.5px] w-4 rounded-full bg-current"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.38, ease: [0.32, 0.72, 0, 1] }
                  }
                />
                <motion.span
                  animate={
                    mobileOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }
                  }
                  className="absolute h-[1.5px] w-4 rounded-full bg-current"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.46, ease: [0.32, 0.72, 0, 1] }
                  }
                />
              </button>
            </div>
          </div>
        </motion.nav>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            animate="open"
            className="fixed inset-0 z-30 md:hidden"
            exit="closed"
            initial="closed"
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.56, ease: [0.32, 0.72, 0, 1] }
            }
            variants={overlayVariants}
          >
            <div className="absolute inset-0 bg-[#20140d]/78 backdrop-blur-3xl" />
            <motion.div
              animate="open"
              className="relative flex min-h-dvh flex-col px-4 pt-28 pb-10"
              exit="closed"
              initial="closed"
              variants={listVariants}
            >
              <div className="mx-auto w-full max-w-md space-y-3">
                {navItems.map((item) => {
                  const isActive = activeHref === item.href
                  return (
                    <motion.a
                      className={cn(
                        "flex min-h-12 items-center justify-between rounded-2xl border px-5 py-3 font-medium text-xl",
                        isActive
                          ? "border-[#e5ccb3] bg-[#fff7eb] text-[#3a2416]"
                          : "border-[#a7876d52] bg-[#fffaf11a] text-[#f8eee1]"
                      )}
                      href={item.href}
                      key={item.href}
                      onClick={handleNavClick}
                      variants={itemVariants}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full",
                          isActive ? "bg-[#f1e2cf]" : "bg-[#fff1dd1f]"
                        )}
                      >
                        ↗
                      </span>
                    </motion.a>
                  )
                })}
              </div>

              <motion.div
                className="mx-auto mt-8 w-full max-w-md"
                variants={itemVariants}
              >
                <div className="rounded-[1.7rem] border border-[#a7876d4f] bg-[#fffaf20f] p-1">
                  <div className="rounded-[calc(1.7rem-0.25rem)] bg-[#fff5e80d] p-4">
                    <AuthNavButton />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
