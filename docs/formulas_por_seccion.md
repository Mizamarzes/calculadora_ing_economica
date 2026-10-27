# Fórmulas por sección de la calculadora

Este documento resume las fórmulas que usa cada sección de la calculadora, en el orden en que aparecen en pantalla. La fuente es la hoja de fórmulas del curso (`docs/HOJA DE FORMULAS.pdf`). Cuando una fórmula no está en la hoja y se obtuvo despejando otra, se indica como **despeje**.

Todas las fórmulas están implementadas en `src/lib/finance.ts`.

**Notación**

| Símbolo | Significado |
|---|---|
| P | Valor presente |
| F | Valor futuro |
| A | Anualidad (pago periódico igual) |
| i | Tasa de interés por periodo |
| n | Tiempo (número de periodos) |
| m | Periodos por año (mensual 12, bimestral 6, trimestral 4, cuatrimestral 3, semestral 2, anual 1) |

En los cálculos las tasas se usan en decimal: 2 % = 0,02. El factor × 100 que aparece en la hoja solo pasa el resultado a porcentaje.

---

## 1. Conversión de tasas

Hay tres tipos de tasa, que son los vértices del **círculo de fórmulas** de la hoja:

- **Interés nominal (iₙ):** tasa anual que se capitaliza m veces al año. Se elige periodicidad y modalidad.
- **Interés periódico (iₚ):** tasa por periodo. Se elige periodicidad y modalidad.
- **Interés efectivo anual (iₑₐ):** no pide periodicidad ni modalidad.

### Círculo de fórmulas *(hoja)*

**Nominal → periódico**

$$
i_p = \frac{i_n}{m}
$$

**Periódico → nominal**

$$
i_n = i_p \cdot m
$$

**Nominal → efectivo**

$$
i_{ea} = \left(1 + \frac{i_n}{m}\right)^{m} - 1
$$

**Efectivo → nominal**

$$
i_n = \left[(1 + i_{ea})^{\frac{1}{m}} - 1\right] \cdot m
$$

**Periódico → efectivo**

$$
i_{ea} = (1 + i_p)^{m} - 1
$$

**Efectivo → periódico**

$$
i_p = (1 + i_{ea})^{\frac{1}{m}} - 1
$$

### Vencido ↔ anticipado *(hoja)*

**Vencido → anticipado**

$$
i_a = \frac{i_v}{1 + i_v}
$$

**Anticipado → vencido**

$$
i_v = \frac{i_a}{1 - i_a}
$$

Se aplica siempre sobre la tasa **periódica**, nunca sobre la nominal.

### Procedimiento

1. **Nominal ↔ periódico con la misma periodicidad y modalidad:** se usa el lado directo del círculo (dividir o multiplicar por m).
2. **Cualquier otro caso** pasa por el efectivo anual:
   - Origen → E.A.: una nominal vencida usa la fórmula nominal → efectivo. Una periódica vencida usa periódico → efectivo. Una tasa anticipada se lleva primero a periódica (iₐ = iₙ / m), se pasa a vencida con iᵥ = iₐ / (1 − iₐ) y luego a E.A.
   - E.A. → destino: los mismos pasos en orden inverso, con la periodicidad de destino.

### Resultado

- **Tasa resultante** con 2 decimales y su abreviatura (N.M.V., N.T.A., E.A., …).
- Debajo, el **equivalente E.A.** cuando el destino no es E.A.

### Validaciones

- La tasa debe ser mayor que 0.
- La tasa periódica anticipada debe ser menor que 100 %.

### Comprobaciones

- 24 % N.M.V. → 26,82 % E.A.
- 24 % N.M.A. → 27,43 % E.A.
- 24 % N.M.A. → 24,99 % N.T.V.
- 2 % periódico mensual → 24,00 % N.M.V.

---

## 2. Indexación de tasas

Una tasa indexada es un **indicador** más unos **puntos adicionales** (spread). Indicadores disponibles: DTF, IBR e IPC.

| Indicador | Se ingresa en | Puntos en | Resultado en |
|---|---|---|---|
| DTF | N.T.A. | N.T.A. | N.T.A. |
| IBR | N.M.V. | N.M.V. | N.M.V. |
| IPC | E.A. | E.A. | E.A. |

**DTF**

$$
i_{DX} = DTF + \text{puntos}
$$

**IBR**

$$
i_{DX} = IBR + \text{puntos}
$$

**IPC** *(hoja)*, donde i₁ es el IPC e i₂ son los puntos:

$$
i_{DX} = (1 + i_1)(1 + i_2) - 1
$$

En DTF e IBR los puntos se suman directamente porque indicador y puntos están en la misma tasa nominal y la misma modalidad. Este procedimiento no está en la hoja de fórmulas y está pendiente de confirmar con lo visto en clase.

**Resultado:** **Tasa indexada (i_DX)** con 2 decimales, en la tasa propia del indicador. Para pasarla a otra tasa se usa la sección de conversión de tasas.

