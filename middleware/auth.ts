// middleware/auth.ts
// SSR-compatible authentication middleware

import type { User } from "~/types/models";
import { useAuthStore } from "~/stores/auth";

// Type for auth result
type AuthResult = { user: User; accessToken: string; refreshToken: string | null } | null;

// Type for serializable auth state (stored in payload for SSR hydration)
interface AuthState {
  result: AuthResult;
  error: boolean;
}

// Extend NuxtApp type for our non-serializable promise storage
declare module '#app' {
  interface NuxtApp {
    _authPromise?: Promise<AuthResult>;
  }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  
  // Use SSR-safe state via nuxtApp.payload for sharing results across parallel middleware calls
  // Only store serializable data (result, error) - promise is stored on nuxtApp instance (not serialized)
  if (!nuxtApp.payload._authState) {
    nuxtApp.payload._authState = { result: null, error: false } as AuthState;
  }
  const authState = nuxtApp.payload._authState as AuthState;
  
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

  // Already authenticated via store - skip
  if (authStore.user) {
    return;
  }

  // Already have result from previous parallel call - use it
  if (authState.result) {
    authStore.setUser(authState.result.user);
    authStore.setTokens(authState.result.accessToken, authState.result.refreshToken);
    return;
  }

  // Previous call failed - redirect
  if (authState.error) {
    return navigateTo('/login');
  }

  // No tokens at all → redirect to login
  if (!accessCookie.value && !refreshCookie.value) {
    authState.error = true;
    return navigateTo('/login');
  }

  // If another auth attempt is in progress, wait for it
  if (nuxtApp._authPromise) {
    try {
      const result = await nuxtApp._authPromise;
      if (result) {
        authStore.setUser(result.user);
        authStore.setTokens(result.accessToken, result.refreshToken);
        return;
      } else {
        return navigateTo('/login');
      }
    } catch {
      return navigateTo('/login');
    }
  }

  // Start new auth attempt with lock
  nuxtApp._authPromise = (async () => {
    try {
      let currentAccessToken = accessCookie.value;
      const currentRefreshToken = refreshCookie.value;

      // Only refresh token exists (access expired) → try to refresh
      if (!currentAccessToken && currentRefreshToken) {
        try {
          const refreshResponse = await $fetch<{ access: string }>(`${apiBase}/auth/refresh/`, {
            method: 'POST',
            body: { refresh: currentRefreshToken },
          });
          currentAccessToken = refreshResponse.access;
          accessCookie.value = currentAccessToken;
        } catch {
          accessCookie.value = null;
          refreshCookie.value = null;
          authState.error = true;
          return null;
        }
      }

      // Now we should have access token → fetch user
      if (currentAccessToken) {
        try {
          const user = await $fetch<User>(`${apiBase}/auth/me/`, {
            headers: {
              Authorization: `Bearer ${currentAccessToken}`,
            },
          });
          const result = { user, accessToken: currentAccessToken, refreshToken: currentRefreshToken };
          authState.result = result; // Cache the result for parallel calls
          return result;
        } catch (error: any) {
          // Access token invalid → try refresh if we have refresh token
          if (error?.response?.status === 401 && currentRefreshToken) {
            try {
              const refreshResponse = await $fetch<{ access: string }>(`${apiBase}/auth/refresh/`, {
                method: 'POST',
                body: { refresh: currentRefreshToken },
              });
              const newAccessToken = refreshResponse.access;
              accessCookie.value = newAccessToken;

              const user = await $fetch<User>(`${apiBase}/auth/me/`, {
                headers: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
              const result = { user, accessToken: newAccessToken, refreshToken: currentRefreshToken };
              authState.result = result; // Cache the result
              return result;
            } catch {
              accessCookie.value = null;
              refreshCookie.value = null;
              authState.error = true;
              return null;
            }
          } else {
            accessCookie.value = null;
            refreshCookie.value = null;
            authState.error = true;
            return null;
          }
        }
      }

      authState.error = true;
      return null;
    } catch {
      authState.error = true;
      return null;
    }
  })();

  // Wait for auth result
  try {
    const result = await nuxtApp._authPromise;
    if (result) {
      authStore.setUser(result.user);
      authStore.setTokens(result.accessToken, result.refreshToken);
    } else {
      authStore.clearAuth();
      return navigateTo('/login');
    }
  } catch {
    authStore.clearAuth();
    return navigateTo('/login');
  }
});
