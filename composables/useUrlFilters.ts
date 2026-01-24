// composables/useUrlFilters.ts
// Manages filter state in URL query parameters

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export type FilterValue = string | number | boolean | null | undefined;
export type FilterDefinition<T = FilterValue> = {
  /** Query parameter name */
  param: string;
  /** Default value when not present in URL */
  defaultValue: T;
  /** Optional parser function to convert string to typed value */
  parse?: (value: string) => T;
  /** Optional serializer function to convert value to string */
  serialize?: (value: T) => string;
};

export interface UseUrlFiltersReturn<T extends Record<string, FilterValue>> {
  /** Reactive filter values from URL */
  filters: ComputedRef<T>;
  
  /** Update a single filter */
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  
  /** Update multiple filters at once */
  setFilters: (updates: Partial<T>) => void;
  
  /** Reset a single filter to default */
  resetFilter: <K extends keyof T>(key: K) => void;
  
  /** Reset all filters to defaults */
  resetAllFilters: () => void;
  
  /** Check if a filter has a non-default value */
  hasFilter: <K extends keyof T>(key: K) => boolean;
  
  /** Check if any filters are active */
  hasAnyFilter: ComputedRef<boolean>;
}

/**
 * Built-in parsers for common types
 */
export const filterParsers = {
  string: (value: string): string => value,
  
  number: (value: string): number => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  },
  
  float: (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  },
  
  boolean: (value: string): boolean => {
    return value === 'true' || value === '1';
  },
  
  array: (separator: string = ',') => (value: string): string[] => {
    return value ? value.split(separator).map(v => v.trim()).filter(Boolean) : [];
  },
};

/**
 * Built-in serializers for common types
 */
export const filterSerializers = {
  string: (value: string): string => value,
  
  number: (value: number): string => String(value),
  
  boolean: (value: boolean): string => value ? 'true' : 'false',
  
  array: (separator: string = ',') => (value: string[]): string => {
    return value.join(separator);
  },
};

/**
 * Composable for managing filter state in URL query parameters
 * 
 * @example
 * ```ts
 * const { filters, setFilter, resetAllFilters } = useUrlFilters({
 *   status: {
 *     param: 'status',
 *     defaultValue: 'all',
 *   },
 *   category: {
 *     param: 'cat',
 *     defaultValue: null,
 *   },
 *   minPrice: {
 *     param: 'min',
 *     defaultValue: 0,
 *     parse: filterParsers.number,
 *     serialize: filterSerializers.number,
 *   },
 * });
 * 
 * // Access filters
 * console.log(filters.value.status); // 'all'
 * 
 * // Update a filter
 * setFilter('status', 'active');
 * 
 * // Reset all filters
 * resetAllFilters();
 * ```
 */
export function useUrlFilters<T extends Record<string, FilterValue>>(
  definitions: { [K in keyof T]: FilterDefinition<T[K]> }
): UseUrlFiltersReturn<T> {
  const route = useRoute();
  const router = useRouter();

  /**
   * Parse a filter value from URL query
   */
  function parseFilterValue<K extends keyof T>(
    key: K,
    queryValue: unknown
  ): T[K] {
    const definition = definitions[key];
    
    if (typeof queryValue !== 'string') {
      return definition.defaultValue;
    }

    if (definition.parse) {
      try {
        return definition.parse(queryValue);
      } catch (error) {
        console.warn(`Failed to parse filter "${String(key)}":`, error);
        return definition.defaultValue;
      }
    }

    // Default string parsing
    return queryValue as T[K];
  }

  /**
   * Serialize a filter value for URL
   */
  function serializeFilterValue<K extends keyof T>(
    key: K,
    value: T[K]
  ): string | undefined {
    const definition = definitions[key];

    // Don't include default values in URL
    if (value === definition.defaultValue) {
      return undefined;
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return undefined;
    }

    if (definition.serialize) {
      try {
        return definition.serialize(value);
      } catch (error) {
        console.warn(`Failed to serialize filter "${String(key)}":`, error);
        return undefined;
      }
    }

    // Default serialization
    return String(value);
  }

  /**
   * Current filter values from URL
   */
  const filters = computed((): T => {
    const result = {} as T;
    
    for (const key in definitions) {
      const definition = definitions[key];
      const queryValue = route.query[definition.param];
      result[key] = parseFilterValue(key, queryValue);
    }
    
    return result;
  });

  /**
   * Check if any filters have non-default values
   */
  const hasAnyFilter = computed(() => {
    for (const key in definitions) {
      if (filters.value[key] !== definitions[key].defaultValue) {
        return true;
      }
    }
    return false;
  });

  /**
   * Update URL query parameters
   */
  function updateQuery(updates: Record<string, string | undefined>) {
    const query = { ...route.query };
    
    // Apply updates
    for (const [param, value] of Object.entries(updates)) {
      if (value === undefined) {
        delete query[param];
      } else {
        query[param] = value;
      }
    }

    // Use replace to avoid adding history entries
    router.replace({ query });
  }

  /**
   * Set a single filter
   */
  function setFilter<K extends keyof T>(key: K, value: T[K]) {
    const definition = definitions[key];
    const serialized = serializeFilterValue(key, value);
    
    updateQuery({
      [definition.param]: serialized,
    });
  }

  /**
   * Set multiple filters at once
   */
  function setFilters(updates: Partial<T>) {
    const queryUpdates: Record<string, string | undefined> = {};
    
    for (const key in updates) {
      const definition = definitions[key];
      const value = updates[key];
      if (value !== undefined) {
        queryUpdates[definition.param] = serializeFilterValue(key, value);
      }
    }
    
    updateQuery(queryUpdates);
  }

  /**
   * Reset a single filter to its default value
   */
  function resetFilter<K extends keyof T>(key: K) {
    setFilter(key, definitions[key].defaultValue);
  }

  /**
   * Reset all filters to their default values
   */
  function resetAllFilters() {
    const queryUpdates: Record<string, string | undefined> = {};
    
    for (const key in definitions) {
      const definition = definitions[key];
      queryUpdates[definition.param] = undefined;
    }
    
    updateQuery(queryUpdates);
  }

  /**
   * Check if a filter has a non-default value
   */
  function hasFilter<K extends keyof T>(key: K): boolean {
    return filters.value[key] !== definitions[key].defaultValue;
  }

  return {
    filters,
    setFilter,
    setFilters,
    resetFilter,
    resetAllFilters,
    hasFilter,
    hasAnyFilter,
  };
}
