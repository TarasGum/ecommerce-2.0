<!-- pages/proposals/create.vue -->
<template>
  <div class="page-wrapper proposal-create-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">Create New Proposal</h1>
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

        <!-- Product Search Input -->
        <div ref="productSearchWrapper" class="product-search-wrapper">
          <div class="product-search-input-wrapper">
            <i
              v-if="productSearchLoading || configurationsLoading"
              class="pi pi-spin pi-spinner product-search-icon"
            ></i>
            <i v-else class="pi pi-search product-search-icon"></i>
            <input
              v-model="productSearchQuery"
              type="text"
              class="product-search-input"
              :placeholder="
                selectedCustomer
                  ? 'Search product by ID...'
                  : 'Select a customer first'
              "
              :disabled="!selectedCustomer"
              @input="onProductSearchInput"
              @focus="onProductSearchFocus"
              @keydown.down.prevent="navigateResults(1)"
              @keydown.up.prevent="navigateResults(-1)"
              @keydown.enter.prevent="selectHighlightedProduct"
              @keydown.escape="closeProductSearch"
            />
            <button
              v-if="productSearchQuery"
              class="product-search-clear"
              @click="clearProductSearch"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Search Results Overlay -->
          <div v-if="showProductResults" class="product-search-overlay">
            <!-- Loading State -->
            <div v-if="productSearchLoading" class="product-loading">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Loading products...</span>
            </div>

            <!-- Empty State -->
            <div v-else-if="productOptions.length === 0" class="product-empty">
              <i class="pi pi-inbox"></i>
              <span>No products found</span>
            </div>

            <!-- Results List -->
            <div v-else class="product-search-results">
              <div
                v-for="(option, index) in productOptions"
                :key="option.autoid"
                class="product-option"
                :class="{
                  'product-option--highlighted': highlightedIndex === index,
                }"
                @click="selectProduct(option)"
                @mouseenter="highlightedIndex = index"
              >
                <div class="product-option-row">
                  <div class="product-option-main">
                    <Tag severity="secondary" class="product-option-id">
                      <span
                        v-html="highlightMatch(option.id, productSearchQuery)"
                      ></span>
                    </Tag>
                    <span
                      class="product-option-name"
                      v-html="
                        highlightMatch(option.descr_1, productSearchQuery)
                      "
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
                <div
                  v-if="option.product_specs?.length"
                  class="product-option-specs"
                >
                  <span
                    v-for="(spec, idx) in option.product_specs.slice(0, 3)"
                    :key="spec.descr"
                    class="product-option-spec"
                  >
                    <span class="spec-label">{{ spec.descr }}:</span>
                    <span class="spec-value">{{ spec.info }}</span>
                    <span
                      v-if="
                        Number(idx) <
                        option.product_specs.slice(0, 3).length - 1
                      "
                      class="spec-separator"
                      >·</span
                    >
                  </span>
                  <span
                    v-if="option.product_specs.length > 3"
                    class="product-option-specs-more"
                  >
                    +{{ option.product_specs.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>
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
          <DataTable :value="cartItems" class="items-table" dataKey="objectId">
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
      :project-id="selectedProjectId"
      :loading="configurationsLoading"
      :customer-id="selectedCustomer?.id"
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
import { until, onClickOutside, useDebounceFn } from "@vueuse/core";
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

// For Yura. This is the customer that will be used to create the proposal.
const selectedCustomer = ref<Customer | null>(null);

// Product search state
const productOptions = ref<Product[]>([]);
const productSearchLoading = ref(false);
const configurationsLoading = ref(false);
const productSearchQuery = ref("");
const showProductResults = ref(false);
const highlightedIndex = ref(-1);
const productSearchWrapper = ref<HTMLElement | null>(null);
let productSearchRequestId = 0; // Track latest request to ignore stale responses

// Close product search on click outside
onClickOutside(productSearchWrapper, () => {
  showProductResults.value = false;
  highlightedIndex.value = -1;
});

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

// Debounced product search
const debouncedProductSearch = useDebounceFn(async (query: string) => {
  const currentRequestId = ++productSearchRequestId;

  try {
    const params: any = {
      limit: 50,
      customer_id: selectedCustomer.value!.id,
    };
    if (selectedProjectId.value !== null) {
      params.project_id = selectedProjectId.value;
    }

    const response = await productsApi.searchById(query, params);

    // Only update if this is still the latest request
    if (currentRequestId === productSearchRequestId) {
      productOptions.value = response.results;
    }
  } catch (error) {
    // Only handle error if this is still the latest request
    if (currentRequestId === productSearchRequestId) {
      console.error("Failed to search products:", error);
      productOptions.value = [];
    }
  } finally {
    // Only update loading state if this is still the latest request
    if (currentRequestId === productSearchRequestId) {
      productSearchLoading.value = false;
    }
  }
}, 300);

function onProductSearchInput() {
  if (!selectedCustomer.value) return;

  const query = productSearchQuery.value.trim();
  highlightedIndex.value = -1;

  // Don't search if query is empty
  if (!query) {
    showProductResults.value = false;
    productOptions.value = [];
    productSearchLoading.value = false;
    return;
  }

  // Show loading immediately
  productSearchLoading.value = true;
  showProductResults.value = true;

  // Trigger debounced search
  debouncedProductSearch(query);
}

function onProductSearchFocus() {
  // Show results only if there's a query and results exist
  if (
    selectedCustomer.value &&
    productSearchQuery.value.trim() &&
    productOptions.value.length > 0
  ) {
    showProductResults.value = true;
  }
}

function closeProductSearch() {
  showProductResults.value = false;
  highlightedIndex.value = -1;
}

function clearProductSearch() {
  productSearchQuery.value = "";
  productOptions.value = [];
  highlightedIndex.value = -1;
  showProductResults.value = false;
}

function navigateResults(direction: number) {
  if (!showProductResults.value || productOptions.value.length === 0) return;

  const newIndex = highlightedIndex.value + direction;
  if (newIndex >= 0 && newIndex < productOptions.value.length) {
    highlightedIndex.value = newIndex;
  }
}

function selectHighlightedProduct() {
  if (
    highlightedIndex.value >= 0 &&
    highlightedIndex.value < productOptions.value.length
  ) {
    selectProduct(productOptions.value[highlightedIndex.value]);
  }
}

async function selectProduct(product: Product) {
  if (!selectedCustomer.value) return;

  closeProductSearch();
  productSearchQuery.value = "";

  const hasConfigurations = Number(product.configurations) > 0;
  const hasMultipleUnits = (product.units?.length ?? 0) > 1;
  const needsModal = hasConfigurations || hasMultipleUnits;

  const selectedProductCopy = {
    ...product,
    unit: product.unit || product.def_unit,
  };

  if (needsModal) {
    // Open modal immediately with loading state
    editingProduct.value = selectedProductCopy;
    editModalMode.value = "add";
    editModalVisible.value = true;

    // Then load configurations in the background
    if (hasConfigurations) {
      configurationsLoading.value = true;
      try {
        const configData = await productsApi.getConfigurations(
          selectedProductCopy.autoid,
          selectedCustomer.value.id,
          selectedProjectId.value,
        );
        // Update the product with configurations
        editingProduct.value = {
          ...selectedProductCopy,
          configurations: configData as any,
        };
      } catch (error) {
        console.error("Failed to load configurations:", error);
        toast.showError("Failed to load product configurations");
        // Close modal on error
        editModalVisible.value = false;
        editingProduct.value = null;
      } finally {
        configurationsLoading.value = false;
      }
    }
  } else {
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

  const index = cart.value.items.findIndex(
    (item) => item.objectId === objectId,
  );
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

<style lang="scss" scoped>
.proposal-create-page {
  padding: 1.5rem;
  min-height: 100vh;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-heading-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.project-dropdown {
  min-width: 200px;

  :deep(.p-dropdown-label) {
    padding: 0.625rem 1rem;
    font-size: var(--font-size-body-s);
  }
}

// Info Banner
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

  i {
    font-size: 1rem;
    color: var(--color-warning);
  }
}

// Proposal Card
.proposal-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

// Sections
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

// Customer Search
.customer-search-wrapper {
  max-width: 100%;
}

.customer-dropdown {
  width: 100%;
  height: 40px;

  :deep(.p-dropdown-label) {
    padding: 0.875rem 1rem;
    font-size: var(--font-size-body-m);
  }

  :deep(.p-dropdown-panel) {
    max-height: 400px;
  }

  :deep(.p-dropdown-items-wrapper) {
    max-height: 350px;
  }
}

// Customer Value (selected)
.customer-value {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;

  &-id {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    min-width: 80px;
  }

  &-name {
    flex: 1;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-email {
    color: var(--color-text-secondary);
    font-size: var(--font-size-body-s);
  }
}

// Customer Option (dropdown item)
.customer-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  width: 100%;

  &-main {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  &-id {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    min-width: 80px;
    font-size: var(--font-size-body-s);
  }

  &-name {
    color: var(--color-text-primary);
    font-size: var(--font-size-body-s);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  &-email {
    color: var(--color-text-secondary);
    font-size: var(--font-size-body-xs);
  }

  &-location {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-body-xs);
  }

  &-tag {
    font-size: 0.65rem;
  }
}

// Customer Empty/Loading states
.customer-empty,
.customer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--color-text-tertiary);

  i {
    font-size: 1.5rem;
  }
}

// Product Search
.product-search-wrapper {
  position: relative;
  max-width: 100%;
}

.product-search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.product-search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-tertiary);
  font-size: 14px;
  pointer-events: none;
}

.product-search-input {
  width: 100%;
  height: 40px;
  padding: 0 36px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body-m);
  color: var(--color-text-primary);
  background: white;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    border-color: var(--color-primary);
  }

  &:disabled {
    background: var(--color-neutral-100);
    cursor: not-allowed;
  }
}

