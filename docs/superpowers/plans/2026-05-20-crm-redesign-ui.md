# CRM Redesign — UI/UX Completo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a UI acromática e com barra de navegação horizontal por um sistema visual moderno com sidebar icon-only teal, tipografia DM Sans e hierarquia clara em todas as telas desktop.

**Architecture:** Camada 1 (CSS tokens + fonte) alimenta tudo. Camada 2 (Sidebar + Layout) muda a estrutura shell. Camadas 3–10 atualizam tela por tela sem tocar em lógica de dados. Mobile (`MobileLayout`, `MobileHeader`, `MobileNavigation`) nunca é tocado.

**Tech Stack:** React 19, Tailwind v4 (OKLCH tokens via `@theme inline`), shadcn/ui (Badge, Card, Button, Separator), `@fontsource-variable/dm-sans`, Lucide React, react-admin (ra-core) para contexto de dados.

---

## Mapa de arquivos

| Arquivo | Ação |
|---|---|
| `src/index.css` | Reescrever tokens de cor + DM Sans |
| `src/components/atomic-crm/layout/Sidebar.tsx` | Criar — sidebar icon-only 52px |
| `src/components/atomic-crm/layout/Layout.tsx` | Modificar — flex h-screen com Sidebar |
| `src/components/atomic-crm/layout/Header.tsx` | Manter (preservar menus dropdown/mobile) |
| `src/components/atomic-crm/dashboard/Dashboard.tsx` | Modificar — grid + topbar label |
| `src/components/atomic-crm/dashboard/HotContacts.tsx` | Modificar — label teal + tipografia |
| `src/components/atomic-crm/contacts/ContactListContent.tsx` | Modificar — cabeçalho de tabela + linhas |
| `src/components/atomic-crm/contacts/ContactShow.tsx` | Modificar — layout desktop 2 colunas |
| `src/components/atomic-crm/leads/LeadStatusBadge.tsx` | Modificar — cores de badge por status/temperatura |
| `src/components/atomic-crm/leads/LeadList.tsx` | Modificar — cabeçalho de tabela |
| `src/components/atomic-crm/agenda/AgendaList.tsx` | Modificar — headers das seções com cor de urgência |
| `src/components/atomic-crm/agenda/AgendaItem.tsx` | Modificar — ícone colorido por kind |
| `src/components/atomic-crm/deals/DealCard.tsx` | Modificar — tipografia + sombra |
| `src/components/atomic-crm/deals/DealColumn.tsx` | Modificar — header + drop zone |
| `src/components/atomic-crm/deals/DealShow.tsx` | Modificar — modal metadata layout |
| `src/components/atomic-crm/proposals/ProposalList.tsx` | Modificar — cabeçalho de tabela |
| `src/components/atomic-crm/proposals/ProposalStatusBadge.tsx` | Modificar — cores novas |
| `src/components/atomic-crm/proposals/ProposalShow.tsx` | Modificar — layout 2 colunas |
| `src/components/atomic-crm/misc/AsideSection.tsx` | Modificar — label teal |

---

## Task 1: CSS tokens + DM Sans

**Files:**
- Modify: `src/index.css`
- Install: `@fontsource-variable/dm-sans`

- [ ] **Step 1.1: Instalar DM Sans**

```bash
npm install @fontsource-variable/dm-sans
```

Expected: novo pacote em `node_modules/@fontsource-variable/dm-sans`.

- [ ] **Step 1.2: Reescrever src/index.css**

Substituir o conteúdo inteiro do arquivo. Mantém todas as regras de `a`, `button`, `input`, media query mobile, e `@layer base` — só os tokens OKLCH e a fonte mudam.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@fontsource-variable/dm-sans";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: "DM Sans Variable", ui-sans-serif, system-ui, sans-serif;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.625rem;

  /* Fundo e superfícies */
  --background:        oklch(0.99 0.003 180);
  --foreground:        oklch(0.11 0.015 240);
  --card:              oklch(1 0.002 180);
  --card-foreground:   oklch(0.11 0.015 240);
  --popover:           oklch(1 0.002 180);
  --popover-foreground: oklch(0.11 0.015 240);

  /* Accent teal */
  --primary:           oklch(0.61 0.14 175);
  --primary-foreground: oklch(0.99 0.003 175);

  /* Superfícies secundárias */
  --secondary:         oklch(0.96 0.005 180);
  --secondary-foreground: oklch(0.11 0.015 240);
  --muted:             oklch(0.96 0.005 180);
  --muted-foreground:  oklch(0.45 0.01 240);
  --accent:            oklch(0.94 0.06 175);
  --accent-foreground: oklch(0.27 0.06 175);

  /* Semântico */
  --destructive:       oklch(0.577 0.245 27.325);
  --border:            oklch(0.91 0.005 180);
  --input:             oklch(0.91 0.005 180);
  --ring:              oklch(0.61 0.14 175);

  /* Gráficos */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.61 0.14 175);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);

  /* Sidebar (usado pelo nosso Sidebar.tsx via classes inline) */
  --sidebar:           oklch(0.19 0.025 240);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary:   oklch(0.61 0.14 175);
  --sidebar-primary-foreground: oklch(0.99 0.003 175);
  --sidebar-accent:    oklch(0.27 0.025 240);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border:    oklch(0.3 0.015 240);
  --sidebar-ring:      oklch(0.61 0.14 175);

  /* Avatares */
  --avatar-0: oklch(0.85 0.08 240);
  --avatar-1: oklch(0.88 0.1 340);
  --avatar-2: oklch(0.85 0.07 180);
  --avatar-3: oklch(0.9 0.09 40);
  --avatar-4: oklch(0.87 0.08 300);
  --avatar-5: oklch(0.85 0.08 150);
  --avatar-6: oklch(0.87 0.08 200);
  --avatar-7: oklch(0.88 0.09 10);
  --avatar-8: oklch(0.92 0.08 80);
  --avatar-9: oklch(0.86 0.09 270);
}

