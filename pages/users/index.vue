<!-- pages/users/index.vue -->
<template>
  <div class="page-wrapper users-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">Users</h1>
      <Button
        label="Add New User"
        icon="pi pi-plus"
        severity="success"
        @click="openCreateModal"
      />
    </div>

 
    <!-- Users Table Card -->
    <div class="table-card">
      <!-- Empty State -->
      <div v-if="!loading && users.length === 0" class="flex flex-column align-items-center justify-content-center gap-3 empty-state">
        <i class="pi pi-inbox"></i>
        <p class="empty-state-text">No users found</p>
        <Button
          label="Add New User"
          icon="pi pi-plus"
          severity="primary"
          size="small"
          @click="openCreateModal"
        />
      </div>

      <!-- Users Table -->
      <DataTable
        v-else
        :value="loading ? skeletonRows : users"
        class="data-table users-table"
        stripedRows
        :sortField="primeVueSortField || undefined"
        :sortOrder="primeVueSortOrder"
        @sort="handlePrimeVueSort"
      >
        <!-- Name Column (sortable) -->
        <Column
          field="first_name"
          header="Name"
          sortable
          :style="{ width: '25%', minWidth: '150px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 120px;"></div>
            <span v-else class="cell-name">{{
              getFullName(data.first_name, data.last_name)
            }}</span>
          </template>
        </Column>

        <!-- Email Column (sortable) -->
        <Column
          field="email"
          header="E-mail"
          sortable
          :style="{ width: '35%', minWidth: '180px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 160px;"></div>
            <span v-else class="cell-secondary">{{ data.email }}</span>
          </template>
        </Column>

        <!-- Type/Role Column (sortable) -->
        <Column
          field="role"
          header="Type"
          sortable
          :style="{ width: '15%', minWidth: '100px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-button"></div>
            <Tag v-else :value="getUserRoleLabel(data.role)" :severity="getUserRoleSeverity(data.role)" />
          </template>
        </Column>

        <!-- State Column (sortable) -->
        <Column
          field="is_active"
          header="State"
          sortable
          :style="{ width: '15%', minWidth: '100px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-button" style="width: 2.25rem; height: 1.125rem;"></div>
            <div
              v-else
              v-tooltip="isCurrentUser(data.id) ? 'You cannot deactivate your own account' : null"
              class="toggle-wrapper"
            >
              <InputSwitch
                :modelValue="data.is_active"
                @update:modelValue="(value) => toggleUserState(data, value)"
                :disabled="updatingUserId === data.id || isCurrentUser(data.id)"
              />
            </div>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column header="Actions" :style="{ width: '10%', minWidth: '80px', textAlign: 'center' }">
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-circle" ></div>
            <Button
              v-else
              icon="pi pi-ellipsis-v"
              text
              rounded
              @click="(event) => toggleMenu(event, data)"
              aria-haspopup="true"
              :aria-controls="`menu-${data.id}`"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Pagination -->
      <div class="flex align-items-center justify-content-between pagination-container">
        <div class="flex justify-content-start align-items-center flex-1">
          <span v-if="!loading && totalRecords > 0" class="results-text">
            {{ paginationRange.start }}–{{ paginationRange.end }} of {{ paginationRange.total.toLocaleString() }}
          </span>
        </div>
        
        <Paginator
          v-if="showPagination"
          :first="offset"
          :rows="pageSize"
          :totalRecords="totalRecords"
          @page="onPageChange"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          :pageLinkSize="9"
          class="custom-paginator"
        />
        
        <div class="flex justify-content-end flex-1"></div>
      </div>
    </div>

    <!-- Context Menu -->
    <Menu ref="menuRef" :model="menuItems" :popup="true">
      <template #item="{ item, props }">
        <a 
          v-ripple 
          class="flex align-items-center menu-item-link" 
          v-bind="props.action"
          :data-tooltip="item.tooltip"
          v-tooltip.top="{ value: item.tooltip, disabled: !item.tooltip }"
        >
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </Menu>

    <!-- User Modal (Create/Edit) -->
    <UserCreateModal
      v-model:visible="showCreateModal"
      :mode="modalMode"
      :initial-user="editingUser"
      @success="onUserSaved"
    />
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputSwitch from "primevue/inputswitch";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";
import Menu from "primevue/menu";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Tooltip from "primevue/tooltip";
import Ripple from "primevue/ripple";
import UserCreateModal from "~/components/users/UserCreateModal.vue";
import type { User, PrimeVuePageEvent } from "~/types";
import type { DataTableSortEvent } from "primevue/datatable";
import { PAGINATION_DEFAULTS, getUserRoleLabel, getUserRoleSeverity } from "~/utils/constants";
import { ValidationError } from "~/utils/errors";
import { useConfirm } from "primevue/useconfirm";

// Register directives
const vTooltip = Tooltip;
const vRipple = Ripple;

definePageMeta({
  middleware: "auth",
});

const usersApi = useUsers();
const toast = useToast();
const confirm = useConfirm();
const auth = useAuth();

// URL-based state management
const { page, pageSize, offset, setPage } = useUrlPagination({
  defaultPageSize: PAGINATION_DEFAULTS.PAGE_SIZE_DEFAULT,
});

const {
  primeVueSortField,
  primeVueSortOrder,
  sortOrdering,
  handlePrimeVueSort,
} = useUrlSort({
  useCombinedFormat: true,
  combinedParam: 'ordering',
});

