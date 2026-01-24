<!-- pages/customers/[id].vue -->
<template>
  <div class="page-wrapper customer-details-page">
    <!-- Content -->
    <div v-if="customer || loading" class="content-wrapper">
      <!-- Tabs (exact structure as Orders page) -->
      <div class="tabs-container">
        <div class="flex tabs">
          <button
            :class="['tab', { 'tab-active': activeTab === 'orders' }]"
            @click="activeTab = 'orders'"
          >
            Orders
          </button>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="columns-container">
        <!-- Left Column: Customer Info -->
        <div class="left-column">
          <div class="info-card">
            <!-- Loading State -->
            <template v-if="loading">
              <div class="skeleton skeleton-title" style="width: 200px; margin-bottom: 1.5rem;"></div>
              
              <div class="flex flex-column gap-3">
                <div class="flex flex-column gap-1" v-for="i in 5" :key="i">
                  <div class="skeleton skeleton-text" style="width: 60px; height: 0.75rem;"></div>
                  <div class="skeleton skeleton-text" :style="{ width: `${100 + i * 20}px`, height: '0.875rem' }"></div>
                </div>
              </div>
            </template>

            <!-- Loaded Content -->
            <template v-else-if="customer">
              <h3 class="info-card-title">{{ truncateName(customer.l_name) ? truncateName(customer.l_name) : '—' }}</h3>
              
              <div class="flex flex-column gap-3">
                <div v-if="customer.phone" class="flex flex-column gap-1">
                  <span class="info-label">Phone</span>
                  <span class="info-value">{{ customer.phone }}</span>
                </div>

                <div v-if="customer.email" class="flex flex-column gap-1">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ customer.email }}</span>
                </div>

                <div v-if="hasAddress" class="flex flex-column gap-1">
                  <span class="info-label">Address</span>
                  <div class="flex flex-column info-value address-block">
                    <div v-if="customer.address1">{{ customer.address1 }}</div>
                    <div v-if="customer.address2">{{ customer.address2 }}</div>
                    <div v-if="customer.city || customer.state || customer.zip">
                      {{ [customer.city, customer.state, customer.zip].filter(Boolean).join(', ') }}
                    </div>
                    <div v-if="customer.country">{{ customer.country }}</div>
                  </div>
                </div>

                <div v-if="customer.in_level" class="flex flex-column gap-1">
                  <span class="info-label">Type</span>
                  <span class="info-value">{{ customer.in_level }}</span>
                </div>

                <div v-if="customer.inactive !== undefined" class="flex flex-column gap-1">
                  <span class="info-label">Status</span>
                  <Tag
                    :value="customer.inactive ? 'Inactive' : 'Active'"
                    :severity="customer.inactive ? 'danger' : 'success'"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Right Column: Tab Content -->
        <div class="right-column">
          <!-- Orders Tab -->
          <div v-if="activeTab === 'orders'" class="tab-content">
            <!-- Search -->
            <div class="search-container">
              <IconField iconPosition="left">
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="searchInput"
                  placeholder="Search by invoice number..."
                  class="search-input"
                  :disabled="loading"
                />
              </IconField>
            </div>

            <!-- Orders Table -->
            <div class="table-card">
              <!-- Empty State -->
              <div v-if="!loading && !ordersLoading && orders.length === 0" class="flex flex-column align-items-center justify-content-center gap-3 empty-state">
                <i class="pi pi-inbox"></i>
                <p class="empty-state-text">
                  {{ search ? 'No orders match your search' : 'No orders found for this customer' }}
                </p>
                <Button
                  v-if="search"
                  label="Clear Search"
                  severity="secondary"
                  size="small"
                  @click="clearSearch"
                />
              </div>

              <!-- Orders Table -->
              <DataTable
                v-else
                :value="(loading || ordersLoading) ? orderSkeletonRows : orders"
                :class="['data-table orders-table', { loading: loading || ordersLoading }]"
                stripedRows
                dataKey="autoid"
                :sortField="primeVueSortField || undefined"
                :sortOrder="primeVueSortOrder"
                @sort="handlePrimeVueSort"
              >
                <!-- Invoice Column -->
                <Column
                  field="invoice"
                  header="Invoice"
                  sortable
                  :style="{ width: '20%', minWidth: '120px' }"
                >
                  <template #body="{ data }">
                    <div v-if="loading || ordersLoading" class="skeleton skeleton-text"></div>
                    <span v-else class="cell-code">{{ data.invoice?.trim() }}</span>
                  </template>
                </Column>

                <!-- Status Column -->
                <Column
                  field="status"
                  header="Status"
                  sortable
                  :style="{ width: '15%', minWidth: '100px' }"
                >
                  <template #body="{ data }">
                    <div v-if="loading || ordersLoading" class="skeleton skeleton-button"></div>
                    <Tag v-else :value="getOrderStatusLabel(data.status)" :severity="getOrderStatusSeverity(data.status)" />
                  </template>
                </Column>

                <!-- Order Date Column -->
                <Column
                  field="inv_date"
                  header="Order Date"
                  sortable
                  :style="{ width: '20%', minWidth: '120px' }"
                >
                  <template #body="{ data }">
                    <div v-if="loading || ordersLoading" class="skeleton skeleton-text"></div>
                    <span v-else class="cell-date">{{ formatDate(data.inv_date) }}</span>
                  </template>
                </Column>

                <!-- Total Column -->
                <Column
                  field="total"
                  header="Total"
                  sortable
                  :style="{ width: '15%', minWidth: '100px' }"
                >
                  <template #body="{ data }">
                    <div v-if="loading || ordersLoading" class="skeleton skeleton-text"></div>
                    <span v-else class="cell-amount">{{ formatCurrency(data.total) }}</span>
                  </template>
                </Column>
              </DataTable>

              <!-- Pagination -->
              <div class="flex align-items-center justify-content-between pagination-container detailed">
                <div class="flex justify-content-start align-items-center flex-1">
                  <span v-if="!loading && !ordersLoading && totalOrders > 0" class="results-text">
                    {{ paginationRange.start }}–{{ paginationRange.end }} of {{ paginationRange.total.toLocaleString() }}
                  </span>
                </div>
                
                <Paginator
                  v-if="showPagination"
                  :first="offset"
                  :rows="pageSize"
                  :totalRecords="totalOrders"
                  @page="onPageChange"
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                  :pageLinkSize="9"
                  class="custom-paginator"
                />
                
                <div class="flex justify-content-end flex-1"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex flex-column align-items-center justify-content-center gap-3 error-container">
      <p>Customer not found</p>
      <Button label="Back to Customers" @click="router.push('/customers')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import InputText from "primevue/inputtext";