.dark {
  --background:        oklch(0.14 0.005 240);
  --foreground:        oklch(0.96 0.005 180);
  --card:              oklch(0.18 0.01 240);
  --card-foreground:   oklch(0.96 0.005 180);
  --popover:           oklch(0.18 0.01 240);
  --popover-foreground: oklch(0.96 0.005 180);

  --primary:           oklch(0.68 0.14 175);
  --primary-foreground: oklch(0.11 0.015 240);

  --secondary:         oklch(0.24 0.01 240);
  --secondary-foreground: oklch(0.96 0.005 180);
  --muted:             oklch(0.24 0.01 240);
  --muted-foreground:  oklch(0.62 0.008 240);
  --accent:            oklch(0.24 0.06 175);
  --accent-foreground: oklch(0.85 0.08 175);

  --destructive:       oklch(0.704 0.191 22.216);
  --border:            oklch(1 0 0 / 12%);
  --input:             oklch(1 0 0 / 12%);
  --ring:              oklch(0.68 0.14 175);

  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.68 0.14 175);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);

  --sidebar:           oklch(0.13 0.015 240);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary:   oklch(0.68 0.14 175);
  --sidebar-primary-foreground: oklch(0.11 0.015 240);
  --sidebar-accent:    oklch(0.2 0.015 240);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border:    oklch(0.25 0.01 240);
  --sidebar-ring:      oklch(0.68 0.14 175);

  --avatar-0: oklch(0.35 0.12 240);
  --avatar-1: oklch(0.38 0.14 340);
  --avatar-2: oklch(0.35 0.11 180);
  --avatar-3: oklch(0.38 0.13 40);
  --avatar-4: oklch(0.36 0.12 300);
  --avatar-5: oklch(0.35 0.11 150);
  --avatar-6: oklch(0.37 0.12 200);
  --avatar-7: oklch(0.38 0.14 10);
  --avatar-8: oklch(0.4 0.11 80);
  --avatar-9: oklch(0.36 0.13 270);
}

a,
button {
  cursor: pointer;
}

input {
  cursor: text;
}

/* Prevent mobile zoom on input focus */
@media screen and (max-width: 768px) {
  html {
    font-size: 17px;
  }
  input,
  textarea,
  select {
    font-size: 16px !important;
  }
}

a[aria-disabled="true"],
button[aria-disabled="true"],
button:disabled,
input[aria-disabled="true"],
input:disabled {
  cursor: not-allowed;
}

input[type="date"],
input[type="datetime-local"],
input[type="month"],
input[type="time"] {
  position: relative;
}

.dark ::-webkit-calendar-picker-indicator {
  filter: invert(1);
  position: absolute;
  right: 0.75rem;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
}

