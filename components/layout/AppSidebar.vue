<!-- components/layout/AppSidebar.vue -->
<template>
  <aside class="flex flex-column justify-content-between align-items-start sidebar" :class="{ collapsed: isCollapsed }">
    <!-- User Header Section -->
    <div class="flex align-items-center gap-2 user-header">
      <div class="flex align-items-center justify-content-center user-avatar" @click="toggleUserMenu" :class="{ clickable: isCollapsed }">
        <span class="avatar-initials">{{ userInitials }}</span>
      </div>
      <div v-if="!isCollapsed" class="flex flex-column user-details">
        <div class="user-name">{{ userName }}</div>
        <div class="user-role">{{ userRole }}</div>
      </div>
      <Button
        v-if="!isCollapsed"
        icon="pi pi-chevron-down"
        text
        rounded
        size="small"
        class="user-menu-toggle"
        @click="toggleUserMenu"
        aria-label="User menu"
      />
      <Menu
        ref="userMenu"
        :model="userMenuItems"
        :popup="true"
        :pt="{
          root: { class: 'user-dropdown-menu' }
        }"
      />
    </div>

    <!-- Search Input -->
    <div v-if="!isCollapsed" class="w-full search-container">
      <InputText
        v-model="searchQuery"
        placeholder="Search…"
        disabled
        class="search-input"
      />
    </div>

    <!-- Navigation Menu -->
    <nav class="flex flex-column gap-1 sidebar-nav">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex align-items-center gap-2 nav-item"
        :class="{ active: isActive(item.path) }"
        v-tooltip.right="isCollapsed ? item.label : ''"
      >
        <i :class="`pi ${item.icon}`"></i>
        <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
        <Tag
          v-if="!isCollapsed && item.badge"
          :value="item.badge"
          severity="info"
          class="nav-badge"
        />
      </NuxtLink>
    </nav>

    <!-- Collapse Toggle -->
    <div class="w-full collapse-control">
      <button
        class="flex align-items-center gap-2 collapse-button"
        @click="toggleCollapse"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <i :class="isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
        <span v-if="!isCollapsed" class="collapse-text">Collapse</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Menu from "primevue/menu";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import type { MenuItem } from "primevue/menuitem";

const route = useRoute();
const auth = useAuth();
const userMenu = ref();

// Collapsed state (persisted in localStorage)
const isCollapsed = ref(false);

// Search query (non-functional for now)
const searchQuery = ref("");

// User info
const userName = computed(() => {
  const user = auth.user.value;
  if (!user) return "User";
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
});

const userInitials = computed(() => {
  const user = auth.user.value;
  if (!user) return "U";
  const firstInitial = user.first_name?.[0] || "";
  const lastInitial = user.last_name?.[0] || "";
  return (firstInitial + lastInitial).toUpperCase() || user.email[0].toUpperCase();
});

const userRole = computed(() => {
  const user = auth.user.value;
  return user?.role || "user";
});

// User menu items
const userMenuItems = ref<MenuItem[]>([
  {
    label: "Logout",
    icon: "pi pi-sign-out",
    command: () => {
      auth.logout();
    },
  },
]);

// Navigation menu items
interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string | number;
}

const menuItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: "pi-home" },
  { path: "/users", label: "Users", icon: "pi-users" },
  { path: "/customers", label: "Customers", icon: "pi-user" },
  { path: "/orders", label: "Orders", icon: "pi-shopping-cart" },
  { path: "/order-desk", label: "Order Desk", icon: "pi-inbox" },
  { path: "/shipping", label: "Shipping", icon: "pi-truck" },
  { path: "/tasks", label: "Tasks", icon: "pi-list" },
  { path: "/notes", label: "Notes", icon: "pi-file" },
  { path: "/settings", label: "Settings", icon: "pi-cog" },
];

// Check if route is active
function isActive(path: string): boolean {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
}

// Toggle user menu
function toggleUserMenu(event: Event) {
  userMenu.value.toggle(event);
}

// Toggle collapse state
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  if (process.client) {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed.value));
  }
}

// Restore collapsed state on mount
onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      isCollapsed.value = saved === "true";
    }
  }
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 220px;
  height: 100vh;
  padding: 0 8px 16px 8px;
  border-right: 1px solid #ededed;
  background: #fafafa;
  z-index: 100;
  transition: width 0.2s ease;
}

.sidebar.collapsed {
  width: 64px;
}

/* ==================== USER HEADER ==================== */
.user-header {
  width: calc(100% + 16px);
  padding: 16px 8px;
  border-bottom: 1px solid #ededed;
  margin: 0 -8px;
  padding-left: 16px;
  padding-right: 16px;
}

.sidebar.collapsed .user-header {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: #d9d9d9;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.user-avatar.clickable {
  cursor: pointer;
}

.user-avatar.clickable:hover {
  background: #bfbfbf;
}

.avatar-initials {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #595959;
  text-transform: uppercase;
}

.user-details {
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.user-name {
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: #8c8c8c;
  text-transform: capitalize;
}

.user-menu-toggle {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #8c8c8c;
}

/* ==================== SEARCH ==================== */
.search-container {
  width: 100%;
  padding: 12px 0;
}

.search-input {
  width: 100%;
  font-family: Inter, sans-serif;
  font-size: 14px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background: white;
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ==================== NAVIGATION ==================== */
.sidebar-nav {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 8px 0;
}

.nav-item {
  height: 36px;
  padding: 8px;
  align-self: stretch;
  border-radius: 8px;
  text-decoration: none;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  color: #595959;
  transition: all 0.15s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.nav-item i {
  font-size: 16px;
  width: 16px;
  flex-shrink: 0;
}

.nav-item:hover {
  border-radius: 8px;
  border: 1px solid #e1dff6;
  background: #f3f4fb;
  color: #4033bc;
  font-weight: 500;
}

.nav-item.active {
  border-radius: 8px;
  border: 1px solid #e1dff6;
  background: #f3f4fb;
  color: #4033bc;
  font-weight: 500;
}

.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-badge {
  margin-left: auto;
}

/* Collapsed state for nav items */
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 8px;
}

/* ==================== COLLAPSE CONTROL ==================== */
.collapse-control {
  padding-top: 12px;
  border-top: 1px solid #ededed;
}

.collapse-button {
  width: 100%;
  height: 36px;
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #595959;
  cursor: pointer;
  transition: all 0.15s ease;
}

.collapse-button:hover {
  background: #f0f0f0;
  color: #262626;
}

.collapse-button i {
  font-size: 16px;
  width: 16px;
  flex-shrink: 0;
}

.collapse-text {
  flex: 1;
  text-align: left;
}

.sidebar.collapsed .collapse-button {
  justify-content: center;
}

/* ==================== SCROLLBAR ==================== */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>
