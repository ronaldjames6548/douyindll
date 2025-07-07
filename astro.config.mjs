import { defineConfig } from "astro/config";
import alpine from "@astrojs/alpinejs";
import i18n from "astro-i18next";

export default defineConfig({
  integrations: [
    alpine(),
    i18n({
      configModule: "./src/i18n",
      supportedLngs: ["en", "zh"],
      fallbackLng: "en",
    }),
  ],
  site: " https://tiktokarchive-one.vercel.app ",
  output: "static",
  adapter: undefined,
});
