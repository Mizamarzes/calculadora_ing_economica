import type { Periodicity, RateSpec } from './finance';

export const PERIODICITIES: { value: Periodicity; label: string; adjective: string; letter: string; unit: string }[] = [
  { value: 'monthly', label: 'Mensual (12/año)', adjective: 'mensual', letter: 'M', unit: 'meses' },
  { value: 'bimonthly', label: 'Bimestral (6/año)', adjective: 'bimestral', letter: 'B', unit: 'bimestres' },
  { value: 'quarterly', label: 'Trimestral (4/año)', adjective: 'trimestral', letter: 'T', unit: 'trimestres' },
  { value: 'fourMonthly', label: 'Cuatrimestral (3/año)', adjective: 'cuatrimestral', letter: 'C', unit: 'cuatrimestres' },
  { value: 'semiannual', label: 'Semestral (2/año)', adjective: 'semestral', letter: 'S', unit: 'semestres' },
  { value: 'annual', label: 'Anual (1/año)', adjective: 'anual', letter: 'A', unit: 'años' },
];

export function periodicityInfo(periodicity: Periodicity) {
  return PERIODICITIES.find((item) => item.value === periodicity) ?? PERIODICITIES[0];
}

/** Ej.: "E.A.", "N.M.V.", "N.T.A.", "efectiva mensual", "mensual anticipada". */
export function describeRate({ kind, periodicity, modality }: RateSpec) {
  if (periodicity === 'annual') return modality === 'vencida' ? 'E.A.' : 'anual anticipada';
  const { letter, adjective } = periodicityInfo(periodicity);
  if (kind === 'nominal') return `N.${letter}.${modality === 'vencida' ? 'V' : 'A'}.`;
  return modality === 'vencida' ? `efectiva ${adjective}` : `${adjective} anticipada`;
}

/**
 * Acepta coma o punto como separador decimal ("1500,5" o "1500.5").
 * Si aparecen ambos, el último es el decimal ("1.000.000,50").
 */
export function parseNumber(raw: string): number | null {
  let text = raw.replace(/[\s$%]/g, '');
  if (!text) return null;

  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');
  const commas = text.split(',').length - 1;
  const dots = text.split('.').length - 1;

  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.';
    const thousands = decimal === ',' ? '.' : ',';
    text = text.split(thousands).join('').replace(decimal, '.');
  } else if (commas > 1 || dots > 1) {
    text = text.replace(/[.,]/g, '');
  } else {
    text = text.replace(',', '.');
  }

  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
}

const numberFormat = (decimals: number) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const moneyFormat = numberFormat(2);
const rateFormat = numberFormat(4);

export function formatMoney(value: number) {
  return `$ ${moneyFormat.format(value)}`;
}

/** Recibe la tasa en decimal y la muestra en porcentaje con 4 decimales. */
export function formatRate(value: number) {
  return `${rateFormat.format(value * 100)} %`;
}

export function formatNumber(value: number, decimals = 4) {
  return numberFormat(decimals).format(value);
}
