# Repository Guidelines

## Project Structure & Module Organization

CareerMatch is a TanStack Start React application with server routes and Supabase-backed data. Application code lives in `src/`. Feature modules are under `src/features/`; each feature should expose `components/`, `containers/`, `hooks/`, and `lib/` when applicable. Route files live in `src/routes/`. Shared UI and utilities live in `src/shared/`. Feature API clients and repository logic live in `src/shared/repository/<feature>/` split into `dto.ts`, `query.ts`, and `action.ts`. Tests live in `src/shared/tests/`. Static assets belong in `public/`. Database migrations and seed data are in `supabase/migrations/` and `supabase/seed.sql`.

## Build, Test, and Development Commands

Use Bun for project scripts:

- `bun run dev` builds and runs the Alchemy/Cloudflare local worker flow.
- `bun run dev:vite` starts the Vite dev server on port `3000`.
- `bun run build` creates the production Vite build.
- `bun run test` runs Vitest tests.
- `bun run typecheck` runs `tsc --noEmit`.
- `bun run lint` runs Biome checks.
- `bun run format` formats files with Biome.
- `bun run db:push` applies Supabase migrations.
- `bun run db:seed` seeds local Supabase data.

## Coding Style & Naming Conventions

Write TypeScript and React using existing repository patterns. Prefer feature-local modules in `src/features/<feature>/` and server-only logic in `src/lib/server/`. Use `PascalCase` for React components, `camelCase` for variables/functions, and descriptive filenames such as `JobsContainer.tsx` or `careermatch-repository.ts`.

Biome is the formatter and linter. Keep imports organized and avoid unrelated formatting churn. Follow strict TypeScript settings; avoid `any` unless the boundary is intentionally untyped and narrowly contained.

## Testing Guidelines

Use Vitest for unit and integration-style tests. Use Testing Library for React component behavior. Keep all tests in `src/shared/tests/` and name them after the subject, for example `hrd-candidate-ranking.test.ts`. Run focused tests first, for example:

```bash
bun run test -- src/shared/tests/hrd-candidate-ranking.test.ts
```

Then run `bun run typecheck` and relevant broader checks before handing off.

## Commit & Pull Request Guidelines

Recent history uses conventional-style commits such as `feat: ...`, `fix: ...`, `refactor: ...`, and `chore: ...`. Keep commits scoped and imperative.

Pull requests should include a short description, linked issue or task when available, screenshots for UI changes, migration notes for Supabase changes, and verification commands run. Call out any known lint baseline failures separately from new issues.

## Security & Configuration Tips

Do not commit `.env`, `.dev.vars`, `.alchemy`, `wrangler.toml`, Supabase service keys, or Cloudflare credentials. Read required environment variables from `.env.example` and keep server-only secrets inside server routes or `src/lib/server/`.
