import { FinanceError } from '@/lib/finance';
import { parseNumber } from '@/lib/format';

/** Lee un campo del formulario; lanza FinanceError si no es un número válido. */
export function readNumber(raw: string, label: string) {
  const value = parseNumber(raw);
  if (value === null) throw new FinanceError(`Ingresa un valor numérico válido en «${label}».`);
  return value;
}

/** Igual que readNumber, pero para campos en porcentaje: devuelve la tasa en decimal. */
export function readRate(raw: string, label: string) {
  return readNumber(raw, label) / 100;
}

export function errorMessage(error: unknown) {
  if (error instanceof FinanceError) return error.message;
  return 'Ocurrió un error inesperado. Revisa los datos ingresados.';
}
