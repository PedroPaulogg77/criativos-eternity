'use client';

/* oxlint-disable next/no-img-element -- imagens da biblioteca preservam a proporção original sem corte */

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Film,
  Filter,
  Globe2,
  KeyRound,
  Layers3,
  LayoutDashboard,
  Link2,
  ListChecks,
  Megaphone,
  MessageSquareText,
  Package,
  PanelTop,
  RefreshCcw,
  RotateCcw,
  Search,
  Sparkles,
  Square,
  Star,
  Ticket,
  Volume2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  compileAudioPrompt,
  compileCarouselFormatPrompt,
  compileCarouselPrompt,
  compileCreativeFormatPrompt,
  compileFlyerPrompt,
  compileVideoPrompt,
  socialPrompts,
} from '@/lib/flow-prompts';
import type { SalesDriver } from '@/lib/mvp-data';
import {
  executionErrorStatuses,
  salesDrivers,
  sortByDriver,
  lotSameness,
  recommendedReferenceIds,
  references,
  reviewOptions,
  type Reference,
  type ReviewStatus,
} from '@/lib/mvp-data';
import {
  compileContextPrompt,
  compileIndividualPrompt,
  compileMasterPrompt,
  compileReferencePrompt,
  compileRecoveryPrompt,
  compileSingleRecoveryPrompt,
  type CampaignInput,
} from '@/lib/prompt-compiler';

type Phase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type AppSurface = 'welcome' | 'flow' | 'workspace' | 'stage';
type CreativeView = 'library' | 'prompt' | 'review';
type IndividualAction = { index: number; kind: 'content' | 'variation' } | null;

type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute(input: unknown): Record<string, unknown> | Promise<Record<string, unknown>>;
};

type WebMcpContext = {
  registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): void | Promise<void>;
};

const phaseNames = [
  'Contexto',
  'Carrossel',
  '5 criativos',
  'Formatos',
  'Redes sociais',
  'Narração',
  'Vídeos',
  'Panfleto',
] as const;

const phaseDescriptions = [
  'Capture os fatos que guiam toda a campanha.',
  'Padronize cinco produtos de uma coleção.',
  'Escolha referências e gere os mestres 4:5.',
  'Copie adaptações para 1:1 ou 9:16.',
  'Monte a presença inicial e a rotina social.',
  'Crie a narração de até 30 segundos.',
  'Prepare takes no Kling quando necessário.',
  'Gere o material impresso que acompanha o pedido.',
] as const;

const contextCheckItems = [
  'O alvo exato está correto',
  'A loja e a marca estão corretas',
  'O produto, coleção e variantes estão corretos',
  'A oferta e o idioma estão corretos',
  'A resposta termina com PRONTO PARA GERAR: SIM',
] as const;

const families = ['Todas as famílias', ...Array.from(new Set(references.map((item) => item.family)))];
const categories = ['Todas as categorias', ...Array.from(new Set(references.map((item) => item.category)))];
const URL_PATTERN = /^https?:\/\/.+/i;
const CAMPAIGN_STORAGE_KEY = 'eternity:last-campaign';
const WORKSPACE_STORAGE_KEY = 'eternity:workspace-unlocked';

function statusTone(status: ReviewStatus) {
  if (status === 'correct') return 'border-emerald-400/45 bg-emerald-400/[0.035]';
  if (executionErrorStatuses.includes(status)) return 'border-amber-400/55 bg-amber-400/[0.04]';
  if (status === 'content') return 'border-rose-400/50 bg-rose-400/[0.035]';
  if (status === 'variation') return 'border-sky-400/50 bg-sky-400/[0.035]';
  return 'border-border bg-card';
}

type MenuConfig = {
  active: Phase;
  onSelect: (phase: Phase) => void;
  isDisabled: (phase: Phase) => boolean;
};

function AppHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[1700px] items-center justify-between gap-3 px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <img src="/brand/eternity-academy.png" alt="Eternity Academy" className="h-7 w-auto sm:h-8" />
          <span className="hidden h-6 w-px bg-border sm:block" />
          <p className="hidden text-sm font-medium tracking-[-0.02em] sm:block">Creative Assistant</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenMenu ? (
            <Button type="button" variant="ghost" size="sm" className="rounded-xl text-muted-foreground" onClick={onOpenMenu}>
              <LayoutDashboard data-icon="inline-start" /> <span className="hidden sm:inline">Etapas</span>
            </Button>
          ) : null}
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-3 py-2 text-xs font-medium text-emerald-200 sm:px-4 sm:text-sm">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.75)]" />
            Continue no mesmo chat.
          </div>
        </div>
      </div>
    </header>
  );
}

