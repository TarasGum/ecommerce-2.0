<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="app-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <AppHeader />
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from "~/components/layout/AppSidebar.vue";
import AppHeader from "~/components/layout/AppHeader.vue";

// Watch for sidebar collapse state changes
const isSidebarCollapsed = ref(false);

onMounted(() => {
  if (process.client) {
    // Initial state
    const saved = localStorage.getItem("sidebar-collapsed");
    isSidebarCollapsed.value = saved === "true";

    // Listen for storage changes (for cross-tab sync)
    window.addEventListener("storage", handleStorageChange);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("storage", handleStorageChange);
  }
});

function handleStorageChange(event: StorageEvent) {
  if (event.key === "sidebar-collapsed") {
    isSidebarCollapsed.value = event.newValue === "true";
  }
}

// Also check on interval (for same-tab updates)
if (process.client) {
  setInterval(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    isSidebarCollapsed.value = saved === "true";
  }, 100);
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: white;
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px; /* sidebar width */
  transition: margin-left 0.2s ease;
}

.app-content.sidebar-collapsed {
  margin-left: 64px; /* collapsed sidebar width */
}

.main-content {
  flex: 1;
}
</style>