// Local UI state (not in URL)
const users = ref<User[]>([]);
const loading = ref(true); // Start with true to prevent empty state flash
const totalRecords = ref(0);
const updatingUserId = ref<number | null>(null);
const showCreateModal = ref(false);
const modalMode = ref<"create" | "edit">("create");
const editingUser = ref<User | null>(null);
const menuRef = ref();
const selectedUser = ref<User | null>(null);

// Computed properties
const showPagination = computed(() => totalRecords.value > pageSize.value);

const paginationRange = computed(() => {
  if (totalRecords.value === 0) {
    return { start: 0, end: 0, total: 0 };
  }
  const start = offset.value + 1;
  const end = Math.min(offset.value + pageSize.value, totalRecords.value);
  return { start, end, total: totalRecords.value };
});

// Skeleton rows for loading state
const skeletonRows = computed(() => {
  return Array.from({ length: pageSize.value }, (_, i) => ({
    id: i,
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    is_active: false,
  }));
});

// Menu items (dynamic based on selected user)
const menuItems = computed(() => {
  const isOwnAccount = selectedUser.value ? isCurrentUser(selectedUser.value.id) : false;
  
  return [
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => {
        openEditModal(selectedUser.value!);
      },
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      disabled: isOwnAccount,
      command: () => {
        if (!isOwnAccount) {
          confirmDeleteUser(selectedUser.value!);
        }
      },
      tooltip: isOwnAccount ? "You cannot delete your own account" : undefined,
    },
  ];
});

// Load users on mount
onMounted(() => {
  loadUsers();
});

// Watch for URL state changes and reload users
watch(
  [page, pageSize, sortOrdering],
  () => {
    loadUsers();
  }
);

async function loadUsers() {
  loading.value = true;
  
  try {
    const params: any = {
      limit: pageSize.value,
      offset: offset.value,
    };

    // Add sorting
    if (sortOrdering.value) {
      params.ordering = sortOrdering.value;
    }

    const response = await usersApi.list(params);
    users.value = response.results;
    totalRecords.value = response.count;
  } catch (error) {
    toast.showError(error, "Failed to Load Users");
  } finally {
    loading.value = false;
  }
}

function onPageChange(event: PrimeVuePageEvent) {
  const newPage = Math.floor(event.first / event.rows) + 1;
  setPage(newPage);
}

async function toggleUserState(user: User, newState: boolean) {
  // Prevent users from deactivating themselves
  if (isCurrentUser(user.id)) {
    toast.showError("You cannot deactivate your own account", "Action Not Allowed");
    return;
  }

  updatingUserId.value = user.id;
  const previousState = user.is_active;

  // Optimistic update
  user.is_active = newState;

  try {
    await usersApi.patch(user.id, { is_active: newState });
    toast.showSuccess(`User ${newState ? "activated" : "deactivated"}`);
  } catch (error) {
    // Revert on failure
    user.is_active = previousState;
    toast.showError(error, "Failed to Update User");
  } finally {
    updatingUserId.value = null;
  }
}

function openCreateModal() {
  modalMode.value = "create";
  editingUser.value = null;
  showCreateModal.value = true;
}

function openEditModal(user: User) {
  modalMode.value = "edit";
  editingUser.value = user;
  showCreateModal.value = true;
}

function onUserSaved() {
  loadUsers();
}

function toggleMenu(event: Event, user: User) {
  selectedUser.value = user;
  menuRef.value.toggle(event);
}

function getFullName(firstName: string, lastName: string): string {
  const name = `${firstName || ""} ${lastName || ""}`.trim();
  return name || "—";
}

// getRoleSeverity and getUserRoleLabel are now imported from ~/utils/constants

function isCurrentUser(userId: number): boolean {
  return auth.user.value?.id === userId;
}

function confirmDeleteUser(user: User) {
  // Prevent users from deleting themselves
  if (isCurrentUser(user.id)) {
    toast.showError("You cannot delete your own account", "Action Not Allowed");
    return;
  }

  const userName = getFullName(user.first_name, user.last_name);
  
  confirm.require({
    message: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
    header: "Delete User",
    icon: "pi pi-exclamation-triangle",
    rejectClass: "p-button-text",
    acceptClass: "p-button-danger",
    accept: () => {
      deleteUser(user.id);
    },
  });
}

async function deleteUser(userId: number) {
  try {
    await usersApi.remove(userId);
    toast.showSuccess("User deleted successfully");
    
    // Reload users list
    loadUsers();
  } catch (error) {
    toast.showError(error, "Failed to Delete User");
  }
}
</script>

<style scoped>
.users-page {
  padding: 1.5rem 1.5rem;
  min-height: 100vh;
  max-width: 1400px;
  min-width: 700px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-heading-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.table-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  min-width: 700px;
}

.users-table {
  width: 100%;
}

.users-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.user-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
}

.user-email {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-s);
}

.users-paginator {
  padding: 0.5rem;
}

.w-full {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

.pagination-container {
  border-top: 1px solid var(--color-border-light);
  min-height: 3rem;
  padding: 0 1rem;
}

.results-text {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-regular);
}

.toggle-wrapper {
  display: inline-block;
}

/* Empty state */
.empty-state {
  padding: 4rem 2rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--color-text-tertiary);
}

.empty-state-text {
  font-size: var(--font-size-body-m);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Menu item disabled state */
:deep(.p-menuitem.p-disabled) {
  opacity: 0.5;
}

:deep(.p-menuitem.p-disabled) a {
  cursor: not-allowed !important;
  pointer-events: auto !important; /* Allow hover for tooltip */
}

:deep(.p-menuitem.p-disabled) a:hover {
  background: transparent !important;
}
</style>
