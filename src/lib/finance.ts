/**
 * Funciones de cálculo financiero de la calculadora.
 * Cada fórmula está documentada en docs/formulas.md.
 *
 * Todas las tasas se reciben y se devuelven en decimal (2 % = 0.02).
 * Las funciones lanzan FinanceError con un mensaje para el usuario
 * cuando los datos son inconsistentes.
 */

export class FinanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FinanceError';
  }
}

function requirePositive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new FinanceError(`${name} debe ser mayor que cero.`);
  }
}

function requireNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new FinanceError(`${name} no puede ser negativo.`);
  }
}

function checkResult(result: number) {
  if (!Number.isFinite(result)) {
    throw new FinanceError('El resultado no es un número válido. Revisa los datos ingresados.');
  }
  return result;
}

// ─── 1. Interés compuesto ────────────────────────────────────────────────

/** F = P(1+i)^n */
export function compoundFutureValue(P: number, i: number, n: number) {
  requirePositive(P, 'El valor presente');
  requirePositive(i, 'La tasa de interés');
  requirePositive(n, 'El número de periodos');
  return checkResult(P * (1 + i) ** n);
}

/** P = F / (1+i)^n */
export function compoundPresentValue(F: number, i: number, n: number) {
  requirePositive(F, 'El valor futuro');
  requirePositive(i, 'La tasa de interés');
  requirePositive(n, 'El número de periodos');
  return checkResult(F / (1 + i) ** n);
}

/** i = (F/P)^(1/n) − 1 */
export function compoundRate(P: number, F: number, n: number) {
  requirePositive(P, 'El valor presente');
  requirePositive(F, 'El valor futuro');
  requirePositive(n, 'El número de periodos');
  if (F <= P) throw new FinanceError('El valor futuro debe ser mayor que el valor presente.');
  return checkResult((F / P) ** (1 / n) - 1);
}

/** n = ln(F/P) / ln(1+i) */
export function compoundPeriods(P: number, F: number, i: number) {
  requirePositive(P, 'El valor presente');
  requirePositive(F, 'El valor futuro');
  requirePositive(i, 'La tasa de interés');
  if (F <= P) throw new FinanceError('El valor futuro debe ser mayor que el valor presente.');
  return checkResult(Math.log(F / P) / Math.log(1 + i));
}

// ─── 2. Conversión de tasas ──────────────────────────────────────────────

export type Periodicity = 'monthly' | 'bimonthly' | 'quarterly' | 'fourMonthly' | 'semiannual' | 'annual';
export type Modality = 'vencida' | 'anticipada';
/** Nominal: tasa anual capitalizable j. Periódica: tasa por periodo i. */
export type RateKind = 'nominal' | 'periodica';
export type RateSpec = { kind: RateKind; periodicity: Periodicity; modality: Modality };

export const PERIODS_PER_YEAR: Record<Periodicity, number> = {
  monthly: 12,
  bimonthly: 6,
  quarterly: 4,
  fourMonthly: 3,
  semiannual: 2,
  annual: 1,
};

export const EFFECTIVE_ANNUAL: RateSpec = { kind: 'periodica', periodicity: 'annual', modality: 'vencida' };

/** i = j / m */
export function nominalToPeriodic(j: number, periodicity: Periodicity) {
  return j / PERIODS_PER_YEAR[periodicity];
}

/** j = i · m */
export function periodicToNominal(i: number, periodicity: Periodicity) {
  return i * PERIODS_PER_YEAR[periodicity];
}

/** ia = iv / (1+iv) */
export function vencidaToAnticipada(iv: number) {
  requirePositive(iv, 'La tasa vencida');
  return iv / (1 + iv);
}

/** iv = ia / (1−ia) */
export function anticipadaToVencida(ia: number) {
  requirePositive(ia, 'La tasa anticipada');
  if (ia >= 1) throw new FinanceError('La tasa periódica anticipada debe ser menor que 100 %.');
  return ia / (1 - ia);
}

/** ie = (1+iv)^m − 1 */
export function periodicToEffectiveAnnual(iv: number, periodicity: Periodicity) {
  return (1 + iv) ** PERIODS_PER_YEAR[periodicity] - 1;
}

/** iv = (1+ie)^(1/m) − 1 */
export function effectiveAnnualToPeriodic(ie: number, periodicity: Periodicity) {
  return (1 + ie) ** (1 / PERIODS_PER_YEAR[periodicity]) - 1;
}

