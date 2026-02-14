// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  runtimeConfig: {
    cftoken: process.env.CF_TOKEN,
    cfzone: process.env.CF_ZONE,
  },
  routeRules: {
    "/api/**": { swr: 600 }
  },
  css: ["@/assets/index.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
  }
})