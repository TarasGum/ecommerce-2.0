<!-- components/orders/OrderDetailsModal.vue -->
<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-lg"
  >
    <template #header>
      <h2 class="modal-title">Order Details</h2>
    </template>

    <div v-if="order" class="flex flex-column gap-4 order-details stagger-in">
      <!-- Order Summary -->
      <div class="order-summary">
        <div class="summary-grid">
          <div class="flex flex-column gap-1">
            <span class="summary-label">Invoice</span>
            <span class="summary-value">{{ formatInvoice(order.invoice) }}</span>
          </div>
          <div class="flex flex-column gap-1">
            <span class="summary-label">Status</span>
            <Tag :value="getOrderStatusLabel(order.status)" :severity="getOrderStatusSeverity(order.status)" />
          </div>
          <div class="flex flex-column gap-1">
            <span class="summary-label">Customer</span>
            <span class="summary-value">{{ order.name || '—' }}</span>
          </div>
          <div class="flex flex-column gap-1">
            <span class="summary-label">Customer ID</span>
            <span class="summary-value">{{ order.id || '—' }}</span>
          </div>
          <div class="flex flex-column gap-1">
            <span class="summary-label">Order Date</span>
            <span class="summary-value">{{ formatDate(order.inv_date) }}</span>
          </div>
          <div class="flex flex-column gap-1">
            <span class="summary-label">Due Date</span>
            <span class="summary-value">{{ formatDate(order.due_date) }}</span>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="flex flex-column gap-2 order-items-section">
        <h3 class="section-title">Order Items</h3>
        
        <!-- Loading state -->
        <div v-if="loadingItems" class="flex flex-column align-items-center justify-content-center gap-3 loading-container">
          <ProgressSpinner style="width: 40px; height: 40px;" />
          <span class="loading-text">Loading items...</span>
        </div>

        <!-- Items table -->
        <div v-else-if="orderItems.length > 0" class="items-table-container">
          <DataTable :value="orderItems" class="items-table" stripedRows>
            <Column field="inven" header="Item Code" :style="{ width: '15%', minWidth: '100px' }">
              <template #body="{ data }">
                <span class="item-code">{{ data.inven || '—' }}</span>
              </template>
            </Column>
            <Column field="descr" header="Description" :style="{ width: '40%', minWidth: '200px' }">
              <template #body="{ data }">
                <span class="item-description">{{ data.descr || '—' }}</span>
              </template>
            </Column>
            <Column field="quan" header="Quantity" :style="{ width: '15%', minWidth: '80px' }">
              <template #body="{ data }">
                <span class="item-quantity">{{ formatQuantity(data.quan) }}</span>
              </template>
            </Column>
            <Column field="price" header="Price" :style="{ width: '15%', minWidth: '90px' }">
              <template #body="{ data }">
                <span class="item-price">{{ formatCurrency(data.price) }}</span>
              </template>
            </Column>
            <Column field="so_amount" header="Amount" :style="{ width: '15%', minWidth: '100px' }">
              <template #body="{ data }">
                <span class="item-amount">{{ formatCurrency(data.so_amount) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- No items message -->
        <div v-else class="flex flex-column align-items-center justify-content-center gap-2 no-items-message">
          <i class="pi pi-inbox" style="font-size: 2rem; color: var(--color-text-tertiary);"></i>
          <p>No items found for this order</p>
        </div>
      </div>

      <!-- Order Totals -->
      <div class="order-totals">
        <div class="flex flex-column gap-2 totals-grid">
          <div class="flex justify-content-between align-items-center py-1">
            <span class="total-label">Subtotal</span>
            <span class="total-value">{{ formatCurrency(order.subtotal) }}</span>
          </div>
          <div class="flex justify-content-between align-items-center py-1">
            <span class="total-label">Tax</span>
            <span class="total-value">{{ formatCurrency(order.tax) }}</span>
          </div>
          <div class="flex justify-content-between align-items-center py-1 total-row-main">
            <span class="total-label">Total</span>
            <span class="total-value total-value-main">{{ formatCurrency(order.total) }}</span>
          </div>
          <div class="flex justify-content-between align-items-center py-1">
            <span class="total-label">Balance</span>
            <span class="total-value">{{ formatCurrency(order.balance) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Close"
        severity="secondary"
        text
        @click="handleClose"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import type { Order, OrderItem } from "~/types/models";
import { formatDate, formatCurrency, formatQuantity } from "~/utils/formatters";
import { getOrderStatusLabel, getOrderStatusSeverity } from "~/utils/constants";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    order: Order | null;
  }>(),
  {
    visible: false,
    order: null,
  }
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  close: [];
}>();

const ordersApi = useOrders();
const toast = useToast();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const orderItems = ref<OrderItem[]>([]);
const loadingItems = ref(false);

// Watch for order changes and load items
watch(
  () => props.order,
  async (newOrder) => {
    if (newOrder) {
      await loadOrderItems(newOrder);
    } else {
      orderItems.value = [];
    }
  },
  { immediate: true }
);

async function loadOrderItems(order: Order) {
  if (!order) return;

  // Check if items already loaded with the order
  if (order.items && order.items.length > 0) {
    orderItems.value = order.items;
    return;
  }

  // Otherwise fetch items by invoice
  loadingItems.value = true;
  try {
    const response = await ordersApi.getDetailsByInvoice(order.invoice.trim());
    orderItems.value = response.items || [];
  } catch (error) {
    console.error("Failed to load order items:", error);
    toast.showError(error, "Failed to Load Order Items");
    orderItems.value = [];
  } finally {
    loadingItems.value = false;
  }
}

function handleClose() {
  isVisible.value = false;
  emit("close");
}

// Formatting functions
function formatInvoice(invoice: string): string {
  return invoice?.trim() || '—';
}

// formatDate, formatCurrency, formatQuantity imported from ~/utils/formatters
// getStatusLabel and getStatusSeverity imported as getOrderStatusLabel and getOrderStatusSeverity from ~/utils/constants
</script>

<style scoped>
/* Order Summary */
.order-summary {
  background: var(--color-neutral-200);
  border-radius: var(--radius-sm);
  padding: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.summary-label {
  font-size: var(--font-size-body-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.section-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.loading-container {
  padding: 2rem;
}

.loading-text {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

.items-table-container {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.items-table {
  width: 100%;
}

.item-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: var(--font-size-body-xs);
  color: var(--color-text-primary);
}

.item-description {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
}

.item-quantity,
.item-price,
.item-amount {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

.item-amount {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.no-items-message {
  padding: 3rem 2rem;
  background: var(--color-neutral-200);
  border-radius: var(--radius-sm);
}

.no-items-message p {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Order Totals */
.order-totals {
  background: var(--color-neutral-200);
  border-radius: var(--radius-sm);
  padding: 1rem;
}

.totals-grid {
  max-width: 300px;
  margin-left: auto;
}

.total-row-main {
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-light);
  margin-top: 0.25rem;
}

.total-label {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-regular);
}

.total-value {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.total-value-main {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
