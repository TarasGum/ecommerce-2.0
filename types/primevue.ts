// types/primevue.ts

/**
 * PrimeVue DataTable pagination event
 * Emitted by Paginator component on page change
 * Note: This extends PrimeVue's PageState to ensure compatibility
 */
export interface PrimeVuePageEvent {
  /** Index of first record */
  first: number;
  /** Number of rows per page */
  rows: number;
  /** Current page number (0-indexed) */
  page: number;
  /** Total number of pages */
  pageCount?: number;
}

/**
 * PrimeVue DataTable sort event
 * Emitted by DataTable on column header click
 * Note: This matches PrimeVue's DataTableSortEvent interface
 */
export interface PrimeVueSortEvent {
  /** Field name to sort by (can be string, function, or undefined) */
  sortField?: string | ((item: any) => string) | string[];
  /** Sort direction: 1 (asc), -1 (desc), 0 or null (unsorted) */
  sortOrder?: 1 | -1 | 0 | null;
  /** Original DOM event */
  originalEvent?: Event;
  /** Multiple sort meta (for multi-column sorting) */
  multiSortMeta?: Array<{
    field: string;
    order: 1 | -1;
  }>;
}

/**
 * PrimeVue DataTable filter event
 * Emitted by DataTable on filter change
 */
export interface PrimeVueFilterEvent {
  /** Filter values keyed by field name */
  filters: Record<string, PrimeVueFilterMeta>;
  /** Original DOM event */
  originalEvent?: Event;
}

/**
 * Filter metadata for a single field
 */
export interface PrimeVueFilterMeta {
  /** Filter value */
  value: any;
  /** Match mode (e.g., 'contains', 'equals', 'startsWith') */
  matchMode: string;
}

/**
 * PrimeVue DataTable row event (click, double-click, etc.)
 */
export interface PrimeVueRowEvent<T = any> {
  /** Original DOM event */
  originalEvent: Event;
  /** Row data */
  data: T;
  /** Row index */
  index: number;
}

/**
 * PrimeVue DataTable selection event
 */
export interface PrimeVueSelectionEvent<T = any> {
  /** Original DOM event */
  originalEvent: Event;
  /** Selected row(s) data */
  data: T | T[];
  /** Type of selection change */
  type: 'row' | 'checkbox' | 'radio' | 'all';
}

/**
 * PrimeVue Menu toggle event
 */
export interface PrimeVueMenuToggleEvent {
  /** Original DOM event */
  originalEvent: Event;
  /** Related target element */
  relatedTarget?: HTMLElement;
}
