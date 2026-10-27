import { useState } from 'react';
import { convertRate, EFFECTIVE_ANNUAL, INDICATOR_RATES, indexRate } from '@/lib/finance';
import type { Indicator, RateSpec } from '@/lib/finance';
import { describeRate, formatRate } from '@/lib/format';
import { CalculatorActions, Field, Hint, NumberInput, ResultPanel, SectionTitle, Select } from '@/components/form';
import type { CalculationResult } from '@/components/form';
import { RateSpecFields } from '@/components/RateSpecFields';
import { errorMessage, readRate } from './inputs';

const indicators: { value: Indicator; label: string; procedure: string }[] = [
  { value: 'DTF', label: 'DTF', procedure: 'La DTF se publica E.A.: se convierte a N.T.A. y se le suman los puntos.' },
  { value: 'IBR', label: 'IBR', procedure: 'La IBR se publica N.M.V.: se le suman los puntos directamente.' },
  { value: 'IPC', label: 'IPC', procedure: 'Se componen las tasas: (1 + IPC)(1 + puntos) − 1, resultado E.A.' },
];

const defaults: Record<Indicator, { indicator: string; spread: string }> = {
  DTF: { indicator: '9', spread: '4' },
  IBR: { indicator: '10', spread: '2' },
  IPC: { indicator: '5', spread: '6' },
};

export function IndexationCalculator() {
  const [indicator, setIndicator] = useState<Indicator>('DTF');
  const [indicatorRate, setIndicatorRate] = useState(defaults.DTF.indicator);
  const [spread, setSpread] = useState(defaults.DTF.spread);
  const [to, setTo] = useState<RateSpec>(EFFECTIVE_ANNUAL);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const specs = INDICATOR_RATES[indicator];
  const info = indicators.find((item) => item.value === indicator) ?? indicators[0];
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
      const spreadRate = readRate(spread, 'Puntos adicionales');
      const indexed = indexRate(indicator, readRate(indicatorRate, indicatorLabel), spreadRate);
      const converted = convertRate(indexed.value, indexed.spec, to);
      const indexedText = `${formatRate(indexed.value)} ${describeRate(indexed.spec)}`;
      const details = [
        indicator === 'DTF' || indicator === 'IBR'
          ? `Tasa indexada: ${formatRate(indexed.indicatorValue)} + ${formatRate(spreadRate)} = ${indexedText}`
          : `Tasa indexada: (1 + ${formatRate(indexed.indicatorValue)})(1 + ${formatRate(spreadRate)}) − 1 = ${indexedText}`,
      ];
      if (describeRate(to) !== 'E.A.') {
        details.push(`Equivalente: ${formatRate(convertRate(indexed.value, indexed.spec, EFFECTIVE_ANNUAL))} E.A.`);
      }
      setResult({ label: 'Tasa resultante', value: `${formatRate(converted)} ${describeRate(to)}`, details });
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
        <Hint>{info.procedure}</Hint>
        <Field label={indicatorLabel}>
          <NumberInput value={indicatorRate} onChange={setIndicatorRate} suffix={`% ${describeRate(specs.indicator)}`} />
        </Field>
        <Field label="Puntos adicionales">
          <NumberInput value={spread} onChange={setSpread} suffix={`% ${describeRate(specs.spread)}`} />
        </Field>
        <SectionTitle>Tasa deseada</SectionTitle>
        <RateSpecFields spec={to} onChange={setTo} suffix="deseada" />
      </div>

      <CalculatorActions onCalculate={calculate} onClear={clearForm} />
      <ResultPanel result={result} error={error} />
    </>
  );
}
