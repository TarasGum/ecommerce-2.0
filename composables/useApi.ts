// composables/useApi.ts
// Provides easy API access using the api-client

import { apiClient } from "~/utils/api-client";

export const useApi = () => {
  const get = <T>(url: string, options?: RequestInit) => {
    return apiClient<T>(url, { ...options, method: "GET" });
  };

  const post = <T>(url: string, data?: any, options?: RequestInit) => {
    return apiClient<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  };

  const put = <T>(url: string, data?: any, options?: RequestInit) => {
    return apiClient<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  };

  const patch = <T>(url: string, data?: any, options?: RequestInit) => {
    return apiClient<T>(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  };

  const del = <T>(url: string, options?: RequestInit) => {
    return apiClient<T>(url, { ...options, method: "DELETE" });
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
  };
};
