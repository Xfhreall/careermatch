import {
  ActivityIcon,
  BriefcaseIcon,
  FileSearchIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import type { AppRole } from "@/features/auth/lib/role-routing";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const jobseekerItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/jobseeker/dashboard",
    icon: LayoutDashboardIcon,
  },
  { label: "Analisis CV", href: "/jobseeker/analyze", icon: FileSearchIcon },
  { label: "Riwayat", href: "/jobseeker/history", icon: HistoryIcon },
  {
    label: "Chatbot",
    href: "/jobseeker/chatbot",
    icon: MessageSquareTextIcon,
  },
  { label: "Profile", href: "/jobseeker/profile", icon: UserIcon },
];

const hrdItems: SidebarItem[] = [
  { label: "Portal", href: "/hrd/portal", icon: BriefcaseIcon },
  { label: "Kelola Lowongan", href: "/hrd/jobs", icon: BriefcaseIcon },
  { label: "Kandidat", href: "/hrd/candidates", icon: UsersIcon },
  { label: "Profile", href: "/hrd/profile", icon: UserIcon },
];

const superadminItems: SidebarItem[] = [
  { label: "Monitoring", href: "/superadmin/monitoring", icon: ActivityIcon },
  {
    label: "Approval HRD",
    href: "/superadmin/hrd-approval",
    icon: ShieldCheckIcon,
  },
  {
    label: "Konfigurasi Model",
    href: "/superadmin/model-config",
    icon: SettingsIcon,
  },
  { label: "Profile", href: "/superadmin/profile", icon: UserIcon },
];

export function getNavigationItems(role: AppRole): SidebarItem[] {
  switch (role) {
    case "hrd":
      return hrdItems;
    case "superadmin":
      return superadminItems;
    default:
      return jobseekerItems;
  }
}