function AttachmentAlert({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? 'px-4 py-3 sm:px-7' : 'rounded-2xl p-5 sm:p-6'} border border-amber-300/45 bg-[linear-gradient(105deg,rgba(245,158,11,.16),rgba(126,45,255,.13))] text-amber-50 shadow-[0_12px_45px_rgba(245,158,11,.08)]`}>
      <div className={`mx-auto flex items-start gap-3 ${compact ? 'max-w-[1500px]' : ''}`}>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-300 text-amber-950"><AlertTriangle className="size-5" /></span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-amber-200">Anexos obrigatórios no ChatGPT</p>
          <p className="mt-1 text-sm leading-6 text-amber-50/80"><strong className="text-white">Antes de copiar o prompt, anexe fotos reais e nítidas dos produtos e prints completos da página de vendas.</strong> Inclua oferta, variantes, benefícios, logo e identidade visual. Sem essas fontes, o processo pode falhar.</p>
        </div>
      </div>
    </div>
  );
}

function PhaseShell({
  phase,
  detail,
  wide = false,
  children,
  onOpenMenu,
  menu,
  attachmentRequired = false,
}: {
  phase: Phase;
  detail?: string;
  wide?: boolean;
  children: React.ReactNode;
  onOpenMenu?: () => void;
  menu?: MenuConfig;
  attachmentRequired?: boolean;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader onOpenMenu={onOpenMenu} />
      {attachmentRequired ? <AttachmentAlert compact /> : null}

      <div className={menu ? 'mx-auto flex max-w-[1700px]' : ''}>
        {menu ? (
          <aside className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] w-64 shrink-0 border-r border-border px-4 py-6 lg:block">
            <p className="px-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Etapas da campanha</p>
            <nav className="mt-4 space-y-1" aria-label="Etapas da campanha">
              {phaseNames.map((name, index) => {
                const itemPhase = (index + 1) as Phase;
                const disabled = menu.isDisabled(itemPhase);
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={disabled}
                    onClick={() => menu.onSelect(itemPhase)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${menu.active === itemPhase ? 'bg-primary/14 text-violet-100' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'} ${disabled ? 'cursor-not-allowed opacity-35' : ''}`}
                  >
                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold ${menu.active === itemPhase ? 'bg-primary text-white' : 'bg-card'}`}>{index + 1}</span>
                    <span>{name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-7 sm:pt-7">
            <div className="mx-auto flex max-w-4xl items-center gap-3">
              <p className="shrink-0 text-xs font-medium text-muted-foreground sm:text-sm">
                {phaseNames[phase - 1]} · {phase} de 8
              </p>
              <Progress value={(phase / 8) * 100} className="h-1 flex-1 bg-white/[0.07]" aria-label={`Etapa ${phase} de 8`} />
              {detail ? <p className="hidden shrink-0 text-xs text-muted-foreground md:block">{detail}</p> : null}
            </div>
          </div>

          <section className="px-4 py-7 sm:px-7 sm:py-10">
            <div className={`mx-auto ${wide ? 'max-w-7xl' : 'max-w-4xl'}`}>{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}

function QuestionScreen({
  eyebrow,
  title,
  description,
  children,
  back,
  next,
  nextLabel = 'Continuar',
  nextDisabled,
  error,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  back?: () => void;
  next: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  error?: string;
}) {
  return (
    <form
      className="flex min-h-[calc(100vh-12rem)] flex-col justify-between"
      onSubmit={(event) => {
        event.preventDefault();
        next();
      }}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground">{eyebrow}</p>
        <h1 className="text-3xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">{title}</h1>
        {description ? <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">{description}</p> : null}
        <div className="mt-8 text-left">{children}</div>
        {error ? <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-400/[0.08] px-4 py-3 text-left text-sm text-rose-200"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div> : null}
      </div>
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between border-t border-border pt-5">
        {back ? <Button type="button" variant="ghost" size="lg" className="h-11 rounded-xl" onClick={back}><ArrowLeft data-icon="inline-start" /> Voltar</Button> : <span />}
        <Button type="submit" size="lg" className="h-11 rounded-xl px-6 shadow-[0_10px_35px_rgba(126,45,255,.24)]" disabled={nextDisabled}>{nextLabel} <ArrowRight data-icon="inline-end" /></Button>
      </div>
    </form>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 border-b border-border pb-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground">{eyebrow}</p>
      <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function PromptPanel({
  label,
  text,
  copyKey,
  copiedKey,
  onCopy,
}: {
  label: string;
  text: string;
  copyKey: string;
  copiedKey: string;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.45rem] border border-primary/20 bg-[#0b0911] shadow-[0_28px_100px_rgba(55,15,105,.28)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 text-sm font-medium text-violet-100"><Clipboard className="size-4 text-violet-400" /> {label}</div>
        <Button type="button" variant="ghost" size="sm" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => onCopy(text, copyKey)}>
          {copiedKey === copyKey ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> Copiar</>}
        </Button>
      </div>
      <pre className="max-h-[58vh] overflow-auto whitespace-pre-wrap p-5 font-sans text-[13px] leading-6 text-slate-300 sm:p-6">{text}</pre>
    </div>
  );
}

function PromptActionCard({
  icon,
  title,
  description,
  prompt,
  copyKey,
  copiedKey,
  onCopy,
  buttonLabel = 'Copiar prompt',
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
  copyKey: string;
  copiedKey: string;
  onCopy: (text: string, key: string) => void;
  buttonLabel?: string;
}) {
  const copied = copiedKey === copyKey;
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-border bg-card/65 p-5 shadow-[0_16px_55px_rgba(0,0,0,.16)]">
      <div>
        <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-accent-foreground">{icon}</span>
        <h2 className="mt-4 text-lg font-semibold tracking-[-0.025em]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <Button type="button" className="mt-5 h-11 w-full rounded-xl" variant={copied ? 'outline' : 'default'} onClick={() => onCopy(prompt, copyKey)}>
        {copied ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> {buttonLabel}</>}
      </Button>
    </article>
  );
}

function ChatInstruction({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-card/65 p-4 text-sm leading-6 text-muted-foreground">
      <MessageSquareText className="mt-1 size-4 shrink-0 text-accent-foreground" />
      <p><strong className="text-foreground">Continue no mesmo chat.</strong> {children}</p>
    </div>
  );
}

function BottomActions({
  back,
  next,
  nextLabel,
  nextDisabled,
}: {
  back?: () => void;
  next: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      {back ? <Button type="button" variant="ghost" size="lg" className="h-11 rounded-xl" onClick={back}><ArrowLeft data-icon="inline-start" /> Voltar</Button> : <span />}
      <Button type="button" size="lg" className="h-11 rounded-xl px-5" onClick={next} disabled={nextDisabled}>{nextLabel} <ArrowRight data-icon="inline-end" /></Button>
    </div>
  );
}

function ChoiceCard({
  value,
  active,
  icon,
  title,
  description,
}: {
  value: string;
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <label className={`choice-card ${active ? 'choice-card-active' : ''}`}>
      <RadioGroupItem value={value} aria-label={title} />
      <span className="choice-icon">{icon}</span>
      <span><span className="block font-medium">{title}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span></span>
    </label>
  );
}

export default function Home() {
  const [surface, setSurface] = useState<AppSurface>('welcome');
  const [journeyMode, setJourneyMode] = useState<'flow' | 'stage'>('flow');
  const [processStarted, setProcessStarted] = useState(false);
  const [workspaceMessage, setWorkspaceMessage] = useState('');
  const [phase, setPhase] = useState<Phase>(1);
  const [contextStep, setContextStep] = useState(0);
  const [campaignMode, setCampaignMode] = useState<CampaignInput['mode']>('single');
  const [exactTarget, setExactTarget] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [linkAccess, setLinkAccess] = useState<CampaignInput['linkAccess']>('public');
  const [salesDriver, setSalesDriver] = useState<SalesDriver | null>(null);
  const [offer, setOffer] = useState('');
  const [formError, setFormError] = useState('');
  const [contextChecks, setContextChecks] = useState<boolean[]>(() => contextCheckItems.map(() => false));

  const [creativeView, setCreativeView] = useState<CreativeView>('library');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [familyFilter, setFamilyFilter] = useState('Todas as famílias');
  const [categoryFilter, setCategoryFilter] = useState('Todas as categorias');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewState, setReviewState] = useState<Record<string, ReviewStatus>>({});
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEscalated, setRecoveryEscalated] = useState(false);
  const [problemIndex, setProblemIndex] = useState<number | null>(null);
  const [individualAction, setIndividualAction] = useState<IndividualAction>(null);
  const [individualIssue, setIndividualIssue] = useState('');

  const [socialIndex, setSocialIndex] = useState(-1);
  const [videoStep, setVideoStep] = useState(0);
  const [hasGoodVideos, setHasGoodVideos] = useState<boolean | null>(null);
  const [flyerStep, setFlyerStep] = useState(0);
  const [prize, setPrize] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState('');
  const [completed, setCompleted] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const campaign = useMemo<CampaignInput>(() => ({
    mode: campaignMode,
    exactTarget,
    sourceUrl,
    linkAccess,
    offer,
  }), [campaignMode, exactTarget, sourceUrl, linkAccess, offer]);

  const selectedReferences = useMemo(
    () => selectedIds.map((id) => references.find((item) => item.id === id)).filter((item): item is Reference => Boolean(item)),
    [selectedIds],
  );
  const contextPrompt = useMemo(() => compileContextPrompt(campaign), [campaign]);
  const carouselPrompt = useMemo(() => compileCarouselPrompt(), []);
  const masterPrompt = useMemo(() => compileMasterPrompt(campaign, selectedReferences), [campaign, selectedReferences]);
  const audioPrompt = useMemo(() => compileAudioPrompt(campaign), [campaign]);
  const videoPrompt = useMemo(() => compileVideoPrompt(), []);
  const flyerPrompt = useMemo(() => compileFlyerPrompt({ prize, coupon, discount }), [prize, coupon, discount]);

  const filteredReferences = references.filter((item) => {
    const matchesMode = item.modes.includes(campaignMode);
    const matchesFamily = familyFilter === 'Todas as famílias' || item.family === familyFilter;
    const matchesCategory = categoryFilter === 'Todas as categorias' || item.category === categoryFilter;
    const haystack = `${item.name} ${item.family} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
    return matchesMode && matchesFamily && matchesCategory && haystack.includes(searchTerm.trim().toLowerCase());
  });
  const orderedReferences = sortByDriver(filteredReferences, salesDriver);
  const compatibleReferences = references.filter((item) => item.modes.includes(campaignMode));
  const hiddenByModeCount = references.length - compatibleReferences.length;
  const pendingIndexes = selectedReferences
    .map((item, index) => executionErrorStatuses.includes(reviewState[item.id] ?? 'correct') ? index : -1)
    .filter((index) => index >= 0);
  const problemIndexes = selectedReferences
    .map((item, index) => (reviewState[item.id] ?? 'correct') !== 'correct' ? index : -1)
    .filter((index) => index >= 0);
  const correctCount = selectedReferences.length - problemIndexes.length;
  const recoveryPrompt = compileRecoveryPrompt(selectedReferences, pendingIndexes);
  const activeIndividualReference = individualAction ? selectedReferences[individualAction.index] : null;
  const individualPrompt = activeIndividualReference && individualAction
    ? compileIndividualPrompt(activeIndividualReference, individualAction.index, individualIssue, individualAction.kind)
    : '';

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);
        if (saved) {
          const value = JSON.parse(saved) as Partial<CampaignInput>;
          if ((value.mode === 'single' || value.mode === 'collection') && typeof value.exactTarget === 'string' && typeof value.sourceUrl === 'string' && (value.linkAccess === 'public' || value.linkAccess === 'protected') && typeof value.offer === 'string') {
            setCampaignMode(value.mode);
            setExactTarget(value.exactTarget);
            setSourceUrl(value.sourceUrl);
            setLinkAccess(value.linkAccess);
            setOffer(value.offer);
          }
        }
        if (window.localStorage.getItem(WORKSPACE_STORAGE_KEY) === 'true') setSurface('workspace');
      } catch {
        // O armazenamento local é apenas conveniência; o fluxo continua sem ele.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: WebMcpContext }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const tool: WebMcpTool = {
      name: 'prepare_creative_context',
      title: 'Preparar contexto de criativos',
      description: 'Preenche o contexto da campanha e abre a primeira mensagem pronta para copiar.',
      inputSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['single', 'collection'] },
          exactTarget: { type: 'string', minLength: 1 },
          sourceUrl: { type: 'string', minLength: 1 },
          linkAccess: { type: 'string', enum: ['public', 'protected'] },
          offer: { type: 'string', minLength: 1 },
        },
        required: ['mode', 'exactTarget', 'sourceUrl', 'linkAccess', 'offer'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== 'object') throw new Error('Entrada inválida.');
        const value = input as Record<string, unknown>;
        if ((value.mode !== 'single' && value.mode !== 'collection') || typeof value.exactTarget !== 'string' || !value.exactTarget.trim() || typeof value.sourceUrl !== 'string' || !value.sourceUrl.trim() || (value.linkAccess !== 'public' && value.linkAccess !== 'protected') || typeof value.offer !== 'string' || !value.offer.trim()) {
          throw new Error('Informe alvo, link, acesso e oferta.');
        }
        setCampaignMode(value.mode);
        setSelectedIds([]);
        setExactTarget(value.exactTarget.trim());
        setSourceUrl(value.sourceUrl.trim());
        setLinkAccess(value.linkAccess);
        setOffer(value.offer.trim());
        setSurface('flow');
        setJourneyMode('flow');
        setProcessStarted(true);
        setPhase(1);
        setContextStep(5);
        window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify({
          mode: value.mode,
          exactTarget: value.exactTarget.trim(),
          sourceUrl: value.sourceUrl.trim(),
          linkAccess: value.linkAccess,
          offer: value.offer.trim(),
        }));
        return { status: 'context_prompt_ready', nextStep: 'copy_to_chatgpt' };
      },
    };
    try {
      void Promise.resolve(modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      // A experiência segue funcionando em navegadores sem WebMCP.
    }
    return () => lifecycle.abort();
  }, []);

  function goPhase(nextPhase: Phase) {
    setPhase(nextPhase);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function persistCampaign() {
    try {
      window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaign));
    } catch {
      // O aluno ainda pode continuar quando o navegador bloquear armazenamento local.
    }
  }

  function openWorkspace(message = '') {
    setWorkspaceMessage(message);
    setSurface('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startGuidedCampaign() {
    setJourneyMode('flow');
    setProcessStarted(true);
    setSurface('flow');
    setPhase(1);
    setContextStep(0);
    setContextChecks(contextCheckItems.map(() => false));
    setCreativeView('library');
    setSelectedIds([]);
    setReviewState({});
    setSocialIndex(-1);
    setVideoStep(0);
    setHasGoodVideos(null);
    setFlyerStep(0);
    setCompleted(false);
    setWorkspaceMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function stageIsDisabled(targetPhase: Phase) {
    const hasContext = exactTarget.trim().length > 2 && sourceUrl.trim().length > 5 && offer.trim().length > 1;
    if (targetPhase === 1) return false;
    if (!hasContext) return true;
    return targetPhase === 2 && campaignMode !== 'collection';
  }

  function openStage(targetPhase: Phase) {
    if (stageIsDisabled(targetPhase)) {
      setWorkspaceMessage(targetPhase === 2 ? 'O carrossel só fica disponível quando o contexto é de coleção.' : 'Prepare o Contexto primeiro. As outras etapas dependem dos fatos e anexos dessa conversa.');
      return;
    }
    setJourneyMode('stage');
    setProcessStarted(true);
    setSurface('stage');
    setWorkspaceMessage('');
    setPhase(targetPhase);
    setCompleted(false);
    if (targetPhase === 1) {
      setContextStep(0);
      setContextChecks(contextCheckItems.map(() => false));
    }
    if (targetPhase === 3) setCreativeView('library');
    if (targetPhase === 5) setSocialIndex(-1);
    if (targetPhase === 7) setVideoStep(0);
    if (targetPhase === 8) setFlyerStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function finishStandalone(message: string) {
    setProcessStarted(false);
    openWorkspace(message);
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(''), 1800);
    } catch {
      setCopiedKey('erro');
    }
  }

  function contextAnswerReady() {
    if (contextStep === 0) return Boolean(campaignMode);
    if (contextStep === 1) return exactTarget.trim().length > 2;
    if (contextStep === 2) return URL_PATTERN.test(sourceUrl.trim());
    if (contextStep === 3) return Boolean(linkAccess);
    if (contextStep === 4) return offer.trim().length > 1;
    if (contextStep === 5) return Boolean(salesDriver);
    return true;
  }

  function advanceContext() {
    if (!contextAnswerReady()) {
      setFormError(contextStep === 2 ? 'Cole um link completo, começando com http:// ou https://.' : 'Complete esta resposta para continuar.');
      return;
    }
    setFormError('');
    if (contextStep === 5) persistCampaign();
    setContextStep((current) => Math.min(7, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backContext() {
    setFormError('');
    setContextStep((current) => Math.max(0, current - 1));
  }

  function finishContext() {
    if (!contextChecks.every(Boolean)) return;
    persistCampaign();
    if (journeyMode === 'stage') {
      finishStandalone('Contexto concluído. Continue usando este mesmo chat nas próximas etapas.');
      return;
    }
    goPhase(campaignMode === 'collection' ? 2 : 3);
  }

  function toggleReference(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 5) return current;
      return [...current, id];
    });
  }

  function updateReview(id: string, value: ReviewStatus) {
    setReviewState((current) => ({ ...current, [id]: value }));
  }

  function markIndexesCorrect(indexes: number[]) {
    setReviewState((current) => {
      const next = { ...current };
      indexes.forEach((index) => {
        const reference = selectedReferences[index];
        if (reference) next[reference.id] = 'correct';
      });
      return next;
    });
  }

  function resetCampaign() {
    setPhase(1);
    setContextStep(0);
    setCampaignMode('single');
    setExactTarget('');
    setSourceUrl('');
    setLinkAccess('public');
    setOffer('');
    setContextChecks(contextCheckItems.map(() => false));
    setCreativeView('library');
    setSelectedIds([]);
    setReviewState({});
    setSocialIndex(-1);
    setVideoStep(0);
    setHasGoodVideos(null);
    setFlyerStep(0);
    setPrize('');
    setCoupon('');
    setDiscount('');
    setCompleted(false);
    setJourneyMode('flow');
    setProcessStarted(true);
    setSurface('flow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeCampaign() {
    try {
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, 'true');
      window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaign));
    } catch {
      // A conclusão não depende do armazenamento local.
    }
    setCompleted(true);
    setProcessStarted(false);
    openWorkspace('Metodologia concluída. Agora você pode voltar a qualquer etapa sem refazer o processo inteiro.');
  }

  const shellProps = {
    onOpenMenu: () => openWorkspace(),
    attachmentRequired: linkAccess === 'protected' && (phase > 1 || contextStep >= 3),
    menu: surface === 'stage' ? {
      active: phase,
      onSelect: openStage,
      isDisabled: stageIsDisabled,
    } satisfies MenuConfig : undefined,
  };

  if (surface === 'welcome') {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <section className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-5xl items-center px-4 py-12 sm:px-7">
          <div className="w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">Eternity Creative System</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl">Como você quer trabalhar hoje?</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Na primeira campanha, recomendamos percorrer a metodologia inteira. Se você já tem o contexto no ChatGPT, também pode abrir somente a etapa de que precisa.</p>
            <div className="mt-9 grid gap-4 md:grid-cols-2">
              <button type="button" onClick={startGuidedCampaign} className="group rounded-[1.5rem] border border-primary/45 bg-primary/[0.09] p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/75 hover:bg-primary/[0.13]">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary text-white shadow-[0_12px_35px_rgba(126,45,255,.3)]"><Sparkles className="size-6" /></span>
                <span className="mt-6 block text-xl font-semibold tracking-[-0.03em]">Fazer o processo completo</span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">Você será guiado com uma pergunta por vez, do contexto ao panfleto.</span>
                <span className="mt-6 flex items-center gap-2 text-sm font-medium text-violet-200">Recomendado na primeira vez <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </button>
              <button type="button" onClick={() => openWorkspace()} className="group rounded-[1.5rem] border border-border bg-card/55 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-card/80">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.07] text-violet-200"><LayoutDashboard className="size-6" /></span>
                <span className="mt-6 block text-xl font-semibold tracking-[-0.03em]">Abrir somente uma etapa</span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">Volte a um material específico sem precisar percorrer todo o processo.</span>
                <span className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground">Escolher etapa <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (surface === 'workspace') {
    const stageIcons = [ListChecks, Layers3, Sparkles, Square, Megaphone, Volume2, Film, Ticket];
    const hasContext = !stageIsDisabled(3);
    return (
      <main className="min-h-screen bg-background text-foreground">
        <AppHeader />
        {linkAccess === 'protected' && hasContext ? <AttachmentAlert compact /> : null}
        <section className="mx-auto max-w-7xl px-4 py-9 sm:px-7 sm:py-12">
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">Painel da campanha</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">Escolha exatamente onde continuar</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Cada etapa abre separadamente. Os prompts continuam dependendo do contexto e dos anexos que já estão no mesmo chat do ChatGPT.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {processStarted ? <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => setSurface(journeyMode)}><ArrowRight data-icon="inline-end" /> Continuar {phaseNames[phase - 1]}</Button> : null}
              <Button type="button" className="h-11 rounded-xl" onClick={resetCampaign}><Sparkles data-icon="inline-start" /> Nova campanha completa</Button>
            </div>
          </div>

          {workspaceMessage ? <output className="mt-6 flex items-start gap-3 rounded-2xl border border-violet-400/30 bg-violet-500/[0.09] p-5 text-sm leading-6 text-violet-100"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-violet-300" /><span>{workspaceMessage}</span></output> : null}

          <div className={`mt-6 rounded-2xl border p-5 ${hasContext ? 'border-emerald-400/25 bg-emerald-400/[0.06]' : 'border-amber-400/30 bg-amber-400/[0.07]'}`}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${hasContext ? 'text-emerald-300' : 'text-amber-300'}`}>{hasContext ? 'Contexto disponível' : 'Comece pelo contexto'}</p>
                <p className="mt-2 font-medium">{hasContext ? exactTarget : 'As demais etapas permanecem protegidas para evitar prompts sem fatos.'}</p>
                {hasContext ? <p className="mt-1 text-sm text-muted-foreground">{campaignMode === 'collection' ? 'Coleção' : 'Produto único'} · {offer}</p> : <p className="mt-1 text-sm text-muted-foreground">Leva poucos minutos e evita falhas em todo o processo.</p>}
              </div>
              <Button type="button" variant="outline" className="shrink-0 rounded-xl" onClick={() => openStage(1)}>{hasContext ? 'Atualizar contexto' : 'Preparar contexto'}</Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {phaseNames.map((name, index) => {
              const targetPhase = (index + 1) as Phase;
              const Icon = stageIcons[index];
              const disabled = stageIsDisabled(targetPhase);
              const collectionOnly = targetPhase === 2;
              return (
                <button key={name} type="button" disabled={disabled} onClick={() => openStage(targetPhase)} className={`group flex min-h-56 flex-col rounded-[1.35rem] border p-5 text-left transition-all ${disabled ? 'cursor-not-allowed border-border bg-card/25 opacity-45' : 'border-border bg-card/55 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-card/80'}`}>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-accent-foreground"><Icon className="size-5" /></span>
                    <span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <span className="mt-5 block text-lg font-semibold tracking-[-0.025em]">{name}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{phaseDescriptions[index]}</span>
                  <span className="mt-auto pt-5 text-xs font-medium text-violet-200">{disabled ? (collectionOnly && hasContext ? 'Disponível apenas para coleção' : 'Prepare o contexto primeiro') : 'Abrir esta etapa →'}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  if (phase === 1) {
    if (contextStep === 0) {
      return (
        <PhaseShell {...shellProps} phase={1} detail="Pergunta 1 de 6">
          <QuestionScreen eyebrow="Vamos começar pelo essencial" title="O que você vai anunciar?" description="Essa escolha define o caminho da campanha. Coleções recebem automaticamente um carrossel com cinco produtos." next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <RadioGroup value={campaignMode} onValueChange={(value) => { setCampaignMode(value as CampaignInput['mode']); setSelectedIds([]); }} className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard value="single" active={campaignMode === 'single'} icon={<Package className="size-5" />} title="Produto único" description="Um produto e uma variante factual." />
              <ChoiceCard value="collection" active={campaignMode === 'collection'} icon={<Layers3 className="size-5" />} title="Coleção" description="Vários produtos e carrossel obrigatório." />
            </RadioGroup>
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 1) {
      return (
        <PhaseShell {...shellProps} phase={1} detail="Pergunta 2 de 6">
          <QuestionScreen eyebrow="Alvo exato" title={campaignMode === 'collection' ? 'Qual coleção será anunciada?' : 'Qual produto será anunciado?'} description="Descreva somente o que pode aparecer nesta campanha." back={backContext} next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <label htmlFor="exact-target" className="mb-2 block text-sm font-medium">Alvo da campanha</label>
            <Input id="exact-target" value={exactTarget} onChange={(event) => setExactTarget(event.target.value)} className="h-14 rounded-xl bg-card px-4 text-base" placeholder={campaignMode === 'collection' ? 'Ex.: coleção de óculos inspirada em marcas de carros' : 'Ex.: suporte Pocket preto para smartphone'} />
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 2) {
      return (
        <PhaseShell {...shellProps} phase={1} detail="Pergunta 3 de 6">
          <QuestionScreen eyebrow="Fonte factual" title="Qual é o link da página de vendas?" description="Pode ser o link direto do produto, da coleção ou da loja." back={backContext} next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <label htmlFor="source-url" className="mb-2 block text-sm font-medium">Link da loja</label>
            <div className="relative"><Link2 className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" /><Input id="source-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} className="h-14 rounded-xl bg-card pr-4 pl-12 text-base" placeholder="https://sualoja.com/produto-ou-colecao" /></div>
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 3) {
      return (
        <PhaseShell {...shellProps} phase={1} detail="Pergunta 4 de 6">
          <QuestionScreen eyebrow="Acesso ao link" title="O ChatGPT consegue abrir essa página?" description="Se a loja pedir senha, você usará os mesmos anexos durante todo o processo." back={backContext} next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <RadioGroup value={linkAccess} onValueChange={(value) => setLinkAccess(value as CampaignInput['linkAccess'])} className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard value="public" active={linkAccess === 'public'} icon={<Globe2 className="size-5" />} title="Sim, está pública" description="Abre sem login, senha ou bloqueio." />
              <ChoiceCard value="protected" active={linkAccess === 'protected'} icon={<KeyRound className="size-5" />} title="Não, está protegida" description="Usaremos fotos e prints no ChatGPT." />
            </RadioGroup>
            {linkAccess === 'protected' ? <div className="mt-5"><AttachmentAlert /></div> : null}
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 4) {
      return (
        <PhaseShell {...shellProps} phase={1} detail="Pergunta 5 de 6">
          <QuestionScreen eyebrow="Oferta" title="Qual é a oferta exata?" description="Escreva exatamente como deve aparecer, incluindo idioma e condições." back={backContext} next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <label htmlFor="offer" className="mb-2 block text-sm font-medium">Oferta da campanha</label>
            <Input id="offer" value={offer} onChange={(event) => setOffer(event.target.value)} className="h-14 rounded-xl bg-card px-4 text-base" placeholder="Ex.: Kaufen Sie 2 und erhalten Sie 1 gratis" />
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 5) {
      return (
        <PhaseShell {...shellProps} phase={1} detail="Pergunta 6 de 6">
          <QuestionScreen eyebrow="Argumento de venda" title="O que faz o cliente comprar isso?" description="A oferta agressiva vale nos dois casos. O que muda a peça é ter um diferencial para explicar ou não. Dois tênis na mesma prateleira podem cair em lados opostos." back={backContext} next={advanceContext} nextLabel="Preparar contexto" nextDisabled={!contextAnswerReady()} error={formError}>
            <RadioGroup value={salesDriver ?? ''} onValueChange={(value) => setSalesDriver(value as SalesDriver)} className="grid gap-3 sm:grid-cols-2">
              {salesDrivers.map((item) => <ChoiceCard key={item.value} value={item.value} active={salesDriver === item.value} icon={<Sparkles className="size-5" />} title={item.label} description={item.description} />)}
            </RadioGroup>
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 6) {
      return (
        <PhaseShell {...shellProps} phase={1} detail="Mensagem inicial">
          <PageHeading eyebrow="Contexto pronto" title="Envie a primeira mensagem" description="Abra um novo chat no ChatGPT. Essa conversa acompanhará toda a campanha até o panfleto." />
          {linkAccess === 'protected' ? <div className="mb-6"><AttachmentAlert /></div> : null}
          <PromptPanel label="Mensagem 1 · contexto inicial" text={contextPrompt} copyKey="context" copiedKey={copiedKey} onCopy={copyText} />
          <ChatInstruction>{linkAccess === 'protected' ? 'Anexe primeiro as fotos e os prints. Depois cole a mensagem acima. ' : 'Cole a mensagem acima. '}Espere a resposta completa antes de continuar.</ChatInstruction>
          <BottomActions back={backContext} next={advanceContext} nextLabel="Já recebi o contexto" />
        </PhaseShell>
      );
    }

    return (
      <PhaseShell {...shellProps} phase={1} detail="Checklist">
        <PageHeading eyebrow="Conferência humana" title="O contexto está correto?" description="Confira somente estes cinco pontos na resposta do ChatGPT. Se algo estiver errado, corrija no mesmo chat antes de avançar." />
        <div className="rounded-[1.5rem] border border-border bg-card/65 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div><p className="font-medium">Checklist da resposta</p><p className="mt-1 text-sm text-muted-foreground">Marque os cinco itens ou use a seleção rápida.</p></div>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setContextChecks(contextCheckItems.map(() => !contextChecks.every(Boolean)))}><ListChecks data-icon="inline-start" /> {contextChecks.every(Boolean) ? 'Limpar seleção' : 'Selecionar tudo'}</Button>
          </div>
          <div className="space-y-3">
            {contextCheckItems.map((item, index) => (
              <label key={item} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/45 p-4 text-sm sm:text-base">
                <Checkbox checked={contextChecks[index]} onCheckedChange={(checked) => setContextChecks((current) => current.map((value, itemIndex) => itemIndex === index ? checked === true : value))} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
        <BottomActions back={backContext} next={finishContext} nextLabel={journeyMode === 'stage' ? 'Concluir contexto' : campaignMode === 'collection' ? 'Criar carrossel' : 'Escolher referências'} nextDisabled={!contextChecks.every(Boolean)} />
      </PhaseShell>
    );
  }

  if (phase === 2) {
    return (
      <PhaseShell {...shellProps} phase={2} detail="Somente coleções">
        <PageHeading eyebrow="Carrossel obrigatório" title="Padronize cinco produtos da coleção" description="O ChatGPT escolherá cinco imagens elegíveis já anexadas e criará cinco cards 4:5 com fundo branco ou cinza consistente." />
        <PromptPanel label="Mensagem 2 · carrossel com 5 cards" text={carouselPrompt} copyKey="carousel" copiedKey={copiedKey} onCopy={copyText} />
        <ChatInstruction>Cole o prompt acima depois de aprovar o contexto. Não reenvie nem substitua as fontes factuais.</ChatInstruction>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {['5 arquivos separados', 'Fundo igual', 'Produto intacto', 'Sem rosto quando houver pessoa'].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-border bg-card/55 p-3 text-sm text-muted-foreground"><CheckCircle2 className="size-4 shrink-0 text-emerald-400" />{item}</div>)}
        </div>
        <BottomActions back={() => journeyMode === 'stage' ? openWorkspace() : (goPhase(1), setContextStep(6))} next={() => journeyMode === 'stage' ? finishStandalone('Etapa de carrossel concluída.') : goPhase(3)} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Já gerei os cinco cards'} />
      </PhaseShell>
    );
  }

  if (phase === 3 && creativeView === 'library') {
    const modeLabel = campaignMode === 'collection' ? 'colecao' : 'produto unico';
    const filterCount = Number(Boolean(searchTerm.trim())) + Number(familyFilter !== 'Todas as famílias') + Number(categoryFilter !== 'Todas as categorias');
    return (
      <PhaseShell {...shellProps} phase={3} detail={`${selectedIds.length} de 5 escolhidas`} wide>
        <div className="mb-5 flex flex-col justify-between gap-4 border-b border-border pb-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground">Direções visuais</p>
            <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Escolha pela imagem</h1>
            <p className="mt-2 text-sm text-muted-foreground">{compatibleReferences.length} compativeis de {references.length} no banco para {modeLabel}. {hiddenByModeCount} ocultas por formato.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-full border border-border bg-card/65 px-3 py-2 text-sm text-muted-foreground"><strong className="text-foreground">{selectedIds.length}</strong> de 5</div>
            <Button type="button" variant="ghost" size="sm" className="h-10 rounded-xl text-accent-foreground" onClick={() => setSelectedIds(recommendedReferenceIds)}><Sparkles data-icon="inline-start" /> Lote validado</Button>
            <Button type="button" size="sm" className="h-10 rounded-xl" disabled={selectedIds.length !== 5} onClick={() => { setCreativeView('prompt'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Criar prompt <ArrowRight data-icon="inline-end" /></Button>
          </div>
        </div>
        <div className="relative z-20 mb-5 rounded-xl border border-border bg-background/80 p-2.5 shadow-[0_14px_45px_rgba(0,0,0,.2)] backdrop-blur-xl">
          <div className="grid gap-2 lg:grid-cols-[1fr_13rem_13rem_auto] lg:items-center">
            <div className="relative min-w-0"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-10 rounded-lg bg-card pr-4 pl-9 text-sm" placeholder="Buscar referência" /></div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? 'Todas as categorias')}><SelectTrigger className="h-10 rounded-lg bg-card text-sm"><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category === 'Todas as categorias' ? 'Todas' : category}</SelectItem>)}</SelectContent></Select>
            <Select value={familyFilter} onValueChange={(value) => setFamilyFilter(value ?? 'Todas as famílias')}><SelectTrigger className="h-10 rounded-lg bg-card text-sm"><Filter className="size-4 text-muted-foreground" /><SelectValue /></SelectTrigger><SelectContent>{families.map((family) => <SelectItem key={family} value={family}>{family}</SelectItem>)}</SelectContent></Select>
            {filterCount ? <Button type="button" variant="ghost" size="sm" className="h-10 rounded-lg text-muted-foreground" onClick={() => { setSearchTerm(''); setCategoryFilter('Todas as categorias'); setFamilyFilter('Todas as famílias'); }}>Limpar</Button> : <span className="hidden text-right text-xs text-muted-foreground lg:block">{filteredReferences.length} visiveis</span>}
          </div>
        </div>

        {orderedReferences.length ? <div className="reference-masonry" aria-label="Biblioteca de referências">{orderedReferences.map((item) => {
          const selectedIndex = selectedIds.indexOf(item.id);
          const selected = selectedIndex >= 0;
          const blocked = selectedIds.length >= 5 && !selected;
          return (
            <article key={item.id} className={`reference-pin group w-full text-left ${selected ? 'reference-pin-active' : ''}`}>
              <button type="button" disabled={blocked} onClick={() => toggleReference(item.id)} className={`reference-image-button ${blocked ? 'opacity-35' : ''}`} aria-pressed={selected} aria-label={`${selected ? 'Remover' : 'Adicionar'} ${item.name} ${selected ? 'do' : 'ao'} lote`}>
                <img src={item.image} alt={`Referência completa: ${item.name}`} loading="lazy" className="h-auto w-full" />
                {selected ? <span className="absolute top-3 left-3 grid size-8 place-items-center rounded-full bg-primary text-xs font-medium text-white shadow-lg">{String(selectedIndex + 1).padStart(2, '0')}</span> : null}
                <span className="reference-hover-panel">
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-medium tracking-[-0.02em] text-white">{item.name}</span>
                      <span className="mt-1 block text-xs text-white/72">{item.family} · {item.category}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${item.validated ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'}`}>{item.validated ? 'Validada' : 'Piloto'}</span>
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-white/66">{item.modes.length === 2 ? 'Produto ou coleção' : item.modes[0] === 'collection' ? 'Coleção' : 'Produto único'}{item.limits ? ` · ${item.limits}` : ''}</span>
                </span>
              </button>
              <Button type="button" variant="ghost" size="icon" title="Copiar so esta direcao" aria-label={`Copiar prompt da referencia ${item.name}`} className="reference-copy-button" onClick={() => copyText(compileReferencePrompt(campaign, item), `library-single-${item.id}`)}>{copiedKey === `library-single-${item.id}` ? <Check className="size-4" /> : <Copy className="size-4" />}</Button>
            </article>
          );
        })}</div> : <div className="rounded-2xl border border-dashed border-border py-16 text-center"><Search className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 font-medium">Nenhuma referência encontrada</p><p className="mt-1 text-sm text-muted-foreground">Remova um filtro ou busque outro termo.</p></div>}
        <div className="mt-8 border-t border-border pt-6"><Button type="button" variant="ghost" size="lg" onClick={() => journeyMode === 'stage' ? openWorkspace() : campaignMode === 'collection' ? goPhase(2) : (goPhase(1), setContextStep(6))}><ArrowLeft data-icon="inline-start" /> Voltar</Button></div>
      </PhaseShell>
    );
  }

  if (phase === 3 && creativeView === 'prompt') {
    return (
      <PhaseShell {...shellProps} phase={3} detail="Lote mestre 4:5">
        <PageHeading eyebrow="Cinco direções selecionadas" title="Gere os cinco criativos mestres" description="Duas formas de pedir ao ChatGPT, com as mesmas receitas e as mesmas travas factuais. Muda só quantas mensagens você cola." />
        {lotSameness(selectedReferences).length >= 3 ? <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-4 text-sm leading-6 text-amber-100/85"><p className="font-medium text-amber-100">As cinco direções escolhidas são parecidas demais entre si.</p><p className="mt-1">Elas repetem {lotSameness(selectedReferences).map((eixo) => eixo.label).join(', ')}. Um lote assim tende a devolver cinco peças que se parecem, e o teste de criativo perde o sentido. Troque pelo menos duas por direções de outra família ou com outra quantidade de produtos.</p></div> : null}
        <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 p-4"><div className="flex -space-x-2">{selectedReferences.map((item, index) => <div key={item.id} className="relative size-11 overflow-hidden rounded-xl border-2 border-background bg-muted shadow"><img src={item.image} alt="" className="h-full w-full object-cover" /><span className="absolute right-0 bottom-0 grid size-4 place-items-center rounded-tl bg-primary text-[8px] text-white">{index + 1}</span></div>)}</div><div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-400" /> 5 imagens separadas · 4:5</div></div>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <section className="flex flex-col rounded-2xl border border-border bg-card/55 p-4 sm:p-5">
            <header className="mb-4 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/14 text-violet-200"><Layers3 className="size-5" /></span>
              <div>
                <h2 className="font-semibold">Cinco de uma vez</h2>
                <p className="mt-0.5 text-sm leading-5 text-muted-foreground">Uma mensagem só. Mais rápido, mas o ChatGPT às vezes falha na entrega.</p>
              </div>
            </header>
            <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-3.5 text-sm leading-6 text-amber-100/85">
              <p className="font-medium text-amber-100">O ChatGPT não garante cinco imagens numa resposta.</p>
              <p className="mt-1">O recurso de várias imagens dele foi feito para gerar variações de um mesmo pedido, não cinco pedidos diferentes. Quando falha, volta uma colagem com as cinco peças juntas ou cinco versões da primeira direção. Se isso acontecer, marque na conferência e o comando de correção aparece — ou use os cinco comandos ao lado.</p>
            </div>
            <PromptPanel label="Mensagem · gerar lote mestre" text={masterPrompt} copyKey="master" copiedKey={copiedKey} onCopy={copyText} />
          </section>

          <section className="flex flex-col rounded-2xl border border-border bg-card/55 p-4 sm:p-5">
            <header className="mb-4 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/14 text-violet-200"><Copy className="size-5" /></span>
              <div>
                <h2 className="font-semibold">Uma direção por vez</h2>
                <p className="mt-0.5 text-sm leading-5 text-muted-foreground">Cinco mensagens curtas, coladas em sequência. Sempre entrega.</p>
              </div>
            </header>
            <p className="mb-4 rounded-xl border border-border bg-background/45 p-3.5 text-sm leading-6 text-muted-foreground">Cole uma, espere a imagem, cole a próxima. Não precisa conferir entre elas: cada mensagem carrega a receita inteira e não depende das anteriores.</p>
            <div className="space-y-2">{selectedReferences.map((item, index) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/45 p-3"><div className="flex min-w-0 items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/14 text-xs font-semibold text-violet-200">{String(index + 1).padStart(2, '0')}</span><p className="truncate text-sm font-medium">{item.name}</p></div><Button type="button" variant="outline" size="sm" className="h-9 shrink-0 rounded-xl" onClick={() => copyText(compileReferencePrompt(campaign, item), `selected-single-${item.id}`)}>{copiedKey === `selected-single-${item.id}` ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> Copiar</>}</Button></div>)}</div>
          </section>
        </div>

        <ChatInstruction>Use um dos dois lados. Cole depois de conferir o contexto e, em coleções, depois de gerar o carrossel.</ChatInstruction>
        <BottomActions back={() => setCreativeView('library')} next={() => { setCreativeView('review'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} nextLabel="Já gerei. Conferir lote" />
      </PhaseShell>
    );
  }

  if (phase === 3) {
    return (
      <PhaseShell {...shellProps} phase={3} detail={`${correctCount} de 5 aprovados`} wide>
        <PageHeading eyebrow="Revisão humana" title="Confira os cinco criativos" description="Se uma imagem estiver correta, não faça nada: ela já está aprovada. Sinalize somente os cartões que realmente têm um problema." />
        {correctCount === 5 ? <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.08] p-5 text-emerald-100"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" /><div><h2 className="font-medium">Tudo certo por padrão</h2><p className="mt-1 text-sm leading-5 text-emerald-200/75">Você pode avançar. Use “Sinalizar problema” somente se algo faltou, repetiu ou precisa de correção.</p></div></div> : <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-5 text-amber-100"><AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" /><div><h2 className="font-medium">Resolva os cartões sinalizados</h2><p className="mt-1 text-sm leading-5 text-amber-200/75">O avanço volta a ser liberado assim que todos os problemas forem marcados como corrigidos.</p></div></div>}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{selectedReferences.map((item, index) => {
          const status = reviewState[item.id] ?? 'correct';
          const needsIndividual = status === 'content' || status === 'variation';
          const statusLabel = reviewOptions.find((option) => option.value === status)?.label ?? 'Correto';
          return (
            <article key={item.id} className={`overflow-hidden rounded-2xl border shadow-[0_14px_44px_rgba(0,0,0,.22)] transition-colors ${statusTone(status)}`}>
              <div className="relative overflow-hidden bg-black/35"><img src={item.sample ?? item.image} alt={`Cartão ${String(index + 1).padStart(2, '0')}: ${item.name}`} className="h-auto w-full" /><div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/65 to-transparent p-3 pb-10 text-white"><span className="grid size-9 place-items-center rounded-xl bg-white/92 text-xs font-medium text-slate-900">{String(index + 1).padStart(2, '0')}</span><span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] backdrop-blur">Mestre 4:5</span></div></div>
              <div className="p-4"><p className="text-xs text-muted-foreground">{item.id}</p><h2 className="mt-1 font-medium tracking-[-0.02em]">{item.name}</h2><div className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${status === 'correct' ? 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200' : 'border-amber-400/30 bg-amber-400/[0.08] text-amber-100'}`}>{status === 'correct' ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}<span className="font-medium">{status === 'correct' ? 'Sem problema' : statusLabel}</span></div><div className="mt-3 grid gap-2"><Button type="button" variant={status === 'correct' ? 'outline' : 'ghost'} className="h-10 w-full rounded-xl" onClick={() => setProblemIndex(index)}>{status === 'correct' ? <><AlertCircle data-icon="inline-start" /> Sinalizar problema</> : 'Alterar problema'}</Button>{needsIndividual ? <Button type="button" variant={status === 'content' ? 'destructive' : 'outline'} className="h-10 w-full rounded-xl" onClick={() => { setIndividualAction({ index, kind: status === 'content' ? 'content' : 'variation' }); setIndividualIssue(''); }}>{status === 'content' ? <><RefreshCcw data-icon="inline-start" /> Corrigir este criativo</> : <><RotateCcw data-icon="inline-start" /> Gerar nova variação</>}</Button> : null}{status !== 'correct' ? <Button type="button" variant="ghost" className="h-9 w-full rounded-xl text-emerald-300" onClick={() => updateReview(item.id, 'correct')}><Check data-icon="inline-start" /> Já foi corrigido</Button> : null}</div></div>
            </article>
          );
        })}</div>
        {pendingIndexes.length ? <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6"><div><h2 className="font-medium text-amber-100">{pendingIndexes.length} {pendingIndexes.length === 1 ? 'item precisa' : 'itens precisam'} ser recuperado{pendingIndexes.length === 1 ? '' : 's'}</h2><p className="mt-1 text-sm leading-5 text-amber-200/70">O comando incluirá apenas {pendingIndexes.map((index) => String(index + 1).padStart(2, '0')).join(', ')}.</p></div><Button type="button" className="mt-4 h-10 shrink-0 rounded-xl sm:mt-0" onClick={() => setRecoveryOpen(true)}><RefreshCcw data-icon="inline-start" /> Corrigir marcados</Button></div> : null}
        {recoveryEscalated && pendingIndexes.length ? <section className="mt-6 rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-white"><Layers3 className="size-4" /></span><div><h2 className="font-medium">Fila segura: um por vez</h2><p className="mt-1 text-sm text-muted-foreground">Cole cada comando separadamente no mesmo chat.</p></div></div><div className="space-y-3">{pendingIndexes.map((index) => { const command = compileSingleRecoveryPrompt(selectedReferences[index], index); return <div key={selectedReferences[index].id} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-muted-foreground">CRIATIVO {String(index + 1).padStart(2, '0')}</p><p className="mt-1 text-sm font-medium">{selectedReferences[index].name}</p></div><Button type="button" variant="outline" className="h-9 rounded-xl" onClick={() => copyText(command, `single-${index}`)}>{copiedKey === `single-${index}` ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> Copiar comando</>}</Button></div>; })}</div></section> : null}
        <BottomActions back={() => setCreativeView('prompt')} next={() => journeyMode === 'stage' ? finishStandalone('Etapa de cinco criativos concluída.') : goPhase(4)} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Ver adaptações de formato'} nextDisabled={problemIndexes.length > 0} />

        <Dialog open={problemIndex !== null} onOpenChange={(open) => !open && setProblemIndex(null)}>
          <DialogContent className="max-w-xl border border-primary/20 bg-popover sm:max-w-xl">
            <DialogHeader><DialogTitle>Qual problema apareceu?</DialogTitle><DialogDescription>Escolha somente o que aconteceu com o CRIATIVO {problemIndex === null ? '' : String(problemIndex + 1).padStart(2, '0')}. Se está certo, não é necessário marcar nada.</DialogDescription></DialogHeader>
            <div className="grid gap-2 py-2 sm:grid-cols-2">{reviewOptions.filter((option) => option.value !== 'unreviewed' && option.value !== 'correct').map((option) => <Button key={option.value} type="button" variant={problemIndex !== null && reviewState[selectedReferences[problemIndex]?.id] === option.value ? 'default' : 'outline'} className="h-auto min-h-12 justify-start whitespace-normal rounded-xl py-3 text-left" onClick={() => { if (problemIndex !== null) updateReview(selectedReferences[problemIndex].id, option.value); setProblemIndex(null); }}>{option.label}</Button>)}</div>
            <DialogFooter><Button type="button" variant="ghost" className="text-emerald-300" onClick={() => { if (problemIndex !== null) updateReview(selectedReferences[problemIndex].id, 'correct'); setProblemIndex(null); }}><Check data-icon="inline-start" /> Na verdade está correto</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
          <DialogContent className="max-h-[88vh] max-w-2xl overflow-auto border border-primary/20 bg-popover p-0 sm:max-w-2xl">
            <DialogHeader className="p-5 pb-0"><DialogTitle>Recuperar somente os pendentes</DialogTitle><DialogDescription>Cole este comando no mesmo chat. Os criativos corretos não serão regenerados.</DialogDescription></DialogHeader>
            <pre className="mx-5 max-h-[46vh] overflow-auto whitespace-pre-wrap rounded-xl bg-[#09070e] p-4 font-sans text-[13px] leading-6 text-slate-300">{recoveryPrompt}</pre>
            <DialogFooter className="mx-0 mb-0 border-border bg-muted/50 px-5"><Button type="button" variant="ghost" onClick={() => { markIndexesCorrect(pendingIndexes); setRecoveryOpen(false); }}>Os itens foram corrigidos</Button><Button type="button" variant="outline" onClick={() => { setRecoveryEscalated(true); setRecoveryOpen(false); }}>Ainda falhou</Button><Button type="button" onClick={() => copyText(recoveryPrompt, 'recovery')}>{copiedKey === 'recovery' ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> Copiar recuperação</>}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(individualAction)} onOpenChange={(open) => !open && setIndividualAction(null)}>
          <DialogContent className="max-h-[88vh] max-w-2xl overflow-auto border border-primary/20 bg-popover p-0 sm:max-w-2xl">
            <DialogHeader className="p-5 pb-0"><DialogTitle>{individualAction?.kind === 'content' ? 'Corrigir um criativo' : 'Gerar nova variação'}</DialogTitle><DialogDescription>Os outros quatro cartões serão preservados.</DialogDescription></DialogHeader>
            {individualAction?.kind === 'content' ? <div className="px-5"><label htmlFor="individual-issue" className="mb-2 block text-sm font-medium">O que precisa ser corrigido?</label><Textarea id="individual-issue" value={individualIssue} onChange={(event) => setIndividualIssue(event.target.value)} className="min-h-24 rounded-xl bg-background" placeholder="Ex.: a oferta saiu incompleta e a cor da armação mudou." /></div> : null}
            <pre className="mx-5 max-h-[38vh] overflow-auto whitespace-pre-wrap rounded-xl bg-[#09070e] p-4 font-sans text-[13px] leading-6 text-slate-300">{individualPrompt}</pre>
            <DialogFooter className="mx-0 mb-0 border-border bg-muted/50 px-5"><Button type="button" variant="ghost" className="text-emerald-300" onClick={() => { if (individualAction) markIndexesCorrect([individualAction.index]); setIndividualAction(null); }}>Já foi corrigido</Button><Button type="button" onClick={() => copyText(individualPrompt, 'individual')}>{copiedKey === 'individual' ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> Copiar correção</>}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </PhaseShell>
    );
  }

  if (phase === 4) {
    return (
      <PhaseShell {...shellProps} phase={4} detail="1:1 e 9:16 · opcionais">
        <PageHeading eyebrow="Adaptação de formatos" title="Copie somente o formato de que precisa" description="Não é necessário responder perguntas nem ler o prompt. Escolha uma ação abaixo e cole o comando no mesmo chat, depois de aprovar os mestres 4:5." />
        <div className="mb-6 rounded-2xl border border-violet-400/25 bg-violet-500/[0.07] p-5 text-sm leading-6 text-violet-100/80"><strong className="text-violet-100">O sistema recompõe a arte para o novo formato.</strong> Ele não deve apenas cortar ou esticar a imagem. Cada botão copia um comando independente.</div>
        <div className="grid gap-4 sm:grid-cols-2">
          {campaignMode === 'collection' ? <PromptActionCard icon={<Square className="size-5" />} title="Carrossel em 1:1" description="Adapta os cinco cards do carrossel, mantendo produtos, fundo e corte sem rosto." prompt={compileCarouselFormatPrompt('1:1')} copyKey="carousel-1:1" copiedKey={copiedKey} onCopy={copyText} /> : null}
          <PromptActionCard icon={<Square className="size-5" />} title="Cinco criativos em 1:1" description="Cria cinco versões quadradas, uma para cada mestre aprovado." prompt={compileCreativeFormatPrompt('1:1')} copyKey="creative-1:1" copiedKey={copiedKey} onCopy={copyText} />
          {campaignMode === 'collection' ? <PromptActionCard icon={<PanelTop className="size-5" />} title="Carrossel em 9:16" description="Adapta os cinco cards para story sem alterar os produtos ou a padronização." prompt={compileCarouselFormatPrompt('9:16')} copyKey="carousel-9:16" copiedKey={copiedKey} onCopy={copyText} /> : null}
          <PromptActionCard icon={<PanelTop className="size-5" />} title="Cinco criativos em 9:16" description="Cria cinco versões verticais prontas para posicionamentos de story e reel." prompt={compileCreativeFormatPrompt('9:16')} copyKey="creative-9:16" copiedKey={copiedKey} onCopy={copyText} />
        </div>
        <ChatInstruction>Copie apenas o que vai utilizar. Execute um comando por vez e confira as cinco saídas antes de copiar outro.</ChatInstruction>
        <BottomActions back={() => journeyMode === 'stage' ? openWorkspace() : (goPhase(3), setCreativeView('review'))} next={() => journeyMode === 'stage' ? finishStandalone('Etapa de formatos concluída.') : (setSocialIndex(-1), goPhase(5))} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Entender as redes sociais'} />
      </PhaseShell>
    );
  }

  if (phase === 5 && socialIndex === -1) {
    return (
      <PhaseShell {...shellProps} phase={5} detail="Entenda antes de gerar">
        <PageHeading eyebrow="Playbook de redes sociais" title="A rede social sustenta a venda do anúncio" description="O objetivo principal do Instagram aqui não é vender sozinho. É eliminar dúvidas e dar credibilidade quando a pessoa que viu o anúncio visita o perfil antes de comprar." />
        <div className="rounded-[1.5rem] border border-primary/25 bg-[linear-gradient(135deg,rgba(126,45,255,.14),rgba(16,12,24,.65))] p-6 sm:p-8">
          <p className="max-w-2xl text-xl font-semibold leading-8 tracking-[-0.03em] sm:text-2xl">Um criativo pode trazer o clique. Um perfil vivo, coerente e confiável ajuda o cliente a decidir que a loja é real.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">{[['01', 'Crescimento proporcional', 'O perfil precisa acompanhar o ritmo da operação de tráfego.'], ['02', 'Fim da “loja fantasma”', 'Perfil vazio ou parado gera desconfiança imediata.'], ['03', 'Mais credibilidade', 'Feed, destaques e avaliações sustentam a decisão de compra.']].map(([number, title, text]) => <div key={number} className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-xs font-semibold text-violet-300">{number}</p><h2 className="mt-3 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-border bg-card/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Montagem inicial</p><p className="mt-3 text-lg font-semibold">9 posts + 9 stories de destaque</p><p className="mt-2 text-sm leading-6 text-muted-foreground">O visitante entende o que a loja vende, por que confiar e como comprar.</p></div><div className="rounded-2xl border border-border bg-card/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Rotina semanal</p><p className="mt-3 text-lg font-semibold">Bom dia + cupom + review</p><p className="mt-2 text-sm leading-6 text-muted-foreground">A presença continua ativa sem parecer repetitiva ou abandonada.</p></div></div>
        <ChatInstruction>Os quatro blocos a seguir devem ser executados em sequência. Cada um herda a identidade construída pelos anteriores.</ChatInstruction>
        <BottomActions back={() => journeyMode === 'stage' ? openWorkspace() : goPhase(4)} next={() => setSocialIndex(0)} nextLabel="Começar pelos 9 posts" />
      </PhaseShell>
    );
  }

  if (phase === 5) {
    const social = socialPrompts[socialIndex];
    return (
      <PhaseShell {...shellProps} phase={5} detail={`${socialIndex + 1} de ${socialPrompts.length}`}>
        <PageHeading eyebrow={`Playbook · bloco ${socialIndex + 1} de ${socialPrompts.length}`} title={social.title} description={social.purpose} />
        <section className="rounded-[1.5rem] border border-primary/25 bg-primary/[0.07] p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">Por que esta etapa existe</p><p className="mt-3 text-lg font-medium leading-8 text-violet-50">{social.importance}</p></section>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-border bg-card/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Antes de rodar</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{social.before}</p></div><div className="rounded-2xl border border-border bg-card/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">O que você recebe</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{social.output}</p></div></div>
        <section className="mt-4 rounded-2xl border border-border bg-card/45 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Como usar sem se perder</p><div className="mt-4 space-y-3">{social.howToUse.map((instruction, index) => <div key={instruction} className="flex items-start gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/14 text-xs font-semibold text-violet-200">{index + 1}</span><p className="pt-0.5 text-sm leading-6 text-muted-foreground">{instruction}</p></div>)}</div></section>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-sm leading-6 text-amber-100/80"><AlertTriangle className="mt-1 size-4 shrink-0 text-amber-300" /><p><strong className="text-amber-100">Atenção:</strong> {social.guardrail}</p></div>
        <div className="mt-5"><PromptActionCard icon={<BookOpen className="size-5" />} title={`Prompt pronto · ${social.title}`} description="O texto aprovado está guardado dentro do sistema. Clique para copiar e cole no mesmo chat; você não precisa editar o prompt." prompt={social.prompt} copyKey={`social-${social.id}`} copiedKey={copiedKey} onCopy={copyText} /></div>
        {social.note ? <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card/50 p-4 text-sm leading-6 text-muted-foreground"><Star className="mt-1 size-4 shrink-0 text-amber-300" /><p>{social.note}</p></div> : null}
        <ChatInstruction>Copie o prompt somente depois de aprovar o bloco anterior. Se uma peça sair errada, corrija nesta conversa.</ChatInstruction>
        <BottomActions back={() => socialIndex === 0 ? setSocialIndex(-1) : setSocialIndex((current) => current - 1)} next={() => socialIndex < socialPrompts.length - 1 ? setSocialIndex((current) => current + 1) : journeyMode === 'stage' ? finishStandalone('Etapa de redes sociais concluída.') : goPhase(6)} nextLabel={socialIndex < socialPrompts.length - 1 ? 'Próximo bloco' : journeyMode === 'stage' ? 'Concluir esta etapa' : 'Criar narração'} />
      </PhaseShell>
    );
  }

  if (phase === 6) {
    return (
      <PhaseShell {...shellProps} phase={6} detail="ElevenLabs · até 30 segundos">
        <PageHeading eyebrow="Áudio do vídeo" title="Crie o texto que dará voz ao anúncio" description="Este prompt não gera o áudio. Ele escreve uma narração comercial curta e factual para você transformar em voz no ElevenLabs." />
        <section className="rounded-[1.5rem] border border-primary/25 bg-primary/[0.07] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">Por que isso importa</p>
          <p className="mt-3 text-xl font-semibold leading-8 tracking-[-0.025em]">Nos primeiros segundos, a narração precisa explicar por que a pessoa deve parar.</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Por isso o texto começa imediatamente pela oferta, apresenta o produto logo depois e termina com uma chamada para ação. A duração máxima de 30 segundos facilita a edição do criativo em vídeo.</p>
        </section>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">{[['1', 'Copie no ChatGPT', 'O mesmo chat usa oferta, produto, idioma e fatos já confirmados.'], ['2', 'Aprove o texto', 'Leia em voz alta e confira se oferta e produto aparecem imediatamente.'], ['3', 'Gere no ElevenLabs', 'Cole somente a narração aprovada para transformar o texto em voz.']].map(([number, title, text]) => <div key={number} className="rounded-2xl border border-border bg-card/55 p-5"><span className="grid size-8 place-items-center rounded-lg bg-primary/14 text-xs font-semibold text-violet-200">{number}</span><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div>
        <div className="mt-5"><PromptActionCard icon={<Volume2 className="size-5" />} title="Preparar narração de até 30 segundos" description="Copia o prompt completo sem exibi-lo. Ele começa pela oferta, preserva somente fatos confirmados e entrega apenas o texto final da locução." prompt={audioPrompt} copyKey="audio" copiedKey={copiedKey} onCopy={copyText} /></div>
        <ChatInstruction>Aprove essa narração aqui. Caso precise de takes no Kling, o próximo prompt reutilizará exatamente o mesmo texto.</ChatInstruction>
        <BottomActions back={() => journeyMode === 'stage' ? openWorkspace() : (goPhase(5), setSocialIndex(socialPrompts.length - 1))} next={() => journeyMode === 'stage' ? finishStandalone('Etapa de narração concluída.') : (goPhase(7), setVideoStep(0))} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Ver necessidade de vídeo'} />
      </PhaseShell>
    );
  }

  if (phase === 7 && videoStep === 0) {
    return (
      <PhaseShell {...shellProps} phase={7} detail="Etapa condicional">
        <QuestionScreen eyebrow="Takes de vídeo" title="Você encontrou bons vídeos reais do produto?" description="O Kling só entra quando não existem vídeos utilizáveis. As imagens originais do produto continuam sendo a fonte." back={() => journeyMode === 'stage' ? openWorkspace() : goPhase(6)} next={() => { if (hasGoodVideos) { if (journeyMode === 'stage') finishStandalone('Vídeos reais confirmados. Não foi necessário usar o Kling.'); else goPhase(8); } else setVideoStep(1); }} nextLabel={hasGoodVideos ? (journeyMode === 'stage' ? 'Concluir esta etapa' : 'Pular Kling') : 'Preparar prompts Kling'} nextDisabled={hasGoodVideos === null}>
          <RadioGroup value={hasGoodVideos === null ? '' : hasGoodVideos ? 'yes' : 'no'} onValueChange={(value) => setHasGoodVideos(value === 'yes')} className="grid gap-3 sm:grid-cols-2"><ChoiceCard value="yes" active={hasGoodVideos === true} icon={<CheckCircle2 className="size-5" />} title="Sim, encontrei" description="Usarei os vídeos reais e seguirei para o panfleto." /><ChoiceCard value="no" active={hasGoodVideos === false} icon={<Film className="size-5" />} title="Não encontrei" description="Preparar três prompts detalhados para Kling." /></RadioGroup>
        </QuestionScreen>
      </PhaseShell>
    );
  }

  if (phase === 7) {
    return (
      <PhaseShell {...shellProps} phase={7} detail="3 vídeos · Kling">
        <PageHeading eyebrow="Vídeo com IA" title="Crie três roteiros visuais para o Kling" description="Os prompts usam as fotos originais, preservam somente cores confirmadas e reutilizam a narração já aprovada." />
        <PromptPanel label="Três prompts para Kling" text={videoPrompt} copyKey="video" copiedKey={copiedKey} onCopy={copyText} />
        <ChatInstruction>Use as fotos originais do produto. O prompt não pede uma nova narração.</ChatInstruction>
        <BottomActions back={() => setVideoStep(0)} next={() => journeyMode === 'stage' ? finishStandalone('Etapa de vídeos com IA concluída.') : goPhase(8)} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Preparar panfleto'} />
      </PhaseShell>
    );
  }

  if (phase === 8 && !completed && flyerStep === 0) {
    return (
        <PhaseShell {...shellProps} phase={8} detail="Pergunta 1 de 3">
        <QuestionScreen eyebrow="Panfleto impresso" title="Qual é o prêmio do sorteio?" description="Essa será a única imagem de produto permitida no panfleto." back={() => journeyMode === 'stage' ? openWorkspace() : goPhase(7)} next={() => setFlyerStep(1)} nextDisabled={prize.trim().length < 2}>
          <label htmlFor="prize" className="mb-2 block text-sm font-medium">Prêmio</label><Input id="prize" value={prize} onChange={(event) => setPrize(event.target.value)} className="h-14 rounded-xl bg-card px-4 text-base" placeholder="Ex.: iPhone 17" />
        </QuestionScreen>
      </PhaseShell>
    );
  }

  if (phase === 8 && !completed && flyerStep === 1) {
    return (
        <PhaseShell {...shellProps} phase={8} detail="Pergunta 2 de 3">
        <QuestionScreen eyebrow="Panfleto impresso" title="Qual cupom o cliente receberá?" description="Digite exatamente como o código deve aparecer dentro do voucher." back={() => setFlyerStep(0)} next={() => setFlyerStep(2)} nextDisabled={coupon.trim().length < 2}>
          <label htmlFor="coupon" className="mb-2 block text-sm font-medium">Código do cupom</label><Input id="coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} className="h-14 rounded-xl bg-card px-4 text-base uppercase" placeholder="Ex.: NOMEDALOJA20" />
        </QuestionScreen>
      </PhaseShell>
    );
  }

  if (phase === 8 && !completed && flyerStep === 2) {
    return (
        <PhaseShell {...shellProps} phase={8} detail="Pergunta 3 de 3">
        <QuestionScreen eyebrow="Panfleto impresso" title="Qual é o desconto da próxima compra?" description="Informe o valor completo, incluindo símbolo ou condição necessária." back={() => setFlyerStep(1)} next={() => setFlyerStep(3)} nextLabel="Preparar panfleto" nextDisabled={discount.trim().length < 1}>
          <label htmlFor="discount" className="mb-2 block text-sm font-medium">Valor do desconto</label><Input id="discount" value={discount} onChange={(event) => setDiscount(event.target.value)} className="h-14 rounded-xl bg-card px-4 text-base" placeholder="Ex.: 20%" />
        </QuestionScreen>
      </PhaseShell>
    );
  }

  if (phase === 8 && !completed) {
    return (
      <PhaseShell {...shellProps} phase={8} detail="A6 · 105 × 148 mm">
        <PageHeading eyebrow="Última entrega" title="Gere o panfleto impresso" description="O prompt utiliza a identidade já capturada, mantém a regra fixa de dez participantes e proíbe produtos da loja na arte." />
        <div className="mb-5 grid gap-3 sm:grid-cols-3">{[[Ticket, 'Prêmio', prize], [Clipboard, 'Cupom', coupon], [Star, 'Desconto', discount]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof Ticket; return <div key={String(label)} className="rounded-2xl border border-border bg-card/60 p-4"><ItemIcon className="size-4 text-accent-foreground" /><p className="mt-3 text-xs text-muted-foreground">{String(label)}</p><p className="mt-1 font-medium">{String(value)}</p></div>; })}</div>
        <PromptPanel label="Panfleto promocional A6" text={flyerPrompt} copyKey="flyer" copiedKey={copiedKey} onCopy={copyText} />
        <ChatInstruction>Cole o prompt no mesmo chat para preservar logo, cores, idioma e identidade visual.</ChatInstruction>
        <BottomActions back={() => setFlyerStep(2)} next={() => journeyMode === 'stage' ? finishStandalone('Etapa de panfleto concluída.') : completeCampaign()} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Finalizar e abrir painel'} />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell {...shellProps} phase={8} detail="Processo concluído">
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-emerald-400/12 text-emerald-300"><CheckCircle2 className="size-8" /></span>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">Campanha concluída</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Todo o processo foi percorrido</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Contexto, imagens, formatos, redes sociais, narração, vídeo quando necessário e panfleto foram organizados no mesmo chat.</p>
        <Button type="button" size="lg" className="mt-8 h-12 rounded-xl px-6" onClick={resetCampaign}><Sparkles data-icon="inline-start" /> Iniciar nova campanha</Button>
      </div>
    </PhaseShell>
  );
}
