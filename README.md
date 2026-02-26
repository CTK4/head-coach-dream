# Head Coach Dream

A dark-themed, card-based football head coach career simulator. Create a coach, interview with teams, accept an offer, hire coordinators, and manage your franchise through a full coaching career — with roster management, scouting, free agency, trades, the draft, and in-season playcalling.

## Project info

**Repository**: https://github.com/CTK4/head-coach-dream

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

Requirements: Node.js 22+ and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Step 1: Clone the repository.
git clone https://github.com/CTK4/head-coach-dream.git

# Step 2: Navigate to the project directory.
cd head-coach-dream

# Step 3: Install the necessary dependencies.
npm ci

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

The dev server runs at `http://localhost:5173` by default.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production (includes pre-build JSON validation) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run smoke` | Run the smoke test (data wiring + reference integrity) |
| `npm run test:ui` | Run Playwright UI tests |

## How can I deploy this project?

This project is configured for [Vercel](https://vercel.com) deployment. Import the repository in Vercel and it will be deployed automatically on every push to the main branch.

## Cloudflare R2 Assets

This app can load static assets from Cloudflare R2 using Vite environment variables.

A Worker is included at `workers/r2-assets` that publicly serves five R2 buckets with these routes:

- `/avatars/<key>`
- `/badges/<key>`
- `/icons/<key>`
- `/placeholders/<key>`
- `/utility/<key>`

Set these environment variables in your frontend deployment to your Worker base URL:

- `VITE_R2_AVATARS_BASE_URL=https://<worker-host>/avatars`
- `VITE_R2_BADGES_BASE_URL=https://<worker-host>/badges`
- `VITE_R2_ICONS_BASE_URL=https://<worker-host>/icons`
- `VITE_R2_PLACEHOLDERS_BASE_URL=https://<worker-host>/placeholders`
- `VITE_R2_UTILITY_BASE_URL=https://<worker-host>/utility`

Where `<worker-host>` is either:

- `https://<worker-name>.<subdomain>.workers.dev` (workers.dev)
- `https://assets.example.com` (custom domain)

The Worker preserves object content headers via `writeHttpMetadata`, returns `404` for missing keys/routes, and sets cache policy `public, max-age=31536000, immutable`.

## Contributor guidelines

- Never render enum constants or internal IDs directly in UI text (e.g. `AIR_RAID`, `teamId`, `QB`, raw status codes).
- Use centralized mapping helpers from `src/lib/displayLabels.ts` for anything surfaced to users (schemes, playbooks, positions, and other domain enums).
- If a new enum appears in UI, add its label mapping in `src/lib/displayLabels.ts` first, then use the helper in components.
