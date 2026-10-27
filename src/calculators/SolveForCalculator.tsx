import { useState } from 'react';
import { toEffectiveAnnual } from '@/lib/finance';
import type { Periodicity } from '@/lib/finance';
import { describeRate, formatMoney, formatNumber, formatRate, PERIODICITIES, periodicityInfo } from '@/lib/format';
import { CalculatorActions, Field, Hint, NumberInput, ResultPanel, Select } from '@/components/form';
import type { CalculationResult } from '@/components/form';
import { errorMessage, readNumber, readRate } from './inputs';
import { DEFAULT_PERIODICITY, VARIABLES } from './modules';
import type { SolveForModule, Variable } from './modules';

function describeResult(variable: Variable, value: number, periodicity: Periodicity): CalculationResult {
  const { label, unit } = VARIABLES[variable];

  if (unit === 'rate') {
    const spec = { kind: 'periodica', periodicity, modality: 'vencida' } as const;
    const details = periodicity === 'annual' ? [] : [`Equivalente: ${formatRate(toEffectiveAnnual(value, spec))} E.A.`];
    return { label, value: `${formatRate(value)} ${describeRate(spec)}`, details };
  }

  if (unit === 'periods') {
    const isWhole = Math.abs(value - Math.round(value)) < 1e-6;
    const details = isWhole ? [] : ['El resultado no es un número entero de periodos.'];
    return { label, value: `${formatNumber(value)} ${periodicityInfo(periodicity).unit}`, details };
  }

  return { label, value: formatMoney(value) };
}

export function SolveForCalculator({ module }: { module: SolveForModule }) {
  const [unknownId, setUnknownId] = useState(module.unknowns[0].id);
  const [periodicity, setPeriodicity] = useState<Periodicity>(DEFAULT_PERIODICITY);
  const [values, setValues] = useState(module.defaults);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unknown = module.unknowns.find((item) => item.id === unknownId) ?? module.unknowns[0];
  const period = periodicityInfo(periodicity);

  const resetOutput = () => {
    setResult(null);
    setError(null);
  };

  const calculate = () => {
    try {
      const parsed = {} as Record<Variable, number>;
      for (const key of unknown.inputs) {
        const { label, unit } = VARIABLES[key];
        const raw = values[key] ?? '';
        parsed[key] = unit === 'rate' ? readRate(raw, label) : readNumber(raw, label);
      }
      setResult(describeResult(unknown.result, unknown.solve(parsed), periodicity));
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
            value={unknownId}
            onChange={(id) => {
              setUnknownId(id);
              resetOutput();
            }}
            options={module.unknowns.map(({ id, label }) => ({ value: id, label }))}
          />
        </Field>
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
          const { label, unit } = VARIABLES[key];
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
