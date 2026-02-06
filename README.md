# mars-grid-demo

Next.js (App Router) based demo for Mars grid map/game workflows.

## Directory Structure

- `app/`: App Router pages and API routes (`app/api/**/route.ts`).
- `public/`: static assets served directly.
- `src/`: shared source modules (`src/lib/*`).
- `lib/`: server-side/shared utility modules.
- `docs/`: project documentation.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`: start development server.
- `npm run build`: production build.
- `npm run start`: run production server.
- `npm run lint`: run ESLint.

## Notes

- Runtime output (`.next/`) and local secrets (`.env*`) are excluded by `.gitignore`.
- Keep route handlers under `app/api/` as the canonical API location for this repo.

## Change Log

### 2026-02-06

- Replaced default create-next-app README with project-specific documentation.
- Added explicit explanation of `app/`, `public/`, `src/`, and `lib/` roles.
