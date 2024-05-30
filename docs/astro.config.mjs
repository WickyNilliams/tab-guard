import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://wicky.nillia.ms",
  base: "/tab-trap",
  trailingSlash: "always",
  devToolbar: {
    enabled: false,
  },
});
