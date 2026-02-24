# Public R2 Asset Worker

This worker serves five R2 buckets over public HTTP routes.

## Bucket bindings

Configure these exact `wrangler.toml` bindings in Worker settings:

- `AVATARS`
- `BADGES`
- `ICONS`
- `PLACEHOLDERS`
- `UTILITY`

## Route mapping

- `/avatars/<key>` -> `AVATARS.get(<key>)`
- `/badges/<key>` -> `BADGES.get(<key>)`
- `/icons/<key>` -> `ICONS.get(<key>)`
- `/placeholders/<key>` -> `PLACEHOLDERS.get(<key>)`
- `/utility/<key>` -> `UTILITY.get(<key>)`

The worker returns `404` when no object exists.

## Caching + metadata

Responses include:

- `cache-control: public, max-age=31536000, immutable`
- Content metadata copied from R2 via `writeHttpMetadata(...)`

## Deploy

```bash
cd workers/r2-assets
npx wrangler deploy
```

## Public base URLs to use in app

If deployed on workers.dev:

- `VITE_R2_AVATARS_BASE_URL=https://<worker-name>.<subdomain>.workers.dev/avatars`
- `VITE_R2_BADGES_BASE_URL=https://<worker-name>.<subdomain>.workers.dev/badges`
- `VITE_R2_ICONS_BASE_URL=https://<worker-name>.<subdomain>.workers.dev/icons`
- `VITE_R2_PLACEHOLDERS_BASE_URL=https://<worker-name>.<subdomain>.workers.dev/placeholders`
- `VITE_R2_UTILITY_BASE_URL=https://<worker-name>.<subdomain>.workers.dev/utility`

If deployed on a custom domain (recommended for long-term CDN URLs):

- `VITE_R2_AVATARS_BASE_URL=https://assets.example.com/avatars`
- `VITE_R2_BADGES_BASE_URL=https://assets.example.com/badges`
- `VITE_R2_ICONS_BASE_URL=https://assets.example.com/icons`
- `VITE_R2_PLACEHOLDERS_BASE_URL=https://assets.example.com/placeholders`
- `VITE_R2_UTILITY_BASE_URL=https://assets.example.com/utility`
