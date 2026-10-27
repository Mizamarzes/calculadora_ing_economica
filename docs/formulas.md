# Fórmulas de la calculadora financiera

Referencia de las fórmulas que implementa cada módulo de la calculadora. La fuente oficial es `docs/HOJA DE FORMULAS.pdf` (EEIE UIS); las fórmulas que **no** aparecen en esa hoja (despejes derivados algebraicamente o procedimientos de indexación) están marcadas como tales.

## Notación

| Símbolo | Significado | Unidad |
|---|---|---|
| $P$ | Valor presente | $ (moneda) |
| $F$ | Valor futuro | $ (moneda) |
| $A$ | Cuota o pago periódico | $ por periodo |
| $i$ | Tasa de interés **periódica efectiva vencida** | % por periodo (se usa en decimal: 2 % → 0,02) |
| $n$ | Número de periodos | periodos (misma unidad que $i$) |
| $j$ | Tasa nominal anual | % anual |
| $m$ | Número de periodos de capitalización en un año | — |
| $i_v$, $i_a$ | Tasa periódica vencida / anticipada | % por periodo |
| $i_e$ | Tasa efectiva anual (E.A.) | % anual |

**Regla de coherencia (aplica a todos los módulos):** $i$ y $n$ deben estar en la misma unidad de tiempo. Si los pagos son mensuales, la tasa debe ser mensual efectiva vencida y $n$ en meses. Si el usuario ingresa una tasa en otra periodicidad o modalidad, primero se convierte con el módulo de conversión de tasas.

---

## 1. Interés compuesto

Relaciona un valor presente con un valor futuro a una tasa periódica durante $n$ periodos.

| Incógnita | Fórmula |
|---|---|
| Valor futuro | $F = P\,(1+i)^n$ |
| Valor presente | $P = \dfrac{F}{(1+i)^n}$ |
| Tasa | $i = \sqrt[n]{\dfrac{F}{P}} - 1$ |
| Tiempo | $n = \dfrac{\ln(F/P)}{\ln(1+i)}$ |

**Condiciones de validez**
- $P > 0$, $F > 0$, $n > 0$, $i > 0$.
- Para calcular $i$ o $n$ se exige $F > P$ (con $F < P$ la tasa resultaría negativa).
- El resultado de $n$ puede no ser entero; se informa tal cual y en la unidad de la tasa.

**Comprobación:** $P = 1.000.000$, $i = 2\%$ mensual, $n = 12$ meses → $F = 1.268.241,79$.

---

## 2. Conversión de tasas

La calculadora maneja tres tipos de tasa, los vértices del **círculo de fórmulas** de la hoja: interés **nominal** ($i_n$), **periódico** ($i_p$) y **efectivo anual** ($i_{ea}$).

### 2.1 Círculo de fórmulas *(hoja de fórmulas)*

| De → a | Fórmula |
|---|---|
| Nominal → periódico | $i_p = \dfrac{i_n}{m}$ |
| Periódico → nominal | $i_n = i_p \cdot m$ |
| Nominal → efectivo | $i_{ea} = \left[\left(1+\dfrac{i_n}{m}\right)^m - 1\right] \times 100$ |
| Efectivo → nominal | $i_n = \left[(1+i_{ea})^{1/m} - 1\right] \cdot m \times 100$ |
| Periódico → efectivo | $i_{ea} = \left[(1+i)^m - 1\right] \times 100$ |
| Efectivo → periódico | $i_p = \left[(1+i)^{1/m} - 1\right] \times 100$ |

El círculo supone tasas vencidas. Nominal ↔ periódico con la misma periodicidad y modalidad usa el lado directo; cualquier otro cambio (otra periodicidad, otra modalidad) pasa por el efectivo anual.

### 2.2 Vencida ↔ anticipada *(hoja de fórmulas)*

Se aplica **sobre la tasa periódica**, nunca sobre la nominal:

$$i_a = \frac{i_v}{1+i_v} \qquad\qquad i_v = \frac{i_a}{1-i_a}$$

Condición: $i_a < 1$ (100 %).

### 2.3 Tasas anticipadas

