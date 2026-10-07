<script setup>import UiShot from './.vitepress/theme/components/UiShot.vue'</script>

# Admin & scoped auth

Each `ADMIN_USERS` entry binds `{ user, slug, salt, passHash }`.

<UiShot
  name="admin-login"
  alt="The admin sign-in form, titled Ferraresi family: Admin, with Username and Password fields and a Sign in button."
  url="your-domain.com/admin"
  caption="Sign-in page"
/>

| Endpoint | Scope |
| --- | --- |
| `GET /bio` | Only `content/bios/<session.slug>.json` |
| `POST /bio` | Rejects if body slug ≠ session slug; path forced to session slug |
| `POST /media` | Filename must match `<slug>-(original\|250\|600\|2000).webp` |
| `GET /stats` | [PostHog filtered to that slug](/analytics) |

The admin UI also forces `form.slug = session.slug` on load, save, and avatar upload.

<UiShot
  name="admin-editor"
  alt="The admin editor signed in as giulia, with her name, colours, font, and layout in the form and, on desktop, a live preview of her page."
  url="your-domain.com/admin"
  caption="Editor with live preview"
/>

The Stats tab needs PostHog. Setup and the meaning of each number are in [Analytics and admin stats](/analytics).

<UiShot
  name="admin-stats"
  alt="The admin Stats tab for the last 30 days, with 1240 visits, 812 unique visitors, a bar chart of views per day, and lists of clicks by link, sources, and countries."
  url="your-domain.com/admin"
  caption="Stats for the last 30 days, sample data"
/>
