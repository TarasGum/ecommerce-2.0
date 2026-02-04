<!-- pages/proposals/create.vue -->
<template>
  <div class="page-wrapper proposal-create-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">Create New Proposal</h1>
    </div>

    <!-- Info Banner -->
    <div class="info-banner mb-3">
      <i class="pi pi-info-circle"></i>
      <span>
        Test API - Product pricing uses cost field. This will be changed.
      </span>
    </div>

    <!-- Proposal Card -->
    <div class="proposal-card">
      <!-- Customer Selection Section -->
      <div class="proposal-section">
        <h3 class="section-title">Select Customer</h3>
        <p class="section-description">Choose a customer for this proposal.</p>

        <!-- Customer Search Dropdown -->
        <div class="customer-search-wrapper">
          <Dropdown
            v-model="selectedCustomer"
            :options="customerOptions"
            optionLabel="l_name"
            placeholder="Search customer by name or ID..."
            class="customer-dropdown"
            :loading="customerSearchLoading"
            filter
            filterPlaceholder="Type to search..."
            @filter="searchCustomers"
            showClear
            :filterFields="['id', 'l_name', 'email']"
            emptyFilterMessage="No customers found"
          >
            <template #value="{ value, placeholder }">
              <div v-if="value" class="customer-value">
                <span class="customer-value-id">{{ value.id }}</span>
                <span class="customer-value-name">{{ value.l_name }}</span>
                <span v-if="value.email" class="customer-value-email">{{
                  value.email
                }}</span>
              </div>
              <span v-else class="text-placeholder">{{ placeholder }}</span>
            </template>
            <template #option="{ option }">
              <div class="customer-option">
                <div class="customer-option-main">
                  <span class="customer-option-id">{{ option.id }}</span>
                  <span class="customer-option-name">{{ option.l_name }}</span>
                </div>
                <div class="customer-option-meta">
                  <span v-if="option.email" class="customer-option-email">{{
                    option.email
                  }}</span>
                  <span
                    v-if="option.city && option.state"
                    class="customer-option-location"
                  >
                    {{ option.city }}, {{ option.state }}
                  </span>
                  <Tag
                    v-if="option.inactive"
                    value="Inactive"
                    severity="secondary"
                    class="customer-option-tag"
                  />
                </div>
              </div>
            </template>
            <template #empty>
              <div v-if="customerSearchLoading" class="customer-loading">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Loading customers...</span>
              </div>
              <div v-else class="customer-empty">
                <i class="pi pi-users"></i>
                <span>Start typing to search customers</span>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>

      <!-- Product Search Section -->
      <div class="proposal-section">
        <h3 class="section-title">Add Products</h3>
        <p class="section-description">
          Search for products by ID or description to add them to this proposal.
        </p>

        <!-- Product Search Combobox -->
        <div class="product-search-wrapper">
          <Dropdown
            v-model="selectedProduct"
            :options="productOptions"
            optionLabel="id"
            :placeholder="
              selectedCustomer
                ? 'Search product by ID...'
                : 'Select a customer first'
            "
            class="product-dropdown"
            :loading="productSearchLoading || configurationsLoading"
            :disabled="!selectedCustomer"
            filter
            filterPlaceholder="Type to search..."
            @filter="searchProducts"
            @change="onProductSelected"
            showClear
            :filterFields="['id', 'descr_1', 'autoid']"
            emptyFilterMessage="No products found"
          >
            <template #value="{ value, placeholder }">
              <div v-if="value" class="product-value">
                <Tag severity="secondary" class="product-value-id">{{ value.id }}</Tag>
                <span class="product-value-name">{{ value.descr_1 }}</span>
                <PriceDisplay
                  :price="value.price"
                  :old-price="value.old_price"
                  class="product-value-price"
                />
              </div>
              <span v-else class="text-placeholder">{{ placeholder }}</span>
            </template>
            <template #option="{ option }">
              <div class="product-option">
                <div class="product-option-row">
                  <div class="product-option-main">
                    <Tag severity="secondary" class="product-option-id">
                      <span v-html="highlightMatch(option.id, productSearchQuery)"></span>
                    </Tag>
                    <span
                      class="product-option-name"
                      v-html="highlightMatch(option.descr_1, productSearchQuery)"
                    ></span>
                  </div>
                  <div class="product-option-meta">
                    <PriceDisplay
                      :price="option.price"
                      :old-price="option.old_price"
                      class="product-option-price"
                    />
                    <Tag
                      v-if="option.inactive"
                      value="Inactive"
                      severity="secondary"
                      class="product-option-tag"
                    />
                  </div>
                </div>
                <div v-if="option.product_specs?.length" class="product-option-specs">
                  <span
                    v-for="(spec, idx) in option.product_specs.slice(0, 3)"
                    :key="spec.descr"
                    class="product-option-spec"
                  >
                    <span class="spec-label">{{ spec.descr }}:</span>
                    <span class="spec-value">{{ spec.info }}</span>
                    <span v-if="Number(idx) < option.product_specs.slice(0, 3).length - 1" class="spec-separator">·</span>
                  </span>
                  <span v-if="option.product_specs.length > 3" class="product-option-specs-more">
                    +{{ option.product_specs.length - 3 }} more
                  </span>
                </div>
              </div>
            </template>
            <template #empty>
              <div v-if="productSearchLoading" class="product-loading">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Loading products...</span>
              </div>
              <div v-else class="product-empty">
                <i class="pi pi-search"></i>
                <span>Start typing to search products</span>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>

      <!-- Added Products List -->
      <div class="proposal-section">
        <div class="flex justify-content-between align-items-center mb-3">
          <h3 class="section-title mb-0">Proposal Items</h3>
          <span v-if="cartItems.length > 0" class="items-count">
            {{ cartItems.length }} item{{ cartItems.length !== 1 ? "s" : "" }}
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="cartLoading" class="items-loading">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Loading cart...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="cartError" class="items-error">
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ cartError }}</span>
          <Button
            label="Retry"
            severity="secondary"
            size="small"
            @click="selectedCustomer && getCart(selectedCustomer.id)"
          />
        </div>

        <!-- Empty State -->
        <div v-else-if="cartItems.length === 0" class="items-empty">
          <i class="pi pi-file-edit"></i>
          <span>No products added yet</span>
          <span class="items-empty-hint"
            >Use the search above to add products to this proposal</span
          >
        </div>

        <!-- Items Table -->
        <div v-else class="items-table-wrapper">
          <DataTable
            :value="cartItems"
            class="items-table"
            dataKey="objectId"
          >
            <!-- Product ID Column -->
            <Column field="id" header="Product ID" :style="{ width: '15%' }">
              <template #body="{ data }">
                <span class="item-id">{{ data.id }}</span>
              </template>
            </Column>

            <!-- Description Column -->
            <Column
              field="descr_1"
              header="Description"
              :style="{ width: '45%' }"
            >
              <template #body="{ data }">
                <div class="item-description-wrapper">
                  <span class="item-description">{{ data.descr_1 }}</span>
                  <span v-if="data.descr_2" class="item-description-2">{{
                    data.descr_2
                  }}</span>
                </div>
              </template>
            </Column>

            <!-- Quantity Column -->
            <Column field="count" header="Qty" :style="{ width: '14%' }">
              <template #body="{ data }">
                <QuantityInput
                  v-model="data.count"
                  :max-count="data.max_count"
                  :ignore-count="data.ignoreCount"
                />
              </template>
            </Column>

            <!-- Unit Price Column -->
            <Column field="cost" header="Unit Price" :style="{ width: '12%' }">
              <template #body="{ data }">
                <span class="item-price">{{ formatCurrency(data.cost) }}</span>
              </template>
            </Column>

            <!-- Line Total Column -->
            <Column header="Total" :style="{ width: '12%' }">
              <template #body="{ data }">
                <span class="item-total">
                  {{ formatCurrency(getLineTotal(data)) }}
                </span>
              </template>
            </Column>

            <!-- Actions Column -->
            <Column :style="{ width: '8%', textAlign: 'center' }">
              <template #body="{ data }">
                <div class="flex gap-2 justify-content-center">
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="primary"
                    size="small"
                    @click="openEditModal(data)"
                    v-tooltip.top="'Edit'"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    size="small"
                    @click="removeItem(data.objectId)"
                    v-tooltip.top="'Remove'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Proposal Summary -->
      <div v-if="cart" class="proposal-summary">
        <div v-if="hasDiscount" class="summary-row">
          <span class="summary-label">Original Price</span>
          <span class="summary-value summary-old-price">
            {{ formatCurrency(cart.oldTotal) }}
          </span>
        </div>
        <div class="summary-row summary-total">
          <span class="summary-label">Total</span>
          <span class="summary-value">{{ formatCurrency(cart.total) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="proposal-actions">
        <Button
          label="Cancel"
          severity="secondary"
          text
          @click="router.push('/proposals')"
        />
        <Button
          label="Clear All"
          severity="secondary"
          outlined
          :disabled="cartItems.length === 0"
          @click="clearAllItems"
        />
        <Button
          label="Create Proposal"
          severity="success"
          icon="pi pi-check"
          :disabled="!selectedCustomer || cartItems.length === 0"
          @click="createProposal"
        />
      </div>
    </div>
    <!-- Product Edit Modal -->
    <ProductEditModal
      v-if="editingProduct"
      v-model:visible="editModalVisible"
      :product="editingProduct"
      :mode="editModalMode"
      :initial-quantity="
        editModalMode === 'edit' ? (editingProduct as CartItem).count : 1
      "
      @close="closeEditModal"
      @save="onProductSaved"
    />
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import QuantityInput from "~/components/offer/QuantityInput.vue";
import PriceDisplay from "~/components/offer/PriceDisplay.vue";
import Tag from "primevue/tag";
import ProductEditModal from "~/components/proposals/ProductEditModal.vue";
import { storeToRefs } from "pinia";
import { until } from "@vueuse/core";
import type { Product, Customer, CartItem, Cart } from "~/types/models";
import { formatCurrency } from "~/utils/formatters";
import { useProjectsStore } from "~/stores/projects";
import { useUiStore } from "~/stores/ui";
import { USER_ROLES } from "~/utils/constants";
import { useCustomers } from "~/composables/useCustomers";

definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const productsApi = useProducts();
const customersApi = useCustomers();
const { getCart, addItem, deleteItem, getPayload } = useCart();
const toast = useToast();
const auth = useAuth();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId, loading: projectsLoading } =
  storeToRefs(projectsStore);

// UI Store for page header
const uiStore = useUiStore();

const isSuperAdmin = computed(
  () => auth.user.value?.role === USER_ROLES.SUPERADMIN,
);

// Customer search state
const customerOptions = ref<Customer[]>([]);
const customerSearchLoading = ref(false);
const selectedCustomer = ref<Customer | null>(null);

// Product search state
const productOptions = ref<Product[]>([]);
const productSearchLoading = ref(false);
const configurationsLoading = ref(false);
const selectedProduct = ref<Product | null>(null);
const productSearchQuery = ref("");

// Cart state
const cart = ref<Cart | null>(null);
const cartLoading = ref(false);
const cartError = ref<string | null>(null);

// Edit modal state
const editModalVisible = ref(false);
const editingProduct = ref<Product | CartItem | null>(null);
const editModalMode = ref<"add" | "edit">("add");

// Computed values
const cartItems = computed(() => cart.value?.items ?? []);
const hasDiscount = computed(() => {
  if (!cart.value) return false;
  const total = parseFloat(cart.value.total) || 0;
  const oldTotal = parseFloat(cart.value.oldTotal) || 0;
  return oldTotal > total;
});

// Load initial data on mount and set page header
onMounted(async () => {
  // Set page header with back button
  uiStore.setPageHeader({
    title: "Proposals / New",
    showBack: true,
    backPath: "/proposals",
  });

  // Wait for projects to load if user is superadmin
  if (isSuperAdmin.value && projectsLoading.value) {
    await until(projectsLoading).toBe(false);
  }

  // Preload customers only (products require customer_id)
  await loadInitialCustomers();
});

// Load cart and clear products when customer is changed
watch(selectedCustomer, async (customer) => {
  productOptions.value = [];
  cartError.value = null;

  if (customer) {
    cartLoading.value = true;
    try {
      cart.value = await getCart(customer.id);
    } catch (error) {
      console.error("Failed to load cart:", error);
      cart.value = null;
      cartError.value = "Failed to load cart";
    } finally {
      cartLoading.value = false;
    }
  } else {
    cart.value = null;
  }
});

// Clear page header when leaving
onUnmounted(() => {
  uiStore.clearPageHeader();
});

async function loadInitialCustomers() {
  customerSearchLoading.value = true;
  try {
    const params: any = { limit: 50 };
    if (selectedProjectId.value !== null) {
      params.project_id = selectedProjectId.value;
    }
    const response = await customersApi.list(params);
    customerOptions.value = response.results;
  } catch (error) {
    console.error("Failed to load customers:", error);
  } finally {
    customerSearchLoading.value = false;
  }
}

// Search customers with debounce
let customerSearchTimeout: ReturnType<typeof setTimeout> | null = null;

async function searchCustomers(event: { value: string }) {
  const query = event.value?.trim() || "";

  // Clear previous timeout
  if (customerSearchTimeout) {
    clearTimeout(customerSearchTimeout);
  }

  // Debounce search
  customerSearchTimeout = setTimeout(async () => {
    customerSearchLoading.value = true;
    try {
      const params: any = { limit: 50 };
      if (selectedProjectId.value !== null) {
        params.project_id = selectedProjectId.value;
      }

      if (query) {
        params.search = query;
      }

      const response = await customersApi.list(params);
      customerOptions.value = response.results;
    } catch (error) {
      console.error("Failed to search customers:", error);
      customerOptions.value = [];
    } finally {
      customerSearchLoading.value = false;
    }
  }, 300);
}

// Highlight search matches in text
function highlightMatch(text: string, query: string): string {
  if (!query || !text) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Search products with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

async function searchProducts(event: { value: string }) {
  if (!selectedCustomer.value) return;

  const query = event.value?.trim() || "";
  productSearchQuery.value = query;

  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Debounce search
  searchTimeout = setTimeout(async () => {
    productSearchLoading.value = true;
    try {
      const params: any = {
        limit: 50,
        customer_id: selectedCustomer.value!.id,
      };
      if (selectedProjectId.value !== null) {
        params.project_id = selectedProjectId.value;
      }

      if (query) {
        const response = await productsApi.searchById(query, params);
        productOptions.value = response.results;
      } else {
        const response = await productsApi.list(params);
        productOptions.value = response.results;
      }
    } catch (error) {
      console.error("Failed to search products:", error);
      productOptions.value = [];
    } finally {
      productSearchLoading.value = false;
    }
  }, 300);
}

async function onProductSelected() {
  if (!selectedProduct.value || !selectedCustomer.value) return;

  const product = selectedProduct.value;
  const hasConfigurations = Number(product.configurations) > 0;
  const hasMultipleUnits = (product.units?.length ?? 0) > 1;
  const needsModal = hasConfigurations || hasMultipleUnits;

  // Clear selection immediately
  const selectedProductCopy = {
    ...product,
    unit: product.unit || product.def_unit, // Initialize unit from def_unit
  };
  nextTick(() => {
    selectedProduct.value = null;
  });

  if (needsModal) {
    // Product needs modal (configurations or multiple units)
    // Fetch configurations only if product has them
    if (hasConfigurations) {
      configurationsLoading.value = true;
      try {
        const configData = await productsApi.getConfigurations(
          selectedProductCopy.autoid,
          selectedCustomer.value.id,
        );

        selectedProductCopy.configurations = configData as any;
      } catch (error) {
        console.error("Failed to load configurations:", error);
        toast.showError("Failed to load product configurations");
        return;
      } finally {
        configurationsLoading.value = false;
      }
    }

    // Open modal with the product
    editingProduct.value = selectedProductCopy;
    editModalMode.value = "add";
    editModalVisible.value = true;
  } else {
    // No configurations → add to cart directly
    const payload = getPayload(selectedProductCopy, 1, []);

    configurationsLoading.value = true;
    try {
      await addItem(payload);
      toast.showSuccess(`${selectedProductCopy.id} added to cart`);
    } catch (error) {
      console.error("Failed to add product:", error);
      toast.showError("Failed to add product to cart");
    } finally {
      configurationsLoading.value = false;
    }
  }
}

function getLineTotal(item: CartItem): number {
  const price = parseFloat(item.price) || 0;
  return price * item.count;
}

async function removeItem(objectId: string) {
  if (!cart.value) return;

  const index = cart.value.items.findIndex((item) => item.objectId === objectId);
  if (index !== -1) {
    const removed = cart.value.items[index];
    try {
      await deleteItem(objectId);
      cart.value.items.splice(index, 1);
      toast.showInfo(`${removed.id} removed`);
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.showError("Failed to remove item from cart");
    }
  }
}

function clearAllItems() {
  if (cart.value) {
    cart.value.items = [];
  }
  toast.showInfo("All items cleared");
}

function createProposal() {
  // Validate customer is selected
  if (!selectedCustomer.value) {
    toast.showWarning("Please select a customer for this proposal");
    return;
  }
}

function openEditModal(product: CartItem) {
  editingProduct.value = { ...product };
  editModalMode.value = "edit";
  editModalVisible.value = true;
}

function closeEditModal() {
  editModalVisible.value = false;
  editingProduct.value = null;
}

function onProductSaved(payload: any) {
  editModalVisible.value = false;
  editingProduct.value = null;
}
</script>

<style scoped>
.proposal-create-page {
  padding: 1.5rem 1.5rem;
  min-height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-heading-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-warning-subtle, #fef3cd);
  border: 1px solid var(--color-warning-border, #ffc107);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body-s);
  color: var(--color-warning-text, #856404);
}

.info-banner i {
  font-size: 1rem;
  color: var(--color-warning);
}

/* Proposal Card */
.proposal-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

/* Sections */
.proposal-section {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.section-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
}

.section-description {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
}

/* Customer Search */
.customer-search-wrapper {
  max-width: 100%;
}

.customer-dropdown {
  width: 100%;
}

/* Override dropdown styles for larger combobox */
.customer-dropdown :deep(.p-dropdown-label) {
  padding: 0.875rem 1rem;
  font-size: var(--font-size-body-m);
}

.customer-dropdown :deep(.p-dropdown-panel) {
  max-height: 400px;
}

.customer-dropdown :deep(.p-dropdown-items-wrapper) {
  max-height: 350px;
}

/* Customer Value (selected) */
.customer-value {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.customer-value-id {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  min-width: 80px;
}

.customer-value-name {
  flex: 1;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-value-email {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-s);
}

/* Customer Option (dropdown item) */
.customer-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  width: 100%;
}

.customer-option-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.customer-option-id {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  min-width: 80px;
  font-size: var(--font-size-body-s);
}

.customer-option-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-option-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.customer-option-email {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-xs);
}

.customer-option-location {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-body-xs);
}

.customer-option-tag {
  font-size: 0.65rem;
}

/* Customer Empty/Loading states */
.customer-empty,
.customer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--color-text-tertiary);
}

