<!-- components/offer/PriceDisplay.vue -->
<template>
  <span class="price-display" :class="{ 'price-display--has-discount': hasDiscount }">
    <span v-if="hasDiscount" class="price-old">
      {{ formatCurrency(oldPrice) }}
    </span>
    <span class="price-current" :class="{ 'price-current--discounted': hasDiscount }">
      {{ formatCurrency(price) }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { formatCurrency } from "~/utils/formatters";

const props = defineProps<{
  price: string | number;
  oldPrice?: string | number;
}>();

const hasDiscount = computed(() => {
  if (!props.oldPrice) return false;
  // Round to hundredths (2 decimal places) for comparison
  const current = Math.round((parseFloat(String(props.price)) || 0) * 100) / 100;
  const old = Math.round((parseFloat(String(props.oldPrice)) || 0) * 100) / 100;
  return old > current;
});
</script>

<style scoped>
.price-display {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.price-old {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
  font-size: 0.9em;
}

.price-current {
  color: var(--color-text-primary);
}

.price-current--discounted {
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}
</style>
