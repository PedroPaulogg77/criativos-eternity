'use client';

/* oxlint-disable next/no-img-element -- as miniaturas são as próprias referências da pasta public */

import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react';

export type FacetOption = { value: string; label: string; count: number };

export type FacetGroup = {
  id: string;
  label: string;
  hint?: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
};

export type FacetToggle = {
  id: string;
  label: string;
  count: number;
  active: boolean;
  onChange: (next: boolean) => void;
};

export type LotSlot = { id: string; name: string; image: string } | null;

export function GalleryPanel({
  stepLabel,
  onBackToSteps,
  slots,
  onRemove,
  onUseRecommended,
  onSubmit,
  warning,
  groups,
  toggles,
  filterCount,
  onClear,
}: {
  stepLabel: string;
  onBackToSteps: () => void;
  slots: LotSlot[];
  onRemove: (id: string) => void;
  onUseRecommended: () => void;
  onSubmit: () => void;
  warning: string | null;
  groups: FacetGroup[];
  toggles: FacetToggle[];
  filterCount: number;
  onClear: () => void;
}) {
  const chosen = slots.filter(Boolean).length;
  const missing = slots.length - chosen;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-sidebar-border p-4">
        <button
          type="button"
          onClick={onBackToSteps}
          className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> {stepLabel}
        </button>

        <p className="mt-3 text-sm font-medium">Seu lote</p>
        {chosen > 0 && chosen < slots.length ? <p className="mt-0.5 text-xs text-muted-foreground">Faltam {missing}.</p> : null}

        <div className="mt-3 flex gap-1.5">
          {slots.map((slot, index) => (
            slot ? (
              <button
                key={slot.id}
                type="button"
                onClick={() => onRemove(slot.id)}
                title={`Tirar ${slot.name} do lote`}
                aria-label={`Tirar ${slot.name} do lote`}
                className="group relative aspect-square min-w-0 flex-1 overflow-hidden border border-primary/60 bg-muted"
              >
                <img src={slot.image} alt="" className="size-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <X className="size-3.5 text-white" />
                </span>
                <span className="absolute bottom-0 left-0 bg-primary px-1 text-[9px] font-medium text-white">{index + 1}</span>
              </button>
            ) : (
              <span
                key={`vazio-${index}`}
                className="grid aspect-square min-w-0 flex-1 place-items-center border border-dashed border-sidebar-border text-[10px] text-muted-foreground"
              >
                {index + 1}
              </span>
            )
          ))}
        </div>

        {warning ? (
          <p className="mt-3 border border-amber-400/30 bg-amber-400/[0.08] p-2.5 text-[11px] leading-4 text-amber-100/85">{warning}</p>
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={chosen !== slots.length}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-muted-foreground"
        >
          Criar prompt <ArrowRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={onUseRecommended}
          className="mt-2 flex h-9 w-full items-center justify-center gap-2 border border-sidebar-border text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Sparkles className="size-3.5" /> Usar um lote pronto
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3">
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Filtros</p>
          {filterCount ? (
            <button type="button" onClick={onClear} className="text-xs text-accent-foreground transition-colors hover:text-foreground">
              Limpar ({filterCount})
            </button>
          ) : null}
        </div>

        {groups.map((group) => (
          <div key={group.id} className="border-b border-sidebar-border px-4 py-3">
            <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{group.label}</p>
            {group.hint ? <p className="mt-1 text-[11px] leading-4 text-muted-foreground/70">{group.hint}</p> : null}
            <div className="mt-2 space-y-0.5">
              {group.options.map((option) => {
                const active = group.selected.includes(option.value);
                const empty = option.count === 0 && !active;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={empty}
                    aria-pressed={active}
                    onClick={() => group.onToggle(option.value)}
                    className={`flex w-full items-center gap-2.5 px-1 py-1.5 text-left text-[13px] transition-colors ${
                      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    } ${empty ? 'cursor-not-allowed opacity-35 hover:text-muted-foreground' : ''}`}
                  >
                    <span className={`grid size-4 shrink-0 place-items-center border ${active ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                      {active ? <span className="size-1.5 bg-white" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{option.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {toggles.map((toggle) => (
          <div key={toggle.id} className="border-b border-sidebar-border px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              <input
                type="checkbox"
                checked={toggle.active}
                onChange={(event) => toggle.onChange(event.target.checked)}
                className="size-4 shrink-0 appearance-none border border-muted-foreground/40 bg-transparent checked:border-primary checked:bg-primary"
              />
              <span className="min-w-0 flex-1">{toggle.label}</span>
              <span className="shrink-0 text-[11px]">{toggle.count}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
