# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### ControlTear (`artifacts/controltear`)
- **Kind**: React + Vite web app (JavaScript, no TypeScript)
- **Preview**: `/`
- **Purpose**: Production downtime tracker for a textile factory
- **Firebase**: Firestore (no Auth) — credentials via VITE_FIREBASE_* env secrets
- **PDF Export**: jsPDF (dynamic import, blob download)
- **Auth**: Fake local auth (localStorage) — user name + cargo, then turma selection
- **Structure**:
  - `src/firebase.js` — Firestore init
  - `src/constants.js` — MOTIVOS, CARGOS, TURMAS, CORES_TURMA
  - `src/context/AuthContext.jsx` — user + turma state
  - `src/hooks/useParadas.js` — Firestore real-time listener, CRUD
  - `src/utils/formatters.js` — date/duration formatters
  - `src/utils/pdfExport.js` — jsPDF period report
  - `src/components/` — Icon (Material Symbols), Toast, BottomNav
  - `src/pages/` — Login, SelecaoTurma, app/NovaParada, app/Lista, app/Painel

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
