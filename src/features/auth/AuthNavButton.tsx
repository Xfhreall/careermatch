import { useNavigate } from "@tanstack/react-router";
import { LogInIcon, LogOutIcon } from "lucide-react";
import * as React from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/shared/components/shadcn/ui/button";

import { getDashboardPathForRole, getUserRole } from "./role-routing";

export function AuthNavButton() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const isAuthenticated = Boolean(session.data?.user);
  const isPending = mounted ? session.isPending : true;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  async function handleDashboardClick() {
    setMenuOpen(false);
    const user = session.data?.user;
    if (!user) return;
    await navigate({
      to: getDashboardPathForRole(getUserRole(user)),
    });
  }

  async function handleLogout() {
    setMenuOpen(false);
    await authClient.signOut();
    await navigate({ to: "/" });
  }

  function handleAuthClick() {
    if (isAuthenticated) {
      setMenuOpen((prev) => !prev);
      return;
    }

    void navigate({ to: "/login" });
  }

  return (
    <div className="relative flex flex-col items-end gap-1">
      <Button disabled={isPending} onClick={handleAuthClick} variant="outline">
        <LogInIcon aria-hidden="true" data-icon="inline-start" />
        {isAuthenticated ? "Akun" : "Login"}
      </Button>

      {menuOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-44 rounded-lg border border-border bg-card p-1 shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
            onClick={handleDashboardClick}
          >
            <LogInIcon className="size-4" />
            Dashboard
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOutIcon className="size-4" />
            Keluar
          </button>
        </div>
      )}
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
