// middleware/auth.ts
// SSR-compatible authentication middleware

import type { User } from "~/types/models";
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  
  const accessCookie = useCookie('auth.access', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  const refreshCookie = useCookie('auth.refresh', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  const apiBase = config.public.apiBase;

  // No tokens at all → redirect to login
  if (!accessCookie.value && !refreshCookie.value) {
    return navigateTo('/login');
  }

  // Only refresh token exists (access expired) → try to refresh
  if (!accessCookie.value && refreshCookie.value) {
    try {
      const refreshResponse = await $fetch<{ access: string }>(`${apiBase}/auth/refresh/`, {
        method: 'POST',
        body: { refresh: refreshCookie.value },
      });
      accessCookie.value = refreshResponse.access;
    } catch (error) {
      // Refresh failed → clear everything and redirect to login
      accessCookie.value = null;
      refreshCookie.value = null;
      authStore.clearAuth();
      return navigateTo('/login');
    }
  }

  // Now we should have access token → fetch user if not in store
  if (accessCookie.value && !authStore.user) {
    try {
      const user = await $fetch<User>(`${apiBase}/auth/me/`, {
        headers: {
          Authorization: `Bearer ${accessCookie.value}`,
        },
      });
      authStore.setUser(user);
      authStore.setTokens(accessCookie.value, refreshCookie.value || null);
    } catch (error: any) {
      // Access token invalid → try refresh if we have refresh token
      if (error?.response?.status === 401 && refreshCookie.value) {
        try {
          const refreshResponse = await $fetch<{ access: string }>(`${apiBase}/auth/refresh/`, {
            method: 'POST',
            body: { refresh: refreshCookie.value },
          });
          accessCookie.value = refreshResponse.access;

          // Retry fetching user with new token
          const user = await $fetch<User>(`${apiBase}/auth/me/`, {
            headers: {
              Authorization: `Bearer ${accessCookie.value}`,
            },
          });
          authStore.setUser(user);
          authStore.setTokens(accessCookie.value, refreshCookie.value);
        } catch {
          // Refresh also failed → clear and redirect
          accessCookie.value = null;
          refreshCookie.value = null;
          authStore.clearAuth();
          return navigateTo('/login');
        }
      } else {
        // Other error or no refresh token → clear and redirect
        accessCookie.value = null;
        refreshCookie.value = null;
        authStore.clearAuth();
        return navigateTo('/login');
      }
    }
  }

  // If we still don't have a user at this point, redirect to login
  if (!authStore.user) {
    return navigateTo('/login');
  }
});