.customer-empty i,
.customer-loading i {
  font-size: 1.5rem;
}

/* Product Search */
.product-search-wrapper {
  max-width: 100%;
}

.product-dropdown,
.customer-dropdown {
  width: 100%;
  height: 40px;
}

/* Override dropdown styles for larger combobox */
.product-dropdown :deep(.p-dropdown-label) {
  padding: 0.5rem 1rem;
  font-size: var(--font-size-body-m);
  line-height: 1.5;
}

.product-dropdown :deep(.p-dropdown-panel) {
  max-height: 400px;
}

.product-dropdown :deep(.p-dropdown-items-wrapper) {
  max-height: 350px;
}

/* Product Value (selected) */
.product-value {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.product-value-id {
  font-size: var(--font-size-body-xs);
  flex-shrink: 0;
}

.product-value-name {
  flex: 1;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-value-price {
  font-weight: var(--font-weight-medium);
}

.text-placeholder {
  color: var(--color-text-tertiary);
}

/* Product Option (dropdown item) */
.product-option {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
  width: 100%;
  border-bottom: 1px solid var(--color-border-light);
}

.product-dropdown :deep(.p-dropdown-item:last-child) .product-option {
  border-bottom: none;
}

.product-option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.product-option-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.product-option-id {
  font-size: var(--font-size-body-xs);
  flex-shrink: 0;
}

.product-option-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-option-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.product-option-price {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-semibold);
}

.product-option-tag {
  font-size: 0.65rem;
}

/* Product Option Specs */
.product-option-specs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  padding-left: 0.25rem;
}

