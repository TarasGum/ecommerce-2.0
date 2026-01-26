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
                v-model:expandedRows="expandedRows"
                dataKey="autoid"
                :sortField="primeVueSortField || undefined"
                :sortOrder="primeVueSortOrder"
                @sort="handlePrimeVueSort"
              >
                <!-- Expansion Column -->
                <Column expander :style="{ width: '50px', minWidth: '50px' }">
                  <template #body="slotProps">
                    <Button
                      v-if="!loading && !ordersLoading"
                      :icon="expandedRows[slotProps.data.autoid] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                      text
                      rounded
                      size="small"
                      @click.stop="toggleExpand(slotProps.data)"
                      class="expander-button"
                    />
                  </template>
                </Column>

                <!-- Invoice Column -->
                <Column
                  field="invoice"
                  header="Invoice"
                  sortable
                  :style="{ width: '18%', minWidth: '120px' }"
                >
                  <template #body="{ data }">
                    <div v-if="loading || ordersLoading" class="skeleton skeleton-text"></div>
                    <span v-else class="cell-code">{{ formatInvoice(data.invoice) }}</span>
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
                  :style="{ width: '18%', minWidth: '120px' }"
                >
                  <template #body="{ data }">
                    <div v-if="loading || ordersLoading" class="skeleton skeleton-text"></div>
                    <span v-else class="cell-date">{{ formatDate(data.inv_date) }}</span>
                  </template>
                </Column>

                <!-- Due Date Column -->
                <Column
                  field="due_date"
                  header="Due Date"
                  sortable
                  :style="{ width: '18%', minWidth: '120px' }"
                >
                  <template #body="{ data }">
                    <div v-if="loading || ordersLoading" class="skeleton skeleton-text"></div>
                    <span v-else class="cell-date">{{ formatDate(data.due_date) }}</span>
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

                <!-- Actions Column -->
                <Column header="Actions" :style="{ width: '8%', minWidth: '70px', textAlign: 'center' }">
                  <template #body="{ data }">
                    <div v-if="loading || ordersLoading" class="skeleton skeleton-circle"></div>
                    <Button
                      v-else
                      icon="pi pi-ellipsis-v"
                      text
                      rounded
                      @click="(event) => toggleMenu(event, data)"
                      aria-haspopup="true"
                      :aria-controls="`menu-${data.autoid}`"
                    />
                  </template>
                </Column>

                <!-- Row Expansion Template -->
                <template #expansion="{ data }">
                  <div class="order-expansion">
                    <div class="flex flex-column gap-3 expansion-content">
                      <!-- Order Summary Info -->
                      <div class="flex justify-content-between align-items-center flex-wrap gap-3 expansion-header">
                        <h4 class="expansion-title">Order Items</h4>
                        <div class="flex gap-4 flex-wrap">
                          <span class="flex gap-2 align-items-center">
                            <span class="meta-label">Customer ID:</span>
                            <span class="meta-value">{{ data.id || '—' }}</span>
                          </span>
                          <span class="flex gap-2 align-items-center">
                            <span class="meta-label">Subtotal:</span>
                            <span class="meta-value">{{ formatCurrency(data.subtotal) }}</span>
                          </span>
                          <span class="flex gap-2 align-items-center">
                            <span class="meta-label">Tax:</span>
                            <span class="meta-value">{{ formatCurrency(data.tax) }}</span>
                          </span>
                          <span class="flex gap-2 align-items-center">
                            <span class="meta-label">Balance:</span>
                            <span class="meta-value">{{ formatCurrency(data.balance) }}</span>
                          </span>
                        </div>
                      </div>

                      <!-- Loading State -->
                      <div v-if="loadingItems[data.autoid]" class="flex align-items-center justify-content-center gap-2 items-loading">
                        <ProgressSpinner style="width: 30px; height: 30px;" />
                        <span class="loading-text">Loading items...</span>
                      </div>

                      <!-- Items Table -->
                      <div v-else-if="orderItemsMap[data.autoid] && orderItemsMap[data.autoid].length > 0" class="items-table-wrapper">
                        <DataTable :value="orderItemsMap[data.autoid]" class="expansion-items-table">
                          <Column field="inven" header="Item Code" :style="{ width: '15%' }">
                            <template #body="{ data: item }">
                              <span class="item-code">{{ item.inven || '—' }}</span>
                            </template>
                          </Column>
                          <Column field="descr" header="Description" :style="{ width: '45%' }">
                            <template #body="{ data: item }">
                              <span class="item-description">{{ item.descr || '—' }}</span>
                            </template>
                          </Column>
                          <Column field="quan" header="Quantity" :style="{ width: '12%' }">
                            <template #body="{ data: item }">
                              <span class="item-quantity">{{ formatQuantity(item.quan) }}</span>
                            </template>
                          </Column>
                          <Column field="price" header="Price" :style="{ width: '14%' }">
                            <template #body="{ data: item }">
                              <span class="item-price">{{ formatCurrency(item.price) }}</span>
                            </template>
                          </Column>
                          <Column field="so_amount" header="Amount" :style="{ width: '14%' }">
                            <template #body="{ data: item }">
                              <span class="item-amount">{{ formatCurrency(item.so_amount) }}</span>
                            </template>
                          </Column>
                        </DataTable>
                      </div>

                      <!-- No Items Message -->
                      <div v-else class="flex flex-column align-items-center justify-content-center gap-2 no-items">
                        <i class="pi pi-inbox"></i>
                        <span>No items found for this order</span>
                      </div>
                    </div>
                  </div>
                </template>
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

    <!-- Context Menu -->
    <Menu ref="menuRef" :model="menuItems" :popup="true" />
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
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import { until } from "@vueuse/core";
import type { Customer, Order, OrderItem, PrimeVuePageEvent } from "~/types";
import type { DataTableSortEvent } from "primevue/datatable";
import { formatDate, formatCurrency, formatQuantity } from "~/utils/formatters";
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
const { selectedProjectId, isSuperAdmin, projectsLoading } = useSelectedProject();

