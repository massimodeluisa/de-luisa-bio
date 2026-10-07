# Examples

This folder holds four example Open Bio Page instances. Each one is a complete content set (a `site.json`, one JSON file per person, and one portrait per person) that you can build and browse without changing the app.

| Folder | Kind | People |
| --- | --- | --- |
| `northvale` | Structural engineering firm in London | 20 |
| `ferraresi` | Family from Bologna | 5 |
| `ottobre` | Coffee roastery in Turin | 2 |
| `pietra` | Architecture studio in Lisbon | 6 |

The people, companies and links in these examples are fictional. The portraits are AI-generated. Every link uses a reserved `.example` domain (RFC 2606), so none of them resolves to a real site. The Northvale phone numbers come from the UK range that Ofcom sets aside for drama (020 7946 0xxx).

Each folder follows the same layout as the root `content/` directory:

```
examples/<id>/content/site.json
examples/<id>/content/bios/<slug>.json
examples/<id>/public/media/<slug>.webp
```

Run `bun run examples:build` to build every folder into `docs/public/examples/<id>/`. The docs site serves that output at `openbio.page/examples/<id>/`.

## Add another example

1. Copy an existing folder to `examples/<new-id>/`.
2. Edit `content/site.json` with the new brand, domain and home copy. Set `origin` to `https://openbio.page/examples/<new-id>`.
3. Replace the files in `content/bios/` with one JSON file per person.
4. Add one square portrait per person to `public/media/`, named after the slug, and point each bio's `avatar` at `/media/<slug>.webp`.
5. Run `bun run examples:build` and open the result under `docs/public/examples/<new-id>/`.