/** Lleva cualquier tasa a su equivalente efectiva anual, pasando por la periódica vencida. */
export function toEffectiveAnnual(rate: number, from: RateSpec) {
  requirePositive(rate, 'La tasa de interés');
  const periodic = from.kind === 'nominal' ? nominalToPeriodic(rate, from.periodicity) : rate;
  const vencida = from.modality === 'anticipada' ? anticipadaToVencida(periodic) : periodic;
  return checkResult(periodicToEffectiveAnnual(vencida, from.periodicity));
}

/** Expresa una tasa efectiva anual en la periodicidad, modalidad y tipo indicados. */
export function fromEffectiveAnnual(ie: number, to: RateSpec) {
  requirePositive(ie, 'La tasa efectiva anual');
  const vencida = effectiveAnnualToPeriodic(ie, to.periodicity);
  const periodic = to.modality === 'anticipada' ? vencidaToAnticipada(vencida) : vencida;
  return checkResult(to.kind === 'nominal' ? periodicToNominal(periodic, to.periodicity) : periodic);
}

/** Convierte una tasa entre dos formas cualesquiera (nominal/periódica, periodicidad, modalidad). */
export function convertRate(rate: number, from: RateSpec, to: RateSpec) {
  return fromEffectiveAnnual(toEffectiveAnnual(rate, from), to);
}

// ─── 3. Indexación de tasas ──────────────────────────────────────────────

export type Indicator = 'DTF' | 'IBR' | 'IPC';

const NOMINAL_TA: RateSpec = { kind: 'nominal', periodicity: 'quarterly', modality: 'anticipada' };
const NOMINAL_MV: RateSpec = { kind: 'nominal', periodicity: 'monthly', modality: 'vencida' };

/** Forma en que se expresa cada indicador y sus puntos adicionales. */
export const INDICATOR_RATES: Record<Indicator, { indicator: RateSpec; spread: RateSpec }> = {
  DTF: { indicator: NOMINAL_TA, spread: NOMINAL_TA },
  IBR: { indicator: NOMINAL_MV, spread: NOMINAL_MV },
  IPC: { indicator: EFFECTIVE_ANNUAL, spread: EFFECTIVE_ANNUAL },
};

/** iDX = (1+i1)(1+i2) − 1 */
export function composeRates(i1: number, i2: number) {
  return (1 + i1) * (1 + i2) - 1;
}

export type IndexedRate = {
  /** Tasa indexada total, expresada según `spec`. */
  value: number;
  spec: RateSpec;
  /** Valor del indicador expresado según `spec`, antes de agregar los puntos. */
  indicatorValue: number;
};

/**
 * DTF e IBR: los puntos se suman sobre la tasa nominal (DTF en T.A., IBR en N.M.V.).
 * IPC: se compone con (1+i1)(1+i2) − 1 y el resultado es E.A.
 */
export function indexRate(indicator: Indicator, indicatorRate: number, spread: number): IndexedRate {
  requirePositive(indicatorRate, `El valor de ${indicator}`);
  requireNonNegative(spread, 'El valor de los puntos adicionales');

  switch (indicator) {
    case 'DTF':
      return { value: indicatorRate + spread, spec: NOMINAL_TA, indicatorValue: indicatorRate };
    case 'IBR':
      return { value: indicatorRate + spread, spec: NOMINAL_MV, indicatorValue: indicatorRate };
    case 'IPC':
      return { value: composeRates(indicatorRate, spread), spec: EFFECTIVE_ANNUAL, indicatorValue: indicatorRate };
  }
}

// ─── 4. Anualidad vencida ────────────────────────────────────────────────

function requireAnnuityInputs(amount: number, amountName: string, i: number, n: number) {
  requirePositive(amount, amountName);
  requirePositive(i, 'La tasa de interés');
  requirePositive(n, 'El número de periodos');
}

/** [(1+i)^n − 1] / [i(1+i)^n] */
function presentValueFactor(i: number, n: number) {
  return ((1 + i) ** n - 1) / (i * (1 + i) ** n);
}

/** [(1+i)^n − 1] / i */
function futureValueFactor(i: number, n: number) {
  return ((1 + i) ** n - 1) / i;
}

/** P = A[((1+i)^n − 1) / (i(1+i)^n)] */
export function ordinaryAnnuityPresentValue(A: number, i: number, n: number) {
  requireAnnuityInputs(A, 'La cuota', i, n);
  return checkResult(A * presentValueFactor(i, n));
}

/** F = A[((1+i)^n − 1) / i] */
export function ordinaryAnnuityFutureValue(A: number, i: number, n: number) {
  requireAnnuityInputs(A, 'La cuota', i, n);
  return checkResult(A * futureValueFactor(i, n));
}

/** A = P[i(1+i)^n / ((1+i)^n − 1)] */
export function ordinaryAnnuityPaymentFromPresent(P: number, i: number, n: number) {
  requireAnnuityInputs(P, 'El valor presente', i, n);
  return checkResult(P / presentValueFactor(i, n));
}

