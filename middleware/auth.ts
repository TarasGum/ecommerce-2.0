// middleware/auth.ts
// Protects routes and ensures user is authenticated

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  // Try to bootstrap session from cookies
  const isAuthenticated = await auth.bootstrap();

  if (!isAuthenticated) {
    // Not authenticated - redirect to login
    return navigateTo("/login");
  }
});
