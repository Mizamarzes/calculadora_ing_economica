import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  DollarSign,
  Infinity,
  Trash2,
} from 'lucide-react';

type Calculator = {
  id: string;
  label: string;
  icon: typeof DollarSign;
  tone: string;
};

const calculators: Calculator[] = [
  { id: 'compound', label: 'Interés Compuesto', icon: DollarSign, tone: 'bg-tone-mint text-icon-green' },
  { id: 'rates', label: 'Conversión de Tasas', icon: ArrowLeftRight, tone: 'bg-tone-rose text-icon-red' },
  { id: 'index', label: 'Indexación Tasas', icon: ArrowUpRight, tone: 'bg-tone-cyan text-icon-blue' },
  { id: 'due', label: 'Anualidad Vencida', icon: CalendarDays, tone: 'bg-tone-amber text-icon-orange' },
  { id: 'advance', label: 'Anualidad Anticipada', icon: Clock3, tone: 'bg-tone-indigo text-icon-indigo' },
  { id: 'perpetual', label: 'Anualidad Perpetua', icon: Infinity, tone: 'bg-tone-lilac text-icon-purple' },
];

const periods = [
  { value: 'monthly', label: 'Mensual (12/año)', count: 12 },
  { value: 'quarterly', label: 'Trimestral (4/año)', count: 4 },
  { value: 'semiannual', label: 'Semestral (2/año)', count: 2 },
  { value: 'annual', label: 'Anual (1/año)', count: 1 },
];

const gridRow = 'grid items-center gap-1.5 sm:grid-cols-[236px_minmax(0,1fr)] sm:gap-2.5';
const control = 'h-[37px] rounded-[9px] border border-line-field bg-white text-ink-field outline-none transition-[border-color,box-shadow] duration-150';
const selectClass = `${control} w-full appearance-auto px-3 focus:border-brand-ring focus:ring-[3px] focus:ring-brand-ring/[.11]`;
const suffixClass = `${control} flex items-center overflow-hidden focus-within:border-brand-ring focus-within:ring-[3px] focus-within:ring-brand-ring/[.11]`;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={`${gridRow} text-sm text-ink-label sm:text-base`}>
      <span className="sm:text-right">{label}</span>
      {children}
    </label>
  );
}

