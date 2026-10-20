import { useState } from 'react';
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
  iconTone: string;
};

const calculators: Calculator[] = [
  { id: 'compound', label: 'Interés Compuesto', icon: DollarSign, tone: 'mint', iconTone: 'green' },
  { id: 'rates', label: 'Conversión de Tasas', icon: ArrowLeftRight, tone: 'rose', iconTone: 'red' },
  { id: 'index', label: 'Indexación Tasas', icon: ArrowUpRight, tone: 'cyan', iconTone: 'blue' },
  { id: 'due', label: 'Anualidad Vencida', icon: CalendarDays, tone: 'amber', iconTone: 'orange' },
  { id: 'advance', label: 'Anualidad Anticipada', icon: Clock3, tone: 'indigo', iconTone: 'indigo' },
  { id: 'perpetual', label: 'Anualidad Perpetua', icon: Infinity, tone: 'lilac', iconTone: 'purple' },
];

const periods = [
  { value: 'monthly', label: 'Mensual (12/año)', count: 12 },
  { value: 'quarterly', label: 'Trimestral (4/año)', count: 4 },
  { value: 'semiannual', label: 'Semestral (2/año)', count: 2 },
  { value: 'annual', label: 'Anual (1/año)', count: 1 },
];

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
    <main className="app-shell">
      <div className="page-wrap">
        <header className="topbar">
          <div>
            <h1>calculadora ingeneria economica</h1>
          </div>
        </header>

        <nav className="calculator-nav" aria-label="Calculadoras disponibles">
          {calculators.map(({ id, label, icon: Icon, tone, iconTone }) => (
            <button
              className={`calculator-card ${activeCalculator === id ? 'selected' : ''}`}
              key={id}
              onClick={() => setActiveCalculator(id)}
              type="button"
            >
              <span className={`card-icon ${tone} ${iconTone}`}><Icon size={31} strokeWidth={2.2} /></span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="calculator-panel" aria-label={activeLabel}>
            <div className="panel-heading">{activeLabel}</div>
            <div className="panel-body">
              <div className="form-grid">
                <label className="field-row">
                  <span>Tipo de conversión</span>
                  <select value={conversion} onChange={(event) => setConversion(event.target.value)}>
                    <option value="nominal">Nominal a Efectiva</option>
                    <option value="effective">Efectiva a Nominal</option>
                  </select>
                </label>
                <label className="field-row">
                  <span>Tasa de interés</span>
                  <div className="input-with-suffix"><input value={rate} onChange={(event) => setRate(event.target.value)} inputMode="decimal" /><b>%</b></div>
                </label>
                <label className="field-row">
                  <span>Periodicidad origen</span>
                  <select value={origin} onChange={(event) => setOrigin(event.target.value)}>
                    {periods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
                  </select>
                </label>
                <label className="field-row">
                  <span>Modalidad</span>
                  <select value={modality} onChange={(event) => setModality(event.target.value)}>
                    <option value="due">Vencida</option>
                    <option value="advance">Anticipada</option>
                  </select>
                </label>
                <label className="field-row">
                  <span>Periodicidad deseada</span>
                  <select value={target} onChange={(event) => setTarget(event.target.value)}>
                    <option value="effective">Efectiva Anual (E.A.)</option>
                    <option value="monthly">Mensual (12/año)</option>
                    <option value="quarterly">Trimestral (4/año)</option>
                  </select>
                </label>
                <label className="field-row">
                  <span>Factor inflación</span>
                  <div className="input-with-suffix"><input value={inflation} onChange={(event) => setInflation(event.target.value)} inputMode="decimal" /><b>%</b></div>
                </label>
              </div>

              <div className="actions">
                <button className="calculate-button" onClick={calculate} type="button">Calcular</button>
                <button className="clear-button" onClick={clearForm} type="button" aria-label="Limpiar formulario"><Trash2 size={18} /></button>
              </div>

              <div className="result-area">
                <div className="result-row"><strong>Tasa Resultante</strong><div className="result-value"><output>{result.toFixed(4)}</output><b>%</b></div></div>
                <p>Equivalente: {result.toFixed(4)}% Efectiva Anual (E.A.)</p>
              </div>
            </div>
        </section>
      </div>
    </main>
  );
}

export default App;