body {
  font-family: "DM Sans Variable", ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 1.3: Verificar no browser**

```bash
make start-demo
```

Abrir http://localhost:5173/ — a fonte DM Sans deve estar visível, o fundo levemente off-white e o botão primário deve aparecer em teal. A barra de navegação ainda existe (será trocada na Task 2).

- [ ] **Step 1.4: Commit**

```bash
git add src/index.css package.json package-lock.json
git commit -m "feat(design): teal OKLCH tokens + DM Sans Variable font"
```

---

## Task 2: Sidebar.tsx — componente novo

**Files:**
- Create: `src/components/atomic-crm/layout/Sidebar.tsx`

A sidebar preserva toda a lógica de navegação do `Header.tsx` atual (detecção de rota ativa, UserMenu com seus filhos, ThemeModeToggle, RefreshButton). O Header.tsx continua existindo para o layout mobile — não deletar.

- [ ] **Step 2.1: Criar src/components/atomic-crm/layout/Sidebar.tsx**

```tsx
import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  UserRound,
  Users,
  RefreshCw,
  FileText as Import,
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

import { useConfigurationContext } from "../root/ConfigurationContext";
import { ImportPage } from "../misc/ImportPage";
import { ChangelogPage } from "../misc/ChangelogPage";

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
            <SidebarChangelogMenu />
          </UserMenu>
        </div>
      </aside>
    </TooltipProvider>
  );
};

/* ─── UserMenu items (mesmo padrão do Header.tsx) ─── */

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
        <Import className="h-4 w-4" />
        {translate("crm.header.import_data")}
      </Link>
    </DropdownMenuItem>
  );
};

const SidebarChangelogMenu = () => {
  const translate = useTranslate();
  const ctx = useUserMenu();
  if (!ctx) throw new Error("<SidebarChangelogMenu> must be inside <UserMenu>");
  return (
    <DropdownMenuItem asChild onClick={ctx.onClose}>
      <Link to={ChangelogPage.path} className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        {translate("crm.changelog.title")}
      </Link>
    </DropdownMenuItem>
  );
};
```

- [ ] **Step 2.2: Commit**

```bash
git add src/components/atomic-crm/layout/Sidebar.tsx
git commit -m "feat(layout): add icon-only Sidebar component"
```

---

## Task 3: Layout.tsx — estrutura flex com sidebar

**Files:**
- Modify: `src/components/atomic-crm/layout/Layout.tsx`

- [ ] **Step 3.1: Reescrever Layout.tsx**

```tsx
import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";

import { useConfigurationLoader } from "../root/useConfigurationLoader";
import { Sidebar } from "./Sidebar";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto print:max-w-none print:px-0 print:pt-0"
        id="main-content"
      >
        <div className="mx-auto max-w-screen-xl px-8 py-6">
          <ErrorBoundary FallbackComponent={Error}>
            <Suspense fallback={<Skeleton className="h-12 w-12 rounded-full" />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <div className="print:hidden">
        <Notification />
      </div>
    </div>
  );
};
```

- [ ] **Step 3.2: Verificar no browser**

O app deve agora mostrar a sidebar icon-only à esquerda e o conteúdo principal à direita. Navegar entre todas as rotas (Dashboard, Leads, Contatos, Negócios, Propostas, Agenda) e confirmar que a rota ativa fica com o ícone teal e fundo `bg-primary/15`. O UserMenu deve abrir a partir do avatar no rodapé da sidebar.

- [ ] **Step 3.3: Commit**

```bash
git add src/components/atomic-crm/layout/Layout.tsx
git commit -m "feat(layout): sidebar + flex h-screen layout shell"
```

---

## Task 4: Dashboard — topbar label + grid

**Files:**
- Modify: `src/components/atomic-crm/dashboard/Dashboard.tsx`
- Modify: `src/components/atomic-crm/dashboard/HotContacts.tsx`

- [ ] **Step 4.1: Adicionar topbar de contexto ao Dashboard.tsx**

Localizar o `return` principal (a `<div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-1">`) e adicionar o topbar antes, depois alterar o grid:

```tsx
  return (
    <div className="flex flex-col gap-6">
      {/* Topbar de contexto */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Visão geral
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <div className="flex flex-col gap-4">
            {import.meta.env.VITE_IS_DEMO === "true" ? <Welcome /> : null}
            <HotContacts />
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="flex flex-col gap-6">
            <SalesManagerSummary />
            <LeadFunnelSummary />
            <ProposalSummary />
            <DealRiskSummary />
            <RevenueForecastSummary />
            <GoalProgressSummary />
            <FunnelConversionSummary />
            <PipelineAgingSummary />
            <AdvancedSellerRanking />
            <LossReasonSummary />
            {totalDeal ? <DealsChart /> : null}
            <DashboardActivityLog />
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="flex flex-col gap-6">
            <SellerDailyCockpit />
            <TasksList />
          </div>
        </div>
      </div>
    </div>
  );
```

- [ ] **Step 4.2: Atualizar HotContacts.tsx — header com label teal**

Substituir o bloco `<div className="flex items-center">` que contém o `<Users>` e o `<h2>`:

```tsx
      {/* Antes: */}
      {/* <div className="flex items-center">
        <div className="mr-3 flex">
          <Users className="text-muted-foreground w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("resources.contacts.hot.title")}
        </h2>
        ...
      </div> */}

      {/* Depois: */}
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary flex-1">
          {translate("resources.contacts.hot.title")}
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-6 w-6 p-0"
                asChild
              >
                <Link to="/contacts/create">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {translate("resources.contacts.action.create")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
```

- [ ] **Step 4.3: Commit**

```bash
git add src/components/atomic-crm/dashboard/Dashboard.tsx \
        src/components/atomic-crm/dashboard/HotContacts.tsx
git commit -m "feat(dashboard): context topbar label + HotContacts teal header"
```

---

## Task 5: Contact List — cabeçalho de tabela + linhas

**Files:**
- Modify: `src/components/atomic-crm/contacts/ContactListContent.tsx`

- [ ] **Step 5.1: Adicionar cabeçalho de tabela antes das linhas**

No `ContactListContent`, substituir o `return` que começa com `<div className="md:divide-y">`:

```tsx
  return (
    <div>
      {/* Cabeçalho da tabela — visível somente em md+ */}
      <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] gap-4 px-6 py-2 border-b border-border/50">
        <div className="w-10" /> {/* espaço checkbox */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Nome / Empresa
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">
          Última atividade
        </p>
      </div>
      <div className="divide-y divide-border/40">
        {contacts.map((contact) => (
          <RecordContextProvider key={contact.id} value={contact}>
            <ContactItemContent
              contact={contact}
              handleToggleItem={handleToggleItem}
            />
          </RecordContextProvider>
        ))}
        {contacts.length === 0 && (
          <div className="p-4">
            <div className="text-muted-foreground">
              {translate("resources.contacts.empty.title", {})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
```

- [ ] **Step 5.2: Atualizar linha ContactItemContent — nome em font-semibold**

No `ContactItemContent`, a linha de nome é `<div className="font-medium">`. Alterar para `font-semibold` e adicionar cor de link teal no hover:

```tsx
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13px] text-foreground">
            {`${contact.first_name} ${contact.last_name ?? ""}`}
          </div>
          {contact.title || contact.company_id != null || contact.nb_tasks ? (
            <div className="text-[12px] text-muted-foreground">
              {/* mantém conteúdo atual */}
              {contact.title && contact.company_id != null
                ? `${translate("resources.contacts.position_at", {
                    title: contact.title,
                  })} `
                : contact.title}
              {contact.company_id != null && (
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                >
                  <TextField source="name" />
                </ReferenceField>
              )}
              {contact.nb_tasks
                ? ` - ${translate("crm.common.task_count", {
                    smart_count: contact.nb_tasks,
                  })}`
                : ""}
              &nbsp;&nbsp;
              <TagsList />
            </div>
          ) : null}
        </div>
```

- [ ] **Step 5.3: Commit**

```bash
git add src/components/atomic-crm/contacts/ContactListContent.tsx
git commit -m "feat(contacts): table header + semibold name typography"
```

---

## Task 6: Contact Show — topbar de contexto

**Files:**
- Modify: `src/components/atomic-crm/contacts/ContactShow.tsx`

A estrutura do `ContactShow` já usa `ContactAside` à esquerda e tabs à direita — esse split já existe. A mudança é acrescentar o topbar de contexto antes do conteúdo desktop.

- [ ] **Step 6.1: Localizar ContactShowContent e adicionar topbar**

No arquivo `ContactShow.tsx`, encontrar a função `ContactShowContent`. Ela usa `useShowContext<Contact>()`. Adicionar o topbar antes do conteúdo existente. Localizar o início do `return` de `ContactShowContent` (procurar por `<div className=` nessa função) e envolver com:

```tsx
const ContactShowContent = () => {
  const translate = useTranslate();
  const { defaultTitle, record, isPending } = useShowContext<Contact>();
  // ... estado existente (useState para noteCreateOpen, editOpen etc)
  if (isPending || !record) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Topbar de contexto */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Pessoas
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {record.first_name} {record.last_name}
        </h1>
      </div>
      {/* Conteúdo existente abaixo sem alteração */}
      {/* ... mantém o Card, Tabs, etc. que já estão aqui */}
    </div>
  );
};
```

**Nota:** Não alterar `ContactShowContentMobile` — só `ContactShowContent` (versão desktop).

- [ ] **Step 6.2: Commit**

```bash
git add src/components/atomic-crm/contacts/ContactShow.tsx
git commit -m "feat(contacts): context topbar on contact show desktop"
```

---

## Task 7: AsideSection — label teal

**Files:**
- Modify: `src/components/atomic-crm/misc/AsideSection.tsx`

- [ ] **Step 7.1: Trocar estilo do título da seção lateral**

```tsx
export function AsideSection({ title, children, noGap }: AsideSectionProps) {
  const isMobile = useIsMobile();
  return (
    <div className="mb-6 text-sm">
      <h3
        className={
          isMobile
            ? "text-lg font-semibold"
            : "text-[10px] font-semibold uppercase tracking-widest text-primary pb-1"
        }
      >
        {title}
      </h3>
      <Separator />
      <div className={cn("pt-2 flex flex-col", { "gap-1": !noGap })}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 7.2: Commit**

```bash
git add src/components/atomic-crm/misc/AsideSection.tsx
git commit -m "feat(misc): teal uppercase label for AsideSection"
```

---

## Task 8: Leads — badges + cabeçalho de lista

**Files:**
- Modify: `src/components/atomic-crm/leads/LeadStatusBadge.tsx`
- Modify: `src/components/atomic-crm/leads/LeadList.tsx`

- [ ] **Step 8.1: Atualizar LeadStatusBadge.tsx com cores por status**

```tsx
import { useTranslate } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { Lead } from "../types";

const STATUS_STYLES: Record<string, string> = {
  new:        "bg-secondary text-secondary-foreground",
  contacted:  "bg-secondary text-secondary-foreground",
  qualified:  "bg-accent text-accent-foreground",
  converted:  "bg-primary text-primary-foreground",
  discarded:  "bg-muted text-muted-foreground",
};

const TEMPERATURE_STYLES: Record<string, string> = {
  cold: "border border-border text-muted-foreground bg-transparent",
  warm: "border border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  hot:  "bg-primary text-primary-foreground",
};

export const LeadStatusBadge = ({ lead }: { lead: Pick<Lead, "status"> }) => {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        STATUS_STYLES[lead.status] ?? "bg-secondary text-secondary-foreground",
      )}
    >
      {translate(`resources.leads.statuses.${lead.status}`)}
    </span>
  );
};

