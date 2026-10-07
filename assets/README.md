# Brand assets

The mark is a profile and a short stack of links: one clay disc, then three bars that get shorter. It should still read as a link-in-bio at favicon size.

SVG files are the source of truth. The docs site serves them from `docs/public/` through relative symlinks into this folder. It does not vendor copies.

## Colors

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#1C1B1A` | Dark field, text on paper |
| Paper | `#F4F0E6` | Light field, bars on ink |
| Clay | `#C46A4A` | Profile disc, accent |
| Clay deep | `#A3563A` | Links and buttons on paper |
| Slate | `#5E6E86` | Third bar on paper, secondary text |
| Mist | `#8A96A8` | Third bar on ink |

## Files

| Theme | Square corners | Rounded corners |
| --- | --- | --- |
| Dark | `mark-dark-square.svg` | `mark-dark-rounded.svg` |
| Light | `mark-light-square.svg` | `mark-light-rounded.svg` |

- `mark.svg` and `logo.svg`: default dark rounded mark.
- `favicon-dark.svg` and `favicon-light.svg`: 64 × 64 sources.
- `favicon.svg`: dark fallback favicon.
- `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`: raster icons. Render from `favicon.svg` and `mark-dark-rounded.svg`.
- `og.svg`: 1200 × 630 social source. `og.png` is the render. `og.jpg` is the file under 500 KB for WhatsApp and OG checkers.
- VitePress logos: `docs/public/logo-light.svg` and `logo-dark.svg` point at `mark-light-rounded.svg` and `mark-dark-rounded.svg`.

## Geometry

The 1024 × 1024 masters place the disc at `cx=340`, `cy=512`, `r=120`. The bars start at `x=536`, are 72 units tall, and sit at `y=372`, `476`, and `580` (32 units apart). Widths are 328, 248, and 184. Rounded fields use radius 192. Bar and disc geometry is the same on the square masters. The outer field radius is the only difference.
