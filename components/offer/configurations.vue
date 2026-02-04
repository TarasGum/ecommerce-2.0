<template>
  <div class="configurations">
    <div class="configurations-parents">
      <div
        class="configuration-parent"
        v-for="configurationParent in configuration.configurations"
        :key="configurationParent.name"
        :class="{
          'configuration--active': active === configurationParent.name,
          'configuration--required': !configurationParent.allownone,
          'configuration--has-selected': hasSelectedItem(configurationParent),
          'configuration--loading': configurationParent.photosLoading,
        }"
        @click="active = configurationParent.name"
      >
        <i
          v-if="configurationParent.photosLoading"
          class="pi pi-spin pi-spinner"
        ></i>
        {{ configurationParent.name }}
      </div>
    </div>
    <div
      class="configurations-items"
      v-for="configurationParent in configuration.configurations"
      v-show="active === configurationParent.name"
      :key="configurationParent.name"
    >
      <div
        v-for="configurationItem in configurationParent.items"
        :key="configurationItem.id"
        :data-loading="configurationItem.isLoading"
        class="configuration-item"
        :class="{
          'configuration-item--active': configurationItem.active,
        }"
        @click="selectItem(configurationParent, configurationItem)"
      >
        <div class="configuration-item__photo-wrapper">
          <!-- Carousel for multiple photos -->
          <Carousel
            v-if="configurationItem.photos?.length"
            :value="configurationItem.photos"
            :numVisible="1"
            :numScroll="1"
            :showIndicators="configurationItem.photos.length > 1"
            :showNavigators="configurationItem.photos.length > 1"
            class="configuration-item__carousel"
          >
            <template #item="{ data: photoUrl }">
              <img
                class="configuration-item__photo"
                :src="photoUrl"
                :alt="configurationItem.descr_1"
              />
            </template>
          </Carousel>
          <!-- Placeholder when no photos -->
          <div v-else class="configuration-item__placeholder">
            <i
              v-if="configurationParent.photosLoading"
              class="pi pi-spin pi-spinner"
            ></i>
            <i v-else class="pi pi-image"></i>
          </div>
        </div>
        <span class="configuration-item__name">
          {{ configurationItem.descr_1 }}
        </span>
        <span class="configuration-item__price">
          +{{ formatCurrency(configurationItem.price) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Carousel from "primevue/carousel";
import { formatCurrency } from "~/utils/formatters";
import type { Configuration, ConfigurationItem } from "~/types/models";

const props = defineProps<{
  configuration: {
    id: string;
    configurations: Configuration[];
  };
  projectId?: number | null;
}>();

const productsApi = useProducts();
const active = ref<string>();

/**
 * Initialize default selections on mount
 */
onMounted(() => {
  if (!props.configuration?.configurations?.length) return;

  // Set first configuration as active tab
  active.value = props.configuration.configurations[0].name;

  // Set default items as active
  props.configuration.configurations.forEach((config) => {
    if (config.default) {
      const defaultItem = config.items.find(
        (item) => item.id === config.default,
      );
      if (defaultItem) {
        defaultItem.active = true;
      }
    }
  });
});

/**
 * Fetch photos when parent becomes active
 */
watch(
  active,
  (newActive) => {
    if (!newActive) return;

    const parent = props.configuration.configurations.find(
      (c) => c.name === newActive,
    );
    if (parent) {
      fetchPhotosForParent(parent);
    }
  },
  { immediate: true },
);

/**
 * Fetch photos for configuration parent items (only once)
 */
async function fetchPhotosForParent(parent: Configuration) {
  if (parent.photosRequested || parent.photosLoading) return;

  parent.photosLoading = true;

  try {
    const response = await productsApi.getConfigurationPhotos(
      props.configuration.id,
      parent.name,
      props.projectId,
    );

    // Map photos to items
    response.forEach((photoData) => {
      const item = parent.items.find((i) => i.id === photoData.id);
      if (item) {
        item.photo = photoData.photos[0] || "";
        item.photos = photoData.photos;
      }
    });

    parent.photosRequested = true;
  } catch (error) {
    console.error("Failed to fetch configuration photos:", error);
  } finally {
    parent.photosLoading = false;
  }
}

/**
 * Check if configuration has any selected item
 */
function hasSelectedItem(configuration: Configuration): boolean {
  return configuration.items.some((item) => item.active);
}

/**
 * Select a configuration item - deselects others in the same group
 * Clicking on already active item deselects it
 */
function selectItem(configuration: Configuration, item: ConfigurationItem) {
  const wasActive = item.active;

  // Deselect all items in this configuration
  configuration.items.forEach((i) => {
    i.active = false;
  });

  // Toggle: if was active, stay deselected; otherwise select
  if (!wasActive) {
    item.active = true;
  }
}
</script>

<style lang="scss" scoped>
.configurations {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &-parents {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }

  &-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}

.configuration {
  &-parent {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--color-border-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 14px;

    &:hover {
      border-color: var(--color-neutral-600);
    }

    &.configuration--required::after {
      content: "*";
      margin-left: 4px;
      color: var(--color-error-200);
    }

    &.configuration--has-selected {
      &::after {
        color: var(--color-error-800);
      }

      border-color: var(--color-neutral-900);
      background: var(--color-neutral-300);
      color: var(--color-text-primary);
    }

    &.configuration--active {
      background: var(--color-neutral-900);
      border-color: var(--color-neutral-900);
      color: var(--color-bg-primary);
    }
  }

  &-item {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid var(--color-border-light);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--color-neutral-300);

    &:hover {
      border-color: var(--color-neutral-600);
    }

    &--active {
      border-color: var(--color-neutral-900);

      .configuration-item__name {
        color: var(--color-neutral-900);
      }
    }

    &__photo-wrapper {
      aspect-ratio: 1 / 1;
      position: relative;
      overflow: hidden;
    }

    &__carousel {
      width: 100%;
      height: 100%;

      :deep(.p-carousel-content) {
        height: 100%;
      }

      :deep(.p-carousel-container) {
        height: 100%;
      }

      :deep(.p-carousel-items-content) {
        height: 100%;
      }

      :deep(.p-carousel-items-container) {
        height: 100%;
      }

      :deep(.p-carousel-item) {
        height: 100%;
        background-color: var(--color-white);
      }

      :deep(.p-carousel-indicators) {
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        padding: 0;
        gap: 4px;

        .p-carousel-indicator {
          margin: 0;

          button {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            border: none;
            padding: 0;
            transition: all 0.2s;
          }

          &.p-highlight button {
            background: white;
          }
        }
      }

      :deep(.p-carousel-prev),
      :deep(.p-carousel-next) {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        border: none;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.2s;

        .p-icon {
          width: 12px;
          height: 12px;
        }
      }

      :deep(.p-carousel-prev) {
        left: 4px;
      }

      :deep(.p-carousel-next) {
        right: 4px;
      }
    }

    &:hover &__carousel {
      :deep(.p-carousel-prev),
      :deep(.p-carousel-next) {
        opacity: 1;
      }
    }

    &__photo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-neutral-400);

      .pi {
        font-size: 32px;
      }
    }

    &__name {
      padding: 8px 12px 4px;
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    &__price {
      margin-top: auto;
      padding: 0 12px 8px;
      font-weight: 600;
      font-size: 14px;
      color: var(--color-text-primary);
    }
  }
}
</style>