.product-option-spec {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.spec-label {
  color: var(--color-text-secondary);
}

.spec-value {
  color: var(--color-text-primary);
}

.spec-separator {
  color: var(--color-text-tertiary);
  margin: 0 0.125rem;
}

.product-option-specs-more {
  color: var(--color-text-tertiary);
  font-style: italic;
}

/* Search highlight */
:deep(.search-highlight) {
  background-color: var(--color-warning-100);
  color: var(--color-text-primary);
  padding: 0 2px;
  border-radius: 2px;
}

/* Product Empty/Loading states */
.product-empty,
.product-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--color-text-tertiary);
}

.product-empty i,
.product-loading i {
  font-size: 1.5rem;
}

/* Items Count Badge */
.items-count {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-secondary);
  background: var(--color-neutral-200);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
}

/* Items Empty State */
/* Items Loading State */
.items-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  color: var(--color-text-secondary);
  background: var(--surface-50);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.items-loading i {
  font-size: 2rem;
  color: var(--color-primary);
}

/* Items Error State */
.items-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  color: var(--color-danger);
  background: var(--color-danger-subtle, #fef2f2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-danger-border, #fecaca);
}

.items-error i {
  font-size: 2rem;
}

/* Items Empty State */
.items-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 2rem;
  color: var(--color-text-tertiary);
  background: var(--surface-50);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--color-border-light);
}