export const LeadTemperatureBadge = ({
  lead,
}: {
  lead: Pick<Lead, "temperature">;
}) => {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        TEMPERATURE_STYLES[lead.temperature] ?? "border border-border text-muted-foreground bg-transparent",
      )}
    >
      {translate(`resources.leads.temperatures.${lead.temperature}`)}
    </span>
  );
};
```

- [ ] **Step 8.2: Adicionar cabeçalho de tabela ao LeadList.tsx**

Na função `LeadListContent`, substituir o `return` com `<Card className="py-0">`:

```tsx
  return (
    <Card className="py-0">
      {/* Cabeçalho das colunas */}
      <div className="hidden md:grid md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-3 px-4 py-2.5 border-b border-border/50">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Nome</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Interesse / Fonte</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Próxima ação</p>
      </div>
      <div className="divide-y divide-border/40">
        {leadRecords.map((lead) => (
          <LeadRow key={lead.id} lead={lead} />
        ))}
        {leadRecords.length === 0 && (
          <div className="p-4 text-muted-foreground">
            {translate("resources.leads.empty.filtered")}
          </div>
        )}
      </div>
    </Card>
  );
```

- [ ] **Step 8.3: Adicionar topbar de contexto ao LeadList.tsx**

No componente `LeadList`, adicionar antes do `<List>` (dentro do return):

O `<List>` de react-admin renderiza o `TopToolbar` e o conteúdo. Wrappear o `<List>` com um `<div>` e adicionar o topbar:

```tsx
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Pipeline
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {translate("resources.leads.name", { smart_count: 2 })}
        </h1>
      </div>
      <List
        title={false}
        perPage={25}
        sort={{ field: "created_at", order: "DESC" }}
        filters={filters}
        actions={<LeadListActions />}
        pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      >
        <LeadListContent />
      </List>
    </div>
  );
```

- [ ] **Step 8.4: Commit**

```bash
git add src/components/atomic-crm/leads/LeadStatusBadge.tsx \
        src/components/atomic-crm/leads/LeadList.tsx
