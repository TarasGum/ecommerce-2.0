// plugins/auth.client.ts
// Bootstrap authentication on client-side app initialization

export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (process.server) return

  const route = useRoute()
  
  // Skip bootstrap on login page - let the page handle it
  if (route.path === '/login') {
    return
  }

  const auth = useAuth()
  const authStore = useAuthStore()
  const projectsStore = useProjectsStore()
  
  // Check cookies first
  const accessCookie = useCookie("auth.access")
  const refreshCookie = useCookie("auth.refresh")

  // Restore tokens from cookies
  if (accessCookie.value || refreshCookie.value) {
    authStore.setTokens(accessCookie.value ?? null, refreshCookie.value ?? null)
  }

  // Only bootstrap if we have tokens but no user (lazy bootstrap)
  // If user already exists in store, skip API call
  if (authStore.accessToken && !authStore.user) {
    // Bootstrap in background - don't block page load
    auth.bootstrap().then(() => {
      // Load projects for super admins after auth is ready
      if (authStore.user?.role === 'superadmin') {
        projectsStore.loadProjects().catch(() => {
          // Silently fail - errors shown via toast in store
        })
      }
    }).catch(() => {
      // Silently fail - errors handled elsewhere
    })
  } else if (authStore.user?.role === 'superadmin') {
    // If user already loaded, ensure projects are loaded
    projectsStore.loadProjects().catch(() => {
      // Silently fail - errors shown via toast in store
    })
  }
})