.product-search-clear {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: var(--color-neutral-200);
    color: var(--color-text-primary);
  }
}

.product-search-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 350px;
  overflow: hidden;
}

.product-search-results {
  max-height: 350px;
  overflow-y: auto;
}

.text-placeholder {
  color: var(--color-text-tertiary);
}

// Product Option (search result item)
.product-option {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  width: 100%;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: background-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &--highlighted {
    background-color: var(--color-neutral-200);
  }

  &-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  &-main {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  &-id {
    font-size: var(--font-size-body-xs);
    flex-shrink: 0;
  }

  &-name {
    color: var(--color-text-primary);
    font-size: var(--font-size-body-s);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  &-price {
    font-size: var(--font-size-body-s);
    font-weight: var(--font-weight-semibold);
  }

  &-tag {
    font-size: 0.65rem;
  }

  &-specs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--font-size-body-xs);
    color: var(--color-text-tertiary);
    padding-left: 0.25rem;

    &-more {
      color: var(--color-text-tertiary);
      font-style: italic;
    }
  }

  &-spec {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
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

// Search highlight
:deep(.search-highlight) {
  background-color: var(--color-warning-100);
  color: var(--color-text-primary);
  padding: 0 2px;
  border-radius: 2px;
}

// Product Empty/Loading states
.product-empty,
.product-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--color-text-tertiary);
  font-size: 14px;

  i {
    font-size: 1.5rem;
  }
}

