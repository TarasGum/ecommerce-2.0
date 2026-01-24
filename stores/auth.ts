// stores/auth.ts
import { defineStore } from "pinia";
import type { User } from "~/types/models";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);

  // Actions - pure state mutations only
  function setUser(newUser: User | null) {
    user.value = newUser;
  }

  function setTokens(access: string | null, refresh: string | null) {
    accessToken.value = access;
    refreshToken.value = refresh;
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    // Getters
    isAuthenticated,
    // Actions
    setUser,
    setTokens,
    clearAuth,
  };
});
