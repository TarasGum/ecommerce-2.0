<!-- pages/customers/index.vue -->
<template>
  <div class="page-wrapper customers-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">Customers</h1>
      <Button
        label="Create New Customer"
        icon="pi pi-plus"
        severity="success"
        @click="openCreateModal"
      />
    </div>

    <!-- Search Row -->
    <div class="flex gap-2 mb-3">
      <IconField iconPosition="left" class="search-field">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchInput"
          placeholder="Search…"
          class="search-input"
        />
      </IconField>
    </div>

    <!-- Customers Table Card -->
    <div class="table-card">
      <!-- Empty State -->
      <div v-if="!loading && customers.length === 0" class="flex flex-column align-items-center justify-content-center gap-3 empty-state">
        <i class="pi pi-inbox"></i>
        <p class="empty-state-text">
          {{ search ? 'No customers match your search' : 'No customers found' }}
        </p>
        <Button
          v-if="search"
          label="Clear Search"
          severity="secondary"
          size="small"
          @click="clearSearch"
        />
        <Button
          v-else
          label="Create New Customer"
          icon="pi pi-plus"
          severity="primary"
          size="small"
          @click="openCreateModal"
        />
      </div>

      <!-- Customers Table -->
      <DataTable
        v-else
        :value="loading ? skeletonRows : customers"
        :class="['data-table customers-table', { loading: loading }]"
        stripedRows
        v-model:selection="selectedCustomers"
        dataKey="id"
        :sortField="primeVueSortField || undefined"
        :sortOrder="primeVueSortOrder"
        @sort="handlePrimeVueSort"
        @row-click="onRowClick"
        :pt="{ bodyRow: { class: 'cursor-pointer' } }"
        tableStyle="table-layout: fixed"
      >
        <!-- Selection Column -->
        <Column selectionMode="multiple" :style="{ width: '50px', minWidth: '50px', maxWidth: '50px' }" />

        <!-- Customer Column (sortable) -->
        <Column
          field="l_name"
          header="Customer"
          sortable
          :style="{ width: 'calc(60% - 78px)', minWidth: '200px' }"
          :pt="{ sort: { class: 'cursor-pointer' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 180px;"></div>
            <span v-else class="cell-name">{{ data.l_name ? data.l_name : '—' }}</span>
          </template>
        </Column>

        <!-- Last Order Date Column (sortable, conditional) -->
        <Column
          v-if="showLastOrderDate"
          field="last_order_date"
          header="Last Order Date"
          sortable
          :style="{ width: 'calc(40% - 52px)', minWidth: '150px' }"
          :pt="{ sort: { class: 'cursor-pointer' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 120px;"></div>
            <span v-else class="cell-date">{{ formatDate(data.last_order_date) }}</span>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column 
          header="Actions" 
          :style="{ width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center' }"
          :pt="{ headerContent: { style: 'justify-content: center' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-circle" ></div>
            <Button
              v-else
              icon="pi pi-ellipsis-v"
              text
              rounded
              @click="(event) => toggleMenu(event, data)"
              aria-haspopup="true"
              :aria-controls="`menu-${data.id}`"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Pagination -->
      <div class="flex align-items-center justify-content-between pagination-container">
        <div class="flex justify-content-start align-items-center flex-1">
          <span v-if="!loading && totalRecords > 0" class="results-text">
            {{ paginationRange.start }}–{{ paginationRange.end }} of {{ paginationRange.total.toLocaleString() }}
          </span>
        </div>
        
        <Paginator
          v-if="showPagination"
          :first="offset"
          :rows="pageSize"
          :totalRecords="totalRecords"
          @page="onPageChange"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          :pageLinkSize="9"
          class="custom-paginator"
        />
        
        <div class="flex justify-content-end flex-1"></div>
      </div>
    </div>

    <!-- Context Menu -->
    <Menu ref="menuRef" :model="menuItems" :popup="true" />


    <!-- Create/Edit Customer Modal -->
    <CustomerModal
      v-model:visible="showModal"
      :mode="modalMode"
      :customer-id="selectedCustomer?.id || null"
      :customer="modalMode === 'edit' ? selectedCustomer : null"
      @success="onModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Paginator from "primevue/paginator";
import Menu from "primevue/menu";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { until } from "@vueuse/core";
import CustomerModal from "~/components/customers/CustomerModal.vue";
import { storeToRefs } from "pinia";
import type { Customer, PrimeVuePageEvent, PrimeVueRowEvent } from "~/types";
import type { DataTableSortEvent } from "primevue/datatable";
import { formatDate } from "~/utils/formatters";
import { PAGINATION_DEFAULTS, DEBOUNCE_MS, USER_ROLES } from "~/utils/constants";
import { useProjectsStore } from "~/stores/projects";

definePageMeta({ middleware: "auth" });

const customersApi = useCustomers();
const toast = useToast();
const router = useRouter();
const auth = useAuth();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId, projects, loading: projectsLoading } = storeToRefs(projectsStore);

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

// URL-based state management
const { page, pageSize, offset, setPage, resetPage } = useUrlPagination({
  defaultPageSize: PAGINATION_DEFAULTS.PAGE_SIZE_DEFAULT,
});

const { searchInput, search, clearSearch } = useUrlSearch({
  param: 'search',
  debounce: DEBOUNCE_MS.SEARCH_DEFAULT,
});

