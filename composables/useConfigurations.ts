import type { Configuration } from "~/types/models";

interface UseConfigurationsOptions {
  configurations: Ref<Configuration[]>;
  basePrice?: Ref<string | number>;
  baseOldPrice?: Ref<string | number>;
}

export function useConfigurations(options: UseConfigurationsOptions) {
  const { configurations, basePrice, baseOldPrice } = options;

  /**
   * Check if configurations exist and is a valid array
   */
  const hasConfigurations = computed(() => {
    return !!configurations.value?.length && Array.isArray(configurations.value);
  });

  /**
   * Check if there are unchecked required configurations
   * Required = allownone is false and no item selected
   */
  const hasUncheckedRequired = computed(() => {
    if (!hasConfigurations.value) return false;

    return configurations.value.some((configuration) => {
      // Skip optional configurations
      if (configuration.allownone) return false;

      // Check if any item is active
      const activeItem = configuration.items.find((item) => item.active);

      return !activeItem;
    });
  });

  /**
   * Calculate total price: base_price + sum of active configuration items' price
   */
  const totalPrice = computed(() => {
    let total = Number(basePrice?.value) || 0;

    if (!hasConfigurations.value) return total;

    configurations.value.forEach((configuration) => {
      configuration.items.forEach((item) => {
        if (item.active) {
          total += Number(item.price) || 0;
        }
      });
    });

    return total;
  });

  /**
   * Calculate total old price: base_old_price + sum of active configuration items' old_price
   */
  const totalOldPrice = computed(() => {
    let total = Number(baseOldPrice?.value) || 0;

    if (!hasConfigurations.value) return total;

    configurations.value.forEach((configuration) => {
      configuration.items.forEach((item) => {
        if (item.active) {
          total += Number(item.old_price) || 0;
        }
      });
    });

    return total;
  });

  /**
   * Get all active configuration items as [{name, id}] for cart payload
   */
  const activeConfigurations = computed(() => {
    if (!hasConfigurations.value) return [];

    const result: { name: string; id: string | number }[] = [];

    configurations.value.forEach((configuration) => {
      configuration.items.forEach((item) => {
        if (item.active) {
          result.push({
            name: configuration.name,
            id: item.id,
          });
        }
      });
    });

    return result;
  });

  return {
    hasConfigurations,
    hasUncheckedRequired,
    totalPrice,
    totalOldPrice,
    activeConfigurations,
  };
}