git commit -m "feat(leads): color-coded badges + table column headers"
```

---

## Task 9: Agenda — headers coloridos por urgência

**Files:**
- Modify: `src/components/atomic-crm/agenda/AgendaList.tsx`
- Modify: `src/components/atomic-crm/agenda/AgendaItem.tsx`

- [ ] **Step 9.1: Colorir headers das seções em AgendaList.tsx**

Substituir `AgendaSection` no final do arquivo:

```tsx
const SECTION_STYLES: Record<string, { header: string; dot: string }> = {
  overdue:  { header: "bg-destructive/8 border-destructive/20", dot: "bg-destructive" },
  today:    { header: "bg-primary/8 border-primary/20",         dot: "bg-primary" },
  risks:    { header: "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800", dot: "bg-amber-500" },
  upcoming: { header: "bg-muted/50 border-border",              dot: "bg-muted-foreground" },
};

const SECTION_KEYS = ["overdue", "today", "risks", "upcoming"] as const;

const AgendaSection = ({
  title,
  items,
  sectionKey,
}: {
  title: string;
  items: AgendaSections[keyof AgendaSections];
  sectionKey: typeof SECTION_KEYS[number];
}) => {
  const translate = useTranslate();
  const styles = SECTION_STYLES[sectionKey];

  return (
    <Card className="overflow-hidden py-0">
      <div
        className={`flex items-center justify-between border-b px-4 py-2.5 ${styles.header}`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-foreground/70">
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
          {items.length}
        </span>
      </div>
      <div className="divide-y divide-border/40">
        {items.length ? (
          items.map((item) => <AgendaItem key={item.id} item={item} />)
        ) : (
          <div className="px-4 py-5 text-[12px] text-muted-foreground">
            {translate("resources.agenda.empty")}
          </div>
        )}
      </div>
    </Card>
  );
};
```

Atualizar as chamadas de `<AgendaSection>` no `return` principal para passar `sectionKey`:

```tsx
        <div className="grid gap-4 xl:grid-cols-2">
          <AgendaSection
            title={translate("resources.agenda.sections.overdue")}
            items={sections.overdue}
            sectionKey="overdue"
          />
          <AgendaSection
            title={translate("resources.agenda.sections.today")}
            items={sections.today}
            sectionKey="today"
          />
          <AgendaSection
            title={translate("resources.agenda.sections.risks")}
            items={sections.risks}
            sectionKey="risks"
          />
          <AgendaSection
            title={translate("resources.agenda.sections.upcoming")}
            items={sections.upcoming}
            sectionKey="upcoming"
          />
        </div>
```

Também adicionar topbar de contexto antes do `isPending` check — localizar `return (` em `AgendaList` e adicionar antes do conteúdo:

```tsx
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Hoje
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {translate("resources.agenda.name", { smart_count: 1 })}
        </h1>
      </div>
      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {/* AgendaSection calls acima */}
        </div>
      )}
    </div>
  );
```

- [ ] **Step 9.2: Atualizar AgendaItem.tsx — ícone colorido por kind**

```tsx
import {
  AlertTriangle,
  BriefcaseBusiness,
  FileText,
  ListTodo,
  UserRound,
} from "lucide-react";
import { useTranslate } from "ra-core";
import { Link } from "react-router";

import type { AgendaItem as AgendaItemData } from "./agendaUtils";

const KIND_STYLES: Record<
  string,
  { icon: React.ElementType; bg: string; iconColor: string }
> = {
  task:     { icon: ListTodo,         bg: "bg-primary/10",       iconColor: "text-primary" },
  lead:     { icon: UserRound,        bg: "bg-violet-100 dark:bg-violet-900/20", iconColor: "text-violet-600 dark:text-violet-400" },
  deal:     { icon: BriefcaseBusiness, bg: "bg-amber-100 dark:bg-amber-900/20",  iconColor: "text-amber-600 dark:text-amber-400" },
  proposal: { icon: FileText,         bg: "bg-blue-100 dark:bg-blue-900/20",     iconColor: "text-blue-600 dark:text-blue-400" },
};

const STATE_LABEL_STYLES: Record<string, string> = {
  overdue:              "text-destructive font-semibold",
  today:                "text-primary font-semibold",
  upcoming:             "text-muted-foreground",
  "missing-next-action": "text-amber-600 dark:text-amber-400 font-semibold",
  stale:                "text-destructive font-semibold",
};

const LOCALE = "pt-BR";