.items-empty i {
  font-size: 2.5rem;
  opacity: 0.5;
}

.items-empty span:first-of-type {
  font-size: var(--font-size-body-m);
  color: var(--color-text-secondary);
}

.items-empty-hint {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
}

/* Items Table */
.items-table-wrapper {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.items-table {
  width: 100%;
}

.items-table :deep(.p-datatable-thead > tr > th) {
  background: var(--surface-50);
  font-size: var(--font-size-body-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 0.75rem 1rem;
}

.items-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.875rem 1rem;
  vertical-align: middle;
}

.item-id {
  font-family: var(--font-family-mono, "Courier New", monospace);
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.item-description-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.item-description {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
}

.item-description-2 {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
}

.item-price {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

.item-total {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Quantity Input */
/* Proposal Summary */
.proposal-summary {
  padding: 1.5rem;
  background: var(--surface-50);
  border-bottom: 1px solid var(--color-border-light);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.summary-label {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

.summary-value {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
}

.summary-total {
  border-top: 1px solid var(--color-border-light);
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.summary-total .summary-label {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.summary-total .summary-value {
  font-size: var(--font-size-heading-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.summary-old-price {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}

/* Proposal Actions */
.proposal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .proposal-create-page {
    padding: 1rem;
  }

  .customer-option-main,
  .product-option-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .customer-option-id,
  .product-option-id {
    min-width: auto;
  }

  .customer-option-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .items-table :deep(.p-datatable-thead > tr > th),
  .items-table :deep(.p-datatable-tbody > tr > td) {
    padding: 0.5rem;
  }

  }
</style>
