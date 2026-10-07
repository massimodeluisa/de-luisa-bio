import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import CopyPrompt from "./CopyPrompt.vue";
import HeroPreview from "./components/HeroPreview.vue";
import HomeLive from "./components/HomeLive.vue";
import "./style.css";
import "./home.css";

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "home-hero-info-before": () =>
        h("p", { class: "hero-eyebrow" }, "100% FREE AND OPEN SOURCE"),
      "home-hero-image": () => h(HeroPreview),
      "home-features-after": () => h(CopyPrompt),
    }),
  enhanceApp({ app }) {
    app.component("HomeLive", HomeLive);
  },
} satisfies Theme;