const {
  primeVueSortField,
  primeVueSortOrder,
  sortOrdering,
  handlePrimeVueSort,
} = useUrlSort({
  useCombinedFormat: true,
  combinedParam: 'ordering',
});

// Local UI state (not in URL)
const customers = ref<Customer[]>([]);
const loading = ref(true); // Start with true to prevent empty state flash
const totalRecords = ref(0);
const selectedCustomers = ref<Customer[]>([]);
const menuRef = ref();
const selectedCustomer = ref<Customer | null>(null);
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');

// Request version counter to prevent stale responses from overwriting newer data
const loadVersion = ref(0);

// Computed
const showLastOrderDate = computed(() => true); // Could be a setting
const showPagination = computed(() => totalRecords.value > pageSize.value);

const paginationRange = computed(() => {
  if (totalRecords.value === 0) {
    return { start: 0, end: 0, total: 0 };
  }
  const start = offset.value + 1;
  const end = Math.min(offset.value + pageSize.value, totalRecords.value);
  return { start, end, total: totalRecords.value };
});

// Skeleton rows for loading state
const skeletonRows = computed(() => {
  return Array.from({ length: pageSize.value }, (_, i) => ({
    id: `skeleton-${i}`,
    l_name: '',
    last_order_date: null,
  }));
});

// Menu items
const menuItems = computed(() => [
  {
    label: "Edit",
    icon: "pi pi-pencil",
    command: () => {
      openEditModal();
    },
  },
]);

// Load customers on mount
onMounted(async () => {
  // Wait for projects to load if user is superadmin
  if (isSuperAdmin.value && projectsLoading.value) {
    await until(projectsLoading).toBe(false);
  }
  
  loadCustomers();
});

// Watch for URL state changes and reload customers
watch(
  [page, pageSize, search, sortOrdering],
  () => {
    loadCustomers();
  }
);

// Watch for search changes and reset to first page
watch(
  search,
  (newVal, oldVal) => {
    // Only reset if values actually changed (not initial load)
    if (oldVal !== undefined && oldVal !== newVal) {
      resetPage();
    }
  }
);

// Watch for project changes and reset to first page
watch(
  selectedProjectId,
  (newVal, oldVal) => {
    // Only reset if this is an actual change, not initial load (oldVal will be null or undefined on first load)
    if (isSuperAdmin.value && oldVal !== undefined && oldVal !== null) {
      resetPage();
      loadCustomers();
    }
  }
);

async function loadCustomers() {
  const params: any = {
    limit: pageSize.value,
    offset: offset.value,
  };

  // Add search filter
  if (search.value) {
    params.search = search.value;
  }

  // Add last order date field
  if (showLastOrderDate.value) {
    params.fields = 'last_order_date';
  }

  // Add sorting
  if (sortOrdering.value) {
    params.ordering = sortOrdering.value;
  }

  // Add project_id for superadmin
  if (isSuperAdmin.value && selectedProjectId.value !== null) {
    params.project_id = selectedProjectId.value;
  }

  // Increment version to invalidate any in-flight requests
  const currentVersion = ++loadVersion.value;
  loading.value = true;

  await useApiCall({
    fn: () => customersApi.list(params),
    errorMessage: 'Failed to Load Customers',
    toast,
    onSuccess: (data) => {
      // Only apply results if this is still the latest request
      if (currentVersion === loadVersion.value) {
        customers.value = data.results;
        totalRecords.value = data.count;
      }
    },
    onFinally: () => {
      // Only clear loading if this is still the latest request
      if (currentVersion === loadVersion.value) {
        loading.value = false;
      }
    },
  });
}

function onPageChange(event: PrimeVuePageEvent) {
  const newPage = Math.floor(event.first / event.rows) + 1;
  setPage(newPage);
}

function toggleMenu(event: Event, customer: Customer) {
  event.stopPropagation(); // Prevent row click
  selectedCustomer.value = customer;
  menuRef.value.toggle(event);
}

function onRowClick(event: PrimeVueRowEvent<Customer>) {
  if (!event.data || loading.value) return;
  // Don't navigate if clicking on checkbox or menu button
  const target = event.originalEvent.target as HTMLElement;
  if (
    target.closest('.p-checkbox') ||
    target.closest('.p-button') ||
    target.closest('[role="menuitem"]')
  ) {
    return;
  }
  router.push(`/customers/${event.data.id}`);
}

function openCreateModal() {
  modalMode.value = 'create';
  selectedCustomer.value = null;
  showModal.value = true;
}

function openEditModal() {
  modalMode.value = 'edit';
  showModal.value = true;
}

function onModalSuccess() {
  loadCustomers();
}

// formatDate is now imported from ~/utils/formatters
</script>

<style scoped>
/* Customers page styles */

.customers-page {
  padding: 1.5rem 1.5rem;
  min-height: 100vh;
  max-width: 1400px;
  min-width: 700px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-heading-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.search-field {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.table-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  min-width: 700px;
}

.customers-table {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

.pagination-container {
  border-top: 1px solid var(--color-border-light);
  min-height: 3rem;
  padding: 0 1rem;
}

.results-text {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-regular);
}

/* Empty state */
.empty-state {
  padding: 4rem 2rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--color-text-tertiary);
}

.empty-state-text {
  font-size: var(--font-size-body-m);
  color: var(--color-text-secondary);
  margin: 0;
}

</style>
