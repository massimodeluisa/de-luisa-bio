# Brand assets

The mark is a 5 × 5 grid of square cells in the style of the identicon GitHub shows before an account has a photo. The filled cells form a figure with both arms raised, a cheering \o/, which stands for a person and the page they publish. The cells are sharp, with no rounding and no gaps, so the mark stays legible at favicon size.

`scripts/generate-brand-assets.ts` is the source of truth. It holds the pattern and the palette, writes every file in this folder except the social preview, and copies `favicon.ico` to `public/favicon.ico`. The social preview source lives in `og/`, and `bun run og:image` exports it as `og.png` and `og.jpg`. The docs site serves these files from `docs/public/` through relative symlinks into this folder and does not vendor copies.

## Colors

The palette is called Hyperlink: ink, paper and link blue.

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#14151B` | Dark field, text on paper |
| Paper | `#F6F6F4` | Page background, text on ink |
| Link | `#3A5BFF` | Filled cells, links, accents on paper |
| Link on ink | `#8FA2FF` | Links and accents on a dark background |
| Visited | `#7B44E8` | Secondary color on paper |
| Visited on ink | `#B99BFF` | Secondary color on a dark background |
| Tint | `#E2E7FF` | Light field, text selection on paper |
| Slate | `#5B5E6B` | Secondary text on paper |

## Files

| Theme | Square corners | Rounded corners |
| --- | --- | --- |
| Dark (ink field) | `mark-dark-square.svg` | `mark-dark-rounded.svg` |
| Light (tint field) | `mark-light-square.svg` | `mark-light-rounded.svg` |

- `mark.svg` and `logo.svg`: copies of `mark-dark-rounded.svg`.
- `favicon-dark.svg` and `favicon-light.svg`: 64 × 64 sources.
- `favicon.svg`: fallback favicon, identical to `favicon-light.svg`.
- `favicon.ico`: 16, 32 and 48 px renders of `favicon-light.svg`, stored as PNG images inside the ICO container.
- `favicon-32x32.png`: 32 px render of `favicon-light.svg`.
- `apple-touch-icon.png`: 180 × 180 render of `mark-dark-square.svg`. iOS rounds the corners itself.
- `og/`: social preview source. `bun run og:dev` opens it; `bun run og:image` exports `og.png` and `og.jpg`.

## Geometry

The 1024 × 1024 masters use a cell size of 128 and a grid origin of `x=192`, `y=192`, so the grid spans 192 to 832. Rounded fields use a radius of 192 and square fields use 0.

The 64 × 64 favicon master uses a cell size of 8 and an origin of 12, so the grid spans 12 to 52 and the field radius is 12. Every cell edge falls on a whole pixel at 16, 32 and 64 px, which keeps the cells sharp without anti-aliasing.

## Favicon color schemes

`favicon-light.svg` is served under `prefers-color-scheme: light`. It draws the mark on an ink field, so the tile stands out on a light tab bar. `favicon-dark.svg` is served under `prefers-color-scheme: dark` and draws the mark on a tint field for the same reason on a dark tab bar. `favicon.svg`, `favicon.ico` and `favicon-32x32.png` use the light variant for browsers that ignore the media query.

## Symlinks

These files in `docs/public/` are relative symlinks into this folder: `favicon.svg`, `favicon-light.svg`, `favicon-dark.svg`, `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`, `og.png` and `og.jpg`. `logo-light.svg` points at `mark-light-rounded.svg` and `logo-dark.svg` points at `mark-dark-rounded.svg`. `docs/public/site.webmanifest` is a regular file.

## Regenerating

Run the generator from the repository root.

```sh
bun scripts/generate-brand-assets.ts
```

The output is deterministic, so a second run leaves every file unchanged.