export const AgendaItem = ({ item }: { item: AgendaItemData }) => {
  const translate = useTranslate();
  const kindStyle = KIND_STYLES[item.kind] ?? KIND_STYLES.task;
  const Icon = kindStyle.icon;
  const dueAt = item.dueAt
    ? new Intl.DateTimeFormat(LOCALE, {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(item.dueAt))
    : null;

  return (
    <Link
      to={item.href}
      className="grid gap-3 px-4 py-3 transition-colors hover:bg-muted md:grid-cols-[1fr_auto] md:items-center"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className={`mt-0.5 rounded-md p-1.5 ${kindStyle.bg}`}>
          <Icon className={`size-3.5 ${kindStyle.iconColor}`} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-foreground">
            {item.title}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>{translate(`resources.agenda.kinds.${item.kind}`)}</span>
            {item.context && <span>· {item.context}</span>}
            {dueAt && <span>· {dueAt}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:justify-end">
        {(item.state === "missing-next-action" || item.state === "stale") && (
          <AlertTriangle className="size-3.5 text-amber-500" />
        )}
        <span
          className={`text-[11px] ${STATE_LABEL_STYLES[item.state] ?? "text-muted-foreground"}`}
        >
          {translate(`resources.agenda.states.${item.state}`)}
        </span>
      </div>
    </Link>
  );
};
```

- [ ] **Step 9.3: Commit**

```bash
git add src/components/atomic-crm/agenda/AgendaList.tsx \
        src/components/atomic-crm/agenda/AgendaItem.tsx
git commit -m "feat(agenda): colored section headers + kind-specific icons"
```

---

## Task 10: Deals — DealCard, DealColumn, DealShow

**Files:**
- Modify: `src/components/atomic-crm/deals/DealCard.tsx`
- Modify: `src/components/atomic-crm/deals/DealColumn.tsx`
- Modify: `src/components/atomic-crm/deals/DealShow.tsx`
- Modify: `src/components/atomic-crm/deals/DealList.tsx`

- [ ] **Step 10.1: Atualizar DealCard.tsx — tipografia + sombra**

No `DealCardContent`, dentro do `<Card>`, alterar as classes:

```tsx
          <Card
            className={`py-3 transition-all duration-200 ${
              snapshot?.isDragging
                ? "opacity-90 rotate-1 shadow-lg"
                : "shadow-sm hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            <CardContent className="px-3 flex flex-col gap-1">
              <div className="flex-1 flex gap-2">
                <p className="flex-1 min-w-0 text-[12px] font-semibold text-foreground mb-1 truncate leading-snug">
                  <ReferenceField
                    source="company_id"
                    reference="companies"
                    link={false}
                  />
                  {" — "}
                  {deal.name}
                </p>
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                >
                  <CompanyAvatar width={20} height={20} />
                </ReferenceField>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                <NumberField
                  source="amount"
                  options={{
                    notation: "compact",
                    style: "currency",
                    currency,
                    currencyDisplay: "narrowSymbol",
                    minimumSignificantDigits: 3,
                  }}
                  locales={locale}
                />
                {deal.category && " · "}
                <SelectField
                  source="category"
                  choices={dealCategories}
                  optionText="label"
                  optionValue="value"
                />
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {deal.deal_type && (
                  <Badge
                    variant="secondary"
                    className="max-w-full truncate px-1.5 py-0 text-[10px] font-normal h-4"
                    title={dealTypeLabel}
                  >
                    {dealTypeLabel}
                  </Badge>
                )}
                {typeof deal.probability === "number" && (
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal h-4">
                    {deal.probability}%
                  </Badge>
                )}
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal h-4">
                  {translate("resources.deals.weighted_short_compact")}{" "}
                  {formattedWeightedAmount}
                </Badge>
                {riskState === "missing_next_action" && (
                  <Badge variant="destructive" className="px-1.5 py-0 text-[10px] font-normal h-4">
                    <CalendarClock className="h-2.5 w-2.5" />
                    {translate("resources.deals.risk.no_next_action")}
                  </Badge>
                )}
                {riskState === "stale" && (
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal h-4 border-amber-300 text-amber-600">
                    <AlertCircle className="h-2.5 w-2.5" />
                    {translate("resources.deals.risk.stale")}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
```

- [ ] **Step 10.2: Atualizar DealColumn.tsx — header com totais**

Substituir o bloco `<div className="flex flex-col items-center">` dentro do `return`:

```tsx
  return (
    <div className="flex-1 pb-8 min-w-[220px]">
      <div className="px-1 pb-2 border-b border-border/40 mb-3">
        <h3 className="text-[13px] font-semibold text-foreground">
          {findDealLabel(dealStages, stage)}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatAmount(totalAmount)}
          <span className="text-border mx-1">·</span>
          {formatAmount(weightedAmount)}{" "}
          <span className="text-[10px]">{translate("resources.deals.weighted_short")}</span>
        </p>
      </div>
      <Droppable droppableId={stage}>
        {(droppableProvided, snapshot) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className={`flex flex-col rounded-xl mt-1 gap-2 min-h-[60px] p-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} />
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
```

- [ ] **Step 10.3: Adicionar topbar ao DealList.tsx**

Em `DealList`, o `return` que contém `<List>` está dentro de um `if (!identity) return null`. Wrappear o `<List>` existente:

```tsx
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Pipeline
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {translate("resources.deals.name", { smart_count: 2 })}
        </h1>
      </div>
      <List
        perPage={100}
        filter={{ "archived_at@is": null }}
        title={false}
        sort={{ field: "index", order: "DESC" }}
        filters={dealFilters}
        actions={<DealActions />}
        pagination={null}
      >
        <DealLayout />
      </List>
    </div>
  );
```

- [ ] **Step 10.4: Atualizar DealShow.tsx — metadata layout**

No `DealShowContent`, o bloco de metadados `<div className="flex flex-wrap gap-8 m-4">` é modificado para usar labels teal uppercase:

```tsx
          <div className="flex flex-wrap gap-x-8 gap-y-4 px-4 pb-4 border-b border-border/40">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {translate("resources.deals.fields.expected_closing_date")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-foreground">{expectedClosingDate.label}</span>
                {expectedClosingDate.isPast ? (
                  <Badge variant="destructive" className="text-[10px] py-0 h-4">
                    {translate("crm.common.past")}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {translate("resources.deals.fields.amount")}
              </span>
              <span className="text-[14px] font-bold text-foreground">
                {record.amount.toLocaleString(locale, currencyFormatOptions)}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {translate("resources.deals.fields.weighted_amount")}
              </span>
              <span className="text-[13px] text-foreground">
                {weightedAmount.toLocaleString(locale, currencyFormatOptions)}
              </span>
            </div>

            {typeof record.probability === "number" && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {translate("resources.deals.fields.probability")}
                </span>
                <span className="text-[13px] text-foreground">{record.probability}%</span>
              </div>
            )}

            {record.category && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {translate("resources.deals.fields.category")}
                </span>
                <span className="text-[13px] text-foreground">
                  {dealCategories.find((c) => c.value === record.category)?.label ?? record.category}
                </span>
              </div>
            )}

            {record.deal_type && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {translate("resources.deals.fields.deal_type")}
                </span>
                <span className="text-[13px] text-foreground">{dealTypeLabel}</span>
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {translate("resources.deals.fields.stage")}
              </span>
              <span className="text-[13px] text-foreground">
                {findDealLabel(dealStages, record.stage)}
              </span>
            </div>

            {record.source && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {translate("resources.deals.fields.source")}
                </span>
                <span className="text-[13px] text-foreground">{record.source}</span>
              </div>
            )}

            {record.lost_reason && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {translate("resources.deals.fields.lost_reason")}
                </span>
                <span className="text-[13px] text-foreground">{lostReasonLabel}</span>
              </div>
            )}
          </div>
```

Aplicar o mesmo padrão de `text-[10px] font-semibold uppercase tracking-widest text-muted-foreground` para cada label de campo nos outros `<div className="flex flex-col mr-10">`.

- [ ] **Step 10.5: Commit**

```bash
git add src/components/atomic-crm/deals/DealCard.tsx \
        src/components/atomic-crm/deals/DealColumn.tsx \
        src/components/atomic-crm/deals/DealList.tsx \
        src/components/atomic-crm/deals/DealShow.tsx
git commit -m "feat(deals): kanban card typography + column headers + modal metadata labels"
```

---

## Task 11: Proposals — lista + show + status badge

**Files:**
- Modify: `src/components/atomic-crm/proposals/ProposalList.tsx`
- Modify: `src/components/atomic-crm/proposals/ProposalStatusBadge.tsx`
- Modify: `src/components/atomic-crm/proposals/ProposalShow.tsx`

- [ ] **Step 11.1: Atualizar ProposalStatusBadge.tsx**

```tsx
import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import type { Proposal } from "../types";

const STATUS_STYLES: Record<string, string> = {
  draft:    "bg-secondary text-secondary-foreground",
  sent:     "bg-primary text-primary-foreground",
  accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  rejected: "bg-destructive/10 text-destructive",
  expired:  "border border-border text-muted-foreground bg-transparent",
};

export const ProposalStatusBadge = ({ proposal }: { proposal: Pick<Proposal, "status"> }) => {
  const translate = useTranslate();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        STATUS_STYLES[proposal.status] ?? "bg-secondary text-secondary-foreground",
      )}
    >
      {translate(`resources.proposals.statuses.${proposal.status}`)}
    </span>
  );
};
```

- [ ] **Step 11.2: Adicionar cabeçalho de tabela ao ProposalList.tsx**

Em `ProposalListContent`, dentro do return com `<Card className="py-0">`, adicionar cabeçalho antes do `divide-y`:

```tsx
      <Card className="py-0">
        {/* Cabeçalho */}
        <div className="hidden md:grid md:grid-cols-[1.5fr_0.8fr_0.7fr_0.8fr] gap-3 px-4 py-2.5 border-b border-border/50 bg-muted/30">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Proposta</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Validade</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Total</p>
        </div>
        <div className="divide-y divide-border/40">
          {records.map((proposal) => (
            <ProposalRow key={proposal.id} proposal={proposal} />
          ))}
          {records.length === 0 && (
            <div className="p-4 text-muted-foreground">
              {translate("resources.proposals.empty.filtered")}
            </div>
          )}
        </div>
      </Card>
