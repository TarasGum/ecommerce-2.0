// middleware/redirect-if-authenticated.ts
// Redirects authenticated users away from login page

export default defineNuxtRouteMiddleware((to, from) => {
  // Check if we have tokens in cookies
  const accessCookie = useCookie("auth.access");
  const refreshCookie = useCookie("auth.refresh");

  // If we have tokens, redirect to home
  if (accessCookie.value || refreshCookie.value) {
    return navigateTo("/");
  }
});
