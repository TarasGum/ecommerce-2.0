// composables/useUrlSort.ts
// Manages sorting state in URL query parameters

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export type SortDirection = 'asc' | 'desc';

export interface UseUrlSortOptions {
  /**
   * Query parameter name for sort field
   * @default 'sort'
   */
  fieldParam?: string;
  
  /**
   * Query parameter name for sort direction
   * @default 'order'
   */
  directionParam?: string;
  
  /**
   * Default sort field (null = no sorting)
   * @default null
   */
  defaultField?: string | null;
  
  /**
   * Default sort direction
   * @default 'asc'
   */
  defaultDirection?: SortDirection;
  
  /**
   * Whether to use combined format (field with prefix)
   * e.g., "-created_at" instead of separate field and direction params
   * @default false
   */
  useCombinedFormat?: boolean;
  
  /**
   * Query parameter name for combined format
   * Only used when useCombinedFormat is true
   * @default 'ordering'
   */
  combinedParam?: string;
}

export interface UseUrlSortReturn {
  /** Current sort field */
  sortField: ComputedRef<string | null>;
  
  /** Current sort direction */
  sortDirection: ComputedRef<SortDirection>;
  
  /** Combined sort string (e.g., "-created_at") */
  sortOrdering: ComputedRef<string | null>;
  
  /** PrimeVue DataTable compatible sort field */
  primeVueSortField: ComputedRef<string | null>;
  
  /** PrimeVue DataTable compatible sort order (1 for asc, -1 for desc) */
  primeVueSortOrder: ComputedRef<1 | -1>;
  
  /** Set sort field and direction */
  setSort: (field: string | null, direction?: SortDirection) => void;
  
  /** Toggle sort direction for a field */
  toggleSort: (field: string) => void;
  
  /** Clear sorting */
  clearSort: () => void;
  
  /** Handle PrimeVue DataTable sort event */
  handlePrimeVueSort: (event: { sortField?: string | string[] | ((item: any) => string); sortOrder?: 1 | -1 | 0 | null }) => void;
}

/**
 * Composable for managing sort state in URL query parameters
 * 
 * @example Basic usage
 * ```ts
 * const { sortField, sortDirection, setSort } = useUrlSort({
 *   defaultField: 'created_at',
 *   defaultDirection: 'desc'
 * });
 * 
 * // Set sort
 * setSort('name', 'asc');
 * 
 * // Toggle sort
 * toggleSort('price');
 * ```
 * 
 * @example With PrimeVue DataTable
 * ```ts
 * const { primeVueSortField, primeVueSortOrder, handlePrimeVueSort } = useUrlSort();
 * 
 * // In template
 * <DataTable
 *   :sortField="primeVueSortField"
 *   :sortOrder="primeVueSortOrder"
 *   @sort="handlePrimeVueSort"
 * >
 * ```
 * 
 * @example Combined format (Django-style)
 * ```ts
 * const { sortOrdering } = useUrlSort({
 *   useCombinedFormat: true,
 *   combinedParam: 'ordering'
 * });
 * 
 * // Use in API calls
 * const response = await api.list({ ordering: sortOrdering.value });
 * // URL: ?ordering=-created_at
 * ```
 */
export function useUrlSort(
  options: UseUrlSortOptions = {}
): UseUrlSortReturn {
  const {
    fieldParam = 'sort',
    directionParam = 'order',
    defaultField = null,
    defaultDirection = 'asc',
    useCombinedFormat = false,
    combinedParam = 'ordering',
  } = options;

  const route = useRoute();
  const router = useRouter();

  /**
   * Parse sort from URL query
   */
  const sortField = computed((): string | null => {
    if (useCombinedFormat) {
      const combined = route.query[combinedParam];
      if (typeof combined === 'string') {
        return combined.startsWith('-') ? combined.slice(1) : combined;
      }
    } else {
      const field = route.query[fieldParam];
      if (typeof field === 'string') {
        return field;
      }
    }
    return defaultField;
  });

  /**
   * Parse direction from URL query
   */
  const sortDirection = computed((): SortDirection => {
    if (useCombinedFormat) {
      const combined = route.query[combinedParam];
      if (typeof combined === 'string') {
        return combined.startsWith('-') ? 'desc' : 'asc';
      }
    } else {
      const direction = route.query[directionParam];
      if (direction === 'asc' || direction === 'desc') {
        return direction;
      }
    }
    return defaultDirection;
  });

  /**
   * Combined sort string (e.g., "-created_at")
   */
  const sortOrdering = computed((): string | null => {
    if (!sortField.value) {
      return null;
    }
    const prefix = sortDirection.value === 'desc' ? '-' : '';
    return `${prefix}${sortField.value}`;
  });

  /**
   * PrimeVue compatible sort field
   */
  const primeVueSortField = computed(() => sortField.value);

  /**
   * PrimeVue compatible sort order (1 for asc, -1 for desc)
   */
  const primeVueSortOrder = computed((): 1 | -1 => {
    return sortDirection.value === 'asc' ? 1 : -1;
  });

  /**
   * Update URL query parameters
   */
  function updateQuery(updates: Record<string, string | undefined>) {
    const query = { ...route.query };
    
    // Apply updates
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        delete query[key];
      } else {
        query[key] = value;
      }
    }

    // Use replace to avoid adding history entries
    router.replace({ query });
  }

  /**
   * Set sort field and direction
   */
  function setSort(field: string | null, direction: SortDirection = 'asc') {
    if (!field) {
      clearSort();
      return;
    }

    if (useCombinedFormat) {
      const prefix = direction === 'desc' ? '-' : '';
      const value = `${prefix}${field}`;
      
      updateQuery({
        [combinedParam]: value === `${defaultDirection === 'desc' ? '-' : ''}${defaultField}` 
          ? undefined 
          : value,
      });
    } else {
      updateQuery({
        [fieldParam]: field === defaultField ? undefined : field,
        [directionParam]: direction === defaultDirection ? undefined : direction,
      });
    }
  }

  /**
   * Toggle sort direction for a field
   * If field is different from current, sets to asc
   * If field is same, toggles between asc and desc
   */
  function toggleSort(field: string) {
    if (sortField.value === field) {
      // Toggle direction
      const newDirection = sortDirection.value === 'asc' ? 'desc' : 'asc';
      setSort(field, newDirection);
    } else {
      // Set new field with default direction
      setSort(field, defaultDirection);
    }
  }

  /**
   * Clear sorting
   */
  function clearSort() {
    if (useCombinedFormat) {
      updateQuery({
        [combinedParam]: undefined,
      });
    } else {
      updateQuery({
        [fieldParam]: undefined,
        [directionParam]: undefined,
      });
    }
  }

  /**
   * Handle PrimeVue DataTable sort event
   */
  function handlePrimeVueSort(event: { sortField?: string | ((item: any) => string) | string[]; sortOrder?: 1 | -1 | 0 | null }) {
    // Extract string field from sortField (ignore functions and arrays for now)
    const fieldName = typeof event.sortField === 'string' ? event.sortField : null;
    
    if (!fieldName || event.sortOrder === null || event.sortOrder === 0 || event.sortOrder === undefined) {
      clearSort();
      return;
    }

    const direction: SortDirection = event.sortOrder === 1 ? 'asc' : 'desc';
    setSort(fieldName, direction);
  }

  return {
    sortField,
    sortDirection,
    sortOrdering,
    primeVueSortField,
    primeVueSortOrder,
    setSort,
    toggleSort,
    clearSort,
    handlePrimeVueSort,
  };
}