import Paginator from "primevue/paginator";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import type { Customer, Order, PrimeVuePageEvent } from "~/types";
import type { DataTableSortEvent } from "primevue/datatable";
import { formatDate, formatCurrency } from "~/utils/formatters";
import { 
  PAGINATION_DEFAULTS, 
  DEBOUNCE_MS,
  getOrderStatusLabel, 
  getOrderStatusSeverity 
} from "~/utils/constants";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const customersApi = useCustomers();
const ordersApi = useOrders();
const toast = useToast();
const { selectedProjectId, isSuperAdmin } = useSelectedProject();

// Customer ID from route
const customerId = computed(() => route.params.id as string);

// Customer state
const customer = ref<Customer | null>(null);
const loading = ref(false);
const activeTab = ref<'orders'>('orders');

// URL-based state management for orders
const { page, pageSize, offset, setPage, resetPage } = useUrlPagination({
  defaultPageSize: PAGINATION_DEFAULTS.PAGE_SIZE_DEFAULT,
  pageParam: 'ordersPage',
});

const { searchInput, search, clearSearch } = useUrlSearch({
  param: 'ordersSearch',
  debounce: DEBOUNCE_MS.SEARCH_DEFAULT,
});

const {
  primeVueSortField,
  primeVueSortOrder,
  sortOrdering,
  handlePrimeVueSort,
} = useUrlSort({
  useCombinedFormat: true,
  combinedParam: 'ordersOrdering',
});

// Local orders state
const orders = ref<Order[]>([]);
const ordersLoading = ref(false);
const totalOrders = ref(0);

// Update header with customer name
const customerHeaderName = useState<string | null>('customerHeaderName', () => null);
watch(customer, (newCustomer) => {
  customerHeaderName.value = newCustomer?.l_name || null;
}, { immediate: true });

// Clear customer name from header when leaving page
onUnmounted(() => {
  customerHeaderName.value = null;
});

