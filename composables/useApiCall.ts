// composables/useApiCall.ts
// Reusable API call wrapper with consistent error handling and loading states

import type { Ref } from 'vue';

/**
 * Options for useApiCall wrapper
 */
interface UseApiCallOptions<T> {
  /** The async function to execute */
  fn: () => Promise<T>;
  
  /** Success message to show in toast (optional) */
  successMessage?: string;
  
  /** Error message prefix (default: "Operation failed") */
  errorMessage?: string;
  
  /** Show success toast (default: false) */
  showSuccess?: boolean;
  
  /** Show error toast (default: true) */
  showError?: boolean;
  
  /** Loading ref to update during execution (optional) */
  loading?: Ref<boolean>;
  
  /** Toast instance from useToast() (required for toast notifications) */
  toast?: ReturnType<typeof useToast>;
  
  /** Callback to run on success (optional) */
  onSuccess?: (data: T) => void;
  
  /** Callback to run on error (optional) */
  onError?: (error: unknown) => void;
  
  /** Callback to run after completion (success or error) (optional) */
  onFinally?: () => void;
}

/**
 * Execute an API call with consistent error handling and loading states
 * 
 * @param options - Configuration options
 * @returns Promise resolving to data on success, null on error
 * 
 * @example
 * ```typescript
 * const loading = ref(false);
 * const toast = useToast();
 * 
 * const users = await useApiCall({
 *   fn: () => usersApi.list({ limit: 20 }),
 *   errorMessage: 'Failed to load users',
 *   loading,
 *   toast,
 *   onSuccess: (data) => {
 *     console.log('Loaded', data.count, 'users');
 *   },
 * });
 * 
 * if (users) {
 *   // Process users
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // With success message
 * const toast = useToast();
 * 
 * const result = await useApiCall({
 *   fn: () => usersApi.create(userData),
 *   successMessage: 'User created successfully',
 *   errorMessage: 'Failed to create user',
 *   showSuccess: true,
 *   loading,
 *   toast,
 * });
 * ```
 */
export async function useApiCall<T>(
  options: UseApiCallOptions<T>
): Promise<T | null> {
  const {
    fn,
    successMessage,
    errorMessage = 'Operation failed',
    showSuccess = false,
    showError = true,
    loading,
    toast,
    onSuccess,
    onError,
    onFinally,
  } = options;
  
  // Set loading state
  if (loading) {
    loading.value = true;
  }
  
  try {
    // Execute the async function
    const result = await fn();
    
    // Show success toast if requested
    if (showSuccess && successMessage && toast) {
      toast.showSuccess(successMessage);
    }
    
    // Call success callback
    if (onSuccess) {
      onSuccess(result);
    }
    
    return result;
  } catch (error) {
    // Show error toast if requested
    if (showError && toast) {
      toast.showError(error, errorMessage);
    }
    
    // Call error callback
    if (onError) {
      onError(error);
    }
    
    return null;
  } finally {
    // Clear loading state
    if (loading) {
      loading.value = false;
    }
    
    // Call finally callback
    if (onFinally) {
      onFinally();
    }
  }
}
