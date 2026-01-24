// composables/useAuth.ts
// Orchestrates authentication flow: login, logout, session restoration

import type { LoginResponse, User } from "~/types/models";
import { ValidationError } from "~/utils/errors";
import { COOKIE_CONFIG } from "~/utils/constants";

export const useAuth = () => {
  const authStore = useAuthStore();
  const api = useApi();
  const router = useRouter();

  // Login
  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<LoginResponse>("/auth/login/", {
      email,
      password,
    });

    // Update store
    authStore.setUser(response.user);
    authStore.setTokens(response.access, response.refresh);

    // Persist tokens in cookies (SSR-safe)
    const accessCookie = useCookie(COOKIE_CONFIG.names.access, {
      maxAge: COOKIE_CONFIG.maxAge.access,
      sameSite: COOKIE_CONFIG.options.sameSite,
      secure: process.env.NODE_ENV === "production",
      path: COOKIE_CONFIG.options.path,
    });
    const refreshCookie = useCookie(COOKIE_CONFIG.names.refresh, {
      maxAge: COOKIE_CONFIG.maxAge.refresh,
      sameSite: COOKIE_CONFIG.options.sameSite,
      secure: process.env.NODE_ENV === "production",
      path: COOKIE_CONFIG.options.path,
    });

    accessCookie.value = response.access;
    refreshCookie.value = response.refresh;

    // Redirect to home
    await router.push("/");
  }

  // Logout
  async function logout(): Promise<void> {
    // Invalidate tokens on server
    try {
      const refreshToken = authStore.refreshToken;
      if (refreshToken) {
        // Try without trailing slash first (some APIs don't accept it)
        await api.post("/auth/logout", { refresh: refreshToken });
      }
    } catch (error) {
      // Log error but don't block logout - this is not critical
      console.warn("Failed to invalidate tokens on server (non-critical):", error);
    }

    // Clear store
    authStore.clearAuth();

    // Clear cookies
    const accessCookie = useCookie(COOKIE_CONFIG.names.access);
    const refreshCookie = useCookie(COOKIE_CONFIG.names.refresh);
    accessCookie.value = null;
    refreshCookie.value = null;

    // Redirect to login
    await router.push("/login");
  }

  // Bootstrap session from cookies
  async function bootstrap(): Promise<boolean> {
    // Check if we have tokens in cookies
    const accessCookie = useCookie(COOKIE_CONFIG.names.access);
    const refreshCookie = useCookie(COOKIE_CONFIG.names.refresh);

    if (!accessCookie.value && !refreshCookie.value) {
      return false;
    }

    // Restore tokens to store
    authStore.setTokens(accessCookie.value || null, refreshCookie.value || null);

    // If we have a user, we're done
    if (authStore.user) {
      return true;
    }

    // Fetch user profile
    try {
      const user = await api.get<User>("/auth/me/");
      authStore.setUser(user);
      return true;
    } catch (error) {
      // Failed to fetch user - clear everything silently
      // Don't show toast for bootstrap failures
      authStore.clearAuth();
      accessCookie.value = null;
      refreshCookie.value = null;
      return false;
    }
  }

  return {
    login,
    logout,
    bootstrap,
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
  };
};
