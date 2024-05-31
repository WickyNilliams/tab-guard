import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://wicky.nillia.ms",
  base: "/tab-guard",
  trailingSlash: "always",
  devToolbar: {
    enabled: false,
  },
});