// Items Count Badge
.items-count {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-secondary);
  background: var(--color-neutral-200);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
}

// Items Loading State
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

  i {
    font-size: 2rem;
    color: var(--color-primary);
  }
}

// Items Error State
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

  i {
    font-size: 2rem;
  }
}

// Items Empty State
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

  i {
    font-size: 2.5rem;
    opacity: 0.5;
  }

  span:first-of-type {
    font-size: var(--font-size-body-m);
    color: var(--color-text-secondary);
  }

  &-hint {
    font-size: var(--font-size-body-xs);
    color: var(--color-text-tertiary);
  }
}

// Items Table
.items-table-wrapper {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.items-table {
  width: 100%;

  :deep(.p-datatable-thead > tr > th) {
    background: var(--surface-50);
    font-size: var(--font-size-body-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    padding: 0.75rem 1rem;
  }

  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.875rem 1rem;
    vertical-align: middle;
  }
}

.item-id {
  font-family: var(--font-family-mono, "Courier New", monospace);
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.item-description {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);

  &-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &-2 {
    font-size: var(--font-size-body-xs);
    color: var(--color-text-tertiary);
  }
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

// Proposal Summary
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

  .summary-label {
    font-size: var(--font-size-body-m);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .summary-value {
    font-size: var(--font-size-heading-xs);
    font-weight: var(--font-weight-bold);
    color: var(--color-success);
  }
}

.summary-old-price {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}

// Proposal Actions
.proposal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
}

// Responsive
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

  .items-table {
    :deep(.p-datatable-thead > tr > th),
    :deep(.p-datatable-tbody > tr > td) {
      padding: 0.5rem;
    }
  }
}
</style>
