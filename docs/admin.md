# Admin & scoped auth

Each `ADMIN_USERS` entry binds `{ user, slug, salt, passHash }`.

| Endpoint | Scope |
| --- | --- |
| `GET /bio` | Only `content/bios/<session.slug>.json` |
| `POST /bio` | Rejects if body slug ≠ session slug; path forced to session slug |
| `POST /media` | Filename must match `<slug>-(original\|250\|600\|2000).webp` |
| `GET /stats` | PostHog filtered to that slug |

The admin UI also forces `form.slug = session.slug` on load, save, and avatar upload.
