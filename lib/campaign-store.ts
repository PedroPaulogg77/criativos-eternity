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
  /* A loja agrupa produtos e coleções sem obrigar o aluno a repetir a organização. */
  storeId: string;
  /* Nome curto exibido na navegação. Não altera o alvo usado nos prompts. */
  tabName: string;
  mode: 'single' | 'collection';
  exactTarget: string;
  sourceUrl: string;
  linkAccess: 'public' | 'protected';
  offer: string;
  channels: Array<'google' | 'meta'>;
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

export type StoreRecord = {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  sourceUrl: string;
};

export type CampaignStore = {
  version: 2;
  activeId: string | null;
  activeStoreId: string | null;
  stores: StoreRecord[];
  items: CampaignRecord[];
};

const STORE_KEY = 'eternity:campaigns';
const LEGACY_CAMPAIGN_KEY = 'eternity:last-campaign';
const LEGACY_WORKSPACE_KEY = 'eternity:workspace-unlocked';

export const emptyStore: CampaignStore = { version: 2, activeId: null, activeStoreId: null, stores: [], items: [] };

function nameFromUrl(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./i, '') || 'Minha loja';
  } catch {
    return 'Minha loja';
  }
}

function sameStoreSource(a: string, b: string) {
  try {
    return new URL(a).hostname.replace(/^www\./i, '') === new URL(b).hostname.replace(/^www\./i, '');
  } catch {
    return a.trim() === b.trim();
  }
}

/* Um produto novo entra na loja do mesmo domínio; uma URL de outra loja abre outro grupo. */
export function findStoreBySource(store: CampaignStore, sourceUrl: string) {
  return sourceUrl.trim()
    ? store.stores.find((item) => sameStoreSource(item.sourceUrl, sourceUrl))
    : undefined;
}

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
    storeId: '',
    tabName: '',
    mode: 'single',
    exactTarget: '',
    sourceUrl: '',
    linkAccess: 'public',
    offer: '',
    channels: ['meta'],
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

export function createStore(partial: Partial<StoreRecord> = {}): StoreRecord {
  const now = Date.now();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    name: partial.sourceUrl ? nameFromUrl(partial.sourceUrl) : 'Minha loja',
    sourceUrl: '',
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
    storeId: text(value.storeId),
    tabName: text(value.tabName),
    mode: value.mode,
    exactTarget: text(value.exactTarget),
    sourceUrl: text(value.sourceUrl),
    linkAccess: value.linkAccess,
    offer: text(value.offer),
    channels: Array.isArray(value.channels)
      ? value.channels.filter((item): item is 'google' | 'meta' => item === 'google' || item === 'meta')
      : ['meta'],
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

function sanitizeStore(raw: unknown): StoreRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== 'string' || !value.id) return null;
  const sourceUrl = typeof value.sourceUrl === 'string' ? value.sourceUrl : '';
  return createStore({
    id: value.id,
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
    name: typeof value.name === 'string' && value.name.trim() ? value.name.trim() : nameFromUrl(sourceUrl),
    sourceUrl,
  });
}

/* Registros antigos não tinham loja. Agrupamos pelo domínio sem perder nenhuma campanha. */
function normalizeStore(items: CampaignRecord[], rawStores: unknown, activeId: string | null, activeStoreId: string | null): CampaignStore {
  const stores = Array.isArray(rawStores)
    ? rawStores.map(sanitizeStore).filter((store): store is StoreRecord => store !== null)
    : [];

  const normalizedItems = items.map((record) => {
    const current = stores.find((store) => store.id === record.storeId);
    if (current) return record;

    const matching = stores.find((store) => sameStoreSource(store.sourceUrl, record.sourceUrl));
    if (matching) return { ...record, storeId: matching.id };

    const store = createStore({ sourceUrl: record.sourceUrl, name: nameFromUrl(record.sourceUrl) });
    stores.push(store);
    return { ...record, storeId: store.id };
  });

  const active = normalizedItems.find((record) => record.id === activeId) ?? normalizedItems[0];
  const currentStore = stores.find((store) => store.id === activeStoreId)
    ?? stores.find((store) => store.id === active?.storeId)
    ?? stores[0];

  return {
    version: 2,
    activeId: active?.id ?? null,
    activeStoreId: currentStore?.id ?? null,
    stores,
    items: normalizedItems,
  };
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
      version: 2,
      activeId: record.id,
      activeStoreId: null,
      stores: [],
      items: [completed ? { ...record, donePhases: [1, 2, 3, 4, 5, 6, 7, 8] } : record],
    };
    window.localStorage.removeItem(LEGACY_CAMPAIGN_KEY);
    window.localStorage.removeItem(LEGACY_WORKSPACE_KEY);
    const normalized = normalizeStore(migrated.items, migrated.stores, migrated.activeId, migrated.activeStoreId);
    saveStore(normalized);
    return normalized;
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
    return normalizeStore(items, value.stores, activeId, typeof value.activeStoreId === 'string' ? value.activeStoreId : null);
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
    version: 2,
    activeId: stamped.id,
    activeStoreId: stamped.storeId || store.activeStoreId,
    stores: store.stores,
    items: exists ? store.items.map((item) => (item.id === stamped.id ? stamped : item)) : [stamped, ...store.items],
  };
}

export function removeCampaign(store: CampaignStore, id: string): CampaignStore {
  const items = store.items.filter((item) => item.id !== id);
  const active = store.activeId === id ? items[0] : items.find((item) => item.id === store.activeId) ?? items[0];
  return {
    version: 2,
    activeId: active?.id ?? null,
    activeStoreId: active?.storeId ?? store.activeStoreId,
    stores: store.stores,
    items,
  };
}

export function upsertStore(store: CampaignStore, record: StoreRecord): CampaignStore {
  const stamped = { ...record, updatedAt: Date.now() };
  const exists = store.stores.some((item) => item.id === stamped.id);
  return {
    ...store,
    version: 2,
    activeStoreId: stamped.id,
    stores: exists ? store.stores.map((item) => item.id === stamped.id ? stamped : item) : [stamped, ...store.stores],
  };
}

export function removeStore(store: CampaignStore, id: string): CampaignStore {
  const items = store.items.filter((item) => item.storeId !== id);
  const stores = store.stores.filter((item) => item.id !== id);
  const active = items.find((item) => item.id === store.activeId) ?? items[0];
  return {
    version: 2,
    activeId: active?.id ?? null,
    activeStoreId: active?.storeId ?? stores[0]?.id ?? null,
    stores,
    items,
  };
}

/* Uma campanha sem alvo e sem etapa concluída é rascunho: pode ser reaproveitada em vez de virar lixo na lista. */
export function isBlank(record: CampaignRecord) {
  return !record.tabName.trim() && !record.exactTarget.trim() && !record.offer.trim() && record.donePhases.length === 0 && record.selectedIds.length === 0;
}

export function campaignLabel(record: CampaignRecord) {
  return record.tabName.trim() || record.exactTarget.trim() || 'Novo produto';
}

export function storeLabel(record: StoreRecord) {
  return record.name.trim() || nameFromUrl(record.sourceUrl);
}
