import { useState } from 'react';
import { toEffectiveAnnual } from '@/lib/finance';
import type { Periodicity } from '@/lib/finance';
import { describeRate, formatMoney, formatNumber, formatRate, PERIODICITIES, periodicityInfo } from '@/lib/format';
import { CalculatorActions, Field, Hint, NumberInput, ResultPanel, Select } from '@/components/form';
import type { CalculationResult } from '@/components/form';
import { errorMessage, readNumber, readRate } from './inputs';
import { DEFAULT_PERIODICITY, VARIABLES } from './modules';
import type { SolveForModule, Unknown, Variable } from './modules';

const basisOptions: { value: 'P' | 'F'; label: string }[] = [
  { value: 'P', label: 'Valor presente (P)' },
  { value: 'F', label: 'Valor futuro (F)' },
];

/** Las incógnitas con `basis` comparten opción en el selector (p. ej. A desde P y A desde F). */
const groupOf = (unknown: Unknown) => (unknown.basis ? unknown.result : unknown.id);

function describeResult(variable: Variable, label: string, value: number, periodicity: Periodicity): CalculationResult {
  const { unit } = VARIABLES[variable];

  if (unit === 'rate') {
    const spec = { kind: 'periodica', periodicity, modality: 'vencida' } as const;
    const details = periodicity === 'annual' ? [] : [`Equivalente: ${formatRate(toEffectiveAnnual(value, spec))} E.A.`];
    return { label, value: `${formatRate(value)} ${describeRate(spec)}`, details };
  }

  if (unit === 'periods') {
    // Se muestra redondeado al entero más cercano; el valor exacto va debajo en letra pequeña.
    const { unit: periodUnit } = periodicityInfo(periodicity);
    const isWhole = Math.abs(value - Math.round(value)) < 1e-6;
    const details = isWhole ? [] : [`Valor exacto: ${formatNumber(value)} ${periodUnit}`];
    return { label, value: `${formatNumber(Math.round(value), 0)} ${periodUnit}`, details };
  }

  return { label, value: formatMoney(value) };
}

export function SolveForCalculator({ module }: { module: SolveForModule }) {
  const [groupId, setGroupId] = useState(groupOf(module.unknowns[0]));
  const [basis, setBasis] = useState<'P' | 'F'>('P');
  const [periodicity, setPeriodicity] = useState<Periodicity>(DEFAULT_PERIODICITY);
  const [values, setValues] = useState(module.defaults);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labelOf = (key: Variable) => module.labels?.[key] ?? VARIABLES[key].label;

  const groups = module.unknowns
    .filter((item, index, all) => all.findIndex((other) => groupOf(other) === groupOf(item)) === index)
    .map((item) => ({ value: groupOf(item), label: item.basis ? labelOf(item.result) : item.label }));
  const candidates = module.unknowns.filter((item) => groupOf(item) === groupId);
  const unknown = candidates.find((item) => item.basis === basis) ?? candidates[0] ?? module.unknowns[0];
  const period = periodicityInfo(periodicity);

  const resetOutput = () => {
    setResult(null);
    setError(null);
  };

  const calculate = () => {
    try {
      const parsed = {} as Record<Variable, number>;
      for (const key of unknown.inputs) {
        const label = labelOf(key);
        const { unit } = VARIABLES[key];
        const raw = values[key] ?? '';
        parsed[key] = unit === 'rate' ? readRate(raw, label) : readNumber(raw, label);
      }
      setResult(describeResult(unknown.result, labelOf(unknown.result), unknown.solve(parsed), periodicity));
      setError(null);
    } catch (caught) {
      setResult(null);
      setError(errorMessage(caught));
    }
  };

  const clearForm = () => {
    setValues({});
    resetOutput();
  };

  return (
    <>
      <div className="grid gap-[13px]">
        <Field label="Variable a calcular">
          <Select
            value={groupId}
            onChange={(id) => {
              setGroupId(id);
              resetOutput();
            }}
            options={groups}
          />
        </Field>
        {candidates.length > 1 && (
          <Field label="Calcular a partir de">
            <Select
              value={basis}
              onChange={(value) => {
                setBasis(value);
                resetOutput();
              }}
              options={basisOptions}
            />
          </Field>
        )}
        <Field label={module.periodLabel}>
          <Select
            value={periodicity}
            onChange={(value) => {
              setPeriodicity(value);
              resetOutput();
            }}
            options={PERIODICITIES}
          />
        </Field>
        {module.note && (
          <Hint>
            {module.note} Si la tasa es nominal o anticipada, conviértela primero en «Conversión de Tasas».
          </Hint>
        )}

        {unknown.inputs.map((key) => {
          const label = labelOf(key);
          const { unit } = VARIABLES[key];
          return (
            <Field key={key} label={label}>
              <NumberInput
                value={values[key] ?? ''}
                onChange={(value) => setValues((current) => ({ ...current, [key]: value }))}
                prefix={unit === 'money' ? '$' : undefined}
                suffix={unit === 'rate' ? `% ${period.adjective}` : unit === 'periods' ? period.unit : undefined}
              />
            </Field>
          );
        })}
      </div>

      <CalculatorActions onCalculate={calculate} onClear={clearForm} />
      <ResultPanel result={result} error={error} />
    </>
  );
}
