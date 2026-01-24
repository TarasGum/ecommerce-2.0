// composables/useUrlPagination.ts
// Manages pagination state in URL query parameters

import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PAGINATION_DEFAULTS } from '~/utils/constants';

export interface UseUrlPaginationOptions {
  /**
   * Default page size (items per page)
   * @default 25
   */
  defaultPageSize?: number;
  
  /**
   * Query parameter name for page number
   * @default 'page'
   */
  pageParam?: string;
  
  /**
   * Query parameter name for page size
   * @default 'pageSize'
   */
  pageSizeParam?: string;
  
  /**
   * Whether to include page size in URL
   * Set to false if you don't want users to change page size
   * @default false
   */
  includePageSize?: boolean;
}

export interface UseUrlPaginationReturn {
  /** Current page number (1-indexed) */
  page: ComputedRef<number>;
  
  /** Current page size (items per page) */
  pageSize: ComputedRef<number>;
  
  /** Current offset for API requests (0-indexed) */
  offset: ComputedRef<number>;
  
  /** Update the current page */
  setPage: (page: number) => void;
  
  /** Update the page size */
  setPageSize: (size: number) => void;
  
  /** Reset pagination to first page */
  resetPage: () => void;
  
  /** Get pagination range text (e.g., "1-25 of 100") */
  getPaginationRange: (totalRecords: number) => {
    start: number;
    end: number;
    total: number;
  };
}

/**
 * Composable for managing pagination state in URL query parameters
 * 
 * @example
 * ```ts
 * const { page, pageSize, offset, setPage } = useUrlPagination({
 *   defaultPageSize: 25
 * });
 * 
 * // Use in API calls
 * const response = await api.list({ offset: offset.value, limit: pageSize.value });
 * 
 * // Update page
 * setPage(2);
 * ```
 */
export function useUrlPagination(
  options: UseUrlPaginationOptions = {}
): UseUrlPaginationReturn {
  const {
    defaultPageSize = PAGINATION_DEFAULTS.PAGE_SIZE_MEDIUM,
    pageParam = 'page',
    pageSizeParam = 'pageSize',
    includePageSize = false,
  } = options;

  const route = useRoute();
  const router = useRouter();

  /**
   * Parse integer from query parameter with validation
   */
  function parseQueryInt(value: unknown, defaultValue: number, min: number = 1): number {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed >= min) {
        return parsed;
      }
    }
    return defaultValue;
  }

  /**
   * Current page (1-indexed)
   */
  const page = computed(() => {
    return parseQueryInt(route.query[pageParam], 1, 1);
  });

  /**
   * Current page size
   */
  const pageSize = computed(() => {
    if (!includePageSize) {
      return defaultPageSize;
    }
    return parseQueryInt(route.query[pageSizeParam], defaultPageSize, 1);
  });

  /**
   * Current offset (0-indexed) for API requests
   */
  const offset = computed(() => {
    return (page.value - 1) * pageSize.value;
  });

  /**
   * Update URL query parameters without adding history entry
   */
  function updateQuery(updates: Record<string, string | number | undefined>) {
    const query = { ...route.query };
    
    // Apply updates
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === '') {
        delete query[key];
      } else {
        query[key] = String(value);
      }
    }

    // Use replace to avoid adding history entries
    router.replace({ query });
  }

  /**
   * Set the current page
   */
  function setPage(newPage: number) {
    if (newPage < 1) {
      newPage = 1;
    }
    
    // Only update if page actually changed
    if (newPage === page.value) {
      return;
    }

    updateQuery({
      [pageParam]: newPage === 1 ? undefined : newPage,
    });
  }

  /**
   * Set the page size
   */
  function setPageSize(newSize: number) {
    if (!includePageSize) {
      console.warn('setPageSize called but includePageSize is false');
      return;
    }

    if (newSize < 1) {
      newSize = 1;
    }

    // Reset to page 1 when changing page size
    updateQuery({
      [pageParam]: undefined,
      [pageSizeParam]: newSize === defaultPageSize ? undefined : newSize,
    });
  }

  /**
   * Reset to first page
   */
  function resetPage() {
    if (page.value === 1) {
      return;
    }
    
    updateQuery({
      [pageParam]: undefined,
    });
  }

  /**
   * Get pagination range for display
   */
  function getPaginationRange(totalRecords: number) {
    if (totalRecords === 0) {
      return { start: 0, end: 0, total: 0 };
    }

    const start = offset.value + 1;
    const end = Math.min(offset.value + pageSize.value, totalRecords);

    return { start, end, total: totalRecords };
  }

  return {
    page,
    pageSize,
    offset,
    setPage,
    setPageSize,
    resetPage,
    getPaginationRange,
  };
}
