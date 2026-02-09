// composables/useAuth.ts
// Orchestrates authentication flow: login, logout, session restoration

import type { LoginResponse, User } from "~/types/models";
import { COOKIE_CONFIG } from "~/utils/constants";
import { useAuthStore } from "~/stores/auth";
import { useProjectsStore } from "~/stores/projects";

export const useAuth = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const router = useRouter();

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

  // Login
  async function login(email: string, password: string): Promise<void> {
    const response = await $fetch<LoginResponse>(
      `${config.public.apiBase}/auth/login/`,
      {
        method: "POST",
        body: { email, password },
      },
    );

    // Update store
    authStore.setUser(response.user);
    authStore.setTokens(response.access, response.refresh);

    // Persist tokens in cookies
    accessCookie.value = response.access;
    refreshCookie.value = response.refresh;

    // Load projects for superadmin users
    if (response.user.role === "superadmin") {
      const projectsStore = useProjectsStore();
      projectsStore.loadProjects().catch(() => {
        // Silently fail - errors shown via toast in store
      });
    }

    // Redirect to home
    await router.push("/");
  }

  // Logout
  async function logout(): Promise<void> {
    // Try to invalidate tokens on server
    try {
      if (refreshCookie.value) {
        await $fetch(`${config.public.apiBase}/auth/logout/`, {
          method: "POST",
          body: { refresh: refreshCookie.value },
          headers: accessCookie.value
            ? {
                Authorization: `Bearer ${accessCookie.value}`,
              }
            : {},
        });
      }
    } catch (error) {
      console.warn("Failed to invalidate tokens on server:", error);
    }

    // Clear store
    authStore.clearAuth();

    // Clear cookies
    accessCookie.value = null;
    refreshCookie.value = null;

    // Redirect to login
    await router.push("/login");
  }

  // Bootstrap - now simplified, mainly for client-side use after SSR
  async function bootstrap(): Promise<boolean> {
    // If already have user, we're good
    if (authStore.user) {
      return true;
    }

    // No tokens → not authenticated
    if (!accessCookie.value && !refreshCookie.value) {
      return false;
    }

    // Sync tokens to store
    authStore.setTokens(
      accessCookie.value || null,
      refreshCookie.value || null,
    );

    // Try to fetch user
    try {
      const user = await $fetch<User>(`${config.public.apiBase}/auth/me/`, {
        headers: {
          Authorization: `Bearer ${accessCookie.value}`,
        },
      });
      authStore.setUser(user);
      return true;
    } catch {
      // Failed → clear auth
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
