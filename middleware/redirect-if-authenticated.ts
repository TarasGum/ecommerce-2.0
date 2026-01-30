// middleware/redirect-if-authenticated.ts
// Redirects authenticated users away from login page

import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore();

  // If auth just failed (tokens were invalid), don't redirect back - let user see login page
  const authState = (nuxtApp.payload as any)?._authState;
  if (authState?.error) {
    return; // Allow access to login page
  }

  // If user is already authenticated in the store, redirect to home
  if (authStore.user) {
    return navigateTo("/");
  }

  // No authenticated user, allow access to login page
});
