<!-- components/offer/QuantityInput.vue -->
<template>
  <div class="quantity-container" :class="{ 'quantity-error': hasError }">
    <button
      type="button"
      class="quantity-btn quantity-btn--minus"
      :disabled="modelValue <= 1"
      @click="decrement"
    >
      <i class="pi pi-minus" />
    </button>
    <input
      type="number"
      class="quantity-input"
      :value="modelValue"
      :min="1"
      :max="maxAllowed"
      @input="onInput"
      @blur="onBlur"
    />
    <button
      type="button"
      class="quantity-btn quantity-btn--plus"
      :disabled="!ignoreCount && modelValue >= maxCount"
      @click="increment"
    >
      <i class="pi pi-plus" />
    </button>
  </div>
  <div v-if="hasError" class="quantity-error-message">
    <i class="pi pi-exclamation-circle" />
    <span>Only {{ maxCount }} available</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number;
    maxCount?: number;
    ignoreCount?: boolean;
  }>(),
  {
    maxCount: 9999,
    ignoreCount: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const maxAllowed = computed(() => (props.ignoreCount ? 9999 : props.maxCount));

const hasError = computed(() => {
  if (props.ignoreCount) return false;
  return props.modelValue > props.maxCount;
});

function decrement() {
  if (props.modelValue > 1) {
    emit("update:modelValue", props.modelValue - 1);
  }
}

function increment() {
  if (props.ignoreCount || props.modelValue < props.maxCount) {
    emit("update:modelValue", props.modelValue + 1);
  }
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  let value = parseInt(target.value, 10);

  if (isNaN(value) || value < 1) {
    value = 1;
  }

  emit("update:modelValue", value);
}

function onBlur(event: Event) {
  const target = event.target as HTMLInputElement;
  let value = parseInt(target.value, 10);

  if (isNaN(value) || value < 1) {
    value = 1;
    target.value = "1";
  }

  // Clamp to max if not ignoreCount
  if (!props.ignoreCount && value > props.maxCount) {
    // Keep the value but show error (don't auto-correct)
  }

  emit("update:modelValue", value);
}
</script>

<style scoped>
.quantity-container {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: border-color 0.2s;
  margin-right: auto;
  padding: 4px;
}

.quantity-container:focus-within {
  border-color: var(--color-primary);
}

.quantity-container.quantity-error {
  border-color: var(--color-error-900);
}

.quantity-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--surface-100);
  color: var(--color-text-primary);
}

.quantity-btn:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.quantity-btn i {
  font-size: 0.75rem;
}

.quantity-input {
  width: 3rem;
  height: 2rem;
  border: none;
  background: transparent;
  text-align: center;
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
  -moz-appearance: textfield;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input:focus {
  outline: none;
}

.quantity-error .quantity-input {
  color: var(--color-error-900);
}

.quantity-error-message {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  font-size: var(--font-size-body-xs);
  color: var(--color-error-900);
}

.quantity-error-message i {
  font-size: 0.75rem;
}
</style>