Una nominal o periódica anticipada se lleva primero a periódica ($i_a = i_n/m$), se pasa a vencida con 2.2 y luego se sigue el círculo. Para llegar a una anticipada se hace al revés.

### Periodicidades

| Periodicidad | $m$ | Nominal vencida | Nominal anticipada |
|---|:-:|:-:|:-:|
| Mensual | 12 | N.M.V. | N.M.A. |
| Bimestral | 6 | N.B.V. | N.B.A. |
| Trimestral | 4 | N.T.V. | N.T.A. |
| Cuatrimestral | 3 | N.C.V. | N.C.A. |
| Semestral | 2 | N.S.V. | N.S.A. |
| Anual | 1 | E.A. | A.A. |

**Comprobaciones**
- 24 % N.M.V. → $i_v = 2\%$ mensual → $i_e = 26,8242\%$ E.A.
- 24 % N.M.A. → $i_a = 2\%$ → $i_v = 2,0408\%$ mensual → $i_e = 27,4345\%$ E.A.

---

## 3. Indexación de tasas

Una tasa indexada se compone de un **indicador variable** (DTF, IBR, IPC o UVR) más unos **puntos adicionales** (spread). La forma de combinarlos depende del indicador.

### 3.1 IPC y UVR: composición *(hoja de fórmulas)*

El IPC (inflación) y la variación de la UVR se expresan como tasas efectivas anuales, y el spread es una tasa real E.A. Se combinan multiplicativamente:

$$i_{DX} = \big[(1+i_1)(1+i_2) - 1\big] \times 100\%$$

donde $i_1$ es el IPC (o la variación de la UVR) y $i_2$ el spread. El resultado es E.A. y se puede convertir después con el módulo 2.

**Comprobación:** IPC $= 5\%$, spread $= 6\%$ → $i_{DX} = 11,30\%$ E.A.

### 3.2 DTF e IBR: suma de puntos sobre la nominal *(por confirmar con lo visto en clase)*

> La hoja de fórmulas solo incluye la composición multiplicativa. El procedimiento siguiente es el usual en Colombia para DTF e IBR, pero conviene confirmarlo con lo trabajado en clase antes de implementarlo.

En DTF e IBR los puntos se **suman** cuando indicador y spread están en la misma tasa nominal y la misma modalidad:

$$j_{total} = j_{indicador} + \text{spread}$$

- **DTF:** la calculadora la recibe directamente en **N.T.A.** (trimestre anticipado), igual que el spread ("DTF + s T.A."). Pasos:
  1. $j_{total} = DTF_{N.T.A.} + s$
  2. Convertir $j_{total}$ (N.T.A.) a la tasa deseada con el módulo 2.
  - Si se tiene la DTF en E.A., primero se pasa a N.T.A. con el módulo 2.
- **IBR:** se publica como tasa **nominal** (normalmente mes vencido, N.M.V.). Pasos:
  1. $j_{total} = IBR_{N.M.V.} + s$
  2. Convertir $j_{total}$ (N.M.V.) a la tasa deseada con el módulo 2.

**Comprobación (DTF):** DTF $= 8,5256\%$ N.T.A. (equivale a $9\%$ E.A.), spread $= 4$ puntos T.A.
→ $j_{total} = 12,5256\%$ T.A. → $i_a = 3,1314\%$ trimestral → $i_v = 3,2326\%$ trimestral → $13,5711\%$ E.A.

---

## 4. Anualidad vencida

Pagos iguales $A$ al **final** de cada periodo durante $n$ periodos.

| Incógnita | Fórmula | Origen |
|---|---|---|
| Valor presente | $P = A\left[\dfrac{(1+i)^n - 1}{i\,(1+i)^n}\right]$ | hoja |
| Cuota desde $P$ | $A = P\left[\dfrac{i\,(1+i)^n}{(1+i)^n - 1}\right]$ | hoja |
| Valor futuro | $F = A\left[\dfrac{(1+i)^n - 1}{i}\right]$ | hoja |
| Cuota desde $F$ | $A = F\left[\dfrac{i}{(1+i)^n - 1}\right]$ | hoja |
| Periodos desde $P$ | $n = \dfrac{-\ln\!\left(1 - \dfrac{P\,i}{A}\right)}{\ln(1+i)}$ | derivada |
| Periodos desde $F$ | $n = \dfrac{\ln\!\left(\dfrac{F\,i}{A} + 1\right)}{\ln(1+i)}$ | derivada |

