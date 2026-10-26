import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  DollarSign,
  Infinity,
} from 'lucide-react';
import { IndexationCalculator } from '@/calculators/IndexationCalculator';
import { annuityDueModule, compoundModule, ordinaryAnnuityModule, perpetuityModule } from '@/calculators/modules';
import { RateConversionCalculator } from '@/calculators/RateConversionCalculator';
import { SolveForCalculator } from '@/calculators/SolveForCalculator';

type Calculator = {
  id: string;
  label: string;
  icon: typeof DollarSign;
  tone: string;
  render: () => ReactNode;
};

const calculators: Calculator[] = [
  { id: 'compound', label: 'Interés Compuesto', icon: DollarSign, tone: 'bg-tone-mint text-icon-green', render: () => <SolveForCalculator module={compoundModule} /> },
  { id: 'rates', label: 'Conversión de Tasas', icon: ArrowLeftRight, tone: 'bg-tone-rose text-icon-red', render: () => <RateConversionCalculator /> },
  { id: 'index', label: 'Indexación Tasas', icon: ArrowUpRight, tone: 'bg-tone-cyan text-icon-blue', render: () => <IndexationCalculator /> },
  { id: 'ordinary', label: 'Anualidad Vencida', icon: CalendarDays, tone: 'bg-tone-amber text-icon-orange', render: () => <SolveForCalculator module={ordinaryAnnuityModule} /> },
  { id: 'advance', label: 'Anualidad Anticipada', icon: Clock3, tone: 'bg-tone-indigo text-icon-indigo', render: () => <SolveForCalculator module={annuityDueModule} /> },
  { id: 'perpetual', label: 'Anualidad Perpetua', icon: Infinity, tone: 'bg-tone-lilac text-icon-purple', render: () => <SolveForCalculator module={perpetuityModule} /> },
];

function App() {
  const [activeCalculator, setActiveCalculator] = useState('compound');

  const active = calculators.find((calculator) => calculator.id === activeCalculator) ?? calculators[0];

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
              aria-pressed={activeCalculator === id}
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
          aria-label={active.label}
        >
          <div className="bg-brand-heading px-6 py-[13px] text-center text-xl font-extrabold text-white">{active.label}</div>
          <div className="px-[18px] py-6 sm:px-[31px] sm:pb-[27px] sm:pt-[29px]" key={active.id}>
            {active.render()}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
