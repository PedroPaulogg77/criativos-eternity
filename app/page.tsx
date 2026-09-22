'use client';

/* oxlint-disable next/no-img-element -- imagens da biblioteca preservam a proporção original sem corte */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Film,
  Globe2,
  KeyRound,
  Layers3,
  LayoutDashboard,
  Link2,
  ListChecks,
  Maximize2,
  Megaphone,
  MessageSquareText,
  Package,
  RefreshCcw,
  RotateCcw,
  Search,
  Sparkles,
  Square,
  Star,
  Ticket,
  Volume2,
  X,
} from 'lucide-react';

import { AppShell, type ShellNav } from '@/components/app-shell';
import { GalleryPanel, type LotSlot } from '@/components/gallery-panel';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  compileAudioPrompt,
  compileCarouselCardPrompt,
  compileCarouselFormatPrompt,
  compileCarouselFormatSinglePrompt,
  compileCarouselPrompt,
  compileCreativeFormatPrompt,
  compileCreativeFormatSinglePrompt,
  compileFlyerPrompt,
  compileVideoPrompt,
  socialPrompts,
} from '@/lib/flow-prompts';
import type { SalesDriver } from '@/lib/mvp-data';
import {
  campaignLabel,
  createCampaign,
  emptyStore,
  isBlank,
  loadStore,
  removeCampaign,
  saveStore,
  upsertCampaign,
  type CampaignRecord,
  type CampaignStore,
} from '@/lib/campaign-store';
import { phaseDescriptions, phaseNames, type Phase } from '@/lib/phases';
import {
  executionErrorStatuses,
  guessCategory,
  guessOfferMechanic,
  isReferenceApplicable,
  offerMechanics,
  salesDrivers,
  sortForCampaign,
  lotSameness,
  recommendedReferenceIds,
  references,
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

type AppSurface = 'welcome' | 'flow' | 'workspace' | 'stage';
type CreativeView = 'library' | 'prompt' | 'review';
type RequirementActionKind = 'select' | 'copy';
type RequirementAction = { reference: Reference; kind: RequirementActionKind } | null;

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

const contextCheckItems = [
  'O alvo exato está correto',
  'A loja e a marca estão corretas',
  'O produto, coleção e variantes estão corretos',
  'A oferta e o idioma estão corretos',
  'A resposta termina com PRONTO PARA GERAR: SIM',
] as const;

type FacetId = 'family' | 'people' | 'category';

const familyValues = Array.from(new Set(references.map((item) => item.family)));
const categoryValues = Array.from(new Set(references.map((item) => item.category))).sort();
const peopleValues = [
  { value: 'sem-pessoa', label: 'Sem pessoa na cena' },
  { value: 'corpo-suporte', label: 'Corpo como suporte' },
  { value: 'humanizado', label: 'Pessoa em cena' },
] as const;
const URL_PATTERN = /^https?:\/\/.+/i;

function peopleLabel(value: Reference['people']) {
  if (value === 'humanizado') return 'Pessoa em cena';
  if (value === 'corpo-suporte') return 'Corpo como suporte';
  return 'Sem pessoa na cena';
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-[13px]">{value}</dd>
    </div>
  );
}


function SameChatPill() {
  return (
    <div className="flex items-center gap-2 border border-emerald-400/25 bg-emerald-400/[0.08] px-3 py-2 text-xs font-medium text-emerald-200">
      <span className="size-1.5 shrink-0 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.75)]" />
      <span className="hidden sm:inline">Continue no mesmo chat.</span>
      <span className="sm:hidden">Mesmo chat</span>
    </div>
  );
}

