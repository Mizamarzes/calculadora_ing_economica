# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A financial calculator for a university Engineering Economics course (Ingeniería Económica, EEIE UIS). The UI and all user-facing text are in **Spanish**. It must cover six modules: interés compuesto, conversión de tasas, indexación de tasas (DTF, IBR, IPC, UVR), anualidad vencida, anualidad anticipada, and anualidad perpetua.

Grading weights financial correctness far above appearance (validation is 35% of the grade), so **correct formulas matter more than UI polish**. `docs/formulas.md` documents every formula per module, with validity conditions and numeric check values to test implementations against. Its source is the course formula sheet `docs/HOJA DE FORMULAS.pdf` (read with `pdftotext -layout`). Implementations should match the sheet rather than alternative textbook forms. In `formulas.md`, the DTF/IBR indexation procedure is marked as not yet confirmed against class material.

`docs/detalle_proyecto.md` is the full assignment spec (the `.txt` is the same content). Its "Requisitos mínimos" section is the functional checklist: show only the inputs needed for the chosen operation/unknown, label units and rate periodicity/modality on every field, accept decimals, reject inconsistent rate/period combinations with a message, and clearly identify the computed variable. `docs/prompt_diseno.md` holds the UI design brief (simple, conventional-calculator style, responsive, Symbolab-like).

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # production build to dist/
npm run lint       # ESLint (flat config, typescript-eslint + react-hooks)
npm run typecheck  # tsc --noEmit -p tsconfig.app.json
npm run preview    # serve the built dist/
```

There is no test framework set up.

## Architecture

Vite + React 18 + TypeScript (strict) + Tailwind CSS 3, with `lucide-react` icons. The `@/` import alias maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

The code is split into three layers:

- `src/lib/finance.ts`: pure calculation functions, with no React. This is the only place financial math lives. Rates are always decimals (2 % = 0.02). Invalid or inconsistent inputs throw `FinanceError` with a Spanish message that the UI shows as is. Rate conversion always goes through the effective annual rate (`toEffectiveAnnual` / `fromEffectiveAnnual`). A rate's form is described by `RateSpec` (`kind` nominal/periódica/efectiva × `periodicity` × `modality` vencida/anticipada; the three kinds are the vertices of the sheet's formula circle). Indexation rules per indicator live in `INDICATOR_RATES` and `indexRate`.
- `src/lib/format.ts`: periodicity labels, rate abbreviations (`describeRate` → "N.M.V.", "E.A."…), `es-CO` formatting, and `parseNumber`, which accepts both comma and dot as the decimal separator.
- `src/calculators/`: the module UIs.
  - Compound interest and the three annuity types have no component of their own. They are config objects in `modules.ts` (`SolveForModule`: which unknowns can be solved, which inputs each needs, and a `solve` fn), all rendered by the generic `SolveForCalculator`. A single periodicity select fixes the unit of both `i` and `n`, so rate/time coherence holds by construction. Rates there must be effective vencida for that period. Nominal or anticipated rates go through the conversion module first.
  - Rate conversion and indexation are custom components.
  - `App.tsx` maps the nav cards to modules. All panels stay mounted and only the active one is visible (`hidden`), so each module keeps its form state when you switch.

Shared form pieces (`Field`, `NumberInput`, `Select`, `ResultPanel`, …) are in `src/components/form.tsx`. Styling uses semantic design tokens defined in `tailwind.config.js` (`page`, `ink.*`, `line.*`, `brand.*`, `tone.*`, `icon.*`, custom `shadow-*`), and custom breakpoints (`sm: 561px`, `md: 801px`, `lg: 1024px`) that differ from Tailwind defaults. Use these tokens rather than raw hex colors.

Node ≥ 23 can import `src/lib/finance.ts` directly (`node script.ts`, native type stripping). That is a quick way to check the math against the examples in `docs/formulas.md` when there is no test runner. Keep `finance.ts` free of path-alias imports so this keeps working.

`@supabase/supabase-js` is a dependency left over from the Bolt.new scaffold. Nothing uses it.
