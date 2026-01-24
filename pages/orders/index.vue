<!-- pages/orders/index.vue -->
<template>
  <div class="page-wrapper orders-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">Orders</h1>
    </div>

    <!-- Status Filter Tabs -->
    <div class="tabs-container">
      <div class="flex tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          :class="['tab', { 'tab-active': filters.status === tab.value }]"
          @click="setFilter('status', tab.value as OrderStatus | '')"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <IconField iconPosition="left">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchInput"
          placeholder="Search by invoice number..."
          class="search-input"
        />
      </IconField>
    </div>

    <!-- Orders Table Card -->
    <div class="table-card">
      <!-- Empty State -->
      <div v-if="!loading && orders.length === 0" class="flex flex-column align-items-center justify-content-center gap-3 empty-state">
        <i class="pi pi-inbox"></i>
        <p class="empty-state-text">
          {{ search ? 'No orders match your search' : getEmptyStateMessage() }}
        </p>
        <Button
          v-if="search"
          label="Clear Search"
          severity="secondary"
          size="small"
          @click="clearSearch"
        />
        <Button
          v-else-if="filters.status"
          label="View All Orders"
          severity="secondary"
          size="small"
          @click="setFilter('status', '' as OrderStatus | '')"
        />
      </div>

      <!-- Orders Table -->
      <DataTable
        v-else
        :value="loading ? skeletonRows : orders"
        :class="['data-table orders-table', { loading: loading }]"
        stripedRows
        v-model:selection="selectedOrders"
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
              v-if="!loading"
              :icon="expandedRows[slotProps.data.autoid] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
              text
              rounded
              size="small"
              @click.stop="toggleExpand(slotProps.data)"
              class="expander-button"
            />
          </template>
        </Column>

        <!-- Selection Column -->
        <Column selectionMode="multiple" :style="{ width: '50px', minWidth: '50px' }" />

        <!-- Invoice Column -->
        <Column
          field="invoice"
          header="Invoice"
          sortable
          :style="{ width: '15%', minWidth: '120px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 100px;"></div>
            <span v-else class="cell-code">{{ formatInvoice(data.invoice) }}</span>
          </template>
        </Column>

        <!-- Status Column -->
        <Column
          field="status"
          header="Status"
          sortable
          :style="{ width: '12%', minWidth: '100px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-button"></div>
            <Tag v-else :value="getOrderStatusLabel(data.status)" :severity="getOrderStatusSeverity(data.status)" />
          </template>
        </Column>

        <!-- Customer Name Column -->
        <Column
          field="name"
          header="Customer"
          sortable
          :style="{ width: '25%', minWidth: '150px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 140px;"></div>
            <span v-else class="customer-name">{{ data.name || '—' }}</span>
          </template>
        </Column>

        <!-- Order Date Column -->
        <Column
          field="inv_date"
          header="Order Date"
          sortable
          :style="{ width: '15%', minWidth: '110px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 90px;"></div>
              <span v-else class="cell-date">{{ formatDate(data.inv_date) }}</span>
          </template>
        </Column>

        <!-- Due Date Column -->
        <Column
          field="due_date"
          header="Due Date"
          sortable
          :style="{ width: '15%', minWidth: '110px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 90px;"></div>
              <span v-else class="cell-date">{{ formatDate(data.due_date) }}</span>
          </template>
        </Column>

        <!-- Total Column -->
        <Column
          field="total"
          header="Total"
          sortable
          :style="{ width: '12%', minWidth: '100px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 80px;"></div>
              <span v-else class="cell-amount">{{ formatCurrency(data.total) }}</span>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column header="Actions" :style="{ width: '8%', minWidth: '70px', textAlign: 'center' }">
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-circle" style="width: 2rem; height: 2rem; margin: 0 auto;"></div>
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
      <div class="flex align-items-center justify-content-between pagination-container">
        <div class="flex justify-content-start align-items-center flex-1">
          <span v-if="!loading && totalRecords > 0" class="results-text">
            {{ paginationRange.start }}–{{ paginationRange.end }} of {{ paginationRange.total.toLocaleString() }}
          </span>
        </div>
        
        <Paginator
          v-if="showPagination"
          :rows="pageSize"
          :totalRecords="totalRecords"
          :first="offset"
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
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";
import Menu from "primevue/menu";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import ProgressSpinner from "primevue/progressspinner";
import { until } from "@vueuse/core";
import type { Order, OrderItem, PrimeVuePageEvent } from "~/types";
import type { DataTableSortEvent } from "primevue/datatable";
import { formatDate, formatCurrency, formatQuantity } from "~/utils/formatters";
import { 
  PAGINATION_DEFAULTS, 
  DEBOUNCE_MS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  getOrderStatusLabel, 
  getOrderStatusSeverity,
  type OrderStatus
} from "~/utils/constants";

definePageMeta({
  middleware: "auth",
});