function AttachmentAlert({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? 'border-x-0 px-4 py-3 sm:px-6' : 'p-5 sm:p-6'} border border-amber-300/35 bg-amber-400/[0.08] text-amber-50`}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center bg-amber-300 text-amber-950"><AlertTriangle className="size-5" /></span>
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
  title,
  detail,
  wide = false,
  children,
  nav,
  panel,
  menuLabel,
  menuBadge,
  actions,
  toolbar,
  attachmentRequired = false,
}: {
  phase: Phase;
  title?: string;
  detail?: string;
  wide?: boolean;
  children: React.ReactNode;
  nav: ShellNav;
  panel?: React.ReactNode;
  menuLabel?: string;
  menuBadge?: number;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  attachmentRequired?: boolean;
}) {
  return (
    <AppShell
      nav={nav}
      panel={panel}
      menuLabel={menuLabel}
      menuBadge={menuBadge}
      eyebrow={`Etapa ${phase} de 8`}
      title={title ?? phaseNames[phase - 1]}
      step={phase}
      detail={detail}
      bleed={wide}
      actions={actions ?? <SameChatPill />}
      toolbar={toolbar}
      alert={attachmentRequired ? <AttachmentAlert compact /> : null}
    >
      {children}
    </AppShell>
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
  eyebrow?: string;
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
        {eyebrow ? <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">{title}</h1>
        {description ? <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">{description}</p> : null}
        <div className="mt-8 text-left">{children}</div>
        {error ? <div role="alert" className="mt-4 flex items-start gap-2 border border-rose-400/25 bg-rose-400/[0.08] px-4 py-3 text-left text-sm text-rose-200"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div> : null}
      </div>
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between border-t border-border pt-5">
        {back ? <Button type="button" variant="ghost" size="lg" className="h-11" onClick={back}><ArrowLeft data-icon="inline-start" /> Voltar</Button> : <span />}
        <Button type="submit" size="lg" className="h-11 px-6" disabled={nextDisabled}>{nextLabel} <ArrowRight data-icon="inline-end" /></Button>
      </div>
    </form>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 border-b border-border pb-6">
      {eyebrow ? <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground">{eyebrow}</p> : null}
      <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-4xl text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}



/*
 * Cartão de prompt. O pedido completo vem primeiro, porque é o que resolve na maioria das vezes.
 * A falha existe e está avisada em uma linha; quando acontece, "gerar uma por vez" abre as peças
 * separadas ali mesmo. O texto do prompt fica fora do caminho: ninguém precisa lê-lo para colar.
 */
function PromptStep({
  title,
  delivers,
  batchPrompt,
  batchKey,
  pieces,
  copiedKey,
  onCopy,
}: {
  title: string;
  delivers: string;
  batchPrompt: string;
  batchKey: string;
  /* Só os prompts que pedem várias imagens têm caminho de uma por vez. */
  pieces?: Array<{ label: string; prompt: string; copyKey: string }>;
  copiedKey: string;
  onCopy: (text: string, key: string) => void;
}) {
  const [showPieces, setShowPieces] = useState(false);
  const [showText, setShowText] = useState(false);
  const copied = copiedKey === batchKey;
  const hasPieces = Boolean(pieces?.length);

  return (
    <section className="border border-border bg-card/55">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <h2 className="font-semibold tracking-[-0.02em]">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{delivers}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Button type="button" size="lg" className="h-11 px-5" onClick={() => onCopy(batchPrompt, batchKey)}>
            {copied ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> Copiar prompt</>}
          </Button>
          <button type="button" onClick={() => setShowText((value) => !value)} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            {showText ? 'Esconder o texto' : 'Ver o texto do prompt'}
          </button>
        </div>
      </div>

      {hasPieces ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-amber-400/[0.04] px-5 py-4">
          <div className="flex min-w-60 flex-1 items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
            <p className="text-sm leading-6 text-amber-100/85">
              Veio colagem, peça faltando ou repetida? É limite do ChatGPT com várias imagens de uma vez, não do prompt.
            </p>
          </div>
          <Button type="button" variant="outline" className="h-10 shrink-0" onClick={() => setShowPieces((value) => !value)}>
            {showPieces ? 'Fechar' : 'Gerar uma por vez'}
          </Button>
        </div>
      ) : null}

      {showText ? (
        <pre className="max-h-72 overflow-auto border-t border-border p-5 font-sans text-[13px] leading-6 whitespace-pre-wrap text-slate-300">{batchPrompt}</pre>
      ) : null}

      {showPieces ? (
        <div className="border-t border-border p-5">
          <p className="mb-3 text-xs text-muted-foreground">Uma mensagem por peça. Cole, espere a imagem, cole a próxima.</p>
          <div className="space-y-2">
            {(pieces ?? []).map((piece, index) => {
              const pieceCopied = copiedKey === piece.copyKey;
              return (
                <div key={piece.copyKey} className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background/45 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center bg-primary/14 text-[11px] font-semibold text-accent-foreground">{String(index + 1).padStart(2, '0')}</span>
                    <p className="truncate text-sm">{piece.label}</p>
                  </div>
                  <Button type="button" variant={pieceCopied ? 'ghost' : 'outline'} size="sm" className="h-8 shrink-0" onClick={() => onCopy(piece.prompt, piece.copyKey)}>
                    {pieceCopied ? <><Check data-icon="inline-start" /> Copiado</> : 'Copiar'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ChatInstruction({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex items-start gap-3 border border-border bg-card/65 p-4 text-sm leading-6 text-muted-foreground">
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
      {back ? <Button type="button" variant="ghost" size="lg" className="h-11" onClick={back}><ArrowLeft data-icon="inline-start" /> Voltar</Button> : <span />}
      <Button type="button" size="lg" className="h-11 px-5" onClick={next} disabled={nextDisabled}>{nextLabel} <ArrowRight data-icon="inline-end" /></Button>
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
  const [workspaceMessage, setWorkspaceMessage] = useState('');
  const [phase, setPhase] = useState<Phase>(1);
  const [contextStep, setContextStep] = useState(0);
  const [campaignMode, setCampaignMode] = useState<CampaignInput['mode']>('single');
  const [exactTarget, setExactTarget] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [linkAccess, setLinkAccess] = useState<CampaignInput['linkAccess']>('public');
  const [salesDriver, setSalesDriver] = useState<SalesDriver | null>(null);
  const [offer, setOffer] = useState('');
  /* A mecânica da oferta é lida do texto que ele escreveu, não perguntada. Só ordena a galeria. */
  const offerMechanic = useMemo(() => guessOfferMechanic(offer), [offer]);
  const [formError, setFormError] = useState('');
  const [contextChecks, setContextChecks] = useState<boolean[]>(() => contextCheckItems.map(() => false));

  const [creativeView, setCreativeView] = useState<CreativeView>('library');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmedRequirements, setConfirmedRequirements] = useState<Record<string, true>>({});
  const [requirementAction, setRequirementAction] = useState<RequirementAction>(null);
  const [familyFilters, setFamilyFilters] = useState<string[]>([]);
  const [peopleFilters, setPeopleFilters] = useState<string[]>([]);
  /* O palpite de nicho só ordena; quem quiser cortar por prateleira usa este filtro. */
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailReference, setDetailReference] = useState<Reference | null>(null);
  const [reviewState, setReviewState] = useState<Record<string, ReviewStatus>>({});
  const [problemIndex, setProblemIndex] = useState<number | null>(null);
  const [fixTextFor, setFixTextFor] = useState<string | null>(null);
  const [individualIssues, setIndividualIssues] = useState<Record<string, string>>({});

  const [socialIndex, setSocialIndex] = useState(-1);
  const [videoStep, setVideoStep] = useState(0);
  const [hasGoodVideos, setHasGoodVideos] = useState<boolean | null>(null);
  const [flyerStep, setFlyerStep] = useState(0);
  const [prize, setPrize] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState('');
  const [completed, setCompleted] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const storeRef = useRef<CampaignStore>(emptyStore);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [donePhases, setDonePhases] = useState<Phase[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<CampaignRecord | null>(null);

  const campaign = useMemo<CampaignInput>(() => ({
    mode: campaignMode,
    exactTarget,
    sourceUrl,
    linkAccess,
    offer,
    offerMechanic,
  }), [campaignMode, exactTarget, sourceUrl, linkAccess, offer, offerMechanic]);

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

  /* Só o argumento de venda corta a biblioteca. Oferta e nicho apenas ordenam. */
  /* O nicho sai do que ele escreveu no alvo; nunca é perguntado e nunca corta nada. */
  const campaignCriteria = { mode: campaignMode, salesDriver, offerMechanic, category: guessCategory(exactTarget) } as const;
  const compatibleReferences = references.filter((item) => isReferenceApplicable(item, campaignCriteria));

  function matchesGalleryFilters(item: Reference, skip?: FacetId) {
    const term = searchTerm.trim().toLowerCase();
    if (term && !`${item.name} ${item.family} ${item.category} ${item.tags.join(' ')}`.toLowerCase().includes(term)) return false;
    if (skip !== 'family' && familyFilters.length && !familyFilters.includes(item.family)) return false;
    if (skip !== 'people' && peopleFilters.length && !peopleFilters.includes(item.people ?? 'sem-pessoa')) return false;
    if (skip !== 'category' && categoryFilters.length && !categoryFilters.includes(item.category)) return false;
    return true;
  }

  function facetCount(skip: FacetId, predicate: (item: Reference) => boolean) {
    return compatibleReferences.filter((item) => predicate(item) && matchesGalleryFilters(item, skip)).length;
  }

  const filteredReferences = compatibleReferences.filter((item) => matchesGalleryFilters(item));
  const orderedReferences = sortForCampaign(filteredReferences, campaignCriteria);
  const galleryFilterCount = familyFilters.length + peopleFilters.length + categoryFilters.length + Number(Boolean(searchTerm.trim()));

  function clearGalleryFilters() {
    setFamilyFilters([]);
    setPeopleFilters([]);
    setCategoryFilters([]);
    setSearchTerm('');
  }

  function toggleFacet(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }
  const pendingIndexes = selectedReferences
    .map((item, index) => executionErrorStatuses.includes(reviewState[item.id] ?? 'correct') ? index : -1)
    .filter((index) => index >= 0);
  const problemIndexes = selectedReferences
    .map((item, index) => (reviewState[item.id] ?? 'correct') !== 'correct' ? index : -1)
    .filter((index) => index >= 0);
  const correctCount = selectedReferences.length - problemIndexes.length;
  const recoveryPrompt = compileRecoveryPrompt(selectedReferences, pendingIndexes);

  function commitStore(next: CampaignStore) {
    storeRef.current = next;
    saveStore(next);
    setCampaigns(next.items);
  }

  /* Devolve a campanha guardada para dentro da tela, campo por campo. */
  function applyCampaign(record: CampaignRecord) {
    setCampaignId(record.id);
    setCampaignMode(record.mode);
    setExactTarget(record.exactTarget);
    setSourceUrl(record.sourceUrl);
    setLinkAccess(record.linkAccess);
    setOffer(record.offer);
    setSalesDriver(record.salesDriver);
    setContextChecks(record.contextChecks);
    setSelectedIds(record.selectedIds);
    setConfirmedRequirements(record.confirmedRequirements);
    setReviewState(record.reviewState);
    setPrize(record.prize);
    setCoupon(record.coupon);
    setDiscount(record.discount);
    setDonePhases(record.donePhases);
    setPhase(record.lastPhase);
    setContextStep(record.donePhases.includes(1) ? 8 : 0);
    setCreativeView('library');
    setSocialIndex(-1);
    setVideoStep(0);
    setFlyerStep(0);
    setCompleted(record.donePhases.length === 8);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadStore();
      storeRef.current = loaded;
      setCampaigns(loaded.items);
      const active = loaded.items.find((item) => item.id === loaded.activeId) ?? loaded.items[0];
      /* Quem já tem campanha salva volta para o painel, não para a tela de boas-vindas. */
      if (active) {
        applyCampaign(active);
        setSurface('workspace');
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  /* Cada mudança de conteúdo regrava a campanha ativa. Só depois de hidratar, para não apagar o que foi lido. */
  useEffect(() => {
    if (!hydrated || !campaignId) return;
    const base = storeRef.current.items.find((item) => item.id === campaignId) ?? createCampaign({ id: campaignId });
    const next = upsertCampaign(storeRef.current, {
      ...base,
      mode: campaignMode,
      exactTarget,
      sourceUrl,
      linkAccess,
      offer,
      offerMechanic,
      salesDriver,
      contextChecks,
      selectedIds,
      confirmedRequirements,
      reviewState,
      prize,
      coupon,
      discount,
      donePhases,
      lastPhase: phase,
    });
    storeRef.current = next;
    saveStore(next);
    setCampaigns(next.items);
  }, [hydrated, campaignId, campaignMode, exactTarget, sourceUrl, linkAccess, offer, offerMechanic, salesDriver, contextChecks, selectedIds, confirmedRequirements, reviewState, prize, coupon, discount, donePhases, phase]);

  function markPhaseDone(target: Phase) {
    setDonePhases((current) => current.includes(target) ? current : [...current, target]);
  }

  function startCampaign(record: CampaignRecord) {
    commitStore(upsertCampaign(storeRef.current, record));
    applyCampaign(record);
  }

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
        startCampaign(createCampaign({
          mode: value.mode,
          exactTarget: value.exactTarget.trim(),
          sourceUrl: value.sourceUrl.trim(),
          linkAccess: value.linkAccess,
          offer: value.offer.trim(),
        }));
        setSurface('flow');
        setJourneyMode('flow');
        setPhase(1);
        setContextStep(5);
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

  function openWorkspace(message = '') {
    setWorkspaceMessage(message);
    setSurface('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Rascunho sem alvo nem progresso é reaproveitado: começar de novo não enche a lista de campanhas vazias. */
  function startGuidedCampaign() {
    const active = campaignId ? storeRef.current.items.find((item) => item.id === campaignId) : undefined;
    startCampaign(active && isBlank(active) ? active : createCampaign());
    setJourneyMode('flow');
    setSurface('flow');
    setPhase(1);
    setContextStep(0);
    setHasGoodVideos(null);
    setWorkspaceMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openCampaign(record: CampaignRecord) {
    commitStore(upsertCampaign(storeRef.current, record));
    applyCampaign(record);
    setJourneyMode('stage');
    setSurface('workspace');
    setWorkspaceMessage(`Campanha aberta: ${campaignLabel(record)}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteCampaign(record: CampaignRecord) {
    const next = removeCampaign(storeRef.current, record.id);
    commitStore(next);
    setCampaignToDelete(null);
    if (campaignId !== record.id) return;
    const fallback = next.items[0];
    if (fallback) {
      applyCampaign(fallback);
      setWorkspaceMessage(`Campanha apagada. Você está em ${campaignLabel(fallback)}.`);
      return;
    }
    setCampaignId(null);
    setSurface('welcome');
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
    /* Quem entrou direto numa etapa, sem campanha aberta, precisa de um registro para o trabalho não se perder. */
    if (!campaignId) startCampaign(createCampaign());
    setJourneyMode('stage');
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
    if (contextStep === 6) return Boolean(salesDriver);
    return true;
  }

  /* Coleção tem seis perguntas; produto único tem sete, porque só nele o argumento é escolha. */
  const totalDePerguntas = campaignMode === 'collection' ? 5 : 6;
  const rotuloDaPergunta = (numero: number) => `Pergunta ${numero} de ${totalDePerguntas}`;

  function advanceContext() {
    if (!contextAnswerReady()) {
      setFormError(contextStep === 2 ? 'Cole um link completo, começando com http:// ou https://.' : 'Complete esta resposta para continuar.');
      return;
    }
    setFormError('');
    /* Em coleção o argumento já está decidido, então a pergunta 6 não existe. */
    setContextStep((current) => Math.min(8, current === 4 ? (campaignMode === 'collection' ? 7 : 6) : current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backContext() {
    setFormError('');
    setContextStep((current) => Math.max(0, current === 6 || (current === 7 && campaignMode === 'collection') ? 4 : current - 1));
  }

  function finishContext() {
    if (!contextChecks.every(Boolean)) return;
    markPhaseDone(1);
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

  function runReferenceAction(reference: Reference, kind: RequirementActionKind) {
    if (reference.requirement && !confirmedRequirements[reference.id]) {
      setRequirementAction({ reference, kind });
      return;
    }
    if (kind === 'select') toggleReference(reference.id);
    else void copyText(compileReferencePrompt(campaign, reference), `library-single-${reference.id}`);
  }

  function confirmRequirement() {
    if (!requirementAction) return;
    const { reference, kind } = requirementAction;
    setConfirmedRequirements((current) => ({ ...current, [reference.id]: true }));
    setRequirementAction(null);
    if (kind === 'select') toggleReference(reference.id);
    else void copyText(compileReferencePrompt(campaign, reference), `library-single-${reference.id}`);
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

  /* Campanha nova é um registro novo: a anterior continua salva na lista do painel. */
  function resetCampaign() {
    startGuidedCampaign();
  }

  function completeCampaign() {
    markPhaseDone(8);
    setCompleted(true);
    openWorkspace('Metodologia concluída. Agora você pode voltar a qualquer etapa sem refazer o processo inteiro.');
  }

  function goToPhase(targetPhase: Phase) {
    if (surface !== 'flow') {
      openStage(targetPhase);
      return;
    }
    if (stageIsDisabled(targetPhase)) {
      openWorkspace(targetPhase === 2
        ? 'O carrossel só fica disponível quando o contexto é de coleção.'
        : 'Prepare o Contexto primeiro. As outras etapas dependem dos fatos e anexos dessa conversa.');
      return;
    }
    if (targetPhase === 3) setCreativeView('library');
    if (targetPhase === 5) setSocialIndex(-1);
    if (targetPhase === 7) setVideoStep(0);
    if (targetPhase === 8) setFlyerStep(0);
    goPhase(targetPhase);
  }

  const nav: ShellNav = {
    active: surface === 'workspace' ? 'workspace' : phase,
    onSelect: goToPhase,
    isDisabled: stageIsDisabled,
    onWorkspace: () => openWorkspace(),
    onNewCampaign: resetCampaign,
    campaignLabel: exactTarget.trim() || 'Nenhuma campanha ativa',
    campaignDetail: exactTarget.trim()
      ? `${campaignMode === 'collection' ? 'Coleção' : 'Produto único'}${offer.trim() ? ` · ${offer.trim()}` : ''}`
      : 'Comece pelo contexto',
  };

  const shellProps = {
    nav,
    attachmentRequired: linkAccess === 'protected' && (phase > 1 || contextStep >= 3),
  };

  if (surface === 'welcome') {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <header className="flex h-16 items-center gap-4 border-b border-border px-4 sm:px-7">
          <img src="/brand/eternity-academy.png" alt="Eternity Academy" className="h-7 w-auto" />
          <span className="hidden h-6 w-px bg-border sm:block" />
          <p className="hidden text-sm font-medium tracking-[-0.02em] sm:block">Creative Assistant</p>
          <div className="ml-auto"><SameChatPill /></div>
        </header>
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center px-4 py-12 sm:px-7">
          <div className="w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">Eternity Creative System</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl">Como você quer trabalhar hoje?</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Na primeira campanha, recomendamos percorrer a metodologia inteira. Se você já tem o contexto no ChatGPT, também pode abrir somente a etapa de que precisa.</p>
            <div className="mt-9 grid gap-4 md:grid-cols-2">
              <button type="button" onClick={startGuidedCampaign} className="group border border-primary/45 bg-primary/[0.08] p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/75 hover:bg-primary/[0.12]">
                <span className="grid size-12 place-items-center bg-primary text-primary-foreground"><Sparkles className="size-6" /></span>
                <span className="mt-6 block text-xl font-semibold tracking-[-0.03em]">Fazer o processo completo</span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">Você será guiado com uma pergunta por vez, do contexto ao panfleto.</span>
                <span className="mt-6 flex items-center gap-2 text-sm font-medium text-accent-foreground">Recomendado na primeira vez <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </button>
              <button type="button" onClick={() => openWorkspace()} className="group border border-border bg-card/55 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-card/80">
                <span className="grid size-12 place-items-center bg-primary/[0.1] text-accent-foreground"><LayoutDashboard className="size-6" /></span>
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
    /* Em produto único o carrossel não existe: ele não pode contar como etapa pendente. */
    const applicablePhases = (campaignMode === 'collection' ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 3, 4, 5, 6, 7, 8]) as Phase[];
    const doneCount = applicablePhases.filter((item) => donePhases.includes(item)).length;
    const nextPhase = applicablePhases.find((item) => !donePhases.includes(item) && !stageIsDisabled(item)) ?? phase;
    const formatDate = (value: number) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    return (
      <AppShell
        nav={nav}
        eyebrow="Painel da campanha"
        title="Escolha onde continuar"
        bleed
        alert={linkAccess === 'protected' && hasContext ? <AttachmentAlert compact /> : null}
        actions={<SameChatPill />}
      >
        {workspaceMessage ? <output className="mb-6 flex items-start gap-3 border border-primary/30 bg-primary/[0.08] p-5 text-sm leading-6 text-foreground"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent-foreground" /><span>{workspaceMessage}</span></output> : null}

        <section className="border border-border bg-card/55 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.12em] text-accent-foreground uppercase">Campanha ativa</p>
              <h2 className="mt-2 truncate text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{exactTarget.trim() || 'Campanha sem alvo'}</h2>
              <p className="mt-1 truncate text-sm text-muted-foreground">{campaignMode === 'collection' ? 'Coleção' : 'Produto único'}{offer.trim() ? ` · ${offer}` : ''}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="w-full sm:w-44">
                <p className="text-xs text-muted-foreground"><strong className="text-foreground">{doneCount}</strong> de {applicablePhases.length} etapas concluídas</p>
                <div className="mt-2 h-1 w-full bg-white/[0.07]"><div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${(doneCount / applicablePhases.length) * 100}%` }} /></div>
              </div>
              <Button type="button" className="h-11 shrink-0" onClick={() => openStage(nextPhase)}>
                {doneCount === applicablePhases.length ? 'Revisar etapas' : doneCount ? `Continuar em ${phaseNames[nextPhase - 1]}` : 'Começar pelo contexto'} <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
          {hasContext ? null : <p className="mt-4 border border-amber-400/30 bg-amber-400/[0.07] p-3 text-sm leading-6 text-amber-100/85">As outras etapas ficam bloqueadas até o contexto estar pronto. É o que impede um prompt sem fatos.</p>}
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {phaseNames.map((name, index) => {
            const targetPhase = (index + 1) as Phase;
            const Icon = stageIcons[index];
            const disabled = stageIsDisabled(targetPhase);
            const done = donePhases.includes(targetPhase);
            const current = !done && !disabled && targetPhase === nextPhase;
            const collectionOnly = targetPhase === 2;
            const lotProgress = targetPhase === 3 && !done && selectedIds.length > 0 ? `${selectedIds.length} de 5 direções escolhidas` : null;
            return (
              <button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => openStage(targetPhase)}
                className={`group flex min-h-52 flex-col border p-5 text-left transition-colors ${
                  disabled ? 'cursor-not-allowed border-border bg-card/25 opacity-45'
                  : done ? 'border-emerald-400/30 bg-emerald-400/[0.05] hover:bg-emerald-400/[0.09]'
                  : current ? 'border-primary/60 bg-primary/[0.07] hover:bg-primary/[0.11]'
                  : 'border-border bg-card/55 hover:border-primary/45 hover:bg-card/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`grid size-11 place-items-center ${done ? 'bg-emerald-400/15 text-emerald-300' : 'bg-primary/12 text-accent-foreground'}`}>
                    {done ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span>
                </div>
                <span className="mt-5 block text-lg font-semibold tracking-[-0.025em]">{name}</span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">{lotProgress ?? phaseDescriptions[index]}</span>
                <span className={`mt-auto pt-5 text-xs font-medium ${done ? 'text-emerald-300' : current ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                  {disabled ? (collectionOnly && hasContext ? 'Só existe em coleção' : 'Prepare o contexto primeiro')
                    : done ? 'Concluída · abrir de novo →'
                    : current ? 'Você parou aqui →'
                    : 'Abrir esta etapa →'}
                </span>
              </button>
            );
          })}
        </div>

        <section className="mt-10 border-t border-border pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold tracking-[-0.02em]">Suas campanhas</h2>
              <p className="mt-1 text-sm text-muted-foreground">Cada uma guarda contexto, lote e conferência separados.</p>
            </div>
            <Button type="button" variant="outline" className="h-10" onClick={resetCampaign}><Sparkles data-icon="inline-start" /> Nova campanha</Button>
          </div>

          <div className="mt-4 grid gap-2">
            {campaigns.map((record) => {
              const applicable = record.mode === 'collection' ? 8 : 7;
              const recordDone = record.donePhases.filter((item) => record.mode === 'collection' || item !== 2).length;
              const active = record.id === campaignId;
              return (
                <div key={record.id} className={`flex flex-wrap items-center gap-3 border p-4 ${active ? 'border-primary/50 bg-primary/[0.06]' : 'border-border bg-card/40'}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{campaignLabel(record)}</p>
                      {active ? <span className="shrink-0 bg-primary/20 px-2 py-0.5 text-[11px] font-medium text-accent-foreground">aberta</span> : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {record.mode === 'collection' ? 'Coleção' : 'Produto único'}{record.offer.trim() ? ` · ${record.offer}` : ''} · {recordDone} de {applicable} etapas · {formatDate(record.updatedAt)}
                    </p>
                  </div>
                  {active ? null : <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={() => openCampaign(record)}>Abrir</Button>}
                  <Button type="button" variant="ghost" size="sm" className="h-9 shrink-0 text-muted-foreground" onClick={() => setCampaignToDelete(record)}>Apagar</Button>
                </div>
              );
            })}
          </div>
        </section>

        <Dialog open={campaignToDelete !== null} onOpenChange={(open) => !open && setCampaignToDelete(null)}>
          <DialogContent className="max-w-lg border border-primary/20 bg-popover sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Apagar esta campanha?</DialogTitle>
              <DialogDescription>{campaignToDelete ? campaignLabel(campaignToDelete) : ''}</DialogDescription>
            </DialogHeader>
            <p className="text-sm leading-6 text-muted-foreground">O contexto, o lote de cinco e a conferência dessa campanha somem deste navegador. Não dá para desfazer.</p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCampaignToDelete(null)}>Manter</Button>
              <Button type="button" variant="destructive" onClick={() => campaignToDelete && deleteCampaign(campaignToDelete)}>Apagar campanha</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppShell>
    );
  }

  if (phase === 1) {
    if (contextStep === 0) {
      return (
        <PhaseShell {...shellProps} phase={1} detail={rotuloDaPergunta(1)}>
          <QuestionScreen eyebrow="Vamos começar pelo essencial" title="O que você vai anunciar?" description="Essa escolha define o caminho da campanha. Coleções recebem automaticamente um carrossel com cinco produtos." next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <RadioGroup value={campaignMode} onValueChange={(value) => { const mode = value as CampaignInput['mode']; setCampaignMode(mode); /* Coleção é sempre um conjunto de produtos que vendem pela estética. */ setSalesDriver(mode === 'collection' ? 'estetica' : null); setSelectedIds([]); }} className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard value="single" active={campaignMode === 'single'} icon={<Package className="size-5" />} title="Produto único" description="Um produto só, contando as cores e versões dele." />
              <ChoiceCard value="collection" active={campaignMode === 'collection'} icon={<Layers3 className="size-5" />} title="Coleção" description="Vários produtos e carrossel obrigatório." />
            </RadioGroup>
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 1) {
      return (
        <PhaseShell {...shellProps} phase={1} detail={rotuloDaPergunta(2)}>
          <QuestionScreen eyebrow="Alvo exato" title={campaignMode === 'collection' ? 'Qual coleção será anunciada?' : 'Qual produto será anunciado?'} description="Descreva somente o que pode aparecer nesta campanha." back={backContext} next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <label htmlFor="exact-target" className="mb-2 block text-sm font-medium">Alvo da campanha</label>
            <Input id="exact-target" value={exactTarget} onChange={(event) => setExactTarget(event.target.value)} className="h-14 bg-card px-4 text-base" placeholder={campaignMode === 'collection' ? 'Ex.: coleção de óculos inspirada em marcas de carros' : 'Ex.: suporte Pocket preto para smartphone'} />
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 2) {
      return (
        <PhaseShell {...shellProps} phase={1} detail={rotuloDaPergunta(3)}>
          <QuestionScreen eyebrow="Fonte factual" title="Qual é o link da página de vendas?" description="Pode ser o link direto do produto, da coleção ou da loja." back={backContext} next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <label htmlFor="source-url" className="mb-2 block text-sm font-medium">Link da loja</label>
            <div className="relative"><Link2 className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" /><Input id="source-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} className="h-14 bg-card pr-4 pl-12 text-base" placeholder="https://sualoja.com/produto-ou-colecao" /></div>
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 3) {
      return (
        <PhaseShell {...shellProps} phase={1} detail={rotuloDaPergunta(4)}>
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
        <PhaseShell {...shellProps} phase={1} detail={rotuloDaPergunta(5)}>
          <QuestionScreen eyebrow="Oferta" title="Qual é a oferta exata?" description="Escreva exatamente como deve aparecer, incluindo idioma e condições." back={backContext} next={advanceContext} nextDisabled={!contextAnswerReady()} error={formError}>
            <label htmlFor="offer" className="mb-2 block text-sm font-medium">Oferta da campanha</label>
            <Input id="offer" value={offer} onChange={(event) => setOffer(event.target.value)} className="h-14 bg-card px-4 text-base" placeholder="Ex.: Kaufen Sie 2 und erhalten Sie 1 gratis" />
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 6) {
      return (
        <PhaseShell {...shellProps} phase={1} detail={rotuloDaPergunta(6)}>
          <QuestionScreen eyebrow="Argumento de venda" title="O que faz o cliente comprar isso?" description="A oferta agressiva vale nos dois casos. O que muda a peça é ter um diferencial para explicar ou não. Dois tênis na mesma prateleira podem cair em lados opostos." back={backContext} next={advanceContext} nextLabel="Preparar contexto" nextDisabled={!contextAnswerReady()} error={formError}>
            <RadioGroup value={salesDriver ?? ''} onValueChange={(value) => setSalesDriver(value as SalesDriver)} className="grid gap-3 sm:grid-cols-2">
              {salesDrivers.map((item) => <ChoiceCard key={item.value} value={item.value} active={salesDriver === item.value} icon={<Sparkles className="size-5" />} title={item.label} description={item.description} />)}
            </RadioGroup>
          </QuestionScreen>
        </PhaseShell>
      );
    }

    if (contextStep === 7) {
      return (
        <PhaseShell {...shellProps} phase={1} detail="Mensagem inicial">
          <PageHeading eyebrow="Contexto pronto" title="Envie a primeira mensagem" description="Abra um novo chat no ChatGPT. Essa conversa acompanhará toda a campanha até o panfleto." />
          {linkAccess === 'protected' ? <div className="mb-6"><AttachmentAlert /></div> : null}
          <PromptStep title="Mensagem 1 · contexto" delivers="O ChatGPT lê a loja e devolve os fatos da campanha para você conferir." batchPrompt={contextPrompt} batchKey="context" copiedKey={copiedKey} onCopy={copyText} />
          <ChatInstruction>{linkAccess === 'protected' ? 'Anexe primeiro as fotos e os prints. Depois cole a mensagem acima. ' : 'Cole a mensagem acima. '}Espere a resposta completa antes de continuar.</ChatInstruction>
          <BottomActions back={backContext} next={advanceContext} nextLabel="Já recebi o contexto" />
        </PhaseShell>
      );
    }

    return (
      <PhaseShell {...shellProps} phase={1} detail="Checklist">
        <PageHeading eyebrow="Conferência humana" title="O contexto está correto?" description="Confira somente estes cinco pontos na resposta do ChatGPT. Se algo estiver errado, corrija no mesmo chat antes de avançar." />
        <div className="border border-border bg-card/65 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div><p className="font-medium">Checklist da resposta</p><p className="mt-1 text-sm text-muted-foreground">Marque os cinco itens ou use a seleção rápida.</p></div>
            <Button type="button" variant="outline" className="" onClick={() => setContextChecks(contextCheckItems.map(() => !contextChecks.every(Boolean)))}><ListChecks data-icon="inline-start" /> {contextChecks.every(Boolean) ? 'Limpar seleção' : 'Selecionar tudo'}</Button>
          </div>
          <div className="space-y-3">
            {contextCheckItems.map((item, index) => (
              <label key={item} className="flex cursor-pointer items-center gap-3 border border-border bg-background/45 p-4 text-sm sm:text-base">
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
        <PageHeading eyebrow="Carrossel obrigatório" title="Padronize cinco produtos da coleção" description="Cinco cards 4:5 com o mesmo fundo, a mesma luz e a mesma escala." />
        <PromptStep
          title="Carrossel de cinco cards"
          delivers="Uma mensagem gera os cinco cards padronizados em 4:5."
          batchPrompt={carouselPrompt}
          batchKey="carousel"
          pieces={[0, 1, 2, 3, 4].map((index) => ({
            label: `Card ${String(index + 1).padStart(2, '0')} de cinco`,
            prompt: compileCarouselCardPrompt(index),
            copyKey: `carousel-card-${index}`,
          }))}
          copiedKey={copiedKey}
          onCopy={copyText}
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {['5 arquivos separados', 'Fundo igual', 'Produto intacto', 'Sem rosto quando houver pessoa'].map((item) => <div key={item} className="flex items-center gap-2 border border-border bg-card/55 p-3 text-sm text-muted-foreground"><CheckCircle2 className="size-4 shrink-0 text-emerald-400" />{item}</div>)}
        </div>
        <BottomActions back={() => journeyMode === 'stage' ? openWorkspace() : (goPhase(1), setContextStep(6))} next={() => { markPhaseDone(2); if (journeyMode === 'stage') finishStandalone('Etapa de carrossel concluída.'); else goPhase(3); }} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Já gerei os cinco cards'} />
      </PhaseShell>
    );
  }

  if (phase === 3 && creativeView === 'library') {
    const openPromptView = () => { setCreativeView('prompt'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const goBackFromLibrary = () => journeyMode === 'stage' ? openWorkspace() : campaignMode === 'collection' ? goPhase(2) : (goPhase(1), setContextStep(6));
    const sameness = lotSameness(selectedReferences);
    /* Peça sem texto conta com a oferta aparecendo nas outras do lote. Se todas forem sem texto, a campanha fica sem oferta em lugar nenhum. */
    const todasSemTexto = selectedReferences.length >= 3 && selectedReferences.every(({ silent }) => silent);
    const lotWarning = todasSemTexto
      ? 'Todas as escolhidas são peças sem texto. A oferta não vai aparecer em nenhuma delas: troque pelo menos uma por uma peça que anuncie.'
      : selectedReferences.length >= 3 && sameness.length >= 3
        ? `As escolhidas repetem ${sameness.map((axis) => axis.label).join(', ')}. Um lote assim volta com cinco peças parecidas: troque pelo menos duas.`
        : null;
    const lotSlots: LotSlot[] = Array.from({ length: 5 }, (_, index) => {
      const item = selectedReferences[index];
      return item ? { id: item.id, name: item.name, image: item.image } : null;
    });

    const galleryPanel = (
      <GalleryPanel
        stepLabel="Etapas da campanha"
        onBackToSteps={() => openWorkspace()}
        slots={lotSlots}
        onRemove={toggleReference}
        onUseRecommended={() => setSelectedIds(recommendedReferenceIds(orderedReferences))}
        onSubmit={openPromptView}
        warning={lotWarning}
        filterCount={galleryFilterCount}
        onClear={clearGalleryFilters}
        groups={[
          {
            id: 'family',
            label: 'Família visual',
            options: familyValues.map((value) => ({ value, label: value, count: facetCount('family', (item) => item.family === value) })),
            selected: familyFilters,
            onToggle: (value) => toggleFacet(setFamilyFilters, value),
          },
          {
            id: 'people',
            label: 'Presença humana',
            options: peopleValues.map(({ value, label }) => ({ value, label, count: facetCount('people', (item) => (item.people ?? 'sem-pessoa') === value) })),
            selected: peopleFilters,
            onToggle: (value) => toggleFacet(setPeopleFilters, value),
          },
          {
            id: 'category',
            label: 'Prateleira do produto',
            options: categoryValues.map((value) => ({ value, label: value, count: facetCount('category', (item) => item.category === value) })),
            selected: categoryFilters,
            onToggle: (value) => toggleFacet(setCategoryFilters, value),
          },
        ]}
        toggles={[]}
      />
    );

    const libraryToolbar = (
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-9 bg-card pr-4 pl-9 text-sm" placeholder="Buscar por nome ou tag" />
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          <strong className="text-foreground">{filteredReferences.length}</strong>
          {galleryFilterCount ? ` de ${compatibleReferences.length}` : ''} direções adequadas
        </p>
        {galleryFilterCount ? (
          <Button type="button" variant="ghost" size="sm" className="ml-auto h-9 shrink-0 text-muted-foreground" onClick={clearGalleryFilters}>
            <RotateCcw data-icon="inline-start" /> <span className="hidden sm:inline">Limpar filtros</span>
          </Button>
        ) : null}
      </div>
    );

    const libraryActions = (
      <div className="hidden min-w-0 items-center gap-2 border border-border bg-card/55 px-3 py-1.5 text-xs md:flex">
        <Package className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="max-w-[14rem] truncate">{exactTarget || 'Campanha sem alvo definido'}</span>
        {offer ? <><span className="text-muted-foreground">·</span><span className="max-w-[12rem] truncate text-muted-foreground">{offer}</span></> : null}
        {offerMechanic ? <><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{offerMechanics.find((item) => item.value === offerMechanic)?.label}</span></> : null}
      </div>
    );

    return (
      <PhaseShell
        {...shellProps}
        phase={3}
        title="Escolha pela imagem"
        wide
        panel={galleryPanel}
        menuLabel="Abrir filtros e lote"
        menuBadge={galleryFilterCount || undefined}
        actions={libraryActions}
        toolbar={libraryToolbar}
      >
        {orderedReferences.length ? <div className="reference-masonry pb-20 lg:pb-0" aria-label="Biblioteca de referências">{orderedReferences.map((item) => {
          const selectedIndex = selectedIds.indexOf(item.id);
          const selected = selectedIndex >= 0;
          const blocked = selectedIds.length >= 5 && !selected;
          return (
            <article key={item.id} className={`reference-pin group w-full text-left ${selected ? 'reference-pin-active' : ''}`}>
              <button
                type="button"
                disabled={blocked}
                title={blocked ? 'O lote já tem cinco direções. Tire uma para trocar.' : undefined}
                onClick={() => selected ? toggleReference(item.id) : runReferenceAction(item, 'select')}
                className={`reference-image-button ${blocked ? 'opacity-45' : ''}`}
                aria-pressed={selected}
                aria-label={`${selected ? 'Tirar' : 'Escolher'} ${item.name}`}
              >
                <img src={item.image} alt={`Referência completa: ${item.name}`} loading="lazy" className="h-auto w-full" />
                {selected ? <span className="absolute top-3 left-3 grid size-8 place-items-center bg-primary text-xs font-medium text-primary-foreground shadow-lg">{String(selectedIndex + 1).padStart(2, '0')}</span> : null}
                <span className="reference-hover-panel">
                  <span className="block">
                    <span>
                      <span className="block font-medium tracking-[-0.02em] text-white">{item.name}</span>
                      <span className="mt-1 block text-xs text-white/72">{item.family} · {peopleLabel(item.people)}</span>
                    </span>
                  </span>
                  {item.limits ? <span className="mt-2 line-clamp-2 block text-xs leading-5 text-white/66">{item.limits}</span> : null}
                </span>
              </button>
              {item.silent ? <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-3 py-2 text-xs leading-5 text-muted-foreground"><Sparkles className="size-3.5 shrink-0" />Peça sem texto: vende só pela imagem, e a oferta fica nas outras do lote</div> : null}
              {item.requirement ? <div className="flex items-center gap-2 border-t border-amber-400/20 bg-amber-400/[0.07] px-3 py-2 text-xs leading-5 text-amber-100"><AlertTriangle className="size-3.5 shrink-0 text-amber-300" />Precisa de {item.requirement.label}</div> : null}
              <Button type="button" variant="ghost" size="icon" title="Ver em detalhe" aria-label={`Ver ${item.name} em detalhe`} className="reference-detail-button" onClick={() => setDetailReference(item)}><Maximize2 className="size-4" /></Button>
            </article>
          );
        })}</div> : (
          <div className="border border-dashed border-border py-16 text-center">
            <Search className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 font-medium">Nenhuma direção passa por esses filtros</p>
            <Button type="button" variant="outline" className="mt-5 h-10" onClick={clearGalleryFilters}><RotateCcw data-icon="inline-start" /> Limpar filtros</Button>
          </div>
        )}

        <Dialog open={detailReference !== null} onOpenChange={(open) => !open && setDetailReference(null)}>
          <DialogContent className="max-w-[min(64rem,94vw)] border border-primary/20 bg-popover p-0 sm:max-w-[min(64rem,94vw)]">
            {detailReference ? (
              <div className="grid max-h-[86vh] overflow-y-auto md:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="grid place-items-center bg-black/45 p-4">
                  <img src={detailReference.image} alt={`Referência completa: ${detailReference.name}`} className="max-h-[76vh] w-full object-contain" />
                </div>
                <div className="flex flex-col border-t border-border p-5 md:border-t-0 md:border-l">
                  <DialogHeader>
                    <DialogTitle className="text-left text-lg tracking-[-0.025em]">{detailReference.name}</DialogTitle>
                    <DialogDescription className="text-left">{detailReference.id}</DialogDescription>
                  </DialogHeader>
                  <dl className="mt-5 space-y-2.5 text-sm">
                    <DetailRow label="Família visual" value={detailReference.family} />
                    <DetailRow label="Presença humana" value={peopleLabel(detailReference.people)} />
                    <DetailRow label="Argumento" value={(detailReference.drivers ?? []).map((driver) => driver === 'estetica' ? 'a foto vende sozinha' : 'precisa explicar a função').join(' e ') || '—'} />
                    <DetailRow label="Oferta" value={detailReference.offerMechanics?.map((mechanic) => offerMechanics.find((item) => item.value === mechanic)?.label).join(' · ') || 'desconto direto ou compre X, leve Y'} />
                    <DetailRow label="Produto da foto" value={detailReference.category} />
                    <DetailRow label="Serve para" value={detailReference.fillsWithVariants ? 'Coleção, ou um produto só nas cores e vistas confirmadas' : detailReference.modes.length === 2 ? 'Produto único ou coleção' : detailReference.modes[0] === 'collection' ? 'Coleção' : 'Produto único'} />
                    {detailReference.slots ? <DetailRow label="Cabe" value={`${detailReference.slots} produtos na grade`} /> : null}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-1.5">{detailReference.tags.map((tag) => <span key={tag} className="border border-border bg-card/55 px-2 py-1 text-[11px] text-muted-foreground">{tag}</span>)}</div>
                  {detailReference.limits ? <p className="mt-4 border border-border bg-card/55 p-3 text-xs leading-5 text-muted-foreground">{detailReference.limits}</p> : null}
                  {detailReference.requirement ? <p className="mt-3 flex items-start gap-2 border border-amber-400/30 bg-amber-400/[0.07] p-3 text-xs leading-5 text-amber-100"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-300" />Precisa de {detailReference.requirement.label} confirmado no contexto.</p> : null}
                  <div className="mt-auto grid gap-2 pt-6">
                    {selectedIds.includes(detailReference.id) ? (
                      <Button type="button" variant="outline" className="h-10 w-full" onClick={() => toggleReference(detailReference.id)}><X data-icon="inline-start" /> Tirar do lote</Button>
                    ) : (
                      <Button type="button" className="h-10 w-full" disabled={selectedIds.length >= 5} onClick={() => { runReferenceAction(detailReference, 'select'); setDetailReference(null); }}>
                        {selectedIds.length >= 5 ? 'O lote já tem cinco' : 'Colocar no lote'}
                      </Button>
                    )}
                    <Button type="button" variant="ghost" className="h-10 w-full text-muted-foreground" onClick={() => runReferenceAction(detailReference, 'copy')}>
                      {copiedKey === `library-single-${detailReference.id}` ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> Copiar só esta direção</>}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={requirementAction !== null} onOpenChange={(open) => !open && setRequirementAction(null)}>
          <DialogContent className="max-w-lg border border-primary/20 bg-popover sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Antes de usar esta direção</DialogTitle>
              <DialogDescription>{requirementAction?.reference.requirement?.question}</DialogDescription>
            </DialogHeader>
            <p className="text-sm leading-6 text-muted-foreground">Se esse fato não apareceu no contexto capturado, escolha outra referência. O ChatGPT não deve inventá-lo.</p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRequirementAction(null)}>Escolher outra</Button>
              <Button type="button" onClick={confirmRequirement}>Sim, está confirmado</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-8 hidden border-t border-border pt-6 lg:block">
          <Button type="button" variant="ghost" size="lg" onClick={goBackFromLibrary}><ArrowLeft data-icon="inline-start" /> Voltar</Button>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Button type="button" variant="ghost" size="icon" aria-label="Voltar" className="shrink-0" onClick={goBackFromLibrary}><ArrowLeft className="size-4" /></Button>
          <span className="text-sm text-muted-foreground"><strong className="text-foreground">{selectedIds.length}</strong> de 5</span>
          <Button type="button" className="ml-auto h-10 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-muted-foreground disabled:opacity-100" disabled={selectedIds.length !== 5} onClick={openPromptView}>Criar prompt <ArrowRight data-icon="inline-end" /></Button>
        </div>
      </PhaseShell>
    );
  }

  if (phase === 3 && creativeView === 'prompt') {
    return (
      <PhaseShell {...shellProps} phase={3} detail="Lote mestre 4:5">
        <PageHeading eyebrow="Cinco direções selecionadas" title="Gere os cinco criativos mestres" description="Uma mensagem leva as cinco receitas. Se alguma peça vier errada, você gera só aquela." />
        {lotSameness(selectedReferences).length >= 3 ? <p className="mb-4 flex items-start gap-2 border border-amber-400/30 bg-amber-400/[0.07] p-3 text-sm leading-6 text-amber-100/85"><AlertTriangle className="mt-1 size-4 shrink-0 text-amber-300" />As cinco repetem {lotSameness(selectedReferences).map((eixo) => eixo.label).join(', ')}. O lote tende a voltar parecido: troque duas antes de gerar.</p> : null}
        <div className="mb-5 flex items-center justify-between gap-4 border border-border bg-card/60 p-4"><div className="flex -space-x-2">{selectedReferences.map((item, index) => <div key={item.id} className="relative size-11 overflow-hidden border-2 border-background bg-muted shadow"><img src={item.image} alt="" className="h-full w-full object-cover" /><span className="absolute right-0 bottom-0 grid size-4 place-items-center bg-primary text-[8px] text-primary-foreground">{index + 1}</span></div>)}</div><div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-400" /> 5 imagens separadas · 4:5</div></div>
        <PromptStep
          title="Lote mestre 4:5"
          delivers="Uma mensagem gera os cinco criativos, na ordem do lote."
          batchPrompt={masterPrompt}
          batchKey="master"
          pieces={selectedReferences.map((item) => ({
            label: item.name,
            prompt: compileReferencePrompt(campaign, item),
            copyKey: `selected-single-${item.id}`,
          }))}
          copiedKey={copiedKey}
          onCopy={copyText}
        />

        <BottomActions back={() => setCreativeView('library')} next={() => { setCreativeView('review'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} nextLabel="Já gerei. Conferir lote" />
      </PhaseShell>
    );
  }

  if (phase === 3) {
    const problemChoices = [
      { value: 'missing' as ReviewStatus, label: 'Não veio como pedi', hint: 'Faltou, veio dentro de uma colagem, repetiu outra peça ou saiu numa direção diferente.' },
      { value: 'content' as ReviewStatus, label: 'O conteúdo saiu errado', hint: 'Produto, oferta, marca ou texto com erro na peça.' },
      { value: 'variation' as ReviewStatus, label: 'Quero outra versão', hint: 'A peça está correta, mas você quer outra tentativa da mesma direção.' },
    ];

    function fixPrompt(item: Reference, index: number, status: ReviewStatus) {
      if (status === 'content') return compileIndividualPrompt(item, index, individualIssues[item.id] ?? '', 'content');
      if (status === 'variation') return compileIndividualPrompt(item, index, '', 'variation');
      return compileSingleRecoveryPrompt(item, index);
    }

    return (
      <PhaseShell {...shellProps} phase={3} detail={`${correctCount} de 5 aprovados`} wide>
        <PageHeading title="Confira os cinco criativos" description="Marque só o que deu errado. O que você não marcar segue aprovado." />

        <div className="space-y-2">
          {selectedReferences.map((item, index) => {
            const status = reviewState[item.id] ?? 'correct';
            const open = problemIndex === index;
            const numero = String(index + 1).padStart(2, '0');
            return (
              <article key={item.id} className={`border ${status === 'correct' ? 'border-border bg-card/45' : 'border-amber-400/40 bg-amber-400/[0.05]'}`}>
                <div className="flex flex-wrap items-center gap-3 p-3">
                  <img src={item.sample ?? item.image} alt="" className="size-12 shrink-0 object-cover" />
                  <span className="grid size-7 shrink-0 place-items-center bg-primary/14 text-[11px] font-semibold text-accent-foreground">{numero}</span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</p>

                  {status === 'correct' ? (
                    <>
                      <span className="flex items-center gap-1.5 text-xs text-emerald-300"><CheckCircle2 className="size-3.5" /> Aprovado</span>
                      <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={() => setProblemIndex(open ? null : index)}>
                        {open ? 'Fechar' : 'Deu problema'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 text-xs text-amber-200"><AlertCircle className="size-3.5" /> {problemChoices.find((choice) => choice.value === status)?.label}</span>
                      <Button type="button" variant="ghost" size="sm" className="h-9 shrink-0 text-emerald-300" onClick={() => { updateReview(item.id, 'correct'); setProblemIndex(null); }}>
                        <Check data-icon="inline-start" /> Já corrigi
                      </Button>
                    </>
                  )}
                </div>

                {open && status === 'correct' ? (
                  <div className="border-t border-border p-3">
                    <p className="mb-2 text-xs text-muted-foreground">O que aconteceu com o criativo {numero}?</p>
                    <div className="grid gap-2 md:grid-cols-3">
                      {problemChoices.map((choice) => (
                        <button
                          key={choice.value}
                          type="button"
                          onClick={() => { updateReview(item.id, choice.value); setProblemIndex(null); }}
                          className="border border-border bg-background/45 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.06]"
                        >
                          <span className="block text-sm font-medium">{choice.label}</span>
                          <span className="mt-1 block text-xs leading-4 text-muted-foreground">{choice.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {status !== 'correct' ? (
                  <div className="border-t border-amber-400/25 p-3">
                    {status === 'content' ? (
                      <div className="mb-3">
                        <label htmlFor={`erro-${item.id}`} className="mb-1.5 block text-xs text-muted-foreground">O que está errado na peça?</label>
                        <Textarea
                          id={`erro-${item.id}`}
                          value={individualIssues[item.id] ?? ''}
                          onChange={(event) => setIndividualIssues((current) => ({ ...current, [item.id]: event.target.value }))}
                          placeholder="Ex.: a oferta saiu em português, o produto mudou de cor"
                          className="min-h-20 bg-background/45 text-sm"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">Cole o comando no mesmo chat. Quando a peça voltar certa, marque “já corrigi”.</p>
                      <div className="flex shrink-0 items-center gap-3">
                        <button type="button" onClick={() => setFixTextFor((current) => current === item.id ? null : item.id)} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                          {fixTextFor === item.id ? 'Esconder o texto' : 'Ver o texto'}
                        </button>
                        <Button type="button" size="sm" className="h-9" onClick={() => copyText(fixPrompt(item, index, status), `fix-${item.id}`)}>
                          {copiedKey === `fix-${item.id}` ? <><Check data-icon="inline-start" /> Copiado</> : <><Copy data-icon="inline-start" /> Copiar correção</>}
                        </Button>
                      </div>
                    </div>
                    {fixTextFor === item.id ? (
                      <pre className="mt-3 max-h-60 overflow-auto border border-border bg-background/45 p-3 font-sans text-[13px] leading-6 whitespace-pre-wrap text-slate-300">{fixPrompt(item, index, status)}</pre>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {pendingIndexes.length > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-card/45 p-3">
            <p className="text-sm text-muted-foreground">
              {pendingIndexes.length} peças não vieram. Dá para pedir todas numa mensagem só.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => copyText(recoveryPrompt, 'recovery')}>
                {copiedKey === 'recovery' ? <><Check data-icon="inline-start" /> Copiado</> : <><RefreshCcw data-icon="inline-start" /> Copiar recuperação</>}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-9 text-emerald-300" onClick={() => markIndexesCorrect(pendingIndexes)}>
                <Check data-icon="inline-start" /> Já vieram
              </Button>
            </div>
          </div>
        ) : null}

        <BottomActions back={() => setCreativeView('prompt')} next={() => { markPhaseDone(3); if (journeyMode === 'stage') finishStandalone('Etapa de cinco criativos concluída.'); else goPhase(4); }} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Ver adaptações de formato'} nextDisabled={problemIndexes.length > 0} />
      </PhaseShell>
    );
  }

  if (phase === 4) {
    return (
      <PhaseShell {...shellProps} phase={4} detail="1:1 e 9:16 · opcionais">
        <PageHeading title="Copie somente o formato de que precisa" description="Depois de aprovar os mestres 4:5. Copie só o formato que for usar: nenhum é obrigatório." />
        <div className="mb-6 border border-primary/25 bg-primary/[0.06] p-5 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">O sistema recompõe a arte para o novo formato.</strong> Ele não deve apenas cortar ou esticar a imagem. Cada botão copia um comando independente.</div>
        <div className="grid gap-4 xl:grid-cols-2">
          {campaignMode === 'collection' ? (
            <PromptStep
              title="Carrossel em 1:1"
              delivers="Uma mensagem adapta os cinco cards do carrossel."
              batchPrompt={compileCarouselFormatPrompt('1:1')}
              batchKey="carousel-1:1"
              pieces={[0, 1, 2, 3, 4].map((index) => ({
                label: `Card ${String(index + 1).padStart(2, '0')} em 1:1`,
                prompt: compileCarouselFormatSinglePrompt('1:1', index),
                copyKey: `carousel-1:1-${index}`,
              }))}
              copiedKey={copiedKey}
              onCopy={copyText}
            />
          ) : null}
            <PromptStep
              title="Cinco criativos em 1:1"
              delivers="Uma mensagem adapta os cinco mestres aprovados."
              batchPrompt={compileCreativeFormatPrompt('1:1', selectedReferences)}
              batchKey="creative-1:1"
              pieces={[0, 1, 2, 3, 4].map((index) => ({
                label: `Criativo ${String(index + 1).padStart(2, '0')} em 1:1`,
                prompt: compileCreativeFormatSinglePrompt('1:1', index, selectedReferences[index]),
                copyKey: `creative-1:1-${index}`,
              }))}
              copiedKey={copiedKey}
              onCopy={copyText}
            />

          {campaignMode === 'collection' ? (
            <PromptStep
              title="Carrossel em 9:16"
              delivers="Uma mensagem adapta os cinco cards para story."
              batchPrompt={compileCarouselFormatPrompt('9:16')}
              batchKey="carousel-9:16"
              pieces={[0, 1, 2, 3, 4].map((index) => ({
                label: `Card ${String(index + 1).padStart(2, '0')} em 9:16`,
                prompt: compileCarouselFormatSinglePrompt('9:16', index),
                copyKey: `carousel-9:16-${index}`,
              }))}
              copiedKey={copiedKey}
              onCopy={copyText}
            />
          ) : null}
            <PromptStep
              title="Cinco criativos em 9:16"
              delivers="Uma mensagem adapta os cinco mestres para story e reel."
              batchPrompt={compileCreativeFormatPrompt('9:16', selectedReferences)}
              batchKey="creative-9:16"
              pieces={[0, 1, 2, 3, 4].map((index) => ({
                label: `Criativo ${String(index + 1).padStart(2, '0')} em 9:16`,
                prompt: compileCreativeFormatSinglePrompt('9:16', index, selectedReferences[index]),
                copyKey: `creative-9:16-${index}`,
              }))}
              copiedKey={copiedKey}
              onCopy={copyText}
            />
        </div>
        <BottomActions back={() => journeyMode === 'stage' ? openWorkspace() : (goPhase(3), setCreativeView('review'))} next={() => { markPhaseDone(4); if (journeyMode === 'stage') finishStandalone('Etapa de formatos concluída.'); else { setSocialIndex(-1); goPhase(5); } }} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Entender as redes sociais'} />
      </PhaseShell>
    );
  }

  if (phase === 5 && socialIndex === -1) {
    return (
      <PhaseShell {...shellProps} phase={5} detail="Entenda antes de gerar">
        <PageHeading title="A rede social sustenta a venda do anúncio" description="O objetivo principal do Instagram aqui não é vender sozinho. É eliminar dúvidas e dar credibilidade quando a pessoa que viu o anúncio visita o perfil antes de comprar." />
        <div className="border border-primary/25 bg-[linear-gradient(135deg,rgba(91,133,255,.12),rgba(20,26,38,.85))] p-6 sm:p-8">
          <p className="max-w-2xl text-xl font-semibold leading-8 tracking-[-0.03em] sm:text-2xl">Um criativo pode trazer o clique. Um perfil vivo, coerente e confiável ajuda o cliente a decidir que a loja é real.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">{[['01', 'Crescimento proporcional', 'O perfil precisa acompanhar o ritmo da operação de tráfego.'], ['02', 'Fim da “loja fantasma”', 'Perfil vazio ou parado gera desconfiança imediata.'], ['03', 'Mais credibilidade', 'Feed, destaques e avaliações sustentam a decisão de compra.']].map(([number, title, text]) => <div key={number} className="border border-border bg-background/30 p-4"><p className="text-xs font-semibold text-accent-foreground">{number}</p><h2 className="mt-3 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="border border-border bg-card/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Montagem inicial</p><p className="mt-3 text-lg font-semibold">9 posts + 9 stories de destaque</p><p className="mt-2 text-sm leading-6 text-muted-foreground">O visitante entende o que a loja vende, por que confiar e como comprar.</p></div><div className="border border-border bg-card/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Rotina semanal</p><p className="mt-3 text-lg font-semibold">Bom dia + cupom + review</p><p className="mt-2 text-sm leading-6 text-muted-foreground">A presença continua ativa sem parecer repetitiva ou abandonada.</p></div></div>
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
        <PromptStep
          title={social.title}
          delivers={social.output}
          batchPrompt={social.prompt}
          batchKey={`social-${social.id}`}
          pieces={social.pieces.map((piece, index) => ({
            label: piece.label,
            prompt: piece.prompt,
            copyKey: `social-${social.id}-${index}`,
          }))}
          copiedKey={copiedKey}
          onCopy={copyText}
        />
        <div className="mt-6 grid gap-x-8 gap-y-5 border-t border-border pt-6 md:grid-cols-3">
          {[
            ['Por que existe', social.importance],
            ['Antes de rodar', social.before],
            ['Cuidado', social.guardrail],
          ].map(([label, text]) => (
            <div key={label}>
              <p className="text-[11px] font-medium tracking-[0.12em] text-accent-foreground uppercase">{label}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <ol className="mt-5 grid gap-2 text-xs leading-5 text-muted-foreground sm:grid-cols-3">
          {social.howToUse.map((instruction, index) => (
            <li key={instruction} className="flex gap-2">
              <span className="text-accent-foreground">{index + 1}.</span>{instruction}
            </li>
          ))}
        </ol>
        {social.note ? <p className="mt-4 text-xs leading-5 text-amber-100/70">{social.note}</p> : null}
        <BottomActions back={() => socialIndex === 0 ? setSocialIndex(-1) : setSocialIndex((current) => current - 1)} next={() => { if (socialIndex < socialPrompts.length - 1) { setSocialIndex((current) => current + 1); return; } markPhaseDone(5); if (journeyMode === 'stage') finishStandalone('Etapa de redes sociais concluída.'); else goPhase(6); }} nextLabel={socialIndex < socialPrompts.length - 1 ? 'Próximo bloco' : journeyMode === 'stage' ? 'Concluir esta etapa' : 'Criar narração'} />
      </PhaseShell>
    );
  }

  if (phase === 6) {
    return (
      <PhaseShell {...shellProps} phase={6} detail="ElevenLabs · até 30 segundos">
        <PageHeading eyebrow="Áudio do vídeo" title="Crie o texto que dará voz ao anúncio" description="Este prompt não gera o áudio. Ele escreve uma narração comercial curta e factual para você transformar em voz no ElevenLabs." />
        <section className="border border-primary/25 bg-primary/[0.07] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Por que isso importa</p>
          <p className="mt-3 text-xl font-semibold leading-8 tracking-[-0.025em]">Nos primeiros segundos, a narração precisa explicar por que a pessoa deve parar.</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Por isso o texto começa imediatamente pela oferta, apresenta o produto logo depois e termina com uma chamada para ação. A duração máxima de 30 segundos facilita a edição do criativo em vídeo.</p>
        </section>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">{[['1', 'Copie no ChatGPT', 'O mesmo chat usa oferta, produto, idioma e fatos já confirmados.'], ['2', 'Aprove o texto', 'Leia em voz alta e confira se oferta e produto aparecem imediatamente.'], ['3', 'Gere no ElevenLabs', 'Cole somente a narração aprovada para transformar o texto em voz.']].map(([number, title, text]) => <div key={number} className="border border-border bg-card/55 p-5"><span className="grid size-8 place-items-center bg-primary/14 text-xs font-semibold text-accent-foreground">{number}</span><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div>
        <div className="mt-5"><PromptStep title="Narração de até 30 segundos" delivers="Começa pela oferta, usa só fatos confirmados e devolve o texto pronto para o ElevenLabs." batchPrompt={audioPrompt} batchKey="audio" copiedKey={copiedKey} onCopy={copyText} /></div>
        <BottomActions back={() => journeyMode === 'stage' ? openWorkspace() : (goPhase(5), setSocialIndex(socialPrompts.length - 1))} next={() => { markPhaseDone(6); if (journeyMode === 'stage') finishStandalone('Etapa de narração concluída.'); else { goPhase(7); setVideoStep(0); } }} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Ver necessidade de vídeo'} />
      </PhaseShell>
    );
  }

  if (phase === 7 && videoStep === 0) {
    return (
      <PhaseShell {...shellProps} phase={7} detail="Etapa condicional">
        <QuestionScreen title="Você encontrou bons vídeos reais do produto?" description="O Kling só entra quando não existem vídeos utilizáveis. As imagens originais do produto continuam sendo a fonte." back={() => journeyMode === 'stage' ? openWorkspace() : goPhase(6)} next={() => { if (hasGoodVideos) { markPhaseDone(7); if (journeyMode === 'stage') finishStandalone('Vídeos reais confirmados. Não foi necessário usar o Kling.'); else goPhase(8); } else setVideoStep(1); }} nextLabel={hasGoodVideos ? (journeyMode === 'stage' ? 'Concluir esta etapa' : 'Pular Kling') : 'Preparar prompts Kling'} nextDisabled={hasGoodVideos === null}>
          <RadioGroup value={hasGoodVideos === null ? '' : hasGoodVideos ? 'yes' : 'no'} onValueChange={(value) => setHasGoodVideos(value === 'yes')} className="grid gap-3 sm:grid-cols-2"><ChoiceCard value="yes" active={hasGoodVideos === true} icon={<CheckCircle2 className="size-5" />} title="Sim, encontrei" description="Usarei os vídeos reais e seguirei para o panfleto." /><ChoiceCard value="no" active={hasGoodVideos === false} icon={<Film className="size-5" />} title="Não encontrei" description="Preparar três prompts detalhados para Kling." /></RadioGroup>
        </QuestionScreen>
      </PhaseShell>
    );
  }

  if (phase === 7) {
    return (
      <PhaseShell {...shellProps} phase={7} detail="3 vídeos · Kling">
        <PageHeading title="Crie três roteiros visuais para o Kling" description="Os prompts usam as fotos originais, preservam somente cores confirmadas e reutilizam a narração já aprovada." />
        <PromptStep title="Três roteiros para o Kling" delivers="Texto, não imagem: volta um prompt completo para cada um dos três vídeos." batchPrompt={videoPrompt} batchKey="video" copiedKey={copiedKey} onCopy={copyText} />
        <BottomActions back={() => setVideoStep(0)} next={() => { markPhaseDone(7); if (journeyMode === 'stage') finishStandalone('Etapa de vídeos com IA concluída.'); else goPhase(8); }} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Preparar panfleto'} />
      </PhaseShell>
    );
  }

  if (phase === 8 && !completed && flyerStep === 0) {
    return (
        <PhaseShell {...shellProps} phase={8} detail="Pergunta 1 de 3">
        <QuestionScreen title="Qual é o prêmio do sorteio?" description="Essa será a única imagem de produto permitida no panfleto." back={() => journeyMode === 'stage' ? openWorkspace() : goPhase(7)} next={() => setFlyerStep(1)} nextDisabled={prize.trim().length < 2}>
          <label htmlFor="prize" className="mb-2 block text-sm font-medium">Prêmio</label><Input id="prize" value={prize} onChange={(event) => setPrize(event.target.value)} className="h-14 bg-card px-4 text-base" placeholder="Ex.: iPhone 17" />
        </QuestionScreen>
      </PhaseShell>
    );
  }

  if (phase === 8 && !completed && flyerStep === 1) {
    return (
        <PhaseShell {...shellProps} phase={8} detail="Pergunta 2 de 3">
        <QuestionScreen title="Qual cupom o cliente receberá?" description="Digite exatamente como o código deve aparecer dentro do voucher." back={() => setFlyerStep(0)} next={() => setFlyerStep(2)} nextDisabled={coupon.trim().length < 2}>
          <label htmlFor="coupon" className="mb-2 block text-sm font-medium">Código do cupom</label><Input id="coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} className="h-14 bg-card px-4 text-base uppercase" placeholder="Ex.: NOMEDALOJA20" />
        </QuestionScreen>
      </PhaseShell>
    );
  }

  if (phase === 8 && !completed && flyerStep === 2) {
    return (
        <PhaseShell {...shellProps} phase={8} detail="Pergunta 3 de 3">
        <QuestionScreen title="Qual é o desconto da próxima compra?" description="Informe o valor completo, incluindo símbolo ou condição necessária." back={() => setFlyerStep(1)} next={() => setFlyerStep(3)} nextLabel="Preparar panfleto" nextDisabled={discount.trim().length < 1}>
          <label htmlFor="discount" className="mb-2 block text-sm font-medium">Valor do desconto</label><Input id="discount" value={discount} onChange={(event) => setDiscount(event.target.value)} className="h-14 bg-card px-4 text-base" placeholder="Ex.: 20%" />
        </QuestionScreen>
      </PhaseShell>
    );
  }

  if (phase === 8 && !completed) {
    return (
      <PhaseShell {...shellProps} phase={8} detail="A6 · 105 × 148 mm">
        <PageHeading eyebrow="Última entrega" title="Gere o panfleto impresso" description="O prompt utiliza a identidade já capturada, mantém a regra fixa de dez participantes e proíbe produtos da loja na arte." />
        <div className="mb-5 grid gap-3 sm:grid-cols-3">{[[Ticket, 'Prêmio', prize], [Clipboard, 'Cupom', coupon], [Star, 'Desconto', discount]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof Ticket; return <div key={String(label)} className="border border-border bg-card/60 p-4"><ItemIcon className="size-4 text-accent-foreground" /><p className="mt-3 text-xs text-muted-foreground">{String(label)}</p><p className="mt-1 font-medium">{String(value)}</p></div>; })}</div>
        <PromptStep title="Panfleto A6" delivers="Uma peça impressa com prêmio, cupom e desconto que você acabou de informar." batchPrompt={flyerPrompt} batchKey="flyer" copiedKey={copiedKey} onCopy={copyText} />
        <BottomActions back={() => setFlyerStep(2)} next={() => { markPhaseDone(8); if (journeyMode === 'stage') finishStandalone('Etapa de panfleto concluída.'); else completeCampaign(); }} nextLabel={journeyMode === 'stage' ? 'Concluir esta etapa' : 'Finalizar e abrir painel'} />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell {...shellProps} phase={8} detail="Processo concluído">
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
        <span className="grid size-16 place-items-center bg-emerald-400/12 text-emerald-300"><CheckCircle2 className="size-8" /></span>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">Campanha concluída</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Todo o processo foi percorrido</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Contexto, imagens, formatos, redes sociais, narração, vídeo quando necessário e panfleto foram organizados no mesmo chat.</p>
        <Button type="button" size="lg" className="mt-8 h-12 px-6" onClick={resetCampaign}><Sparkles data-icon="inline-start" /> Iniciar nova campanha</Button>
      </div>
    </PhaseShell>
  );
}
