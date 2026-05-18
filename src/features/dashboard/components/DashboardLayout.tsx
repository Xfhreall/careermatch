"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getUserRole, type AppRole } from "@/features/auth/role-routing";
import { useUserQuery, userQueryKey } from "@/features/auth/user-query";
import { Button } from "@/shared/components/shadcn/ui/button";
import { cn } from "@/shared/lib/utils";

import type { SidebarItem } from "../lib/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { RoleAccessGuard } from "./RoleGuard";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: AppRole;
  sidebarItems: SidebarItem[];
  allowedRoles?: AppRole[];
  user?: {
    image?: string | null;
    name: string;
    email: string;
  };
}

export function DashboardLayout({
  children,
  role,
  sidebarItems,
  allowedRoles,
  user: userProp,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const hasSession = Boolean(session.data?.user);
  const userQuery = useUserQuery({
    enabled: hasSession,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sessionRole = getUserRole(session.data?.user);
  const cachedUser = userQuery.data;
  const effectiveAllowedRoles = allowedRoles ?? [role];
  const canRenderDashboard =
    !session.isPending &&
    hasSession &&
    effectiveAllowedRoles.includes(sessionRole);

  const user = userProp ?? {
    name: cachedUser?.name ?? session.data?.user?.name ?? "User",
    email: cachedUser?.email ?? session.data?.user?.email ?? "",
    image: cachedUser?.image ?? session.data?.user?.image ?? null,
  };
  const roleForLabel = cachedUser?.role ?? sessionRole;
  const userInitials = useMemo(() => {
    const source = user.name.trim() || user.email.trim() || "U";
    const normalized = source.includes("@") ? source.split("@")[0] : source;
    const words = normalized.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return words
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");
    }

    const compact = normalized.replace(/\s+/g, "");
    return compact.slice(0, 2).toUpperCase() || "U";
  }, [user.email, user.name]);
  const roleLabel =
    roleForLabel === "superadmin"
      ? "Superadmin"
      : roleForLabel === "hrd"
        ? "HRD"
        : "Jobseeker";

  function handleToggleMobile() {
    setMobileSidebarOpen((prev) => !prev);
  }

  function handleToggleCollapsed() {
    setSidebarCollapsed((prev) => !prev);
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authClient.signOut();
      queryClient.removeQueries({ queryKey: userQueryKey });
      void navigate({ replace: true, to: "/" });
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!canRenderDashboard) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-background">
        <RoleAccessGuard allowedRoles={effectiveAllowedRoles} />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <RoleAccessGuard allowedRoles={effectiveAllowedRoles} />
      <DashboardSidebar
        items={sidebarItems}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        isLoggingOut={isLoggingOut}
        onToggleCollapsed={handleToggleCollapsed}
        onLogout={handleLogout}
        onToggleMobile={handleToggleMobile}
      />

      <div
        className={cn(
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64",
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-card px-4 md:px-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={handleToggleMobile}
                aria-label="Buka sidebar"
              >
                <MenuIcon aria-hidden="true" className="size-5" />
              </Button>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              {user.image ? (
                <img
                  alt={`Avatar ${user.name}`}
                  className="size-9 rounded-full border border-border object-cover"
                  src={user.image}
                />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground uppercase">
                  {userInitials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