**Condiciones de validez**
- $i > 0$, $A > 0$, $n > 0$.
- Para $n$ desde $P$: se requiere $A > P\,i$. Si $A \le P\,i$ la cuota no alcanza a cubrir los intereses y la deuda nunca se paga.
- La tasa $i$ no tiene despeje cerrado. Si se quisiera calcular, haría falta un método numérico (Newton o bisección); no lo exige el enunciado.

**Comprobación:** $A = 500.000$, $i = 1,5\%$ mensual, $n = 24$ → $P = 10.015.202,68$ ; $F = 14.316.760,40$.

---

## 5. Anualidad anticipada

Pagos iguales $A$ al **inicio** de cada periodo durante $n$ periodos.

| Incógnita | Fórmula | Origen |
|---|---|---|
| Valor presente | $P = A + A\left[\dfrac{(1+i)^{n-1} - 1}{i\,(1+i)^{n-1}}\right]$ | hoja |
| Cuota desde $P$ | $A = \dfrac{P}{1 + \left[\dfrac{(1+i)^{n-1} - 1}{i\,(1+i)^{n-1}}\right]}$ | hoja |
| Valor futuro | $F = A\left[\dfrac{(1+i)^{n+1} - (1+i)}{i}\right]$ | hoja |
| Cuota desde $F$ | $A = \dfrac{F\,i}{(1+i)^{n+1} - (1+i)}$ | derivada |
| Periodos desde $P$ | $n = \dfrac{-\ln\!\left(1 - \dfrac{P\,i}{A\,(1+i)}\right)}{\ln(1+i)}$ | derivada |
| Periodos desde $F$ | $n = \dfrac{\ln\!\left(1 + \dfrac{F\,i}{A\,(1+i)}\right)}{\ln(1+i)}$ | derivada |

Relación útil para verificar: el valor de una anticipada es el de la vencida multiplicado por $(1+i)$:

$$P_{anticipada} = (1+i)\,P_{vencida} \qquad F_{anticipada} = (1+i)\,F_{vencida}$$

**Condiciones de validez**
- $i > 0$, $A > 0$, $n \ge 1$.
- Para $n$ desde $P$: se requiere $A\,(1+i) > P\,i$.

**Comprobación:** $A = 500.000$, $i = 1,5\%$ mensual, $n = 24$ → $P = 10.165.430,72$ ; $F = 14.531.511,80$ (las cifras del módulo 4 multiplicadas por 1,015).

---

## 6. Anualidad perpetua

Pagos iguales $A$ al final de cada periodo, sin fin.

| Incógnita | Fórmula | Origen |
|---|---|---|
| Capital requerido | $P = \dfrac{A}{i}$ | hoja |
| Pago sostenible | $A = P \cdot i$ | derivada |
| Tasa | $i = \dfrac{A}{P}$ | derivada |

**Condiciones de validez:** $i > 0$, $P > 0$, $A > 0$. $A$ e $i$ deben estar en el mismo periodo: un pago mensual exige una tasa mensual.

**Comprobación:** $A = 2.000.000$ mensuales, $i = 1\%$ mensual → $P = 200.000.000$.

---

## Validaciones generales de entrada

Se aplican a todos los módulos:

- Aceptar decimales con coma o punto.
- Rechazar campos vacíos, valores no numéricos y montos o periodos negativos o en cero.
- Rechazar tasas $\le 0$ donde la fórmula divide por $i$ (anualidades y perpetuidad).
- No permitir combinar una tasa y un número de periodos de unidades distintas sin convertir antes.
- Mostrar siempre qué variable se calculó, en qué unidad, y con qué periodicidad y modalidad queda la tasa.
- Precisión sugerida: 4 decimales para tasas (%) y 2 decimales para montos.
