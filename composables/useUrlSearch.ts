// composables/useUrlSearch.ts
// Manages search state in URL query parameters with debouncing

import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import { DEBOUNCE_MS } from '~/utils/constants';

export interface UseUrlSearchOptions {
  /**
   * Query parameter name for search
   * @default 'search'
   */
  param?: string;
  
  /**
   * Debounce delay in milliseconds
   * @default 500
   */
  debounce?: number;
  
  /**
   * Minimum search length before triggering (0 = no minimum)
   * @default 0
   */
  minLength?: number;
  
  /**
   * Whether to trim whitespace from search value
   * @default true
   */
  trim?: boolean;
}

export interface UseUrlSearchReturn {
  /** Current search value from URL */
  search: ComputedRef<string>;
  
  /** Local search input value (for v-model binding) */
  searchInput: Ref<string>;
  
  /** Whether the search is currently debouncing */
  isDebouncing: ComputedRef<boolean>;
  
  /** Update the search value (debounced) */
  setSearch: (value: string) => void;
  
  /** Clear the search */
  clearSearch: () => void;
  
  /** Immediately apply search without debounce */
  applySearchImmediately: () => void;
}

/**
 * Composable for managing search state in URL query parameters with debouncing
 * 
 * @example
 * ```ts
 * const { searchInput, search, clearSearch } = useUrlSearch({
 *   debounce: 500,
 *   param: 'q'
 * });
 * 
 * // In template
 * <InputText v-model="searchInput" placeholder="Search..." />
 * 
 * // Use in API calls
 * const response = await api.list({ search: search.value });
 * ```
 */
export function useUrlSearch(
  options: UseUrlSearchOptions = {}
): UseUrlSearchReturn {
  const {
    param = 'search',
    debounce = DEBOUNCE_MS.SEARCH_LONG,
    minLength = 0,
    trim = true,
  } = options;

  const route = useRoute();
  const router = useRouter();

  // Track if we're currently debouncing
  const pendingUpdate = ref(false);

  /**
   * Current search value from URL
   */
  const search = computed(() => {
    const value = route.query[param];
    if (typeof value === 'string') {
      return trim ? value.trim() : value;
    }
    return '';
  });

  /**
   * Local input value for v-model
   * Initialize from URL on mount
   */
  const searchInput = ref(search.value);

  /**
   * Whether currently debouncing
   */
  const isDebouncing = computed(() => pendingUpdate.value);

  /**
   * Update URL query parameter
   */
  function updateUrlSearch(value: string) {
    const processedValue = trim ? value.trim() : value;
    
    // Check minimum length
    if (processedValue && minLength > 0 && processedValue.length < minLength) {
      return;
    }

    const query = { ...route.query };

    if (processedValue) {
      query[param] = processedValue;
    } else {
      delete query[param];
    }

    // Use replace to avoid adding history entries
    router.replace({ query });
    pendingUpdate.value = false;
  }

  /**
   * Debounced search update
   */
  const debouncedUpdate = useDebounceFn((value: string) => {
    updateUrlSearch(value);
  }, debounce);

  /**
   * Set search value (debounced)
   */
  function setSearch(value: string) {
    searchInput.value = value;
    pendingUpdate.value = true;
    debouncedUpdate(value);
  }

  /**
   * Clear search
   */
  function clearSearch() {
    searchInput.value = '';
    pendingUpdate.value = false;
    updateUrlSearch('');
  }

  /**
   * Apply search immediately without debounce
   */
  function applySearchImmediately() {
    pendingUpdate.value = false;
    updateUrlSearch(searchInput.value);
  }

  /**
   * Watch searchInput for changes (for v-model)
   */
  watch(searchInput, (newValue) => {
    pendingUpdate.value = true;
    debouncedUpdate(newValue);
  });

  /**
   * Sync searchInput when URL changes externally
   * (e.g., browser back/forward)
   */
  watch(search, (newValue) => {
    if (searchInput.value !== newValue && !pendingUpdate.value) {
      searchInput.value = newValue;
    }
  });

  return {
    search,
    searchInput,
    isDebouncing,
    setSearch,
    clearSearch,
    applySearchImmediately,
  };
}
