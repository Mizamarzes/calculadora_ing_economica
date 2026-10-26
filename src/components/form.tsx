import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

const gridRow = 'grid items-center gap-1.5 sm:grid-cols-[236px_minmax(0,1fr)] sm:gap-2.5';
const control = 'h-[37px] rounded-[9px] border border-line-field bg-white text-ink-field outline-none transition-[border-color,box-shadow] duration-150';
const selectClass = `${control} w-full appearance-auto px-3 focus:border-brand-ring focus:ring-[3px] focus:ring-brand-ring/[.11]`;
const suffixClass = `${control} flex items-center overflow-hidden focus-within:border-brand-ring focus-within:ring-[3px] focus-within:ring-brand-ring/[.11]`;

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={`${gridRow} text-sm text-ink-label sm:text-base`}>
      <span className="sm:text-right">{label}</span>
      {children}
    </label>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="mt-2 border-b border-line-rule pb-1 text-sm font-extrabold text-ink-heading first:mt-0">{children}</p>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-center text-xs text-ink-muted sm:pl-[246px] sm:text-left">{children}</p>;
}

export function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
}: {
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className={suffixClass}>
      {prefix && <b className="pl-[13px] text-base text-ink-suffix">{prefix}</b>}
      <input
        className="h-full w-full min-w-0 border-0 px-[13px] text-right text-ink-field outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
      />
      {suffix && <b className="whitespace-nowrap pr-[13px] text-base text-ink-suffix">{suffix}</b>}
    </div>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select className={selectClass} value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function CalculatorActions({ onCalculate, onClear }: { onCalculate: () => void; onClear: () => void }) {
  return (
    <div className="mb-[17px] mt-[35px] flex items-center justify-center gap-3">
      <button
        className="h-[43px] rounded-3xl bg-brand px-[30px] text-[15px] font-extrabold text-white shadow-button transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-brand-dark"
        onClick={onCalculate}
        type="button"
      >
        Calcular
      </button>
      <button
        className="grid h-[43px] w-[43px] place-items-center rounded-full border border-line-soft bg-white text-brand hover:bg-brand-tint"
        onClick={onClear}
        type="button"
        aria-label="Limpiar formulario"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export type CalculationResult = {
  /** Variable calculada, p. ej. "Valor futuro (F)". */
  label: string;
  value: string;
  details?: string[];
};

export function ResultPanel({ result, error }: { result: CalculationResult | null; error: string | null }) {
  return (
    <div className="border-t border-line-rule pt-[18px] sm:pt-[19px]" aria-live="polite">
      {error ? (
        <p className="rounded-[9px] border border-brand/30 bg-brand-tint px-3 py-2.5 text-center text-sm font-semibold text-brand-dark" role="alert">
          {error}
        </p>
      ) : (
        <>
          <div className={gridRow}>
            <strong className="text-sm text-ink sm:text-right sm:text-base">{result?.label ?? 'Resultado'}</strong>
            <div className="flex min-h-10 w-full items-center justify-end border border-line-result px-[13px] py-1.5 text-right text-brand-result">
              <output className="text-base font-extrabold">{result?.value ?? '—'}</output>
            </div>
          </div>
          {result?.details?.map((detail) => (
            <p className="mt-[7px] text-center text-[11px] text-ink-muted" key={detail}>
              {detail}
            </p>
          ))}
        </>
      )}
    </div>
  );
}
