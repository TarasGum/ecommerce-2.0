// middleware/redirect-if-authenticated.ts
// Redirects authenticated users away from login page

import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore();
  
  const accessCookie = useCookie('auth.access');
  const refreshCookie = useCookie('auth.refresh');

  // If auth just failed (tokens were invalid), don't redirect back - let user see login page
  const authState = (nuxtApp.payload as any)?._authState;
  if (authState?.error) {
    return; // Allow access to login page
  }

  // Check if user is authenticated (either in store OR via cookies)
  if (authStore.user || accessCookie.value || refreshCookie.value) {
    return navigateTo("/");
  }

  // No authenticated user, allow access to login page
});