```

Atualizar `ProposalRow` para usar o novo `ProposalStatusBadge` (já importado) e ajustar fonte do título:

```tsx
const ProposalRow = ({ proposal }: { proposal: Proposal }) => {
  const formatter = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: proposal.currency || "USD",
  });

  return (
    <Link
      to={`/proposals/${proposal.id}/show`}
      className="grid gap-3 px-4 py-3.5 transition-colors hover:bg-muted md:grid-cols-[1.5fr_0.8fr_0.7fr_0.8fr] items-center"
    >
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-foreground">{proposal.title}</div>
        <div className="truncate text-[11px] text-muted-foreground mt-0.5">
          {proposal.number}
        </div>
      </div>
      <div className="flex items-center">
        <ProposalStatusBadge proposal={proposal} />
      </div>
      <div className="text-[12px] text-muted-foreground">
        {proposal.valid_until
          ? new Intl.DateTimeFormat(LOCALE, {
              dateStyle: "medium",
            }).format(new Date(`${proposal.valid_until}T00:00:00`))
          : "—"}
      </div>
      <div className="text-[13px] font-semibold text-foreground md:text-right">
        {formatter.format(proposal.total / 100)}
      </div>
    </Link>
  );
};
```

Também adicionar topbar ao `ProposalList` (wrappear o `<List>`):

```tsx
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Comercial
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {translate("resources.proposals.name", { smart_count: 2 })}
        </h1>
      </div>
      <List
        title={false}
        perPage={25}
        sort={{ field: "created_at", order: "DESC" }}
        filters={filters}
        actions={<ProposalListActions />}
        pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      >
        <ProposalListContent />
      </List>
    </div>
  );