/** A = F[i / ((1+i)^n − 1)] */
export function ordinaryAnnuityPaymentFromFuture(F: number, i: number, n: number) {
  requireAnnuityInputs(F, 'El valor futuro', i, n);
  return checkResult(F / futureValueFactor(i, n));
}

/** n = −ln(1 − P·i/A) / ln(1+i) */
export function ordinaryAnnuityPeriodsFromPresent(P: number, A: number, i: number) {
  requirePositive(P, 'El valor presente');
  requirePositive(A, 'La cuota');
  requirePositive(i, 'La tasa de interés');
  if (A <= P * i) {
    throw new FinanceError('La cuota no alcanza a cubrir los intereses del periodo (A ≤ P·i): la deuda nunca se paga.');
  }
  return checkResult(-Math.log(1 - (P * i) / A) / Math.log(1 + i));
}

/** n = ln(F·i/A + 1) / ln(1+i) */
export function ordinaryAnnuityPeriodsFromFuture(F: number, A: number, i: number) {
  requirePositive(F, 'El valor futuro');
  requirePositive(A, 'La cuota');
  requirePositive(i, 'La tasa de interés');
  return checkResult(Math.log((F * i) / A + 1) / Math.log(1 + i));
}

// ─── 5. Anualidad anticipada ─────────────────────────────────────────────

function requireAnnuityDueInputs(amount: number, amountName: string, i: number, n: number) {
  requireAnnuityInputs(amount, amountName, i, n);
  if (n < 1) throw new FinanceError('El número de periodos debe ser al menos 1.');
}

/** P = A + A[((1+i)^(n−1) − 1) / (i(1+i)^(n−1))] */
export function annuityDuePresentValue(A: number, i: number, n: number) {
  requireAnnuityDueInputs(A, 'La cuota', i, n);
  return checkResult(A + A * presentValueFactor(i, n - 1));
}

/** F = A[((1+i)^(n+1) − (1+i)) / i] */
export function annuityDueFutureValue(A: number, i: number, n: number) {
  requireAnnuityDueInputs(A, 'La cuota', i, n);
  return checkResult(A * (((1 + i) ** (n + 1) - (1 + i)) / i));
}

/** A = P / {1 + [((1+i)^(n−1) − 1) / (i(1+i)^(n−1))]} */
export function annuityDuePaymentFromPresent(P: number, i: number, n: number) {
  requireAnnuityDueInputs(P, 'El valor presente', i, n);
  return checkResult(P / (1 + presentValueFactor(i, n - 1)));
}

/** A = F·i / ((1+i)^(n+1) − (1+i)) */
export function annuityDuePaymentFromFuture(F: number, i: number, n: number) {
  requireAnnuityDueInputs(F, 'El valor futuro', i, n);
  return checkResult((F * i) / ((1 + i) ** (n + 1) - (1 + i)));
}

/** n = −ln(1 − P·i / (A(1+i))) / ln(1+i) */
export function annuityDuePeriodsFromPresent(P: number, A: number, i: number) {
  requirePositive(P, 'El valor presente');
  requirePositive(A, 'La cuota');
  requirePositive(i, 'La tasa de interés');
  if (A * (1 + i) <= P * i) {
    throw new FinanceError('La cuota no alcanza a cubrir los intereses (A(1+i) ≤ P·i): la deuda nunca se paga.');
  }
  return checkResult(-Math.log(1 - (P * i) / (A * (1 + i))) / Math.log(1 + i));
}

/** n = ln(1 + F·i / (A(1+i))) / ln(1+i) */
export function annuityDuePeriodsFromFuture(F: number, A: number, i: number) {
  requirePositive(F, 'El valor futuro');
  requirePositive(A, 'La cuota');
  requirePositive(i, 'La tasa de interés');
  return checkResult(Math.log(1 + (F * i) / (A * (1 + i))) / Math.log(1 + i));
}

// ─── 6. Anualidad perpetua ───────────────────────────────────────────────

/** P = A / i */
export function perpetuityPresentValue(A: number, i: number) {
  requirePositive(A, 'La cuota');
  requirePositive(i, 'La tasa de interés');
  return checkResult(A / i);
}

/** A = P · i */
export function perpetuityPayment(P: number, i: number) {
  requirePositive(P, 'El valor presente');
  requirePositive(i, 'La tasa de interés');
  return checkResult(P * i);
}

/** i = A / P */
export function perpetuityRate(P: number, A: number) {
  requirePositive(P, 'El valor presente');
  requirePositive(A, 'La cuota');
  return checkResult(A / P);
}
