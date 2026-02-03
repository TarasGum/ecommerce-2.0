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

    <div style="font-size: 10px; margin-bottom: 10px;">Payload for Cart</div>

    <div v-if="product" class="product-content">
      <div class="product-gallery">
        <template v-if="product.photos?.length">
          <div class="product-gallery-photo">
            <img
              :src="product.photos[currentPhotoIndex]"
              :alt="product.descr_1"
              @click="showFullscreen = true"
            />
            <div class="product-gallery-nav">
              <Button
                icon="pi pi-chevron-left"
                severity="secondary"
                rounded
                :disabled="currentPhotoIndex === 0"
                @click="currentPhotoIndex--"
              />
              <Button
                icon="pi pi-chevron-right"
                severity="secondary"
                rounded
                :disabled="currentPhotoIndex === product.photos.length - 1"
                @click="currentPhotoIndex++"
              />
            </div>
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
      </div>

      <div class="product-data">
        <h1>{{ product.descr_1 }}</h1>

        <!-- просто показуємо спеки -->
        <table v-if="product.specs?.length" class="specs-table">
          <tbody>
            <tr v-for="spec in product.specs" :key="spec.name">
              <td class="spec-name">{{ spec.name }}</td>
              <td class="spec-value">{{ spec.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="handleClose" />
      <Button label="Save" @click="handleSave" />
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
import type { Product } from "~/types/models";

const currentPhotoIndex = ref(0);
const showFullscreen = ref(false);

const galleriaResponsiveOptions = [
  { breakpoint: "1536px", numVisible: 9 },
  { breakpoint: "1280px", numVisible: 7 },
  { breakpoint: "1024px", numVisible: 5 },
  { breakpoint: "768px", numVisible: 4 },
  { breakpoint: "640px", numVisible: 3 },
];

const product: Product = {
  autoid: "auto-12345",
  id: "SKU-001",
  upc: "012345678901",
  type: "Purchased",
  descr_1: "Test Product Name",
  descr_2: "Additional product description",
  base: "99.99",
  cost: "149.99",
  count: "50",
  location: "Warehouse A, Shelf 3",
  inactive: false,
  ignoreCount: false,

  specs: [
    {
      name: "Weight",
      value: "2.5 kg",
    },
    {
      name: "Dimensions",
      value: "30x20x10 cm",
    },
  ],

  units: [
    {
      autoid: "PQHJVHE07I40J6C1",
      unit: "EA",
      multiplier: "1.0000",
      level: "Wholesale",
      price: "33.5790",
      old_price: "33.5790",
    },
    {
      autoid: "PQHJV234HE07I40J6C1",
      unit: "BOX",
      multiplier: "5.0000",
      level: "Wholesale",
      price: "333.5790",
      old_price: "333.5790",
    },
  ],

  defUnit: "EA",

  photo:
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_1.jpg",
  photos: [
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_1.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_10.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_11.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_14.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_15.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_2.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_4.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_5.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_6.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_7.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_8.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/OLS560N_9.jpg",
    "https:\/\/dundalkleisurecraft.s3.ca-central-1.amazonaws.com\/INVENTRY\/OLS560N_7RHLD4JAUVOBSGP0\/Shipping%20%26%20Assembly\/44x84.jpg",
  ],
  color: "#3B82F6",
  configurations: [
    { size: "S", available: true },
    { size: "M", available: true },
    { size: "L", available: false },
  ],
};

const props = withDefaults(
  defineProps<{
    visible: boolean;
    // product: Product | null;
  }>(),
  {
    visible: false,
    // product: null,
  },
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  close: [];
  save: [];
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

function handleClose() {
  isVisible.value = false;
  emit("close");
}

function handleSave() {
  emit("save");
  isVisible.value = false;
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
    h1 {
      margin: 0 0 16px 0;
    }

    .specs-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      font-size: 14px;

      td {
        padding: 6px 12px;
        border: 1px solid #e2e8f0;
      }

      .spec-name {
        font-weight: 600;
        color: #1e40af;
        background: #eff6ff;
        width: 40%;
      }

      .spec-value {
        color: #334155;
      }
    }
  }

  &-gallery {
    display: flex;
    flex-direction: column;
    gap: 10px;

    &-photo {
      position: relative;
      aspect-ratio: 1 / 1;
      width: 100%;
      background: var(--p-surface-100);
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
      }
    }

    &-nav {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
    }

    &-thumbnails {
      display: flex;
      gap: 8px;
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
      background: var(--p-surface-100);
      border-radius: 8px;
      color: var(--p-surface-400);

      i {
        font-size: 4rem;
      }

      span {
        font-size: 14px;
      }
    }
  }
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
