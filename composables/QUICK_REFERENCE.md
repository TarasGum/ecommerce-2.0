# URL State Composables - Quick Reference

## Import

```typescript
// Import the composables you need
import { useUrlPagination } from '~/composables/useUrlPagination';
import { useUrlSearch } from '~/composables/useUrlSearch';
import { useUrlFilters } from '~/composables/useUrlFilters';
import { useUrlSort } from '~/composables/useUrlSort';
```

## Quick Setup Template

```vue
<template>
  <div>
    <!-- Search -->
    <InputText v-model="searchInput" placeholder="Search..." />

    <!-- Filters -->
    <button @click="setFilter('status', 'active')">Active</button>
    <button @click="setFilter('status', 'inactive')">Inactive</button>

    <!-- Table -->
    <DataTable
      :value="items"
      :sortField="primeVueSortField || undefined"
      :sortOrder="primeVueSortOrder"
      @sort="handlePrimeVueSort as any"
    >
      <Column field="name" header="Name" sortable />
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
// Setup composables
const { page, pageSize, offset, setPage } = useUrlPagination({
  defaultPageSize: 25
});

const { searchInput, search } = useUrlSearch({
  debounce: 500
});

const { filters, setFilter } = useUrlFilters({
  status: {
    param: 'status',
    defaultValue: 'all'
  }
});

const { 
  primeVueSortField, 
  primeVueSortOrder, 
  sortOrdering,
  handlePrimeVueSort 
} = useUrlSort({
  useCombinedFormat: true,
  combinedParam: 'ordering'
});

// Local state
const items = ref([]);
const totalRecords = ref(0);

// Watch URL changes and reload
watch(
  [page, search, () => filters.value.status, sortOrdering],
  () => loadItems()
);

// Load function
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
onMounted(() => loadItems());
</script>
```

## Common Patterns

### Reset page on filter/search change
```typescript
// Handled automatically via watch!
// When search or filters change, just reload data
// The watch will trigger automatically
```

### Clear search
```typescript
const { clearSearch } = useUrlSearch();

function handleClearSearch() {
  clearSearch(); // Immediately clears
}
```

### Reset all filters
```typescript
const { resetAllFilters } = useUrlFilters({ ... });

function handleReset() {
  resetAllFilters(); // Clears all filters
}
```

### Custom filter types
```typescript
const { filters, setFilter } = useUrlFilters({
  price: {
    param: 'price',
    defaultValue: 0,
    parse: filterParsers.number,
    serialize: filterSerializers.number
  },
  active: {
    param: 'active',
    defaultValue: false,
    parse: filterParsers.boolean,
    serialize: filterSerializers.boolean
  }
});
```

### Multiple tables on one page
```typescript
// Main table
const mainPagination = useUrlPagination({
  pageParam: 'page'
});

// Secondary table
const secondaryPagination = useUrlPagination({
  pageParam: 'subPage'
});
```

## Cheat Sheet

| Composable | Primary Use | Key Returns | Default Param |
|------------|-------------|-------------|---------------|
| `useUrlPagination` | Page navigation | `page`, `pageSize`, `offset`, `setPage` | `page` |
| `useUrlSearch` | Search input | `searchInput`, `search`, `clearSearch` | `search` |
| `useUrlFilters` | Multiple filters | `filters`, `setFilter`, `resetAllFilters` | custom |
| `useUrlSort` | Column sorting | `sortOrdering`, `handlePrimeVueSort` | `ordering` |

## Common Issues

### Search not updating
```typescript
// ❌ Wrong - binding to search (read-only)
<InputText v-model="search" />

// ✅ Correct - binding to searchInput
<InputText v-model="searchInput" />
```

### PrimeVue sort not working
```typescript
// ✅ Required props
<DataTable
  :sortField="primeVueSortField || undefined"
  :sortOrder="primeVueSortOrder"
  @sort="handlePrimeVueSort as any"
>
```

### Page not resetting on filter change
```typescript
// ✅ Watch both page and filters
watch([page, () => filters.value.status], () => {
  loadData();
});
```

## URL Examples

```
# Pagination
?page=2

# Search
?search=john

# Filter
?status=active

# Sort (combined format)
?ordering=-created_at

# Sort (separate format)
?sort=created_at&order=desc

# Everything combined
?page=2&search=john&status=active&ordering=-created_at
```

## Pro Tips

1. Always watch URL state, not local state
2. Use `router.replace` is handled for you - don't call it manually
3. Default values don't appear in URL (cleaner URLs)
4. Use TypeScript generics for type-safe filters
5. Test with browser back/forward button
6. Copy/paste URLs to test state restoration

## Full Documentation

See `composables/README.md` for complete documentation, examples, and best practices.
