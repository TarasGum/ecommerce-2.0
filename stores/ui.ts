// stores/ui.ts
// Pinia store for managing UI state (page headers, sidebar, etc.)

import { defineStore } from 'pinia';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageHeaderOptions {
  title?: string | null;
  subtitle?: string | null;
  showBack?: boolean;
}

export const useUiStore = defineStore('ui', () => {
  // ===== Page Header State =====
  const pageTitle = ref<string | null>(null);
  const pageSubtitle = ref<string | null>(null);
  const showBackButton = ref(false);

  // ===== Breadcrumbs State =====
  const breadcrumbs = ref<Breadcrumb[]>([]);

  // ===== Sidebar State =====
  // Initialize from localStorage immediately on client-side
  const sidebarCollapsed = ref(
    process.client && typeof localStorage !== 'undefined'
      ? localStorage.getItem('sidebar-collapsed') === 'true'
      : false
  );

  // ===== Page Header Actions =====
  function setPageHeader(options: PageHeaderOptions) {
    pageTitle.value = options.title ?? null;
    pageSubtitle.value = options.subtitle ?? null;
    showBackButton.value = options.showBack ?? false;
  }

  function clearPageHeader() {
    pageTitle.value = null;
    pageSubtitle.value = null;
    showBackButton.value = false;
  }

  // ===== Breadcrumbs Actions =====
  function setBreadcrumbs(crumbs: Breadcrumb[]) {
    breadcrumbs.value = crumbs;
  }

  function clearBreadcrumbs() {
    breadcrumbs.value = [];
  }

  // ===== Sidebar Actions =====
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function collapseSidebar() {
    sidebarCollapsed.value = true;
  }

  function expandSidebar() {
    sidebarCollapsed.value = false;
  }

  function loadSidebarState() {
    if (process.client) {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        sidebarCollapsed.value = saved === 'true';
      }
    }
  }

  // ===== Watchers for Persistence =====
  if (process.client) {
    watch(sidebarCollapsed, (newValue) => {
      localStorage.setItem('sidebar-collapsed', String(newValue));
    });
  }

  return {
    // State
    pageTitle,
    pageSubtitle,
    showBackButton,
    breadcrumbs,
    sidebarCollapsed,
    // Actions
    setPageHeader,
    clearPageHeader,
    setBreadcrumbs,
    clearBreadcrumbs,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    loadSidebarState,
  };
});
