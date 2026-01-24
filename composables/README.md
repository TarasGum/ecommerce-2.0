# URL State Management Composables

This directory contains reusable composables for managing application state in URL query parameters. These composables provide a consistent, type-safe way to handle filters, pagination, sorting, and search across the entire application.

## Core Principles

1. **URL as Single Source of Truth**: All filter, pagination, sorting, and search state is stored in URL query parameters
2. **No Local State**: Components don't maintain local state for these values - they're always derived from the URL
3. **SSR-Safe**: All composables work correctly with server-side rendering
4. **Router.replace**: Updates use `router.replace()` to avoid polluting browser history
5. **Type-Safe**: Proper type conversions and validations for all query parameters

## Available Composables

### useUrlPagination

Manages pagination state (page number and page size) in URL query parameters.

```typescript
const { page, pageSize, offset, setPage, resetPage } = useUrlPagination({
  defaultPageSize: 25,
  pageParam: 'page',
  includePageSize: false
});

// Use in API calls
const response = await api.list({
  limit: pageSize.value,
  offset: offset.value
});

// Update page
setPage(2); // URL becomes: ?page=2

// Reset to first page
resetPage(); // Removes page param from URL
```

**Options:**
- `defaultPageSize`: Default number of items per page (default: 25)
- `pageParam`: Query parameter name for page number (default: 'page')
- `pageSizeParam`: Query parameter name for page size (default: 'pageSize')
- `includePageSize`: Whether to include page size in URL (default: false)

**Returns:**
- `page`: Current page number (1-indexed)
- `pageSize`: Current page size
- `offset`: Current offset for API requests (0-indexed)
- `setPage(page)`: Update the current page
- `setPageSize(size)`: Update page size (only if includePageSize is true)
- `resetPage()`: Reset to first page
- `getPaginationRange(totalRecords)`: Get display range (start, end, total)

### useUrlSearch

Manages search state with debouncing in URL query parameters.

```typescript
const { searchInput, search, clearSearch } = useUrlSearch({
  param: 'search',
  debounce: 500
});

// In template
<InputText v-model="searchInput" placeholder="Search..." />

// Use in API calls
const response = await api.list({
  search: search.value
});

// Programmatically clear
clearSearch();
```

**Options:**
- `param`: Query parameter name (default: 'search')
- `debounce`: Debounce delay in milliseconds (default: 500)
- `minLength`: Minimum search length before triggering (default: 0)
- `trim`: Whether to trim whitespace (default: true)

**Returns:**
- `search`: Current search value from URL (read-only)
- `searchInput`: Local input value for v-model binding (writable)
- `isDebouncing`: Whether currently debouncing
- `setSearch(value)`: Update search value (debounced)
- `clearSearch()`: Clear search immediately
- `applySearchImmediately()`: Apply current input without debounce

### useUrlFilters

Manages filter state for multiple filters in URL query parameters.

```typescript
const { filters, setFilter, resetAllFilters } = useUrlFilters({
  status: {
    param: 'status',
    defaultValue: 'all',
  },
  category: {
    param: 'cat',
    defaultValue: null,
  },
  minPrice: {
    param: 'min',
    defaultValue: 0,
    parse: filterParsers.number,
    serialize: filterSerializers.number,
  },
});

// Access filters
console.log(filters.value.status); // 'all'

// Update a single filter
setFilter('status', 'active'); // URL becomes: ?status=active

// Update multiple filters
setFilters({ status: 'active', category: 'electronics' });

// Reset all filters
resetAllFilters(); // Removes all filter params
```

**Built-in Parsers & Serializers:**
- `filterParsers.string`: Parse as string
- `filterParsers.number`: Parse as integer
- `filterParsers.float`: Parse as float
- `filterParsers.boolean`: Parse as boolean ('true'/'false')
- `filterParsers.array(separator)`: Parse as array with separator

