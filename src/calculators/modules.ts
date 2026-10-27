import * as finance from '@/lib/finance';
import type { Periodicity } from '@/lib/finance';

export type Unit = 'money' | 'rate' | 'periods';
export type Variable = 'P' | 'F' | 'A' | 'i' | 'n';

export const VARIABLES: Record<Variable, { label: string; unit: Unit }> = {
  P: { label: 'Valor presente (P)', unit: 'money' },
  F: { label: 'Valor futuro (F)', unit: 'money' },
  A: { label: 'Cuota (A)', unit: 'money' },
  i: { label: 'Tasa de interés (i)', unit: 'rate' },
  n: { label: 'Número de periodos (n)', unit: 'periods' },
};

export type Unknown = {
  id: string;
  /** Texto del selector "Variable a calcular". */
  label: string;
  result: Variable;
  /**
   * Para A y n de anualidades: si se despeja desde el valor presente o el futuro.
   * Las incógnitas con `basis` se agrupan en una sola opción y la calculadora pregunta P o F aparte.
   */
  basis?: 'P' | 'F';
  inputs: Variable[];
  /** Recibe las tasas en decimal. */
  solve: (values: Record<Variable, number>) => number;
};

/** Módulo en el que el usuario elige qué variable despejar (interés compuesto, anualidades, perpetuidad). */
export type SolveForModule = {
  unknowns: Unknown[];
  defaults: Partial<Record<Variable, string>>;
  /** Etiqueta del selector de periodicidad, que fija la unidad de la tasa y de n. */
  periodLabel: string;
  /** Etiquetas propias del módulo; reemplazan las de `VARIABLES`. */
  labels?: Partial<Record<Variable, string>>;
  /** Tasa resultante con 2 decimales y unidad abreviada (E.M., E.T., …) en vez de 4 decimales y "efectiva mensual". */
  shortRate?: boolean;
};

export const DEFAULT_PERIODICITY: Periodicity = 'monthly';

export const compoundModule: SolveForModule = {
  periodLabel: 'Periodicidad',
  defaults: { P: '1000000', F: '1268241,79', i: '2', n: '12' },
  unknowns: [
    { id: 'F', label: 'Valor futuro (F)', result: 'F', inputs: ['P', 'i', 'n'], solve: (v) => finance.compoundFutureValue(v.P, v.i, v.n) },
    { id: 'P', label: 'Valor presente (P)', result: 'P', inputs: ['F', 'i', 'n'], solve: (v) => finance.compoundPresentValue(v.F, v.i, v.n) },
    { id: 'i', label: 'Tasa de interés (i)', result: 'i', inputs: ['P', 'F', 'n'], solve: (v) => finance.compoundRate(v.P, v.F, v.n) },
    { id: 'n', label: 'Número de periodos (n)', result: 'n', inputs: ['P', 'F', 'i'], solve: (v) => finance.compoundPeriods(v.P, v.F, v.i) },
  ],
};

export const ordinaryAnnuityModule: SolveForModule = {
  periodLabel: 'Periodicidad de los pagos',
  labels: { A: 'Anualidad (A)', n: 'Tiempo (n)' },
  defaults: { A: '500000', i: '1,5', n: '24', P: '10015202,68', F: '14316760,40' },
  unknowns: [
    { id: 'F', label: 'Valor futuro (F)', result: 'F', inputs: ['A', 'i', 'n'], solve: (v) => finance.ordinaryAnnuityFutureValue(v.A, v.i, v.n) },
    { id: 'P', label: 'Valor presente (P)', result: 'P', inputs: ['A', 'i', 'n'], solve: (v) => finance.ordinaryAnnuityPresentValue(v.A, v.i, v.n) },
    { id: 'A-P', label: 'Anualidad (A) a partir de P', result: 'A', basis: 'P', inputs: ['P', 'i', 'n'], solve: (v) => finance.ordinaryAnnuityPaymentFromPresent(v.P, v.i, v.n) },
    { id: 'A-F', label: 'Anualidad (A) a partir de F', result: 'A', basis: 'F', inputs: ['F', 'i', 'n'], solve: (v) => finance.ordinaryAnnuityPaymentFromFuture(v.F, v.i, v.n) },
    { id: 'n-P', label: 'Tiempo (n) a partir de P', result: 'n', basis: 'P', inputs: ['P', 'A', 'i'], solve: (v) => finance.ordinaryAnnuityPeriodsFromPresent(v.P, v.A, v.i) },
    { id: 'n-F', label: 'Tiempo (n) a partir de F', result: 'n', basis: 'F', inputs: ['F', 'A', 'i'], solve: (v) => finance.ordinaryAnnuityPeriodsFromFuture(v.F, v.A, v.i) },
  ],
};

export const annuityDueModule: SolveForModule = {
  periodLabel: 'Periodicidad de los pagos',
  labels: { A: 'Anualidad (A)', n: 'Tiempo (n)' },
  defaults: { A: '500000', i: '1,5', n: '24', P: '10165430,72', F: '14531511,80' },
  unknowns: [
    { id: 'F', label: 'Valor futuro (F)', result: 'F', inputs: ['A', 'i', 'n'], solve: (v) => finance.annuityDueFutureValue(v.A, v.i, v.n) },
    { id: 'P', label: 'Valor presente (P)', result: 'P', inputs: ['A', 'i', 'n'], solve: (v) => finance.annuityDuePresentValue(v.A, v.i, v.n) },
    { id: 'A-P', label: 'Anualidad (A) a partir de P', result: 'A', basis: 'P', inputs: ['P', 'i', 'n'], solve: (v) => finance.annuityDuePaymentFromPresent(v.P, v.i, v.n) },
    { id: 'A-F', label: 'Anualidad (A) a partir de F', result: 'A', basis: 'F', inputs: ['F', 'i', 'n'], solve: (v) => finance.annuityDuePaymentFromFuture(v.F, v.i, v.n) },
    { id: 'n-P', label: 'Tiempo (n) a partir de P', result: 'n', basis: 'P', inputs: ['P', 'A', 'i'], solve: (v) => finance.annuityDuePeriodsFromPresent(v.P, v.A, v.i) },
    { id: 'n-F', label: 'Tiempo (n) a partir de F', result: 'n', basis: 'F', inputs: ['F', 'A', 'i'], solve: (v) => finance.annuityDuePeriodsFromFuture(v.F, v.A, v.i) },
  ],
};

export const perpetuityModule: SolveForModule = {
  periodLabel: 'Periodicidad de los pagos',
  labels: { A: 'Anualidad (A)' },
  shortRate: true,
  defaults: { A: '2000000', i: '1', P: '200000000' },
  unknowns: [
    { id: 'P', label: 'Valor presente (P)', result: 'P', inputs: ['A', 'i'], solve: (v) => finance.perpetuityPresentValue(v.A, v.i) },
    { id: 'A', label: 'Anualidad (A)', result: 'A', inputs: ['P', 'i'], solve: (v) => finance.perpetuityPayment(v.P, v.i) },
    { id: 'i', label: 'Tasa de interés (i)', result: 'i', inputs: ['P', 'A'], solve: (v) => finance.perpetuityRate(v.P, v.A) },
  ],
};
