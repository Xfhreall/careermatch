# Repository Guidelines

## Project Structure & Module Organization

This is a TanStack Start React app using TypeScript, Vite, Tailwind CSS, and
shadcn/ui. Application code lives in `src/`. File routes are under
`src/routes/`, with `src/routes/__root.tsx` defining the root document shell and
`src/routes/index.tsx` defining the home route. Shared utilities belong in
`src/shared/lib/`; shared UI components belong in `src/shared/components/`,
including generated shadcn components in `src/shared/components/shadcn/ui/`.
Static assets live in `public/`; app-local assets can live in `src/`, such as
`src/logo.svg`. Treat `src/routeTree.gen.ts` as generated router output.

## Build, Test, and Development Commands

Use Bun because this repo includes `bun.lock`.

- `bun install`: install dependencies.
- `bun run dev`: start Vite dev server on port `3000`.
- `bun run build`: create a production build.
- `bun run preview`: serve the built app locally.
- `bun run test`: run Vitest once.
- `bun run lint`: run Biome checks.
- `bun run format`: apply Biome formatting.
- `bun run typecheck`: run TypeScript without emitting files.

## Coding Style & Naming Conventions

Biome is the formatter and linter. Use 2-space indentation, LF line endings,
double quotes, trailing commas where valid in ES5, and no required semicolons.
Keep imports organized through Biome. Tailwind classes must remain sorted; Biome
enforces `useSortedClasses`. Prefer the `@/` alias for imports from `src/`.
Name React components in PascalCase, hooks with `use...`, and route files using
TanStack Router file-route conventions.

## Testing Guidelines

Tests run with Vitest and React Testing Library. No test files are present yet;
add focused tests next to the code they cover as `*.test.ts` or `*.test.tsx`.
Prefer user-visible behavior tests for components and small unit tests for
shared utilities. Run `bun run test`, `bun run typecheck`, and `bun run lint`
before opening a PR.

## Commit & Pull Request Guidelines

Local Git history is unavailable in this workspace, so no existing convention
can be inferred. Use concise Conventional Commit subjects, for example
`feat: add candidate dashboard` or `fix: handle empty matches`. PRs should
include a short summary, linked issue when relevant, screenshots for UI changes,
and the verification commands you ran.

## Configuration Notes

shadcn/ui aliases are configured in `components.json`; generated components
should follow those paths. Global styling and design tokens live in
`src/styles.css`. Keep secrets out of the repo and document required environment
variables when adding integrations.
