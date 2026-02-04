<!-- components/offer/units.vue -->
<template>
  <div v-if="units?.length" class="units-selector">
    <div
      v-for="u in units"
      :key="u.autoid"
      class="unit-option"
      :class="{ active: modelValue === u.unit }"
      @click="$emit('update:modelValue', u.unit)"
    >
      <RadioButton
        :modelValue="modelValue"
        :value="u.unit"
        :inputId="u.autoid"
        class="sr-only"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
      <label :for="u.autoid" class="unit-label">
        <span class="unit-name">{{ u.unit }}</span>
        <PriceDisplay :price="u.price" :old-price="u.old_price" class="unit-price" />
        <span v-if="u.multiplier !== '1.0000'" class="unit-multiplier">
          x{{ parseFloat(u.multiplier) }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import RadioButton from "primevue/radiobutton";
import PriceDisplay from "~/components/offer/PriceDisplay.vue";

interface Unit {
  autoid: string;
  unit: string;
  multiplier: string;
  level: string;
  price: string;
  old_price: string;
}

defineProps<{
  units: Unit[] | undefined;
  modelValue: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<style scoped lang="scss">
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.units-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.unit-option {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    border-color: var(--color-neutral-600);
  }

  &.active {
    border-color: var(--color-neutral-900);
    background: var(--color-neutral-300);
  }
}

.unit-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.unit-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.unit-price {
  color: var(--color-text-secondary);
}

.unit-multiplier {
  font-size: 12px;
  color: var(--color-text-tertiary);
}
</style>
