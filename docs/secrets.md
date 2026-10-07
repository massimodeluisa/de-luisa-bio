# Secrets checklist

1. Copy `secrets.local.example` → `secrets.local`
2. Fill values from your current host dashboards (temporary dump while migrating)
3. Remove or rotate secrets on the upstream `open-bio-page/open-bio-page` repository if that repo should stay clean
4. On each forked instance, upload the secrets again to Actions and to the serverless env
5. Confirm `secrets.local` is gitignored (it is listed in `.gitignore`)

Never put secrets in `VITE_*` variables. Those values ship in the client bundle.

PostHog keys and where each one goes: [Analytics and admin stats](/analytics).
