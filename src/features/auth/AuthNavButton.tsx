import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogInIcon, LogOutIcon, PanelRightOpenIcon } from "lucide-react";
import * as React from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/shared/components/shadcn/ui/button";

import { getDashboardPathForRole, getUserRole } from "./role-routing";

export function AuthNavButton() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const session = authClient.useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const user = session.data?.user;
  const isAuthenticated = Boolean(user);
  const isPending = mounted ? session.isPending : true;
  const userRole = user ? getUserRole(user) : null;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  async function handleDashboardClick() {
    setMenuOpen(false);
    if (!user) {
      return;
    }

    await navigate({
      to: getDashboardPathForRole(userRole ?? "jobseeker"),
    });
  }

  async function handleLogout() {
    setMenuOpen(false);
    await authClient.signOut();
    await navigate({ to: "/" });
  }

  function handleAuthClick() {
    if (isAuthenticated) {
      setMenuOpen((previous) => !previous);
      return;
    }

    void navigate({ to: "/login" });
  }

  return (
    <div className="relative flex flex-col items-end gap-1">
      <Button
        className="w-full py-6 md:py-4 rounded-3xl md:rounded-full border-[#cdb8a3] bg-[#fdf7ef] px-4 text-[#4a3223] shadow-[0_12px_30px_-24px_rgba(75,48,29,0.55)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f6ebde]"
        disabled={isPending}
        onClick={handleAuthClick}
        ref={triggerRef}
        variant="outline"
      >
        <LogInIcon aria-hidden="true" data-icon="inline-start" />
        {isAuthenticated ? "Akun" : "Login"}
      </Button>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full right-0 z-50 mt-2 w-56 rounded-[1.35rem] border border-[#b9937655] bg-[#fffaf2] p-1"
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : -8,
              scale: shouldReduceMotion ? 1 : 0.98,
            }}
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : -10,
              scale: shouldReduceMotion ? 1 : 0.98,
            }}
            ref={menuRef}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.42, ease: [0.32, 0.72, 0, 1] }
            }
          >
            <div className="rounded-[calc(1.35rem-0.25rem)] border border-[#decab7] bg-[#fffdf9] p-2">
              <div className="mb-2 rounded-xl bg-[#f7eee1] px-3 py-2">
                <p className="font-medium text-[#4a3223] text-sm">
                  {user?.name ?? "CareerMatch user"}
                </p>
                <p className="mt-0.5 text-[#7a5d48] text-xs uppercase tracking-[0.12em]">
                  {userRole ?? "account"}
                </p>
              </div>

              <button
                className="flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[#4d3526] text-sm transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f1e3d3]"
                onClick={handleDashboardClick}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <PanelRightOpenIcon className="size-4" strokeWidth={1.55} />
                  Dashboard
                </span>
                <span className="text-xs">↗</span>
              </button>

              <button
                className="mt-1 flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[#9f2f2d] text-sm transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#fce9e8]"
                onClick={handleLogout}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <LogOutIcon className="size-4" strokeWidth={1.55} />
                  Keluar
                </span>
                <span className="text-xs">↗</span>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function RoleRedirectGate() {
  const navigate = useNavigate();
  const session = authClient.useSession();

  React.useEffect(() => {
    if (!session.data?.user) {
      return;
    }

    void navigate({
      replace: true,
      to: getDashboardPathForRole(getUserRole(session.data.user)),
    });
  }, [navigate, session.data?.user]);

  return null;
}

export { RoleAccessGuard } from "@/features/dashboard/components/RoleGuard";