// Computed
const hasAddress = computed(() => {
  if (!customer.value) return false;
  return !!(
    customer.value.address1 ||
    customer.value.address2 ||
    customer.value.city ||
    customer.value.state ||
    customer.value.zip ||
    customer.value.country
  );
});

const showPagination = computed(() => totalOrders.value > pageSize.value);

const paginationRange = computed(() => {
  if (totalOrders.value === 0) {
    return { start: 0, end: 0, total: 0 };
  }
  const start = offset.value + 1;
  const end = Math.min(offset.value + pageSize.value, totalOrders.value);
  return { start, end, total: totalOrders.value };
});

const orderSkeletonRows = computed(() => {
  return Array.from({ length: pageSize.value }, (_, i) => ({
    autoid: `skeleton-${i}`,
    id: '',
    invoice: '',
    name: '',
    inv_date: null,
    due_date: null,
    status: 'U' as const,
    tax: '0',
    subtotal: '0',
    total: '0',
    balance: '0',
  }));
});

// Load customer on mount
onMounted(() => {
  loadCustomer();
  loadOrders();
});

// Watch for project changes (superadmin only)
watch(
  selectedProjectId,
  () => {
    if (isSuperAdmin.value) {
      loadCustomer();
      loadOrders();
    }
  }
);

// Watch for URL state changes and reload orders
watch(
  [page, pageSize, search, sortOrdering],
  () => {
    loadOrders();
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

async function loadCustomer() {
  try {
    loading.value = true;

    const projectId = isSuperAdmin.value && selectedProjectId.value !== null 
      ? selectedProjectId.value 
      : undefined;

    customer.value = await customersApi.getById(customerId.value, undefined, projectId);
  } catch (error) {
    toast.showError(error, "Failed to Load Customer");
    customer.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadOrders() {
  try {
    ordersLoading.value = true;

    const params: any = {
      customer_id: customerId.value,
      limit: pageSize.value,
      offset: offset.value,
    };

    // Add search filter
    if (search.value) {
      params.invoice = search.value;
    }

    // Add sorting
    if (sortOrdering.value) {
      params.ordering = sortOrdering.value;
    }

    // Add project_id for superadmin
    if (isSuperAdmin.value && selectedProjectId.value !== null) {
      params.project_id = selectedProjectId.value;
    }

    const response = await ordersApi.list(params);
    orders.value = response.results;
    totalOrders.value = response.count;
  } catch (error) {
    toast.showError(error, "Failed to Load Orders");
  } finally {
    ordersLoading.value = false;
  }
}

function onPageChange(event: PrimeVuePageEvent) {
  const newPage = Math.floor(event.first / event.rows) + 1;
  setPage(newPage);
}

// formatDate and formatCurrency are now imported from ~/utils/formatters

// getStatusLabel and getStatusSeverity are now imported as getOrderStatusLabel and getOrderStatusSeverity from ~/utils/constants

function truncateName(name: string): string {
  if (!name) return '';
  const maxLength = 40;
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
}
</script>

<style scoped>
/* Customer details page - custom styles */
/* Common styles are in assets/css/components.css */

/* Tabs container (exact match to Orders page) */
.tabs-container {
  margin-bottom: 1rem;
}

.tabs {
  gap: 0.25rem;
  border-bottom: 1px solid var(--color-border-light);
}

.tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.tab:hover {
  color: var(--color-text-primary);
  background: var(--color-neutral-200);
}

.tab-active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-neutral-900);
}

/* Override info-card-title size */
.info-card-title {
  font-size: var(--font-size-body-l) !important;
  font-weight: var(--font-weight-semibold) !important;
  margin-bottom: 1rem !important;
}

/* Search container spacing */
.search-container {
  margin-bottom: 1rem;
}

.columns-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
}

.left-column {
  position: sticky;
  top: 4rem;
  align-self: start;
}

/* Two-column layout (custom to detail pages) */
.right-column {
  min-width: 0;
}

@media (max-width: 1024px) {
  .columns-container {
    grid-template-columns: 1fr;
  }

  .left-column {
    position: static;
  }
}

/* Loading container - use flex utilities in template if needed */
.loading-container {
  min-height: 400px;
}

/* Error container */
.error-container {
  padding: 4rem 2rem;
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

/* Info card */
.info-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
}

.info-label {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.info-value {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
}

.address-block {
  gap: 0.125rem;
}

/* Table card */
.table-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

/* Pagination */
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
</style>
