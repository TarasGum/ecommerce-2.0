<!-- components/offer/specs.vue -->
<template>
  <table v-if="specs?.length" class="specs-table">
    <tbody>
      <tr v-for="spec in specs" :key="spec.descr">
        <td class="spec-name">{{ spec.descr }}</td>
        <td class="spec-value">{{ spec.info }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
interface Spec {
  descr: string;
  info: string;
}

defineProps<{
  specs: Spec[] | undefined;
}>();
</script>

<style scoped>
.specs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-body-s);
}

.specs-table tr {
  border-bottom: 1px solid var(--color-border-light);
}

.specs-table td {
  padding: 0.5rem 0;
}

.spec-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  width: 40%;
  padding-right: 1rem;
}

.spec-value {
  color: var(--color-text-secondary);
}
</style>