function App() {
  const [activeCalculator, setActiveCalculator] = useState('rates');
  const [conversion, setConversion] = useState('nominal');
  const [rate, setRate] = useState('24.0');
  const [origin, setOrigin] = useState('monthly');
  const [modality, setModality] = useState('due');
  const [target, setTarget] = useState('effective');
  const [inflation, setInflation] = useState('0.0');
  const [result, setResult] = useState(26.8242);

  const calculate = () => {
    const enteredRate = Number(rate) || 0;
    const inflationRate = Number(inflation) || 0;
    const originCount = periods.find((period) => period.value === origin)?.count ?? 12;
    const targetCount = target === 'effective' ? 1 : target === 'monthly' ? 12 : 4;
    let calculatedRate = enteredRate;

    if (conversion === 'nominal') {
      calculatedRate = (Math.pow(1 + enteredRate / 100 / originCount, originCount / targetCount) - 1) * 100;
    } else {
      calculatedRate = (Math.pow(1 + enteredRate / 100, targetCount / originCount) - 1) * 100;
    }

    calculatedRate = calculatedRate * (1 + inflationRate / 100);
    setResult(Number(calculatedRate.toFixed(4)));
  };

  const clearForm = () => {
    setRate('0.0');
    setInflation('0.0');
    setResult(0);
  };

  const activeLabel = calculators.find((calculator) => calculator.id === activeCalculator)?.label ?? 'Conversión de Tasas';

  return (
    <main className="min-h-screen bg-page px-4 pb-12 pt-7 sm:px-7 sm:pb-[76px] sm:pt-[43px]">
      <div className="mx-auto w-[min(100%,972px)]">
        <header className="flex items-center justify-center text-center">
          <div>
            <h1 className="text-[28px] font-extrabold leading-[1.05] tracking-[-0.055em] text-ink-heading sm:text-[clamp(29px,3.1vw,36px)]">
              calculadora ingeneria economica
            </h1>
          </div>
        </header>

        <nav
          className="mt-[38px] grid grid-cols-2 gap-[10px] sm:mt-[55px] sm:grid-cols-3 sm:gap-[14px] md:grid-cols-6"
          aria-label="Calculadoras disponibles"
        >
          {calculators.map(({ id, label, icon: Icon, tone }) => (
            <button
              className={`relative flex min-h-[128px] flex-col items-center justify-center gap-3 rounded-[14px] bg-white px-2 pb-3 pt-4 text-center text-[13px] font-[750] leading-[1.24] transition-[transform,box-shadow,border-color] duration-[180ms] ease-out hover:-translate-y-[3px] hover:shadow-card-hover sm:min-h-[141px] ${
                activeCalculator === id
                  ? 'border-2 border-brand-selected text-brand-text shadow-selected'
                  : 'border border-line text-ink shadow-card'
              }`}
              key={id}
              onClick={() => setActiveCalculator(id)}
              type="button"
            >
              <span className={`grid h-[61px] w-[61px] place-items-center rounded-full ${tone}`}>
                <Icon size={31} strokeWidth={2.2} />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section
          className="mx-auto mt-8 w-[min(100%,638px)] overflow-hidden rounded-[14px] border border-line-panel bg-white shadow-panel sm:mt-[45px]"
          aria-label={activeLabel}
        >
          <div className="bg-brand-heading px-6 py-[13px] text-center text-xl font-extrabold text-white">{activeLabel}</div>
          <div className="px-[18px] py-6 sm:px-[31px] sm:pb-[27px] sm:pt-[29px]">
            <div className="grid gap-[13px]">
              <Field label="Tipo de conversión">
                <select className={selectClass} value={conversion} onChange={(event) => setConversion(event.target.value)}>
                  <option value="nominal">Nominal a Efectiva</option>
                  <option value="effective">Efectiva a Nominal</option>
                </select>
              </Field>
              <Field label="Tasa de interés">
                <div className={suffixClass}>
                  <input
                    className="h-full w-full min-w-0 border-0 px-[13px] text-right text-ink-field outline-none"
                    value={rate}
                    onChange={(event) => setRate(event.target.value)}
                    inputMode="decimal"
                  />
                  <b className="pr-[13px] text-base text-ink-suffix">%</b>
                </div>
              </Field>
              <Field label="Periodicidad origen">
                <select className={selectClass} value={origin} onChange={(event) => setOrigin(event.target.value)}>
                  {periods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
                </select>
              </Field>
              <Field label="Modalidad">
                <select className={selectClass} value={modality} onChange={(event) => setModality(event.target.value)}>
                  <option value="due">Vencida</option>
                  <option value="advance">Anticipada</option>
                </select>
              </Field>
              <Field label="Periodicidad deseada">
                <select className={selectClass} value={target} onChange={(event) => setTarget(event.target.value)}>
                  <option value="effective">Efectiva Anual (E.A.)</option>
                  <option value="monthly">Mensual (12/año)</option>
                  <option value="quarterly">Trimestral (4/año)</option>
                </select>
              </Field>
              <Field label="Factor inflación">
                <div className={suffixClass}>
                  <input
                    className="h-full w-full min-w-0 border-0 px-[13px] text-right text-ink-field outline-none"
                    value={inflation}
                    onChange={(event) => setInflation(event.target.value)}
                    inputMode="decimal"
                  />
                  <b className="pr-[13px] text-base text-ink-suffix">%</b>
                </div>
              </Field>
            </div>

            <div className="mb-[17px] mt-[35px] flex items-center justify-center gap-3">
              <button
                className="h-[43px] rounded-3xl bg-brand px-[30px] text-[15px] font-extrabold text-white shadow-button transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-brand-dark"
                onClick={calculate}
                type="button"
              >
                Calcular
              </button>
              <button
                className="grid h-[43px] w-[43px] place-items-center rounded-full border border-line-soft bg-white text-brand hover:bg-brand-tint"
                onClick={clearForm}
                type="button"
                aria-label="Limpiar formulario"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="border-t border-line-rule pt-[18px] sm:pt-[19px]">
              <div className={gridRow}>
                <strong className="text-sm text-ink sm:text-right sm:text-base">Tasa Resultante</strong>
                <div className="flex h-10 w-full items-center justify-end border border-line-result text-brand-result">
                  <output className="pr-2.5 text-base font-extrabold">{result.toFixed(4)}</output>
                  <b className="pr-[13px] text-base font-extrabold text-brand-result">%</b>
                </div>
              </div>
              <p className="mt-[7px] text-center text-[11px] text-ink-muted">
                Equivalente: {result.toFixed(4)}% Efectiva Anual (E.A.)
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
