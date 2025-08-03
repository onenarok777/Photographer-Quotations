import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    head: {
      title: "Photographer Quotations",
      meta: [
        { name: "description", content: "Photographer Quotations" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/global.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["@nuxt/fonts", "@nuxtjs/color-mode", "@nuxt/image"],
  fonts: {
    families: [{ name: "Kanit", provider: "google" }],
  },
  colorMode: {
    preference: "system",
    fallback: "light",
    dataValue: "theme",
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "",
    storage: "cookie",
    storageKey: "theme",
  },
  typescript: {
    typeCheck: true,
  },
});
