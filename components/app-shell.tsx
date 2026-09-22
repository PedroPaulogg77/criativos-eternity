'use client';

/* oxlint-disable next/no-img-element -- o logo é um PNG estático servido da pasta public */

import { useEffect, useState } from 'react';
import {
  Film,
  Layers3,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Sparkles,
  Square,
  Ticket,
  Volume2,
  X,
} from 'lucide-react';

import { phaseNames, type Phase } from '@/lib/phases';

const SIDEBAR_STORAGE_KEY = 'eternity:sidebar-collapsed';

const phaseIcons = [ListChecks, Layers3, Sparkles, Square, Megaphone, Volume2, Film, Ticket] as const;

export type ShellNav = {
  active: Phase | 'workspace';
  onSelect: (phase: Phase) => void;
  isDisabled: (phase: Phase) => boolean;
  onWorkspace: () => void;
  onNewCampaign: () => void;
  campaignLabel: string;
  campaignDetail: string;
};

function NavItem({
  active,
  disabled,
  collapsed,
  label,
  badge,
  icon,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  collapsed: boolean;
  label: string;
  badge?: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${collapsed ? 'justify-center px-0' : ''} ${
        active
          ? 'bg-primary/12 font-medium text-accent-foreground'
          : 'text-muted-foreground hover:bg-white/[0.045] hover:text-foreground'
      } ${disabled ? 'cursor-not-allowed opacity-35 hover:bg-transparent hover:text-muted-foreground' : ''}`}
    >
      {active ? <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" /> : null}
      <span className="grid size-5 shrink-0 place-items-center">{icon}</span>
      {collapsed ? null : <span className="truncate">{label}</span>}
      {collapsed || !badge ? null : <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{badge}</span>}
    </button>
  );
}

function Sidebar({
  nav,
  panel,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: {
  nav: ShellNav;
  panel?: React.ReactNode;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-[transform,width] duration-200 sm:w-64 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${collapsed ? 'lg:w-[4.75rem]' : 'lg:w-64'}`}
      aria-label="Menu principal"
    >
      <div className={`flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        {collapsed ? (
          <span className="grid size-9 place-items-center bg-primary text-sm font-semibold text-primary-foreground">E</span>
        ) : (
          <img src="/brand/eternity-academy.png" alt="Eternity Academy" className="h-7 w-auto" />
        )}
        {collapsed ? null : (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Recolher menu"
            className="ml-auto hidden size-8 place-items-center text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground lg:grid"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Fechar menu"
          className="ml-auto grid size-8 place-items-center text-muted-foreground hover:bg-white/[0.06] hover:text-foreground lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      {panel ? <div className="flex min-h-0 flex-1 flex-col">{panel}</div> : (
      <nav className="min-h-0 flex-1 overflow-y-auto py-3" aria-label="Etapas da campanha">
        <NavItem
          collapsed={collapsed}
          active={nav.active === 'workspace'}
          label="Painel"
          icon={<LayoutDashboard className="size-4" />}
          onClick={nav.onWorkspace}
        />

        <p className={`mt-4 mb-1 px-4 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '···' : 'Etapas'}
        </p>
        {phaseNames.map((name, index) => {
          const phase = (index + 1) as Phase;
          const Icon = phaseIcons[index];
          return (
            <NavItem
              key={name}
              collapsed={collapsed}
              active={nav.active === phase}
              disabled={nav.isDisabled(phase)}
              label={name}
              badge={String(index + 1).padStart(2, '0')}
              icon={<Icon className="size-4" />}
              onClick={() => nav.onSelect(phase)}
            />
          );
        })}
      </nav>
      )}

      <div className={`shrink-0 border-t border-sidebar-border p-3 ${panel ? 'hidden' : ''}`}>
        {collapsed ? (
          <div className="grid gap-2">
            <button
              type="button"
              onClick={onToggleCollapsed}
              title="Expandir menu"
              aria-label="Expandir menu"
              className="grid h-10 w-full place-items-center border border-sidebar-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <PanelLeftOpen className="size-4" />
            </button>
            <button
              type="button"
              onClick={nav.onNewCampaign}
              title="Nova campanha"
              aria-label="Nova campanha"
              className="grid h-10 w-full place-items-center bg-primary text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <Sparkles className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={nav.onWorkspace}
              title="Ver todas as campanhas"
              className="mb-3 block w-full border border-sidebar-border bg-white/[0.02] p-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{nav.campaignLabel}</span>
                <span className="shrink-0 text-[10px] tracking-[0.1em] text-muted-foreground uppercase">trocar</span>
              </span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">{nav.campaignDetail}</span>
            </button>
            <button
              type="button"
              onClick={nav.onNewCampaign}
              className="flex h-10 w-full items-center justify-center gap-2 bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <Sparkles className="size-4" /> Nova campanha
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

export function AppShell({
  nav,
  panel,
  menuLabel = 'Abrir menu',
  menuBadge,
  eyebrow,
  title,
  step,
  detail,
  actions,
  toolbar,
  alert,
  bleed = false,
  children,
}: {
  nav: ShellNav;
  /* Painel que substitui a lista de etapas quando a tela tem ferramentas próprias. */
  panel?: React.ReactNode;
  menuLabel?: string;
  menuBadge?: number;
  eyebrow?: string;
  title: string;
  step?: number;
  detail?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  alert?: React.ReactNode;
  bleed?: boolean;
  children: React.ReactNode;
}) {
  const [storedCollapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  /* Um painel de ferramentas não cabe em faixa de ícones: nessa tela o menu fica sempre aberto. */
  const collapsed = panel ? false : storedCollapsed;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
      } catch {
        // O menu abre expandido quando o navegador bloqueia armazenamento local.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // A preferência é apenas conveniência.
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/65 lg:hidden"
        />
      ) : null}

      <Sidebar
        nav={nav}
        panel={panel}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`flex min-h-screen flex-col transition-[padding] duration-200 ${collapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={menuLabel}
              className="relative grid size-9 shrink-0 place-items-center border border-border text-muted-foreground hover:text-foreground lg:hidden"
            >
              {panel ? <SlidersHorizontal className="size-4" /> : <Menu className="size-4" />}
              {menuBadge ? (
                <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center bg-primary text-[10px] font-medium text-primary-foreground">{menuBadge}</span>
              ) : null}
            </button>
            <div className="min-w-0 flex-1">
              {eyebrow ? (
                <p className="truncate text-[11px] font-medium tracking-[0.14em] text-accent-foreground uppercase">{eyebrow}</p>
              ) : null}
              <h1 className="truncate text-base font-semibold tracking-[-0.025em] sm:text-lg">{title}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {detail ? <span className="hidden text-xs text-muted-foreground xl:block">{detail}</span> : null}
              {actions}
            </div>
          </div>

          {step ? (
            <div className="h-0.5 w-full bg-white/[0.06]">
              <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${(step / 8) * 100}%` }} />
            </div>
          ) : null}

          {toolbar ? <div className="border-t border-border px-4 py-2.5 sm:px-6">{toolbar}</div> : null}
        </header>

        {alert}

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {bleed ? children : <div className="mx-auto w-full max-w-4xl">{children}</div>}
        </main>
      </div>
    </div>
  );
}
