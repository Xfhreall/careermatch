import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { MenuIcon, XIcon } from "lucide-react";

import { AuthNavButton } from "@/features/auth/AuthNavButton";
import { buttonVariants } from "@/shared/components/shadcn/ui/button";
import { cn } from "@/shared/lib/utils";

import { BriefcaseBusinessIcon } from "../data";

const navItems = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#features", label: "Features" },
  { href: "/#contact", label: "Contact" },
] as const;

export function AppNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollY = useScroll().scrollY;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }

    if (!prefersReducedMotion) {
      if (latest > lastScrollY && latest > 60) {
        setIsShrunk(true);
      } else if (latest < lastScrollY) {
        setIsShrunk(false);
      }
    }

    setLastScrollY(latest);
  });

  // Close mobile menu on navigation
  const handleNavClick = () => setMobileOpen(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-full bg-background/80 backdrop-blur-md",
        !prefersReducedMotion && "transition-all duration-500 ease-in-out",
        isScrolled
          ? "max-w-3xl rounded-xl top-4 shadow-sm border-0"
          : "border-b",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8",
          !prefersReducedMotion && "transition-all duration-300",
          isShrunk ? "h-14" : "h-16",
        )}
      >
        {/* Logo */}
        <Link
          className={cn(
            "flex items-center gap-2.5 font-medium transition-all duration-300",
          )}
          to="/"
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-lg border border-border bg-card transition-all duration-300",
              isShrunk ? "size-7" : "size-8",
            )}
          >
            <BriefcaseBusinessIcon
              aria-hidden="true"
              className={cn(
                "text-foreground transition-all duration-300",
                isShrunk ? "size-3.5" : "size-4",
              )}
            />
          </span>
          <span className="text-base">CareerMatch</span>
        </Link>

        {/* Desktop nav items */}
        <div className="mx-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              className={cn(
                buttonVariants({ size: "sm", variant: "ghost" }),
                "text-muted-foreground hover:text-foreground",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Spacer + Auth */}
        <div className="flex items-center gap-2">
          <AuthNavButton />

          {/* Mobile menu toggle */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
          >
            {mobileOpen ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <a
                className={cn(
                  buttonVariants({ size: "sm", variant: "ghost" }),
                  "justify-start text-muted-foreground hover:text-foreground",
                )}
                href={item.href}
                key={item.href}
                onClick={handleNavClick}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
