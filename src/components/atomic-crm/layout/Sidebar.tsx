import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { CanAccess, useTranslate, useUserMenu } from "ra-core";
import { Link, matchPath, useLocation } from "react-router";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { RefreshButton } from "@/components/admin/refresh-button";
import { UserMenu } from "@/components/admin/user-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { GlobalSearch } from "../misc/GlobalSearch";
import { ImportPage } from "../misc/ImportPage";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, labelKey: "ra.page.dashboard", match: "/" },
  {
    to: "/agenda",
    icon: CalendarDays,
    labelKey: "resources.agenda.name",
    match: "/agenda/*",
  },
  {
    to: "/leads",
    icon: UserRound,
    labelKey: "resources.leads.name",
    match: "/leads/*",
  },
  {
    to: "/contacts",
    icon: Users,
    labelKey: "resources.contacts.name",
    match: "/contacts/*",
  },
  {
    to: "/companies",
    icon: BriefcaseBusiness,
    labelKey: "resources.companies.name",
    match: "/companies/*",
  },
  {
    to: "/deals",
    icon: BriefcaseBusiness,
    labelKey: "resources.deals.name",
    match: "/deals/*",
  },
  {
    to: "/proposals",
    icon: FileText,
    labelKey: "resources.proposals.name",
    match: "/proposals/*",
  },
] as const;

export const Sidebar = () => {
  const location = useLocation();
  const translate = useTranslate();

  const isActive = (pattern: string) =>
    pattern === "/"
      ? !!matchPath("/", location.pathname)
      : !!matchPath(pattern, location.pathname);

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-screen w-[52px] flex-shrink-0 flex-col items-center bg-sidebar py-3 print:hidden">
        {/* Logo */}
        <Link
          to="/"
          className="mb-4 flex h-7 w-7 items-center justify-center rounded-lg bg-primary"
          aria-label="Dashboard"
        >
          <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
        </Link>

        {/* Global search */}
        <GlobalSearch />

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-1">
          {NAV_ITEMS.map(({ to, icon: Icon, labelKey, match }) => {
            const active = isActive(match);
            const label = translate(labelKey, { smart_count: 2 });
            return (
              <Tooltip key={to}>
                <TooltipTrigger asChild>
                  <Link
                    to={to}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-sidebar-foreground/30 hover:bg-sidebar-accent hover:text-sidebar-foreground/60"
                    }`}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <ThemeModeToggle />
          <RefreshButton />
          <UserMenu>
            <SidebarProfileMenu />
            <CanAccess resource="sales" action="list">
              <SidebarUsersMenu />
            </CanAccess>
            <CanAccess resource="configuration" action="edit">
              <SidebarSettingsMenu />
            </CanAccess>
            <SidebarImportMenu />
          </UserMenu>
        </div>
      </aside>
    </TooltipProvider>
  );
};

const SidebarProfileMenu = () => {
  const translate = useTranslate();
  const ctx = useUserMenu();
  if (!ctx) throw new Error("<SidebarProfileMenu> must be inside <UserMenu>");
  return (
    <DropdownMenuItem asChild onClick={ctx.onClose}>
      <Link to="/profile" className="flex items-center gap-2">
        <UserRound className="h-4 w-4" />
        {translate("crm.profile.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const SidebarUsersMenu = () => {
  const translate = useTranslate();
  const ctx = useUserMenu();
  if (!ctx) throw new Error("<SidebarUsersMenu> must be inside <UserMenu>");
  return (
    <DropdownMenuItem asChild onClick={ctx.onClose}>
      <Link to="/sales" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        {translate("resources.sales.name", { smart_count: 2 })}
      </Link>
    </DropdownMenuItem>
  );
};

const SidebarSettingsMenu = () => {
  const translate = useTranslate();
  const ctx = useUserMenu();
  if (!ctx) throw new Error("<SidebarSettingsMenu> must be inside <UserMenu>");
  return (
    <DropdownMenuItem asChild onClick={ctx.onClose}>
      <Link to="/settings" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        {translate("crm.settings.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const SidebarImportMenu = () => {
  const translate = useTranslate();
  const ctx = useUserMenu();
  if (!ctx) throw new Error("<SidebarImportMenu> must be inside <UserMenu>");
  return (
    <DropdownMenuItem asChild onClick={ctx.onClose}>
      <Link to={ImportPage.path} className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        {translate("crm.header.import_data")}
      </Link>
    </DropdownMenuItem>
  );
};
