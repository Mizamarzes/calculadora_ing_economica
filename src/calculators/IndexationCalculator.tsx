import { useState } from 'react';
import { INDICATOR_RATES, indexRate } from '@/lib/finance';
import type { Indicator } from '@/lib/finance';
import { describeRate, formatRate } from '@/lib/format';
import { CalculatorActions, Field, NumberInput, ResultPanel, Select } from '@/components/form';
import type { CalculationResult } from '@/components/form';
import { errorMessage, readRate } from './inputs';

const indicators: { value: Indicator; label: string }[] = [
  { value: 'DTF', label: 'DTF' },
  { value: 'IBR', label: 'IBR' },
  { value: 'IPC', label: 'IPC' },
  { value: 'UVR', label: 'UVR' },
];

const defaults: Record<Indicator, { indicator: string; spread: string }> = {
  DTF: { indicator: '9', spread: '4' },
  IBR: { indicator: '10', spread: '2' },
  IPC: { indicator: '5', spread: '6' },
  UVR: { indicator: '5', spread: '6' },
};

export function IndexationCalculator() {
  const [indicator, setIndicator] = useState<Indicator>('DTF');
  const [indicatorRate, setIndicatorRate] = useState(defaults.DTF.indicator);
  const [spread, setSpread] = useState(defaults.DTF.spread);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const specs = INDICATOR_RATES[indicator];
  const indicatorLabel = `Valor ${indicator}`;

  const changeIndicator = (value: Indicator) => {
    setIndicator(value);
    setIndicatorRate(defaults[value].indicator);
    setSpread(defaults[value].spread);
    setResult(null);
    setError(null);
  };

  const calculate = () => {
    try {
      const indexed = indexRate(indicator, readRate(indicatorRate, indicatorLabel), readRate(spread, 'Spread'));
      setResult({ label: <>Tasa indexada (i<sub>DX</sub>)</>, value: `${formatRate(indexed.value, 2)} ${describeRate(indexed.spec)}` });
      setError(null);
    } catch (caught) {
      setResult(null);
      setError(errorMessage(caught));
    }
  };

  const clearForm = () => {
    setIndicatorRate('');
    setSpread('');
    setResult(null);
    setError(null);
  };

  return (
    <>
      <div className="grid gap-[13px]">
        <Field label="Indicador">
          <Select value={indicator} onChange={changeIndicator} options={indicators} />
        </Field>
        <Field label={indicatorLabel}>
          <NumberInput value={indicatorRate} onChange={setIndicatorRate} suffix={`% ${describeRate(specs.indicator)}`} />
        </Field>
        <Field label="Spread">
          <NumberInput value={spread} onChange={setSpread} suffix={`% ${describeRate(specs.spread)}`} />
        </Field>
      </div>

      <CalculatorActions onCalculate={calculate} onClear={clearForm} />
      <ResultPanel result={result} error={error} />
    </>
  );
}
