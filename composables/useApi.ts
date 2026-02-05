// composables/useApi.ts
// Provides easy API access using the api-client composable

export const useApi = () => {
  const { apiClient } = useApiClient();

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

  const del = <T>(url: string, data?: any, options?: RequestInit) => {
    return apiClient<T>(url, {
      ...options,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
  };
};
