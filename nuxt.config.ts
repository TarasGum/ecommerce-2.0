// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@pinia/nuxt", "@vueuse/nuxt"],

  css: [
    // Order: PrimeVue -> PrimeFlex -> Custom
    "primevue/resources/primevue.css",
    "primevue/resources/themes/lara-light-blue/theme.css",
    "primeicons/primeicons.css",
    // PrimeFlex - Utility-first CSS framework (flex, grid, spacing, etc.)
    "primeflex/primeflex.css",
    // Custom CSS
    "~/assets/css/main.css",            // Design system variables
    "~/assets/css/utilities.css",       // Custom utilities not in PrimeFlex
    "~/assets/css/prime-overrides.css", // PrimeVue component overrides
    "~/assets/css/components.css",      // Custom component styles
  ],

  build: {
    transpile: ["primevue"],
  },

  typescript: {
    strict: true,
    typeCheck: false, // Disabled until vue-tsc is installed
  },

  runtimeConfig: {
    public: {
      // Single source of truth for API base URL
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE 
    },
  },

  app: {
    head: {
      title: "Ecommerce Platform",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        {
          name: "description",
          content: "Multi-project ecommerce management platform",
        },
      ],
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },

  ssr: true,
});
