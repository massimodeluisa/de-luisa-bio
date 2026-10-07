import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS_DIR = join(ROOT, "assets");
const PUBLIC_DIR = join(ROOT, "public");

const EPalette = {
  ink: "#14151B",
  paper: "#F6F6F4",
  link: "#3A5BFF",
  tint: "#E2E7FF",
  slate: "#5B5E6B",
} as const;

/** X marks a filled cell. Rows run top to bottom. */
const EPattern = ["X.X.X", ".XXX.", "..X..", ".XXX.", ".X.X."] as const;

interface IGeometry {
  size: number;
  cell: number;
  origin: number;
  radius: number;
}

const MASTER: IGeometry = { size: 1024, cell: 128, origin: 192, radius: 192 };
const FAVICON: IGeometry = { size: 64, cell: 8, origin: 12, radius: 12 };

/**
 * One path for all cells: separate rects leave hairline seams when the SVG is rasterized
 * at a scale that puts cell edges between pixels (180 px icon).
 */
const cells = (geometry: IGeometry): string => {
  const d = EPattern.flatMap((row, y) =>
    [...row].flatMap((mark, x) =>
      mark === "X"
        ? [
          `M${geometry.origin + x * geometry.cell} ${
            geometry.origin + y * geometry.cell
          }h${geometry.cell}v${geometry.cell}h-${geometry.cell}z`,
        ]
        : []
    )
  ).join("");
  return `<path d="${d}"/>`;
};

const mark = (
  geometry: IGeometry,
  field: string,
  radius: number,
  title: string,
): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${geometry.size}" height="${geometry.size}" viewBox="0 0 ${geometry.size} ${geometry.size}" role="img" aria-label="Open Bio Page">
  <title>${title}</title>
  <rect width="${geometry.size}" height="${geometry.size}" rx="${radius}" fill="${field}"/>
  <g fill="${EPalette.link}">
    ${cells(geometry)}
  </g>
</svg>
`;

const markDarkRounded = mark(
  MASTER,
  EPalette.ink,
  MASTER.radius,
  "Open Bio Page · dark rounded mark",
);
const markDarkSquare = mark(
  MASTER,
  EPalette.ink,
  0,
  "Open Bio Page · dark square mark",
);
const markLightRounded = mark(
  MASTER,
  EPalette.tint,
  MASTER.radius,
  "Open Bio Page · light rounded mark",
);
const markLightSquare = mark(
  MASTER,
  EPalette.tint,
  0,
  "Open Bio Page · light square mark",
);
const faviconLight = mark(
  FAVICON,
  EPalette.ink,
  FAVICON.radius,
  "Open Bio Page · light favicon",
);
const faviconDark = mark(
  FAVICON,
  EPalette.tint,
  FAVICON.radius,
  "Open Bio Page · dark favicon",
);

const render = (svg: string, size: number): Promise<Buffer> =>
  sharp(Buffer.from(svg), {
    density: (72 * size) / Number(/viewBox="0 0 (\d+)/.exec(svg)?.[1]),
  })
    .resize(size, size)
    .png()
    .toBuffer();

/** PNG-in-ICO: ICONDIR, one ICONDIRENTRY per image, then the PNG payloads. */
const encodeIco = (images: { size: number; png: Buffer }[]): Buffer => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
};

const svgFiles: Record<string, string> = {
  "mark-dark-rounded.svg": markDarkRounded,
  "mark-dark-square.svg": markDarkSquare,
  "mark-light-rounded.svg": markLightRounded,
  "mark-light-square.svg": markLightSquare,
  "mark.svg": markDarkRounded,
  "logo.svg": markDarkRounded,
  "favicon-light.svg": faviconLight,
  "favicon-dark.svg": faviconDark,
  "favicon.svg": faviconLight,
};

mkdirSync(ASSETS_DIR, { recursive: true });
for (const [name, content] of Object.entries(svgFiles)) {
  writeFileSync(join(ASSETS_DIR, name), content);
}

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(
  icoSizes.map(async (size) => ({
    size,
    png: await render(faviconLight, size),
  })),
);
writeFileSync(join(ASSETS_DIR, "favicon.ico"), encodeIco(icoImages));
writeFileSync(
  join(ASSETS_DIR, "favicon-32x32.png"),
  await render(faviconLight, 32),
);
writeFileSync(
  join(ASSETS_DIR, "apple-touch-icon.png"),
  await render(markDarkSquare, 180),
);

copyFileSync(join(ASSETS_DIR, "favicon.ico"), join(PUBLIC_DIR, "favicon.ico"));