**Returns:**
- `filters`: Reactive object with all filter values
- `setFilter(key, value)`: Update a single filter
- `setFilters(updates)`: Update multiple filters
- `resetFilter(key)`: Reset single filter to default
- `resetAllFilters()`: Reset all filters
- `hasFilter(key)`: Check if filter has non-default value
- `hasAnyFilter`: Whether any filter is active

### useUrlSort

Manages sorting state in URL query parameters with support for both separate and combined formats.

```typescript
// Combined format (Django-style: "ordering=-created_at")
const { sortOrdering, handlePrimeVueSort } = useUrlSort({
  useCombinedFormat: true,
  combinedParam: 'ordering',
  defaultField: 'created_at',
  defaultDirection: 'desc'
});

// Use in API calls
const response = await api.list({
  ordering: sortOrdering.value // "-created_at"
});

// Use with PrimeVue DataTable
<DataTable
  :sortField="primeVueSortField"
  :sortOrder="primeVueSortOrder"
  @sort="handlePrimeVueSort"
>
```

**Options:**
- `fieldParam`: Query parameter for sort field (default: 'sort')
- `directionParam`: Query parameter for direction (default: 'order')
- `defaultField`: Default sort field (default: null)
- `defaultDirection`: Default direction (default: 'asc')
- `useCombinedFormat`: Use combined format like "-field" (default: false)
- `combinedParam`: Parameter name for combined format (default: 'ordering')

**Returns:**
- `sortField`: Current sort field
- `sortDirection`: Current direction ('asc' | 'desc')
- `sortOrdering`: Combined string (e.g., '-created_at')
- `primeVueSortField`: PrimeVue-compatible field
- `primeVueSortOrder`: PrimeVue-compatible order (1 | -1)
- `setSort(field, direction)`: Set sort
- `toggleSort(field)`: Toggle sort for field
- `clearSort()`: Clear sorting
- `handlePrimeVueSort(event)`: Handle PrimeVue sort event

## Complete Example

Here's a complete example of a page using all composables:

```vue
<template>
  <div>
    <!-- Filters -->
    <div class="filters">
      <button
        v-for="status in ['all', 'active', 'inactive']"
        :key="status"
        @click="setFilter('status', status)"
        :class="{ active: filters.status === status }"
      >
        {{ status }}
      </button>
    </div>

    <!-- Search -->
    <InputText v-model="searchInput" placeholder="Search..." />

    <!-- Table -->
    <DataTable
      :value="items"
      :sortField="primeVueSortField"
      :sortOrder="primeVueSortOrder"
      @sort="handlePrimeVueSort"
    >
      <Column field="name" header="Name" sortable />
      <Column field="email" header="Email" sortable />
    </DataTable>

    <!-- Pagination -->
    <Paginator
      :first="offset"
      :rows="pageSize"
      :totalRecords="totalRecords"
      @page="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
// URL state management
const { page, pageSize, offset, setPage } = useUrlPagination({
  defaultPageSize: 25
});

const { searchInput, search } = useUrlSearch({
  param: 'q',
  debounce: 500
});

const { filters, setFilter } = useUrlFilters({
  status: {
    param: 'status',
    defaultValue: 'all'
  }
});

const { sortOrdering, primeVueSortField, primeVueSortOrder, handlePrimeVueSort } = useUrlSort({
  useCombinedFormat: true,
  combinedParam: 'ordering'
});

// Local state
const items = ref([]);
const totalRecords = ref(0);

// Watch URL state and reload
watch(
  [page, pageSize, search, () => filters.value.status, sortOrdering],
  () => {
    loadItems();
  }
);

// Load data
async function loadItems() {
  const response = await api.list({
    offset: offset.value,
    limit: pageSize.value,
    search: search.value,
    status: filters.value.status !== 'all' ? filters.value.status : undefined,
    ordering: sortOrdering.value
  });
  
  items.value = response.results;
  totalRecords.value = response.count;
}

// Pagination handler
function onPageChange(event: any) {
  const newPage = Math.floor(event.first / pageSize.value) + 1;
  setPage(newPage);
}

// Initial load
onMounted(() => {
  loadItems();
});
</script>
```

