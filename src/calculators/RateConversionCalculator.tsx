import { useState } from 'react';
import { convertRate, EFFECTIVE_ANNUAL, toEffectiveAnnual } from '@/lib/finance';
import type { RateSpec } from '@/lib/finance';
import { describeRate, formatRate } from '@/lib/format';
import { CalculatorActions, Field, NumberInput, ResultPanel, SectionTitle } from '@/components/form';
import type { CalculationResult } from '@/components/form';
import { RateSpecFields } from '@/components/RateSpecFields';
import { errorMessage, readRate } from './inputs';

export function RateConversionCalculator() {
  const [rate, setRate] = useState('24');
  const [from, setFrom] = useState<RateSpec>({ kind: 'nominal', periodicity: 'monthly', modality: 'vencida' });
  const [to, setTo] = useState<RateSpec>(EFFECTIVE_ANNUAL);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    try {
      const value = readRate(rate, 'Tasa de interés');
      const converted = convertRate(value, from, to);
      const details = describeRate(to) === 'E.A.' ? [] : [`Equivalente: ${formatRate(toEffectiveAnnual(value, from))} E.A.`];
      setResult({ label: 'Tasa resultante', value: `${formatRate(converted, 2)} ${describeRate(to)}`, details });
      setError(null);
    } catch (caught) {
      setResult(null);
      setError(errorMessage(caught));
    }
  };

  const clearForm = () => {
    setRate('');
    setResult(null);
    setError(null);
  };

  return (
    <>
      <div className="grid gap-[13px]">
        <SectionTitle>Tasa de origen</SectionTitle>
        <Field label="Tasa de interés">
          <NumberInput value={rate} onChange={setRate} suffix={`% ${describeRate(from)}`} />
        </Field>
        <RateSpecFields spec={from} onChange={setFrom} suffix="origen" />
        <SectionTitle>Tasa deseada</SectionTitle>
        <RateSpecFields spec={to} onChange={setTo} suffix="deseada" />
      </div>

      <CalculatorActions onCalculate={calculate} onClear={clearForm} />
      <ResultPanel result={result} error={error} />
    </>
  );
}
