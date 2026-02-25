# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

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

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

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
