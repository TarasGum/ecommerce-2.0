// composables/useApiClient.ts
// Centralized API client composable with automatic token refresh and error handling
// This is a composable (not a plain utility) to ensure access to Nuxt context for
// useAuthStore(), useRuntimeConfig(), and useCookie()

import {
  ApiError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ServerError,
  NetworkError,
} from "~/utils/errors";
import { COOKIE_CONFIG } from "~/utils/constants";
import { useAuthStore } from "~/stores/auth";

// Promise to track ongoing refresh requests (prevents duplicate refresh calls)
// This must be module-level to work across all instances of the composable
let refreshPromise: Promise<string> | null = null;

export const useApiClient = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  
  // SSR-safe cookie access
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

  /**
   * Get API base URL from runtime config
   */
  function getApiBaseUrl(): string {
    return config.public.apiBase || "/api";
  }

  /**
   * Refreshes the access token using the refresh token
   * Uses a promise lock to prevent multiple simultaneous refresh requests
   * Only runs on client-side - middleware handles SSR auth
   */
  async function refreshAccessToken(): Promise<string> {
    // Skip on server - middleware handles SSR auth
    if (import.meta.server) {
      throw new AuthenticationError("Session expired");
    }

    // Return existing refresh promise if one is in progress
    if (refreshPromise) {
      return refreshPromise;
    }

    const refreshToken = authStore.refreshToken || refreshCookie.value;

    if (!refreshToken) {
      throw new AuthenticationError("No refresh token available");
    }

    refreshPromise = (async () => {
      try {
        const response = await $fetch<{ access: string }>(`${getApiBaseUrl()}/auth/refresh/`, {
          method: "POST",
          body: { refresh: refreshToken },
        });

        const newAccessToken = response.access;

        // Update store and cookie
        authStore.setTokens(newAccessToken, refreshToken);
        accessCookie.value = newAccessToken;

        return newAccessToken;
      } catch (error) {
        // Clear auth and redirect
        authStore.clearAuth();
        accessCookie.value = null;
        refreshCookie.value = null;

        window.location.href = "/login";
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  /**
   * Handles error responses and throws appropriate error types
   */
  async function handleErrorResponse(response: Response): Promise<never> {
    const contentType = response.headers.get("content-type");
    let errorData: any = null;

    // Try to parse error response
    if (contentType && contentType.includes("application/json")) {
      try {
        errorData = await response.json();
      } catch {
        // Could not parse error response
      }
    }

    // Extract error message
    const message =
      errorData?.detail ||
      errorData?.message ||
      errorData?.error ||
      `Request failed with status ${response.status}`;

    // Throw appropriate error based on status code
    switch (response.status) {
      case 400:
        // Bad Request - could be validation errors
        if (errorData && typeof errorData === "object") {
          throw new ValidationError(message, errorData);
        }
        throw new ApiError(message);

      case 401:
        throw new AuthenticationError(message);

      case 403:
        throw new AuthenticationError(
          "You don't have permission to access this resource"
        );

      case 404:
        throw new NotFoundError(
          errorData?.detail || "The requested resource was not found"
        );

      case 422:
        // Unprocessable Entity - validation errors with field details
        throw new ValidationError(message, errorData);

      case 500:
      case 501:
      case 502:
      case 503:
      case 504:
        throw new ServerError(
          "A server error occurred. Please try again later."
        );

      default:
        throw new ApiError(message);
    }
  }

  /**
   * Main API client function
   * Handles authentication, token refresh, and error responses
   */
  async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get access token from store or cookie
    let accessToken = authStore.accessToken || accessCookie.value;

    // Build full URL
    const apiBaseUrl = getApiBaseUrl();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${apiBaseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Make the request
    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - Token expired, try to refresh
      if (response.status === 401 && accessToken) {
        try {
          // Refresh the token
          const newAccessToken = await refreshAccessToken();

          // Retry the original request with new token
          headers["Authorization"] = `Bearer ${newAccessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } catch (refreshError) {
          throw new AuthenticationError("Session expired. Please login again.");
        }
      }

      // Handle different response statuses
      if (!response.ok) {
        await handleErrorResponse(response);
      }

      // Parse successful response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      // Return empty object for non-JSON responses (e.g., 204 No Content)
      return {} as T;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError(
          "Network connection failed. Please check your internet connection."
        );
      }

      // Re-throw our custom errors
      if (
        error instanceof ApiError ||
        error instanceof AuthenticationError ||
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ServerError
      ) {
        throw error;
      }

      // Wrap unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  }

  return {
    apiClient,
  };
};
