// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  runtimeConfig: {
    cftoken: process.env.CF_TOKEN,
    cfzone: process.env.CF_ZONE,
  },
  routeRules: {
    '/api/**': { swr: 600 },
  },
  css: ['@/assets/index.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      script: [
        // apply the saved/system kumo color mode before first paint
        {
          innerHTML: `(function(){var m;try{m=localStorage.getItem('kumo-mode')}catch(e){}if(m!=='light'&&m!=='dark')m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.mode=m})()`,
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
  },
})