## Best Practices

### 1. Initialize on Mount
Always load data on mount to handle direct URL access:

```typescript
onMounted(() => {
  loadData();
});
```

### 2. Watch URL State Changes
Use `watch` to reload data when URL state changes:

```typescript
watch(
  [page, search, filters, sortOrdering],
  () => {
    loadData();
  }
);
```

### 3. Reset Page on Filter/Search Changes
The watch will handle this automatically, but if you need manual control:

```typescript
// When changing filters, page resets automatically via watch
setFilter('status', 'active');
```

### 4. Handle External URL Changes
These composables automatically handle browser back/forward navigation - no extra code needed.

### 5. Combine with Other URL Params
These composables preserve other query parameters when updating:

```typescript
// URL: ?tab=orders&status=active
setFilter('status', 'pending');
// Result: ?tab=orders&status=pending (tab is preserved)
```

### 6. Use Separate Params for Nested Tables
When you have multiple tables on one page, use different param names:

```typescript
// Main table
const mainPagination = useUrlPagination({
  pageParam: 'page'
});

// Nested/secondary table
const nestedPagination = useUrlPagination({
  pageParam: 'nestedPage'
});
```

## Edge Cases Handled

1. **Invalid Values**: Invalid query params fall back to defaults
2. **Missing Values**: Missing params use default values
3. **Type Conversion**: Automatic string-to-type conversion
4. **Empty Strings**: Treated as undefined/default
5. **Browser Back/Forward**: Fully supported
6. **Direct URL Access**: Works perfectly
7. **SSR**: Server-side rendering compatible

## Migration Guide

### Before (Local State)
```typescript
const currentPage = ref(1);
const searchQuery = ref('');
const sortField = ref(null);

watch(searchQuery, () => {
  currentPage.value = 1;
  loadData();
});

function loadData() {
  api.list({
    offset: (currentPage.value - 1) * 25,
    search: searchQuery.value
  });
}
```

### After (URL State)
```typescript
const { page, offset } = useUrlPagination({ defaultPageSize: 25 });
const { searchInput, search } = useUrlSearch();

watch([page, search], () => {
  loadData();
});

function loadData() {
  api.list({
    offset: offset.value,
    search: search.value
  });
}
```

## TypeScript Support

All composables are fully typed:

```typescript
import type { UseUrlPaginationOptions, UseUrlPaginationReturn } from '~/composables/useUrlPagination';
import type { UseUrlSearchOptions, UseUrlSearchReturn } from '~/composables/useUrlSearch';
import type { UseUrlFiltersReturn, FilterDefinition } from '~/composables/useUrlFilters';
import type { UseUrlSortOptions, UseUrlSortReturn, SortDirection } from '~/composables/useUrlSort';
```

## Performance Considerations

1. **Debouncing**: Search is debounced by default (500ms)
2. **Router.replace**: Uses `replace` instead of `push` to avoid history pollution
3. **Minimal Rerenders**: Only updates when URL actually changes
4. **Efficient Watching**: Uses computed values and selective watching

## Troubleshooting

### Search not triggering
Make sure you're using `searchInput` for v-model, not `search`:
```vue
<!-- ✅ Correct -->
<InputText v-model="searchInput" />

<!-- ❌ Wrong -->
<InputText v-model="search" />
```

### Page doesn't reset on filter change
Make sure you're watching the filter value:
```typescript
watch([page, () => filters.value.status], () => {
  loadData();
});
```

### Sorting not working with PrimeVue
Use both the field and order, and handle the event:
```vue
<DataTable
  :sortField="primeVueSortField"
  :sortOrder="primeVueSortOrder"
  @sort="handlePrimeVueSort"
>
```

## Contributing

When adding new composables or modifying existing ones:
1. Follow the established patterns
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Handle edge cases
5. Update this README
