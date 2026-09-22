import type { OfferMechanic, ReviewStatus, SalesDriver } from './mvp-data';
import type { Phase } from './phases';

/*
 * Tudo o que o aluno produziu numa campanha mora aqui e volta igual depois de fechar a aba.
 * Antes só cinco campos de contexto sobreviviam; lote, conferência e panfleto se perdiam num F5.
 */
export type CampaignRecord = {
  id: string;
  createdAt: number;
  updatedAt: number;
  /* Nome curto exibido na navegação. Não altera o alvo usado nos prompts. */
  tabName: string;
  mode: 'single' | 'collection';
  exactTarget: string;
  sourceUrl: string;
  linkAccess: 'public' | 'protected';
  offer: string;
  offerMechanic: OfferMechanic | null;
  salesDriver: SalesDriver | null;
  contextChecks: boolean[];
  selectedIds: string[];
  confirmedRequirements: Record<string, true>;
  reviewState: Record<string, ReviewStatus>;
  prize: string;
  coupon: string;
  discount: string;
  donePhases: Phase[];
  lastPhase: Phase;
};

export type CampaignStore = {
  version: 1;
  activeId: string | null;
  items: CampaignRecord[];
};

const STORE_KEY = 'eternity:campaigns';
const LEGACY_CAMPAIGN_KEY = 'eternity:last-campaign';
const LEGACY_WORKSPACE_KEY = 'eternity:workspace-unlocked';

export const emptyStore: CampaignStore = { version: 1, activeId: null, items: [] };

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export function createCampaign(partial: Partial<CampaignRecord> = {}): CampaignRecord {
  const now = Date.now();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    tabName: '',
    mode: 'single',
    exactTarget: '',
    sourceUrl: '',
    linkAccess: 'public',
    offer: '',
    offerMechanic: null,
    salesDriver: null,
    contextChecks: [false, false, false, false, false],
    selectedIds: [],
    confirmedRequirements: {},
    reviewState: {},
    prize: '',
    coupon: '',
    discount: '',
    donePhases: [],
    lastPhase: 1,
    ...partial,
  };
}

/* O armazenamento local pode voltar corrompido ou de uma versão antiga: cada campo é conferido. */
function sanitize(raw: unknown): CampaignRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== 'string' || !value.id) return null;
  if (value.mode !== 'single' && value.mode !== 'collection') return null;
  if (value.linkAccess !== 'public' && value.linkAccess !== 'protected') return null;

  const text = (input: unknown) => (typeof input === 'string' ? input : '');
  const phases = Array.isArray(value.donePhases)
    ? value.donePhases.filter((item): item is Phase => typeof item === 'number' && item >= 1 && item <= 8)
    : [];

  return createCampaign({
    id: value.id,
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
    tabName: text(value.tabName),
    mode: value.mode,
    exactTarget: text(value.exactTarget),
    sourceUrl: text(value.sourceUrl),
    linkAccess: value.linkAccess,
    offer: text(value.offer),
    offerMechanic: value.offerMechanic === 'percentual' || value.offerMechanic === 'leve-mais' || value.offerMechanic === 'progressivo'
      ? value.offerMechanic
      : null,
    salesDriver: value.salesDriver === 'estetica' || value.salesDriver === 'funcao' ? value.salesDriver : null,
    contextChecks: Array.isArray(value.contextChecks) && value.contextChecks.length === 5
      ? value.contextChecks.map((item) => item === true)
      : [false, false, false, false, false],
    selectedIds: Array.isArray(value.selectedIds) ? value.selectedIds.filter((item): item is string => typeof item === 'string').slice(0, 5) : [],
    confirmedRequirements: value.confirmedRequirements && typeof value.confirmedRequirements === 'object'
      ? Object.fromEntries(Object.keys(value.confirmedRequirements as object).map((key) => [key, true as const]))
      : {},
    reviewState: value.reviewState && typeof value.reviewState === 'object'
      ? (Object.fromEntries(
          Object.entries(value.reviewState as Record<string, unknown>).filter(([, status]) => typeof status === 'string'),
        ) as Record<string, ReviewStatus>)
      : {},
    prize: text(value.prize),
    coupon: text(value.coupon),
    discount: text(value.discount),
    donePhases: phases,
    lastPhase: typeof value.lastPhase === 'number' && value.lastPhase >= 1 && value.lastPhase <= 8 ? (value.lastPhase as Phase) : 1,
  });
}

/* A campanha única que o app guardava antes vira o primeiro item da lista, sem perder nada. */
function migrateLegacy(): CampaignStore | null {
  const saved = window.localStorage.getItem(LEGACY_CAMPAIGN_KEY);
  if (!saved) return null;
  try {
    const value = JSON.parse(saved) as Record<string, unknown>;
    const record = sanitize({ ...value, id: newId() });
    if (!record) return null;
    const completed = window.localStorage.getItem(LEGACY_WORKSPACE_KEY) === 'true';
    const migrated: CampaignStore = {
      version: 1,
      activeId: record.id,
      items: [completed ? { ...record, donePhases: [1, 2, 3, 4, 5, 6, 7, 8] } : record],
    };
    window.localStorage.removeItem(LEGACY_CAMPAIGN_KEY);
    window.localStorage.removeItem(LEGACY_WORKSPACE_KEY);
    saveStore(migrated);
    return migrated;
  } catch {
    return null;
  }
}

export function loadStore(): CampaignStore {
  try {
    const saved = window.localStorage.getItem(STORE_KEY);
    if (!saved) return migrateLegacy() ?? emptyStore;
    const value = JSON.parse(saved) as Record<string, unknown>;
    const items = Array.isArray(value.items)
      ? value.items.map(sanitize).filter((item): item is CampaignRecord => item !== null)
      : [];
    const activeId = typeof value.activeId === 'string' && items.some((item) => item.id === value.activeId) ? value.activeId : items[0]?.id ?? null;
    return { version: 1, activeId, items };
  } catch {
    return emptyStore;
  }
}

export function saveStore(store: CampaignStore) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Sem armazenamento local o app continua funcionando, só não lembra depois de fechar.
  }
}

export function upsertCampaign(store: CampaignStore, record: CampaignRecord): CampaignStore {
  const stamped = { ...record, updatedAt: Date.now() };
  const exists = store.items.some((item) => item.id === stamped.id);
  return {
    version: 1,
    activeId: stamped.id,
    items: exists ? store.items.map((item) => (item.id === stamped.id ? stamped : item)) : [stamped, ...store.items],
  };
}

export function removeCampaign(store: CampaignStore, id: string): CampaignStore {
  const items = store.items.filter((item) => item.id !== id);
  return { version: 1, activeId: store.activeId === id ? items[0]?.id ?? null : store.activeId, items };
}

/* Uma campanha sem alvo e sem etapa concluída é rascunho: pode ser reaproveitada em vez de virar lixo na lista. */
export function isBlank(record: CampaignRecord) {
  return !record.tabName.trim() && !record.exactTarget.trim() && !record.offer.trim() && record.donePhases.length === 0 && record.selectedIds.length === 0;
}

export function campaignLabel(record: CampaignRecord) {
  return record.tabName.trim() || record.exactTarget.trim() || 'Novo produto';
}
