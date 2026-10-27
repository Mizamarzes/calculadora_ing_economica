import type { Modality, RateKind, RateSpec } from '@/lib/finance';
import { PERIODICITIES } from '@/lib/format';
import { Field, Select } from './form';

const kindOptions: { value: RateKind; label: string }[] = [
  { value: 'nominal', label: 'Interés nominal (iₙ)' },
  { value: 'periodica', label: 'Interés periódico (iₚ)' },
  { value: 'efectiva', label: 'Interés efectivo anual (iₑₐ)' },
];

const modalityOptions: { value: Modality; label: string }[] = [
  { value: 'vencida', label: 'Vencida' },
  { value: 'anticipada', label: 'Anticipada' },
];

/**
 * Selectores de tipo, periodicidad y modalidad de una tasa. `suffix` completa la etiqueta ("origen", "deseada").
 * La efectiva anual no pide periodicidad ni modalidad.
 */
export function RateSpecFields({
  spec,
  onChange,
  suffix,
}: {
  spec: RateSpec;
  onChange: (spec: RateSpec) => void;
  suffix: string;
}) {
  return (
    <>
      <Field label={`Tipo de tasa ${suffix}`}>
        <Select value={spec.kind} onChange={(kind) => onChange({ ...spec, kind })} options={kindOptions} />
      </Field>
      {spec.kind !== 'efectiva' && (
        <>
          <Field label={`Periodicidad ${suffix}`}>
            <Select value={spec.periodicity} onChange={(periodicity) => onChange({ ...spec, periodicity })} options={PERIODICITIES} />
          </Field>
          <Field label={`Modalidad ${suffix}`}>
            <Select value={spec.modality} onChange={(modality) => onChange({ ...spec, modality })} options={modalityOptions} />
          </Field>
        </>
      )}
    </>
  );
}
