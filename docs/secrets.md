# Secrets checklist

1. Copy `secrets.local.example` → `secrets.local`
2. Fill values from your current host dashboards (temporary dump while migrating)
3. Remove / rotate secrets on the **upstream** `open-bio-page/open-bio-page` repository if it should stay clean
4. On each **GitHub Fork** instance repo, re-upload secrets to Actions + serverless env
5. Confirm `secrets.local` is gitignored (`gitignore` includes it)

Never put secrets in `VITE_*` variables — those are public.
