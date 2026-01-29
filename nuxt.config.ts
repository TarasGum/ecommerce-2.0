// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@pinia/nuxt", "@vueuse/nuxt", "@vueuse/motion/nuxt"],

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
    // Page transitions
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // Motion configuration for smooth animations
  motion: {
    directives: {
      'pop-bottom': {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 300, ease: 'easeOut' } },
        leave: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 200, ease: 'easeIn' } },
      },
      'custom-fade': {
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: { duration: 250 } },
        leave: { opacity: 0, transition: { duration: 150 } },
      },
      'custom-slide-left': {
        initial: { opacity: 0, x: -20 },
        enter: { opacity: 1, x: 0, transition: { duration: 300, ease: 'easeOut' } },
      },
      'custom-slide-right': {
        initial: { opacity: 0, x: 20 },
        enter: { opacity: 1, x: 0, transition: { duration: 300, ease: 'easeOut' } },
      },
      'scale': {
        initial: { opacity: 0, scale: 0.9 },
        enter: { opacity: 1, scale: 1, transition: { duration: 250, ease: 'easeOut' } },
      },
    },
  },

  ssr: true,
});
