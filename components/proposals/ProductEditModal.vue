<!-- components/proposals/ProductEditModal.vue -->
<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="true"
    :draggable="false"
    :closeOnEscape="!showFullscreen"
    class="product-modal"
    :style="{ width: '100vw', height: '100vh' }"
    :contentStyle="{ height: '100%' }"
  >
    <template #header>
      <h2 class="modal-title">Product configuration</h2>
    </template>

    <div class="product-content">
      <div class="product-gallery">
        <template v-if="product.photos?.length">
          <div class="product-gallery-photo">
            <img
              :src="product.photos[currentPhotoIndex]"
              :alt="product.descr_1"
              @click="showFullscreen = true"
            />
            <button
              class="gallery-nav gallery-nav--prev"
              :disabled="currentPhotoIndex === 0"
              @click.stop="currentPhotoIndex--"
            >
              <i class="pi pi-chevron-left" />
            </button>
            <button
              class="gallery-nav gallery-nav--next"
              :disabled="currentPhotoIndex === product.photos.length - 1"
              @click.stop="currentPhotoIndex++"
            >
              <i class="pi pi-chevron-right" />
            </button>
          </div>
          <div class="product-gallery-thumbnails">
            <div
              v-for="(photo, index) in product.photos"
              :key="index"
              class="product-gallery-thumbnail"
              :class="{ active: index === currentPhotoIndex }"
              @click="currentPhotoIndex = index"
            >
              <img :src="photo" :alt="`${product.descr_1} - ${index + 1}`" />
            </div>
          </div>
        </template>
        <div v-else class="product-gallery-placeholder">
          <i class="pi pi-image" />
          <span>No photos available</span>
        </div>

        <!-- Debug: Cart payload -->
        <div class="cart-payload-debug">
          <strong>Cart payload:</strong>
          <pre>{{ JSON.stringify(cartPayload, null, 2) }}</pre>
        </div>
      </div>

      <div class="product-data">
        <h1>{{ product.descr_1 }}</h1>

        <!-- Price -->
        <PriceDisplay
          v-if="hasConfigurations || !hasMultipleUnits"
          class="product-price"
          :price="
            hasConfigurations ? totalPrice : product.price || product.cost
          "
          :old-price="hasConfigurations ? totalOldPrice : product.old_price"
        />

        <!-- Units (shown when multiple units exist) -->
        <div v-if="hasMultipleUnits" class="product-section">
          <h3 class="section-title">Unit of Meassure</h3>
          <OfferUnits v-model="product.unit" :units="product.units" />
        </div>

        <!-- Specs -->
        <div v-if="product.product_specs?.length" class="product-section">
          <h3 class="section-title">Specifications</h3>
          <OfferSpecs :specs="product.product_specs" />
        </div>

        <!-- Quantity -->
        <div class="product-section">
          <h3 class="section-title">Quantity</h3>
          <QuantityInput
            v-model="quantity"
            :max-count="maxCount"
            :ignore-count="product.ignoreCount"
          />
        </div>

        <!-- Configurations -->
        <div v-if="hasConfigurations" class="product-section">
          <h3 class="section-title">Configurations</h3>
          <OfferConfigurations :configuration="product.configurations as any" :project-id="projectId" />
        </div>
      </div>
    </div>

    <template #footer>
      <span v-if="hasUncheckedRequired" class="validation-message">
        <i class="pi pi-exclamation-circle" />
        Please select all required configurations
      </span>
      <Button label="Cancel" severity="secondary" text @click="handleClose" />
      <Button
        label="Save"
        :disabled="hasUncheckedRequired"
        :loading="isSaving"
        @click="handleSave"
      />
    </template>
  </Dialog>

  <!-- Confirm Close Dialog -->
  <Dialog
    v-model:visible="showConfirmClose"
    modal
    :closable="false"
    :draggable="false"
    header="Confirmation"
    :style="{ width: '400px' }"
  >
    <div class="confirm-content">
      <i class="pi pi-exclamation-triangle confirm-icon" />
      <span>Are you sure you want to close without saving?</span>
    </div>
    <template #footer>
      <Button label="No" severity="secondary" text @click="cancelClose" />
      <Button label="Yes" severity="danger" @click="confirmClose" />
    </template>
  </Dialog>

  <Teleport to="body">
    <Galleria
      v-model:visible="showFullscreen"
      v-model:activeIndex="currentPhotoIndex"
      :value="product.photos"
      :numVisible="9"
      :responsiveOptions="galleriaResponsiveOptions"
      fullScreen
      showThumbnails
      showItemNavigators
      :showItemNavigatorsOnHover="false"
    >
      <template #item="{ item }">
        <img
          :src="item"
          :alt="product.descr_1"
          style="width: 100%; max-height: 80vh; object-fit: contain"
        />
      </template>
      <template #thumbnail="{ item }">
        <img
          :src="item"
          :alt="product.descr_1"
          style="width: 80px; height: 60px; object-fit: cover"
        />
      </template>
      <template #closeicon>
        <i class="pi pi-times" />
      </template>
    </Galleria>
  </Teleport>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Galleria from "primevue/galleria";
import QuantityInput from "~/components/offer/QuantityInput.vue";
import PriceDisplay from "~/components/offer/PriceDisplay.vue";
import type { Product, CartItem, Configuration } from "~/types/models";
import { useConfigurations } from "~/composables/useConfigurations";
import { useCart, type CartPayload } from "~/composables/useCart";
import { useToast } from "~/composables/useToast";

