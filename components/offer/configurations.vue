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
        }"
        @click="active = configurationParent.name"
      >
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
          <img
            v-if="configurationItem.photo"
            class="configuration-item__photo"
            :src="configurationItem.photo"
            :alt="configurationItem.descr_1"
          />
          <div v-else class="configuration-item__placeholder">
            <i class="pi pi-image"></i>
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
import { formatCurrency } from "~/utils/formatters";
import type { Configuration, ConfigurationItem } from "~/types/models";

const props = defineProps<{
  configuration: {
    configurations: Configuration[];
  };
}>();

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
      background: var(--color-neutral-300);
      aspect-ratio: 1 / 1;
    }

    &__photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
