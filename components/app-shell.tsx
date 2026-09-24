'use client';

/* oxlint-disable next/no-img-element -- o logo é um PNG estático servido da pasta public */

import { useEffect, useState } from 'react';
import {
  Boxes,
  Ellipsis,
  Film,
  Layers3,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Store,
  SlidersHorizontal,
  Sparkles,
  Square,
  Ticket,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';

import { phaseNames, type Phase } from '@/lib/phases';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SIDEBAR_STORAGE_KEY = 'eternity:sidebar-collapsed';

const phaseIcons = [ListChecks, Layers3, Sparkles, Square, Megaphone, Volume2, Film, Ticket] as const;

export type ShellNav = {
  audience: 'student' | 'admin';
  primaryPhases: Phase[];
  optionalPhases: Phase[];
  active: Phase | 'workspace';
  onSelect: (phase: Phase) => void;
  isDisabled: (phase: Phase) => boolean;
  onWorkspace: () => void;
  onNewCampaign: () => void;
  stores: Array<{ id: string; label: string }>;
  activeStoreId: string | null;
  onSwitchStore: (id: string) => void;
  onRenameStore: (id: string, name: string) => void;
  onDeleteStore: (id: string) => void;
  campaigns: Array<{ id: string; label: string; detail: string }>;
  activeCampaignId: string | null;
  onSwitchCampaign: (id: string) => void;
  onRenameCampaign: (id: string, name: string) => void;
  onDeleteCampaign: (id: string) => void;
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
        {nav.primaryPhases.map((phase) => {
          const index = phase - 1;
          const name = phaseNames[index];
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
        {nav.optionalPhases.length ? (
          <>
            <p className={`mt-5 mb-1 px-4 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase ${collapsed ? 'text-center' : ''}`}>{collapsed ? '···' : 'Extras'}</p>
            {nav.optionalPhases.map((phase) => {
              const index = phase - 1;
              const name = phaseNames[index];
              const Icon = phaseIcons[index];
              return <NavItem key={name} collapsed={collapsed} active={nav.active === phase} disabled={nav.isDisabled(phase)} label={name} icon={<Icon className="size-4" />} onClick={() => nav.onSelect(phase)} />;
            })}
          </>
        ) : null}
      </nav>
      )}

      {collapsed && !panel ? (
        <button
          type="button"
          onClick={onToggleCollapsed}
          title="Expandir menu"
          aria-label="Expandir menu"
          className="m-3 grid h-10 shrink-0 place-items-center border border-sidebar-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <PanelLeftOpen className="size-4" />
        </button>
      ) : null}
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
  const [renamingCampaignId, setRenamingCampaignId] = useState<string | null>(null);
  const [campaignNameDraft, setCampaignNameDraft] = useState('');
  const [renamingStoreId, setRenamingStoreId] = useState<string | null>(null);
  const [storeNameDraft, setStoreNameDraft] = useState('');
  const [deleteRequest, setDeleteRequest] = useState<{ kind: 'store' | 'campaign'; id: string; label: string } | null>(null);
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

  function beginRename(id: string, currentName: string) {
    setRenamingCampaignId(id);
    setCampaignNameDraft(currentName);
  }

  function finishRename() {
    if (!renamingCampaignId || !campaignNameDraft.trim()) return;
    nav.onRenameCampaign(renamingCampaignId, campaignNameDraft.trim());
    setRenamingCampaignId(null);
  }

  function beginStoreRename(id: string, currentName: string) {
    setRenamingStoreId(id);
    setStoreNameDraft(currentName);
  }

  function finishStoreRename() {
    if (!renamingStoreId || !storeNameDraft.trim()) return;
    nav.onRenameStore(renamingStoreId, storeNameDraft.trim());
    setRenamingStoreId(null);
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
          <div className="flex min-w-0 items-center gap-2 border-b border-border bg-card/65 px-3 py-2 sm:px-6">
            <Boxes className="hidden size-4 shrink-0 text-accent-foreground sm:block" />
            <div className="min-w-0">
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:block">Loja</p>
              <div className="flex items-center gap-1">
                <Select value={nav.activeStoreId ?? undefined} onValueChange={(value) => { if (value) nav.onSwitchStore(value); }} disabled={!nav.stores.length}>
                  <SelectTrigger size="sm" className="max-w-36 sm:max-w-48"><Store className="size-3.5 text-accent-foreground" /><SelectValue placeholder="Selecione a loja">{nav.stores.find((store) => store.id === nav.activeStoreId)?.label}</SelectValue></SelectTrigger>
                  <SelectContent>{nav.stores.map((store) => <SelectItem key={store.id} value={store.id}>{store.label}</SelectItem>)}</SelectContent>
                </Select>
                {nav.activeStoreId ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<button type="button" aria-label="Opções da loja" className="grid size-7 place-items-center text-muted-foreground hover:bg-white/[0.07] hover:text-foreground" />}><Ellipsis className="size-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      <DropdownMenuItem onClick={() => { const store = nav.stores.find((item) => item.id === nav.activeStoreId); if (store) beginStoreRename(store.id, store.label); }}><Pencil /> Renomear loja</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => { const store = nav.stores.find((item) => item.id === nav.activeStoreId); if (store) setDeleteRequest({ kind: 'store', id: store.id, label: store.label }); }}><Trash2 /> Apagar loja</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>

            <span className="h-7 w-px shrink-0 bg-border" />

            <div className="min-w-0 flex-1">
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:block">Produto</p>
              <div className="flex items-center gap-1">
                <Select value={nav.activeCampaignId ?? undefined} onValueChange={(value) => { if (value) nav.onSwitchCampaign(value); }} disabled={!nav.campaigns.length}>
                  <SelectTrigger size="sm" className="max-w-44 sm:max-w-64"><SelectValue placeholder="Novo produto">{nav.campaigns.find((campaign) => campaign.id === nav.activeCampaignId)?.label}</SelectValue></SelectTrigger>
                  <SelectContent>{nav.campaigns.map((campaign) => <SelectItem key={campaign.id} value={campaign.id}>{campaign.label}</SelectItem>)}</SelectContent>
                </Select>
                {nav.activeCampaignId ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<button type="button" aria-label="Opções do produto" className="grid size-7 place-items-center text-muted-foreground hover:bg-white/[0.07] hover:text-foreground" />}><Ellipsis className="size-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={() => { const campaign = nav.campaigns.find((item) => item.id === nav.activeCampaignId); if (campaign) beginRename(campaign.id, campaign.label); }}><Pencil /> Renomear produto</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => { const campaign = nav.campaigns.find((item) => item.id === nav.activeCampaignId); if (campaign) setDeleteRequest({ kind: 'campaign', id: campaign.id, label: campaign.label }); }}><Trash2 /> Apagar produto</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>

            <button type="button" onClick={nav.onNewCampaign} className="grid size-8 shrink-0 place-items-center border border-primary/35 text-accent-foreground hover:bg-primary/[0.1]" aria-label="Adicionar produto" title="Adicionar produto"><Plus className="size-4" /></button>
          </div>

          <div className="flex h-12 items-center gap-3 px-3 sm:h-16 sm:px-6">
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
                <p className="hidden truncate text-[11px] font-medium tracking-[0.14em] text-accent-foreground uppercase sm:block">{eyebrow}</p>
              ) : null}
              <h1 className="truncate text-sm font-semibold tracking-[-0.025em] sm:text-lg">{title}</h1>
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

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-8">
          {bleed ? children : <div className="mx-auto w-full max-w-4xl">{children}</div>}
        </main>
      </div>

      <Dialog open={renamingCampaignId !== null} onOpenChange={(open) => !open && setRenamingCampaignId(null)}>
        <DialogContent className="border border-primary/20 bg-popover sm:max-w-md">
          <form onSubmit={(event) => { event.preventDefault(); finishRename(); }}>
            <DialogHeader>
              <DialogTitle>Renomear a aba</DialogTitle>
              <DialogDescription>Use um nome curto para encontrar este produto. O produto enviado aos prompts não será alterado.</DialogDescription>
            </DialogHeader>
            <label htmlFor="campaign-tab-name" className="mt-5 mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Nome da aba</label>
            <Input id="campaign-tab-name" value={campaignNameDraft} onChange={(event) => setCampaignNameDraft(event.target.value)} maxLength={40} className="h-11" />
            <DialogFooter className="mt-5">
              <Button type="button" variant="ghost" onClick={() => setRenamingCampaignId(null)}>Cancelar</Button>
              <Button type="submit" disabled={!campaignNameDraft.trim()}>Salvar nome</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={renamingStoreId !== null} onOpenChange={(open) => !open && setRenamingStoreId(null)}>
        <DialogContent className="border border-primary/20 bg-popover sm:max-w-md">
          <form onSubmit={(event) => { event.preventDefault(); finishStoreRename(); }}>
            <DialogHeader><DialogTitle>Renomear a loja</DialogTitle><DialogDescription>Esse nome organiza seus produtos neste navegador.</DialogDescription></DialogHeader>
            <label htmlFor="store-name" className="mt-5 mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Nome da loja</label>
            <Input id="store-name" value={storeNameDraft} onChange={(event) => setStoreNameDraft(event.target.value)} maxLength={40} className="h-11" />
            <DialogFooter className="mt-5"><Button type="button" variant="ghost" onClick={() => setRenamingStoreId(null)}>Cancelar</Button><Button type="submit" disabled={!storeNameDraft.trim()}>Salvar nome</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteRequest !== null} onOpenChange={(open) => !open && setDeleteRequest(null)}>
        <DialogContent className="border border-destructive/25 bg-popover sm:max-w-md">
          <DialogHeader><DialogTitle>Apagar {deleteRequest?.kind === 'store' ? 'esta loja' : 'este produto'}?</DialogTitle><DialogDescription>{deleteRequest?.label}</DialogDescription></DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">{deleteRequest?.kind === 'store' ? 'Todos os produtos desta loja e seus dados salvos serão apagados deste navegador.' : 'O contexto, o lote e a conferência deste produto serão apagados deste navegador.'}</p>
          <DialogFooter className="mt-5"><Button type="button" variant="ghost" onClick={() => setDeleteRequest(null)}>Manter</Button><Button type="button" variant="destructive" onClick={() => { if (!deleteRequest) return; if (deleteRequest.kind === 'store') nav.onDeleteStore(deleteRequest.id); else nav.onDeleteCampaign(deleteRequest.id); setDeleteRequest(null); }}>Apagar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