const ordersApi = useOrders();
const toast = useToast();
const { selectedProjectId, projects, projectsLoading, isSuperAdmin } = useSelectedProject();

// URL-based state management
const { page, pageSize, offset, setPage, resetPage } = useUrlPagination({
  defaultPageSize: PAGINATION_DEFAULTS.PAGE_SIZE_MEDIUM,
});

const { searchInput, search, clearSearch } = useUrlSearch({
  param: 'invoice',
  debounce: DEBOUNCE_MS.SEARCH_LONG,
});

const { filters, setFilter } = useUrlFilters<{
  status: OrderStatus | '';
}>({
  status: {
    param: 'status',
    defaultValue: ORDER_STATUS.UNPROCESSED as OrderStatus | '', // Default to Unprocessed
  },
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
const orders = ref<Order[]>([]);
const loading = ref(true); // Start with true to prevent empty state flash
const totalRecords = ref(0);
const selectedOrders = ref<Order[]>([]);
const expandedRows = ref<Record<string, boolean>>({});
const orderItemsMap = ref<Record<string, OrderItem[]>>({});
const loadingItems = ref<Record<string, boolean>>({});
const menuRef = ref();
const selectedOrder = ref<Order | null>(null);

// Status tabs configuration
const statusTabs = [
  { 
    label: ORDER_STATUS_LABELS[ORDER_STATUS.UNPROCESSED], 
    value: ORDER_STATUS.UNPROCESSED 
  },
  { 
    label: ORDER_STATUS_LABELS[ORDER_STATUS.OPEN], 
    value: ORDER_STATUS.OPEN 
  },
  { 
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CLOSED], 
    value: ORDER_STATUS.CLOSED 
  },
  { label: 'All Orders', value: '' },
];

// Computed properties
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
  return Array.from({ length: Math.min(pageSize.value, 10) }, (_, i) => ({
    autoid: `skeleton-${i}`,
    id: '',
    invoice: '',
    name: '',
    inv_date: null,
    due_date: null,
    status: 'U' as const,
    tax: '',
    subtotal: '',
    total: '',
    balance: '',
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

// Load orders on mount
onMounted(async () => {
  // Wait for projects to load if user is superadmin
  if (isSuperAdmin.value && projectsLoading.value) {
    await until(projectsLoading).toBe(false);
  }
  
  loadOrders();
});

// Watch for URL state changes and reload orders
watch(
  [page, pageSize, search, () => filters.value.status, sortOrdering],
  () => {
    loadOrders();
  }
);

// Watch for search/filter changes and reset to first page
watch(
  [search, () => filters.value.status],
  (newVals, oldVals) => {
    // Only reset if values actually changed (not initial load)
    if (oldVals && (oldVals[0] !== newVals[0] || oldVals[1] !== newVals[1])) {
      resetPage();
    }
  }
);

// Watch for project changes and reset to first page
watch(
  selectedProjectId,
  (newVal, oldVal) => {
    // Only reset if this is an actual change, not initial load (oldVal will be null or undefined on first load)
    if (oldVal !== undefined && oldVal !== null) {
      resetPage();
      loadOrders();
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

async function loadOrders() {
  loading.value = true;
  try {
    const params: any = {
      limit: pageSize.value,
      offset: offset.value,
    };

    // Add status filter if not "All Orders"
    if (filters.value.status) {
      params.status = filters.value.status;
    }

    // Add search filter
    if (search.value) {
      params.invoice = search.value;
    }

    // Add sorting
    if (sortOrdering.value) {
      params.ordering = sortOrdering.value;
    }

    // Add project_id filter if available
    if (selectedProjectId.value !== null) {
      params.project_id = selectedProjectId.value;
    }

    const response = await ordersApi.list(params);
    orders.value = response.results;
    totalRecords.value = response.count;
  } catch (error) {
    toast.showError(error, "Failed to Load Orders");
  } finally {
    loading.value = false;
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

function getEmptyStateMessage(): string {
  if (!filters.value.status) {
    return 'No orders found';
  }
  
  const statusLabel = ORDER_STATUS_LABELS[filters.value.status as OrderStatus];
  return `No ${statusLabel.toLowerCase()} orders`;
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

// Keep formatInvoice as it's custom logic specific to this page
function formatInvoice(invoice: string): string {
  return invoice?.trim() || '—';
}
</script>

<style scoped>
.orders-page {
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

/* Tabs */
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

/* Search */
.search-container {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
}

/* Table */
.table-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  min-width: 700px;
}

.orders-table {
  width: 100%;
}

.orders-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.invoice-number {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
}

.customer-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
}

.order-date,
.due-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-s);
}

.order-total {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
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

.orders-paginator {
  padding: 0.5rem;
}

/* Prevent horizontal shifting during loading */
.orders-table :deep(.p-datatable-tbody > tr > td) {
  overflow: hidden;
}

.orders-table :deep(.p-datatable-thead > tr > th) {
  overflow: hidden;
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