const currentPhotoIndex = ref(0);
const showFullscreen = ref(false);

const galleriaResponsiveOptions = [
  { breakpoint: "1536px", numVisible: 9 },
  { breakpoint: "1280px", numVisible: 7 },
  { breakpoint: "1024px", numVisible: 5 },
  { breakpoint: "768px", numVisible: 4 },
  { breakpoint: "640px", numVisible: 3 },
];

const props = withDefaults(
  defineProps<{
    visible: boolean;
    product: Product | CartItem;
    mode?: "add" | "edit";
    initialQuantity?: number;
    projectId?: number | null;
  }>(),
  {
    mode: "add",
    initialQuantity: 1,
    projectId: null,
  },
);

// Local quantity state
const quantity = ref(props.initialQuantity);

// Reset state when product changes
watch(
  () => props.product?.autoid,
  () => {
    currentPhotoIndex.value = 0;
    quantity.value = props.initialQuantity;
  },
);

// Multiple units check
const hasMultipleUnits = computed(
  () => (props.product?.units?.length ?? 0) > 1,
);

// Max count - parse from string (Product) or use number (CartItem)
const maxCount = computed(() => {
  const value = props.product?.max_count;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseInt(value) || 9999;
  return 9999;
});

// Configurations composable - configurations is nested: product.configurations.configurations
const configData = computed(() => props.product?.configurations as any);
const {
  hasConfigurations,
  hasUncheckedRequired,
  totalPrice,
  totalOldPrice,
  activeConfigurations,
} = useConfigurations({
  configurations: computed(
    () => (configData.value?.configurations as Configuration[]) || [],
  ),
  basePrice: computed(() => configData.value?.base_price || "0"),
  baseOldPrice: computed(() => configData.value?.base_old_price || "0"),
});

// Cart payload
const toast = useToast();
const { getPayload, addItem, changeItem } = useCart();

// Confirm dialog state
const showConfirmClose = ref(false);
const cartPayload = computed(() =>
  getPayload(props.product, quantity.value, activeConfigurations.value),
);
const isSaving = ref(false);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  close: [];
  save: [payload: CartPayload];
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      // User is trying to close - show confirmation
      handleClose();
    } else {
      emit("update:visible", value);
    }
  },
});

function doClose() {
  emit("update:visible", false);
  emit("close");
}

function handleClose() {
  showConfirmClose.value = true;
}

function confirmClose() {
  showConfirmClose.value = false;
  doClose();
}

function cancelClose() {
  showConfirmClose.value = false;
}

async function handleSave() {
  const payload = cartPayload.value;
  isSaving.value = true;

  try {
    // TODO: Call API based on mode
    if (props.mode === "add") {
      await addItem(payload);
    } else {
      await changeItem(payload.id, payload);
    }

    emit("save", payload);
    doClose();
  } catch (error) {
    console.error("Failed to save:", error);
    toast.showError(
      props.mode === "add"
        ? "Failed to add product to cart"
        : "Failed to update product",
    );
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped lang="scss">
.product {
  &-modal {
    max-width: 100vw !important;
    max-height: 100vh !important;
    margin: 0 !important;
    border-radius: 0 !important;

    .p-dialog-content {
      flex: 1;
      overflow: auto;
    }
  }

  &-content {
    height: 100%;
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 20px;
  }

  &-data {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;

    h1 {
      margin: 0;
      color: var(--color-text-primary);
    }
  }

  &-price {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-neutral-900);
  }

  &-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &-gallery {
    display: flex;
    flex-direction: column;
    gap: 10px;

    &-photo {
      position: relative;
      aspect-ratio: 1 / 1;
      width: 100%;
      background: var(--color-neutral-300);
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
      }

      .gallery-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        i {
          font-size: 14px;
          color: var(--color-text-primary);
        }

        &:hover:not(:disabled) {
          background: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &:disabled {
          opacity: 0 !important;
          cursor: default;
        }

        &--prev {
          left: 12px;
        }

        &--next {
          right: 12px;
        }
      }

      &:hover .gallery-nav:not(:disabled) {
        opacity: 1;
      }
    }

    &-thumbnails {
      display: flex;
      gap: 4px;
      overflow-x: auto;
      padding: 4px 0;
      flex-wrap: wrap;
    }

    &-thumbnail {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;

      &.active {
        border-color: var(--p-primary-color);
      }

      &:hover {
        border-color: var(--p-primary-300);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      aspect-ratio: 1 / 1;
      width: 100%;
      background: var(--color-neutral-300);
      border-radius: 8px;
      color: var(--color-neutral-600);

      i {
        font-size: 4rem;
      }

      span {
        font-size: 14px;
      }
    }
  }
}

.cart-payload-debug {
  font-size: 12px;
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
}

.validation-message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: auto;
  font-size: 13px;
  color: var(--color-error-500);

  i {
    font-size: 14px;
  }
}

.confirm-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.confirm-icon {
  font-size: 2rem;
  color: var(--color-warning-500, #f59e0b);
}
</style>

<style lang="scss">
.p-galleria-fullscreen {
  .p-galleria-content {
    gap: 1rem;
  }

  .p-galleria-thumbnails-content {
    display: flex;
    justify-content: center;
  }

  .p-galleria-thumbnail-items {
    gap: 10px !important;
  }

  .p-galleria-thumbnail-item {
    flex: 0 0 auto !important;
    width: auto !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .p-galleria-close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 1;
  }
}
</style>