```

- [ ] **Step 11.3: Atualizar ProposalShow.tsx — layout 2 colunas**

O `ProposalShowContent` renderiza `<ProposalActions>` e `<ProposalPreview>` num flex. Adicionar sidebar de metadados:

```tsx
const ProposalShowContent = () => {
  const { record, isPending } = useShowContext<Proposal>();
  const location = useLocation();
  const translate = useTranslate();
  const printMode = new URLSearchParams(location.search).get("print") === "1";
  const { data: items = [] } = useGetList<ProposalItem>(
    "proposal_items",
    {
      filter: { proposal_id: record?.id },
      sort: { field: "index", order: "ASC" },
      pagination: { page: 1, perPage: 100 },
    },
    { enabled: Boolean(record?.id) },
  );
  const { data: company } = useGetOne<Company>(
    "companies",
    { id: record?.company_id ?? "" },
    { enabled: Boolean(record?.company_id) },
  );

  if (isPending || !record) return null;

  if (printMode) {
    return (
      <div className="mt-0 block">
        <div className="mb-4 flex justify-end print:hidden">
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-semibold"
            onClick={() => window.print()}
            type="button"
          >
            {translate("resources.proposals.action.print")}
          </button>
        </div>
        <ProposalPreview proposal={record} company={company} items={items} printMode />
      </div>
    );
  }

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: record.currency || "BRL",
  });

  return (
    <div className="mt-2 flex gap-6">
      {/* Sidebar de ações e metadados */}
      <aside className="w-48 flex-shrink-0 flex flex-col gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Ações
          </p>
          <ProposalActions proposal={record} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Status
          </p>
          <ProposalStatusBadge proposal={record} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Resumo
          </p>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Número</p>
              <p className="text-[12px] font-semibold text-foreground">{record.number}</p>
            </div>
            {record.valid_until && (
              <div>
                <p className="text-[10px] text-muted-foreground">Validade</p>
                <p className="text-[12px] font-semibold text-foreground">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
                    new Date(`${record.valid_until}T00:00:00`),
                  )}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-[16px] font-bold text-primary">
                {formatter.format(record.total / 100)}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Preview do documento */}
      <div className="flex-1 min-w-0">
        <ProposalPreview proposal={record} company={company} items={items} printMode={false} />
      </div>
    </div>
  );
};
```

Adicionar import do `ProposalStatusBadge` no topo do arquivo:
```tsx
import { ProposalStatusBadge } from "./ProposalStatusBadge";
```

- [ ] **Step 11.4: Commit**

```bash
git add src/components/atomic-crm/proposals/ProposalList.tsx \
        src/components/atomic-crm/proposals/ProposalStatusBadge.tsx \
        src/components/atomic-crm/proposals/ProposalShow.tsx
git commit -m "feat(proposals): color badges + table headers + 2-col show layout"
```

---

## Task 12: Company Show — topbar de contexto

**Files:**
- Modify: `src/components/atomic-crm/companies/CompanyShow.tsx`

- [ ] **Step 12.1: Adicionar topbar ao CompanyShowContent**

Em `CompanyShowContent`, localizar o `if (isPending || !record) return null;` e o `return (` logo abaixo. Envolver o conteúdo existente com um `div flex-col` com o topbar:

```tsx
  if (isPending || !record) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Topbar de contexto */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          {translate("resources.companies.forcedCaseName")}
        </p>
        <h1 className="text-[18px] font-bold text-foreground leading-tight">
          {record.name}
        </h1>
      </div>
      {/* Conteúdo original — manter o JSX existente abaixo sem modificação */}
      {/* (o Card/Tabs/CompanyAside que já existia vai aqui) */}
    </div>
  );
```

**Atenção:** O `CompanyShowContent` já retorna um layout com `Card`, `Tabs`, `CompanyAside`. Apenas wrappear esse retorno com o `div flex-col gap-4` e inserir o topbar no início — não alterar nenhum outro elemento.

- [ ] **Step 12.2: Commit**

```bash
git add src/components/atomic-crm/companies/CompanyShow.tsx
git commit -m "feat(companies): context topbar on company show desktop"
```

---

## Task 13: Typecheck + revisão visual final

- [ ] **Step 13.1: Typecheck**

```bash
make typecheck
```

Corrigir quaisquer erros de TypeScript introduzidos — tipicamente imports faltando ou props incorretas.

- [ ] **Step 13.2: Lint**

```bash
make lint
```

Corrigir avisos de ESLint/Prettier.

- [ ] **Step 13.3: Revisão visual completa**

Com `make start-demo` rodando, verificar cada rota:

| Rota | O que checar |
|---|---|
| `/` | Sidebar visível, font DM Sans, topbar "Visão geral / Dashboard", HotContacts com label teal |
| `/agenda` | Seções coloridas (vermelho/teal/âmbar/cinza), ícones coloridos por kind |
| `/leads` | Colunas com header uppercase, badges de status/temperatura coloridos |
| `/contacts` | Header de tabela, nome em font-semibold |
| `/contacts/:id/show` | Topbar de contexto, AsideSection com label teal |
| `/deals` | Kanban com colunas separadas por divider, cards com sombra, drag funcionando |
| `/proposals` | Header de tabela, badges coloridos, show com sidebar de metadados |
| Dark mode | Alternar com ThemeModeToggle — verificar sidebar, badges e topbars |

- [ ] **Step 13.4: Commit final**

```bash
git add -A
git commit -m "feat(design): complete CRM UI/UX redesign — teal accent, DM Sans, sidebar nav"
```

---

## Notas de implementação

**Preservar sempre:**
- Todos os arquivos em `src/components/atomic-crm/layout/MobileLayout.tsx`, `MobileHeader.tsx`, `MobileNavigation.tsx`, `MobileContent.tsx` — não tocar.
- `Header.tsx` — preservar intacto (usado potencialmente por outros contextos e para referência dos menus).
- Toda lógica de dados (providers, queries, tipos) inalterada.

**Tailwind v4:** tokens OKLCH são referenciados via `var(--token)` no `@theme inline` — não use `oklch(...)` diretamente em classes Tailwind, use os aliases semânticos (`text-primary`, `bg-muted`, etc).

**Sem testes unitários de UI:** mudanças são de classes CSS/Tailwind puras. A verificação é visual no browser. `make typecheck` garante que os tipos estão corretos.
