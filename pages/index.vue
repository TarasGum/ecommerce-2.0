<!-- pages/index.vue -->
<template>
  <div>
    <h1>Dashboard</h1>
    <p>Dashboard content will be implemented here</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
