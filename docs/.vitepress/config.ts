import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vitepress";

const ESiteOrigin = "https://openbio.page";
const ESiteDescription =
  "White-label link-in-bio you host yourself. Fork it, edit the JSON, and publish on your domain.";
const EOgImage = `${ESiteOrigin}/og.jpg`;
const EOgImageAlt =
  "Open Bio Page. Your links. Your brand. Your host. Your stats. Free.";
const EPublicAsset = (file: string) => `/${file}`;
const EExampleRoute = /^(\/examples\/[^/]+\/)([^/.]*)$/;

function pageCanonicalUrl(relativePath: string): string {
  const path = relativePath.replace(/index\.md$/, "").replace(/\.md$/, ".html");
  return `${ESiteOrigin}/${path}`;
}

export default defineConfig({
  lang: "en-US",
  title: "Open Bio Page",
  description: ESiteDescription,
  base: "/",
  outDir: ".vitepress/dist",
  cacheDir: ".vitepress/cache",
  cleanUrls: false,
  lastUpdated: false,
  appearance: true,
  sitemap: {
    hostname: ESiteOrigin,
  },
  vite: {
    plugins: [
      {
        name: "examples-clean-urls",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const [pathname = "", query] = (req.url ?? "").split("?");
            const match = req.method === "GET"
              ? EExampleRoute.exec(pathname)
              : null;
            if (match) {
              const file = `${match[1]}${match[2] || "index"}.html`;
              if (existsSync(join(server.config.publicDir, file))) {
                req.url = query === undefined ? file : `${file}?${query}`;
              }
            }
            next();
          });
        },
      },
    ],
  },
  transformPageData(pageData) {
    const url = pageCanonicalUrl(pageData.relativePath);
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:url", content: url }],
    );
  },
  head: [
    ["link", { rel: "icon", href: EPublicAsset("favicon.ico"), sizes: "any" }],
    ["link", {
      rel: "icon",
      href: EPublicAsset("favicon-32x32.png"),
      type: "image/png",
      sizes: "32x32",
    }],
    ["link", {
      rel: "icon",
      href: EPublicAsset("favicon.svg"),
      type: "image/svg+xml",
    }],
    [
      "link",
      {
        rel: "icon",
        href: EPublicAsset("favicon-light.svg"),
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        href: EPublicAsset("favicon-dark.svg"),
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    ["link", {
      rel: "apple-touch-icon",
      href: EPublicAsset("apple-touch-icon.png"),
      sizes: "180x180",
    }],
    ["link", { rel: "manifest", href: EPublicAsset("site.webmanifest") }],
    ["meta", {
      name: "theme-color",
      content: "#F6F6F4",
      media: "(prefers-color-scheme: light)",
    }],
    ["meta", {
      name: "theme-color",
      content: "#14151B",
      media: "(prefers-color-scheme: dark)",
    }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Open Bio Page" }],
    ["meta", { property: "og:locale", content: "en_US" }],
    ["meta", { property: "og:title", content: "Open Bio Page" }],
    ["meta", { property: "og:description", content: ESiteDescription }],
    ["meta", { property: "og:image", content: EOgImage }],
    ["meta", { property: "og:image:type", content: "image/jpeg" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:image:alt", content: EOgImageAlt }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@massimodeluisa" }],
    ["meta", { name: "twitter:title", content: "Open Bio Page" }],
    ["meta", { name: "twitter:description", content: ESiteDescription }],
    ["meta", { name: "twitter:image", content: EOgImage }],
    ["meta", { name: "twitter:image:alt", content: EOgImageAlt }],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "Open Bio Page",
            url: `${ESiteOrigin}/`,
            description: ESiteDescription,
            publisher: {
              "@type": "Person",
              name: "Massimo De Luisa",
              url: "https://deluisa.me",
            },
          },
          {
            "@type": "SoftwareSourceCode",
            name: "open-bio-page",
            description: ESiteDescription,
            codeRepository: "https://github.com/open-bio-page/open-bio-page",
            url: `${ESiteOrigin}/`,
            programmingLanguage: "TypeScript",
            runtimePlatform: "Web",
            license: "https://opensource.org/licenses/MIT",
          },
        ],
      }),
    ],
  ],
  themeConfig: {
    logo: {
      light: "/logo-light.svg",
      dark: "/logo-dark.svg",
      alt: "Open Bio Page",
    },
    siteTitle: "Open Bio Page",
    nav: [
      { text: "Guide", link: "/guide" },
      { text: "Deploy", link: "/deploy/" },
      { text: "Providers", link: "/providers/" },
      { text: "Admin & auth", link: "/admin" },
    ],
    sidebar: [
      {
        text: "Start",
        items: [
          { text: "What it is", link: "/" },
          { text: "Install and usage", link: "/guide" },
          { text: "Create your bio", link: "/create" },
        ],
      },
      {
        text: "Deploy",
        items: [
          { text: "Overview", link: "/deploy/" },
          { text: "GitHub Pages + secrets", link: "/deploy/github-pages" },
          { text: "Your instance", link: "/deploy/fork-instance" },
        ],
      },
      {
        text: "Serverless providers",
        items: [
          { text: "Compare free tiers", link: "/providers/" },
          { text: "Cloudflare Workers", link: "/providers/cloudflare" },
          { text: "Vercel", link: "/providers/vercel" },
          { text: "Netlify", link: "/providers/netlify" },
          { text: "AWS Lambda", link: "/providers/aws-lambda" },
          { text: "Azure Functions", link: "/providers/azure" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Admin & scoped auth", link: "/admin" },
          { text: "Analytics & stats", link: "/analytics" },
          { text: "site.json", link: "/site-config" },
          { text: "Secrets checklist", link: "/secrets" },
        ],
      },
    ],
    socialLinks: [{
      icon: "github",
      link: "https://github.com/open-bio-page/open-bio-page",
    }],
    editLink: {
      pattern:
        "https://github.com/open-bio-page/open-bio-page/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },
    search: { provider: "local" },
    footer: {
      message:
        'Open-source white-label, made with ❤️ by <a href="https://deluisa.me">Massimo De Luisa</a>',
      copyright: "© 2026 Massimo De Luisa. MIT License.",
    },
    outline: { level: [2, 3] },
  },
});