**Comprobación (DTF):** DTF 8,5256 % N.T.A. + 4 puntos → 12,53 % N.T.A., que equivale a 13,5711 % E.A.

---

## 3. Interés compuesto

**Valor futuro**

$$
F = P\,(1 + i)^{n}
$$

**Valor presente**

$$
P = \frac{F}{(1 + i)^{n}}
$$

**Tasa de interés**

$$
i = \left(\frac{F}{P}\right)^{\frac{1}{n}} - 1
$$

**Tiempo**

$$
n = \frac{\ln(F/P)}{\ln(1 + i)}
$$

- Un solo selector de **periodicidad** fija la unidad de i y de n, así que la tasa y el tiempo siempre están en la misma unidad.
- La tasa debe ser **efectiva vencida** en esa periodicidad. Si es nominal o anticipada, primero se convierte en la sección 1.

### Validaciones

- P, F, i y n deben ser mayores que 0.
- Para calcular i o n se exige F > P.

**Comprobación:** P = 1.000.000, i = 2 % mensual, n = 12 meses → F = 1.268.241,79.

---

## 4. Anualidad vencida

Pagos iguales A al **final** de cada periodo.

**Valor futuro (F)** *(hoja)*

$$
F = A\left[\frac{(1+i)^{n} - 1}{i}\right]
$$

**Valor presente (P)** *(hoja)*

$$
P = A\left[\frac{(1+i)^{n} - 1}{i\,(1+i)^{n}}\right]
$$

**Anualidad (A) a partir de P** *(hoja)*

$$
A = P\left[\frac{i\,(1+i)^{n}}{(1+i)^{n} - 1}\right]
$$

**Anualidad (A) a partir de F** *(hoja)*

$$
A = F\left[\frac{i}{(1+i)^{n} - 1}\right]
$$

**Tiempo (n) a partir de P** *(despeje)*

$$
n = \frac{-\ln\left(1 - \frac{P\,i}{A}\right)}{\ln(1+i)}
$$

**Tiempo (n) a partir de F** *(despeje)*

$$
n = \frac{\ln\left(\frac{F\,i}{A} + 1\right)}{\ln(1+i)}
$$

### Validaciones

- A, i y n deben ser mayores que 0.
- Para n desde P se exige A > P · i. Si no, la anualidad no alcanza a cubrir los intereses y la deuda nunca se paga.

**Comprobación:** A = 500.000, i = 1,5 %, n = 24 → P = 10.015.202,68 y F = 14.316.760,40.

---

## 5. Anualidad anticipada

Pagos iguales A al **inicio** de cada periodo.

**Valor futuro (F)** *(hoja)*

$$
F = A\left[\frac{(1+i)^{n+1} - (1+i)}{i}\right]
$$

**Valor presente (P)** *(hoja)*

$$
P = A + A\left[\frac{(1+i)^{n-1} - 1}{i\,(1+i)^{n-1}}\right]
$$

**Anualidad (A) a partir de P** *(hoja)*

$$
A = \frac{P}{1 + \left[\frac{(1+i)^{n-1} - 1}{i\,(1+i)^{n-1}}\right]}
$$

**Anualidad (A) a partir de F** *(despeje)*

$$
A = \frac{F\,i}{(1+i)^{n+1} - (1+i)}
$$

**Tiempo (n) a partir de P** *(despeje)*

$$
n = \frac{-\ln\left(1 - \frac{P\,i}{A\,(1+i)}\right)}{\ln(1+i)}
$$

**Tiempo (n) a partir de F** *(despeje)*

$$
n = \frac{\ln\left(1 + \frac{F\,i}{A\,(1+i)}\right)}{\ln(1+i)}
$$

### Validaciones

- A e i deben ser mayores que 0, y n ≥ 1.
- Para n desde P se exige A · (1 + i) > P · i.

**Comprobación:** A = 500.000, i = 1,5 %, n = 24 → P = 10.165.430,72 y F = 14.531.511,80.

---

## 6. Anualidad perpetua

Pagos iguales A al final de cada periodo, sin fin.

**Valor presente (P)** *(hoja)*

$$
P = \frac{A}{i}
$$

**Anualidad (A)** *(despeje)*

$$
A = P \cdot i
$$

**Tasa de interés (i)** *(despeje)*

$$
i = \frac{A}{P}
$$

- La tasa resultante se muestra con 2 decimales y abreviada: E.M., E.B., E.T., E.C., E.S. o E.A.
- P, A e i deben ser mayores que 0.

**Comprobación:** A = 2.000.000, i = 1 % mensual → P = 200.000.000.

---

## Presentación de resultados

- **Tiempo (n):** se muestra redondeado al entero más cercano. Si el valor no es entero, el valor exacto aparece debajo en letra pequeña.
- **Valores en dinero:** 2 decimales, con formato colombiano ($ 1.268.241,79).
- **Tasas:**
  - interés compuesto: 4 decimales;
  - anualidad perpetua, conversión e indexación: 2 decimales.