// Customer ID from route
const customerId = computed(() => route.params.id as string);

// Customer state
const customer = ref<Customer | null>(null);
const loading = ref(true); // Start with true to prevent empty state flash
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
const expandedRows = ref<Record<string, boolean>>({});
const orderItemsMap = ref<Record<string, OrderItem[]>>({});
const loadingItems = ref<Record<string, boolean>>({});
const menuRef = ref();
const selectedOrder = ref<Order | null>(null);

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

// Menu items
const menuItems = computed(() => [
  {
    label: "Edit",
    icon: "pi pi-pencil",
    command: () => {
      toast.showInfo("Coming Soon!");
    },
  },
  {
    label: "Delete",
    icon: "pi pi-trash",
    command: () => {
      toast.showInfo("Coming Soon!");
    },
  },
]);

// Load customer on mount
onMounted(async () => {
  // Wait for projects to load if user is superadmin AND projects are still loading
  if (isSuperAdmin.value && projectsLoading.value) {
    await until(projectsLoading).toBe(false);
  }
  
  // Always load data after waiting (if needed)
  loadCustomer();
  loadOrders();
});

// Watch for customer ID changes (navigation between customers)
watch(
  customerId,
  () => {
    loadCustomer();
    loadOrders();
  }
);

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

// Watch for row expansion and load items
watch(expandedRows, async (newExpandedRows, oldExpandedRows) => {
  // Find newly expanded row autoids
  const newAutoids = Object.keys(newExpandedRows).filter(
    autoid => newExpandedRows[autoid] && !oldExpandedRows[autoid]
  );

  // Load items for newly expanded rows
  for (const autoid of newAutoids) {
    const order = orders.value.find(o => o.autoid === autoid);
    if (order) {
      await loadOrderItems(order);
    }
  }
}, { deep: true });

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

function toggleMenu(event: Event, order: Order) {
  selectedOrder.value = order;
  menuRef.value.toggle(event);
}

function toggleExpand(order: Order) {
  const autoid = order.autoid;
  const isExpanded = expandedRows.value[autoid];
  
  if (isExpanded) {
    // Collapse
    const newExpandedRows = { ...expandedRows.value };
    delete newExpandedRows[autoid];
    expandedRows.value = newExpandedRows;
  } else {
    // Expand
    expandedRows.value = {
      ...expandedRows.value,
      [autoid]: true,
    };
  }
}

async function loadOrderItems(order: Order) {
  // Check if already loaded
  if (orderItemsMap.value[order.autoid]) {
    return;
  }

  // Check if items came with the order
  if (order.items && order.items.length > 0) {
    orderItemsMap.value = {
      ...orderItemsMap.value,
      [order.autoid]: order.items,
    };
    return;
  }

  // Fetch items from API
  loadingItems.value = {
    ...loadingItems.value,
    [order.autoid]: true,
  };
  
  try {
    const response = await ordersApi.getDetailsByInvoice(order.invoice.trim());
    orderItemsMap.value = {
      ...orderItemsMap.value,
      [order.autoid]: response.items || [],
    };
  } catch (error) {
    console.error("Failed to load order items:", error);
    toast.showError(error, "Failed to Load Order Items");
    orderItemsMap.value = {
      ...orderItemsMap.value,
      [order.autoid]: [],
    };
  } finally {
    loadingItems.value = {
      ...loadingItems.value,
      [order.autoid]: false,
    };
  }
}

// formatDate and formatCurrency are now imported from ~/utils/formatters

// getStatusLabel and getStatusSeverity are now imported as getOrderStatusLabel and getOrderStatusSeverity from ~/utils/constants

function truncateName(name: string): string {
  if (!name) return '';
  const maxLength = 40;
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
}

function formatInvoice(invoice: string): string {
  return invoice?.trim() || '—';
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

/* Row Expansion Styles */
.order-expansion {
  background: var(--color-neutral-200);
  padding: 0;
}

.expansion-content {
  padding: 1.25rem;
}

.expansion-header {
  margin-bottom: 0.5rem;
}

.expansion-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.meta-label {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.meta-value {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.items-loading {
  padding: 2rem;
}

.loading-text {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

.items-table-wrapper {
  background: white;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
}

.expansion-items-table {
  width: 100%;
}

.expansion-items-table :deep(.p-datatable-thead > tr > th) {
  background: var(--color-neutral-300);
  font-size: var(--font-size-body-xs);
  padding: 0.5rem 0.75rem;
}

.expansion-items-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.625rem 0.75rem;
  font-size: var(--font-size-body-s);
}

.item-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: var(--font-size-body-xs);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.item-description {
  color: var(--color-text-primary);
}

.item-quantity,
.item-price {
  color: var(--color-text-secondary);
}

.item-amount {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.no-items {
  padding: 2.5rem;
  background: white;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.no-items i {
  font-size: 2rem;
  color: var(--color-text-tertiary);
}

.no-items span {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

/* Expansion row styling */
.orders-table :deep(.p-datatable-row-expansion > td) {
  padding: 0 !important;
  border-bottom: 1px solid var(--color-border-light);
}

/* Consistent row height - force exact match to 45px */
.orders-table :deep(.p-datatable-tbody > tr) {
  height: 45px;
  max-height: 45px;
  min-height: 45px;
}

.orders-table :deep(.p-datatable-tbody > tr > td) {
  vertical-align: middle;
  padding: 8px !important;
  height: 45px;
  line-height: normal;
}
</style>
