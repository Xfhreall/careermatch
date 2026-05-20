import { Link } from "@tanstack/react-router"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  LogOutIcon,
  XIcon,
} from "lucide-react"

import { buttonVariants } from "@/shared/components/shadcn/ui/button"
import { cn } from "@/shared/lib/utils"

import type { SidebarItem } from "../lib/navigation"

interface DashboardSidebarProps {
  items: SidebarItem[]
  collapsed: boolean
  isLoggingOut: boolean
  mobileOpen: boolean
  onToggleCollapsed: () => void
  onLogout: () => void
  onToggleMobile: () => void
}

export function DashboardSidebar({
  items,
  collapsed,
  isLoggingOut,
  mobileOpen,
  onToggleCollapsed,
  onLogout,
  onToggleMobile,
}: DashboardSidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/80 md:hidden"
          onClick={onToggleMobile}
          aria-label="Tutup sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen flex-col border-border border-r bg-card transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "w-16" : "w-64",
          "hidden md:flex"
        )}
        aria-label="Sidebar navigasi"
      >
        <div className="flex h-14 items-center border-border border-b px-2">
          {!collapsed && (
            <span className="px-2 font-semibold text-foreground">
              CareerMatch
            </span>
          )}
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "ml-auto",
              collapsed ? "mr-2" : "mr-0"
            )}
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon aria-hidden="true" className="size-4" />
            ) : (
              <ChevronLeftIcon aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    activeProps={{
                      className:
                        "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary",
                    }}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "default" }),
                      "w-full justify-start gap-3",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-border border-t p-2">
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              "w-full justify-start gap-3 text-destructive hover:text-destructive",
              collapsed && "justify-center px-2"
            )}
            disabled={isLoggingOut}
            onClick={onLogout}
            aria-label="Keluar"
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="size-5 shrink-0 animate-spin"
              />
            ) : (
              <LogOutIcon aria-hidden="true" className="size-5 shrink-0" />
            )}
            {!collapsed && (
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            )}
          </button>
        </div>
      </aside>

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-border border-r bg-card transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigasi"
      >
        <div className="flex h-14 items-center justify-between border-border border-b px-4">
          <span className="font-medium text-foreground">CareerMatch</span>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" })
            )}
            onClick={onToggleMobile}
            aria-label="Tutup sidebar"
          >
            <XIcon aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    activeProps={{
                      className:
                        "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary",
                    }}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "default" }),
                      "w-full justify-start gap-3"
                    )}
                    onClick={onToggleMobile}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-border border-t p-2">
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              "w-full justify-start gap-3 text-destructive hover:text-destructive"
            )}
            disabled={isLoggingOut}
            onClick={onLogout}
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="size-5 shrink-0 animate-spin"
              />
            ) : (
              <LogOutIcon aria-hidden="true" className="size-5 shrink-0" />
            )}
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
