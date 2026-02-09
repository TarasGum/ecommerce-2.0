<!-- pages/proposals/index.vue -->
<template>
  <div class="page-wrapper proposals-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">Proposals</h1>
    </div>

    <!-- Status Filter Tabs -->
    <div class="tabs-container">
      <div class="flex tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          :class="['tab', { 'tab-active': effectiveStatus === tab.value }]"
          @click="setFilter('status', tab.value as ProposalStatus | '')"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <IconField iconPosition="left">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchInput"
          placeholder="Search by quote number..."
          class="search-input"
        />
      </IconField>
    </div>

    <!-- Proposals Table Card -->
    <div class="table-card">
      <!-- Empty State -->
      <div
        v-if="!loading && proposals.length === 0"
        class="flex flex-column align-items-center justify-content-center gap-3 empty-state"
      >
        <i class="pi pi-inbox"></i>
        <p class="empty-state-text">
          {{
            search ? "No proposals match your search" : getEmptyStateMessage()
          }}
        </p>
        <Button
          v-if="search"
          label="Clear Search"
          severity="secondary"
          size="small"
          @click="clearSearch"
        />
        <Button
          v-else-if="filters.status"
          label="View All Proposals"
          severity="secondary"
          size="small"
          @click="setFilter('status', '' as ProposalStatus | '')"
        />
      </div>

      <!-- Proposals Table -->
      <DataTable
        v-else
        :value="loading ? skeletonRows : proposals"
        :class="['data-table proposals-table', { loading: loading }]"
        stripedRows
        v-model:selection="selectedProposals"
        v-model:expandedRows="expandedRows"
        dataKey="autoid"
        :sortField="primeVueSortField || undefined"
        :sortOrder="primeVueSortOrder"
        @sort="handlePrimeVueSort"
        tableStyle="table-layout: fixed"
      >
        <!-- Expansion Column -->
        <Column expander :style="{ width: '50px', minWidth: '50px' }">
          <template #body="slotProps">
            <Button
              v-if="!loading"
              :icon="
                expandedRows[slotProps.data.autoid]
                  ? 'pi pi-chevron-down'
                  : 'pi pi-chevron-right'
              "
              text
              rounded
              size="small"
              @click.stop="toggleExpand(slotProps.data)"
              class="expander-button"
            />
          </template>
        </Column>

        <!-- Selection Column -->
        <Column
          selectionMode="multiple"
          :style="{ width: '50px', minWidth: '50px' }"
        />

        <!-- Quote Column -->
        <Column
          field="quote"
          header="Quote"
          sortable
          :style="{ width: '15%', minWidth: '120px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div
              v-if="loading"
              class="skeleton skeleton-text"
              style="width: 100px"
            ></div>
            <span v-else class="cell-code">{{ formatQuote(data.quote) }}</span>
          </template>
        </Column>

        <!-- Status Column -->
        <Column
          field="status"
          header="Status"
          sortable
          :style="{ width: '12%', minWidth: '100px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-button"></div>
            <Tag
              v-else
              :value="getProposalStatusLabel(data.status)"
              :severity="getProposalStatusSeverity(data.status)"
            />
          </template>
        </Column>

        <!-- Customer Name Column -->
        <Column
          field="b_name"
          header="Customer"
          sortable
          :style="{ width: '30%', minWidth: '150px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div
              v-if="loading"
              class="skeleton skeleton-text"
              style="width: 140px"
            ></div>
            <span v-else class="customer-name">{{ data.b_name || "—" }}</span>
          </template>
        </Column>

        <!-- Quote Date Column -->
        <Column
          field="qt_date"
          header="Quote Date"
          sortable
          :style="{ width: '18%', minWidth: '110px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div
              v-if="loading"
              class="skeleton skeleton-text"
              style="width: 90px"
            ></div>
            <span v-else class="cell-date">{{ formatDate(data.qt_date) }}</span>
          </template>
        </Column>

        <!-- Total Column -->
        <Column
          field="total"
          header="Total"
          sortable
          :style="{ width: '12%', minWidth: '100px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div
              v-if="loading"
              class="skeleton skeleton-text"
              style="width: 80px"
            ></div>
            <span v-else class="cell-amount">{{
              formatCurrency(data.total)
            }}</span>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column
          header="Actions"
          :style="{ width: '70px', minWidth: '70px', textAlign: 'center' }"
          :pt="{ headerContent: { style: 'justify-content: center' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-circle"></div>
            <Button
              v-else
              icon="pi pi-ellipsis-v"
              text
              rounded
              @click="(event) => toggleMenu(event, data)"
              aria-haspopup="true"
              :aria-controls="`menu-${data.autoid}`"
            />
          </template>
        </Column>

        <!-- Row Expansion Template -->
        <template #expansion="{ data }">
          <div class="proposal-expansion">
            <div class="flex flex-column gap-3 expansion-content">
              <!-- Proposal Summary Info -->
              <div
                class="flex justify-content-between align-items-center flex-wrap gap-3 expansion-header"
              >
                <h4 class="expansion-title">Proposal Items</h4>
                <div class="flex gap-4 flex-wrap">
                  <span class="flex gap-2 align-items-center">
                    <span class="meta-label">Customer ID:</span>
                    <span class="meta-value">{{ data.b_id || "—" }}</span>
                  </span>
                  <span class="flex gap-2 align-items-center">
                    <span class="meta-label">Subtotal:</span>
                    <span class="meta-value">{{
                      formatCurrency(data.subtotal)
                    }}</span>
                  </span>
                  <span class="flex gap-2 align-items-center">
                    <span class="meta-label">Tax:</span>
                    <span class="meta-value">{{
                      formatCurrency(data.tax)
                    }}</span>
                  </span>
                </div>
              </div>

              <!-- Loading State -->
              <div
                v-if="loadingItems[data.autoid]"
                class="flex align-items-center justify-content-center gap-2 items-loading"
              >
                <ProgressSpinner style="width: 30px; height: 30px" />
                <span class="loading-text">Loading items...</span>
              </div>

              <!-- Items Table -->
              <div
                v-else-if="
                  proposalItemsMap[data.autoid] &&
                  proposalItemsMap[data.autoid].length > 0
                "
                class="items-table-wrapper"
              >
                <DataTable
                  :value="proposalItemsMap[data.autoid]"
                  class="expansion-items-table"
                >
                  <Column
                    field="inven"
                    header="Item Code"
                    :style="{ width: '15%' }"
                  >
                    <template #body="{ data: item }">
                      <span class="item-code">{{ item.inven || "—" }}</span>
                    </template>
                  </Column>
                  <Column
                    field="descr"
                    header="Description"
                    :style="{ width: '45%' }"
                  >
                    <template #body="{ data: item }">
                      <span class="item-description">{{
                        item.descr || "—"
                      }}</span>
                    </template>
                  </Column>
                  <Column
                    field="quan"
                    header="Quantity"
                    :style="{ width: '15%' }"
                  >
                    <template #body="{ data: item }">
                      <span class="item-quantity">{{
                        formatQuantity(item.quan)
                      }}</span>
                    </template>
                  </Column>
                  <Column
                    field="amount"
                    header="Amount"
                    :style="{ width: '15%' }"
                  >
                    <template #body="{ data: item }">
                      <span class="item-amount">{{
                        formatCurrency(item.amount)
                      }}</span>
                    </template>
                  </Column>
                </DataTable>
              </div>

              <!-- No Items Message -->
              <div
                v-else
                class="flex flex-column align-items-center justify-content-center gap-2 no-items"
              >
                <i class="pi pi-inbox"></i>
                <span>No items found for this proposal</span>
              </div>
            </div>
          </div>
        </template>
      </DataTable>

      <!-- Pagination -->
      <div
        class="flex align-items-center justify-content-between pagination-container"
      >
        <div class="flex justify-content-start align-items-center flex-1">
          <span v-if="!loading && totalRecords > 0" class="results-text">
            {{ paginationRange.start }}–{{ paginationRange.end }} of
            {{ paginationRange.total.toLocaleString() }}
          </span>
        </div>

        <Paginator
          v-if="showPagination"
          :rows="pageSize"
          :totalRecords="totalRecords"
          :first="offset"
          @page="onPageChange"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          :pageLinkSize="9"
          class="custom-paginator"
        />

        <div class="flex justify-content-end flex-1"></div>
      </div>
    </div>

    <!-- Context Menu -->
    <Menu ref="menuRef" :model="menuItems" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";
import Menu from "primevue/menu";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import ProgressSpinner from "primevue/progressspinner";
import { until } from "@vueuse/core";
import { storeToRefs } from "pinia";
import type { Proposal, ProposalItem, PrimeVuePageEvent } from "~/types";
import type { DataTableSortEvent } from "primevue/datatable";
import { formatDate, formatCurrency, formatQuantity } from "~/utils/formatters";
import { useProjectsStore } from "~/stores/projects";
import {
  PAGINATION_DEFAULTS,
  DEBOUNCE_MS,
  PROPOSAL_STATUS,
  PROPOSAL_STATUS_LABELS,
  getProposalStatusLabel,
  getProposalStatusSeverity,
  USER_ROLES,
  type ProposalStatus,
} from "~/utils/constants";

definePageMeta({
  middleware: "auth",
});

const proposalsApi = useProposals();
const toast = useToast();
const auth = useAuth();

// Store management
const projectsStore = useProjectsStore();
const {
  selectedProjectId,
  projects,
  loading: projectsLoading,
} = storeToRefs(projectsStore);

const isSuperAdmin = computed(
  () => auth.user.value?.role === USER_ROLES.SUPERADMIN,
);

// URL-based state management
const { page, pageSize, offset, setPage, resetPage } = useUrlPagination({
  defaultPageSize: PAGINATION_DEFAULTS.PAGE_SIZE_MEDIUM,
});

const { searchInput, search, clearSearch } = useUrlSearch({
  param: "quote",
  debounce: DEBOUNCE_MS.SEARCH_LONG,
});

const { filters, setFilter } = useUrlFilters<{
  status: ProposalStatus | "";
}>({
  status: {
    param: "status",
    defaultValue: "", // Empty for "All Proposals"
  },
});

const {
  primeVueSortField,
  primeVueSortOrder,
  sortOrdering,
  handlePrimeVueSort,
} = useUrlSort({
  useCombinedFormat: true,
  combinedParam: "ordering",
});

// Local UI state (not in URL)
const proposals = ref<Proposal[]>([]);
const loading = ref(true); // Start with true to prevent empty state flash
const totalRecords = ref(0);
const selectedProposals = ref<Proposal[]>([]);
const expandedRows = ref<Record<string, boolean>>({});
const proposalItemsMap = ref<Record<string, ProposalItem[]>>({});
const loadingItems = ref<Record<string, boolean>>({});
const menuRef = ref();
const selectedProposal = ref<Proposal | null>(null);

// Request cancellation - track the current request to prevent race conditions
const currentAbortController = ref<AbortController | null>(null);

// Status tabs configuration
const statusTabs = [
  {
    label: PROPOSAL_STATUS_LABELS[PROPOSAL_STATUS.OPEN],
    value: PROPOSAL_STATUS.OPEN,
  },
  {
    label: PROPOSAL_STATUS_LABELS[PROPOSAL_STATUS.ACCEPTED],
    value: PROPOSAL_STATUS.ACCEPTED,
  },
  {
    label: PROPOSAL_STATUS_LABELS[PROPOSAL_STATUS.LOST],
    value: PROPOSAL_STATUS.LOST,
  },
  {
    label: PROPOSAL_STATUS_LABELS[PROPOSAL_STATUS.EXPIRED],
    value: PROPOSAL_STATUS.EXPIRED,
  },
  { label: "All Proposals", value: "" },
];

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
  return Array.from({ length: Math.min(pageSize.value, 10) }, (_, i) => ({
    autoid: `skeleton-${i}`,
    b_id: "",
    quote: "",
    b_name: "",
    qt_date: null,
    status: "O" as const,
    tax: "",
    subtotal: "",
    total: "",
  }));
});

// Menu items
const menuItems = computed(() => [
  {
    label: "Edit",
    icon: "pi pi-pencil",
    command: () => {
      toast.showInfo("Coming Soon!");
    },
  },
  {
    label: "Delete",
    icon: "pi pi-trash",
    command: () => {
      toast.showInfo("Coming Soon!");
    },
  },
]);

// Track if we're initializing default filter to prevent race condition
const route = useRoute();

// Check if autoid filter is present (from task link)
const autoidFilter = computed(() => route.query.autoid as string | undefined);

// Only initialize status filter if no autoid filter is present
const shouldInitializeFilter =
  !route.query.autoid && (!route.query.status || route.query.status === "");
const isInitializing = ref(shouldInitializeFilter);

// Track if initial data load is ready (projects loaded for superadmin)
const isReadyToLoad = ref(false);

// Effective status for UI rendering (prevents flickering during initialization)
const effectiveStatus = computed(() => {
  // If autoid filter is present, show "All Proposals" tab as active
  if (autoidFilter.value) {
    return "";
  }
  // Only override during the brief initialization phase
  if (isInitializing.value && filters.value.status === "") {
    return PROPOSAL_STATUS.OPEN;
  }
  return filters.value.status;
});

// Initialize status filter if not present in URL (and no autoid filter)
if (shouldInitializeFilter) {
  setFilter("status", PROPOSAL_STATUS.OPEN as ProposalStatus | "");
}

// Load proposals on mount
onMounted(async () => {
  // Wait for projects to load if user is superadmin
  if (isSuperAdmin.value && projectsLoading.value) {
    await until(projectsLoading).toBe(false);
  }

  // Mark as ready to load - watcher can now make API calls
  isReadyToLoad.value = true;

  // Always call loadProposals from onMounted - we're now ready
  loadProposals();
});

// Watch for URL state changes and reload proposals
watch(
  [
    page,
    pageSize,
    search,
    () => filters.value.status,
    sortOrdering,
    autoidFilter,
  ],
  () => {
    // Mark initialization as complete once the watcher fires
    if (isInitializing.value) {
      isInitializing.value = false;
    }
    // Only load if ready (projects loaded for superadmin)
    // onMounted will handle the initial load
    if (isReadyToLoad.value) {
      loadProposals();
    }
  },
);

// Watch for search/filter changes and reset to first page
watch([search, () => filters.value.status], (newVals, oldVals) => {
  // Only reset if values actually changed (not initial load)
  if (oldVals && (oldVals[0] !== newVals[0] || oldVals[1] !== newVals[1])) {
    resetPage();
  }
});

// Watch for project changes and reset to first page
watch(selectedProjectId, (newVal, oldVal) => {
  // Only reset if this is an actual change, not initial load (oldVal will be null or undefined on first load)
  if (oldVal !== undefined && oldVal !== null) {
    resetPage();
    loadProposals();
  }
});

// Watch for row expansion and load items
watch(
  expandedRows,
  async (newExpandedRows, oldExpandedRows) => {
    // Find newly expanded row autoids
    const newAutoids = Object.keys(newExpandedRows).filter(
      (autoid) => newExpandedRows[autoid] && !oldExpandedRows[autoid],
    );

    // Load items for newly expanded rows
    for (const autoid of newAutoids) {
      const proposal = proposals.value.find((p) => p.autoid === autoid);
      if (proposal) {
        await loadProposalItems(proposal);
      }
    }
  },
  { deep: true },
);

async function loadProposals() {
  // Cancel any in-flight request to prevent race conditions
  if (currentAbortController.value) {
    currentAbortController.value.abort();
  }

  // Create a new AbortController for this request
  const abortController = new AbortController();
  currentAbortController.value = abortController;

  // Set loading state immediately
  loading.value = true;

  const params: any = {
    limit: pageSize.value,
    offset: offset.value,
  };

  // If autoid filter is present, use it and skip status filter
  if (autoidFilter.value) {
    params.autoid = autoidFilter.value;
  } else {
    // Add status filter if not "All Proposals"
    if (filters.value.status) {
      params.status = filters.value.status;
    }
  }

  // Add search filter
  if (search.value) {
    params.quote = search.value;
  }

  // Add sorting
  if (sortOrdering.value) {
    params.ordering = sortOrdering.value;
  }

  // Add project_id filter if available
  if (selectedProjectId.value !== null) {
    params.project_id = selectedProjectId.value;
  }

  try {
    const data = await proposalsApi.list(params, abortController.signal);

    // Only update data if this request wasn't aborted
    if (!abortController.signal.aborted) {
      proposals.value = data.results;
      totalRecords.value = data.count;
      loading.value = false;
    }
  } catch (error: any) {
    // Only handle errors if this request wasn't aborted
    if (!abortController.signal.aborted) {
      // Check for abort error (can be DOMException with name 'AbortError' or Error)
      const isAbortError =
        error?.name === "AbortError" ||
        error?.code === DOMException.ABORT_ERR ||
        error?.message?.includes("aborted");

      if (!isAbortError) {
        toast.showError(error, "Failed to Load Proposals");
      }
      loading.value = false;
    }
    // If aborted, don't change loading state - let the new request handle it
  }
}

function onPageChange(event: PrimeVuePageEvent) {
  const newPage = Math.floor(event.first / event.rows) + 1;
  setPage(newPage);
}

function toggleMenu(event: Event, proposal: Proposal) {
  selectedProposal.value = proposal;
  menuRef.value.toggle(event);
}

function getEmptyStateMessage(): string {
  if (!filters.value.status) {
    return "No proposals found";
  }

  const statusLabel =
    PROPOSAL_STATUS_LABELS[filters.value.status as ProposalStatus];
  return `No ${statusLabel.toLowerCase()} proposals`;
}

function toggleExpand(proposal: Proposal) {
  const autoid = proposal.autoid;
  const isExpanded = expandedRows.value[autoid];

  if (isExpanded) {
    // Collapse
    const newExpandedRows = { ...expandedRows.value };
    delete newExpandedRows[autoid];
    expandedRows.value = newExpandedRows;
  } else {
    // Expand
    expandedRows.value = {
      ...expandedRows.value,
      [autoid]: true,
    };
  }
}

async function loadProposalItems(proposal: Proposal) {
  // Check if already loaded
  if (proposalItemsMap.value[proposal.autoid]) {
    return;
  }

  // Check if items came with the proposal
  if (proposal.items && proposal.items.length > 0) {
    proposalItemsMap.value = {
      ...proposalItemsMap.value,
      [proposal.autoid]: proposal.items,
    };
    return;
  }

  // Create loading ref for this specific proposal
  const itemLoading = ref(true);
  loadingItems.value = {
    ...loadingItems.value,
    [proposal.autoid]: true,
  };

  await useApiCall({
    fn: () => proposalsApi.getByAutoid(proposal.autoid),
    errorMessage: "Failed to Load Proposal Items",
    loading: itemLoading,
    toast,
    onSuccess: (data) => {
      proposalItemsMap.value = {
        ...proposalItemsMap.value,
        [proposal.autoid]: data.items || [],
      };
    },
    onError: () => {
      proposalItemsMap.value = {
        ...proposalItemsMap.value,
        [proposal.autoid]: [],
      };
    },
    onFinally: () => {
      loadingItems.value = {
        ...loadingItems.value,
        [proposal.autoid]: false,
      };
    },
  });
}

// Keep formatQuote as it's custom logic specific to this page
function formatQuote(quote: string): string {
  return quote?.trim() || "—";
}
</script>

<style scoped>
.proposals-page {
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

/* Tabs */
.tabs-container {
  margin-bottom: 1rem;
}

.tabs {
  gap: 0.25rem;
  border-bottom: 1px solid var(--color-border-light);
}

.tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.tab:hover {
  color: var(--color-text-primary);
  background: var(--color-neutral-200);
}

.tab-active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-neutral-900);
}

/* Search */
.search-container {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
}

/* Table */
.table-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  min-width: 700px;
}

.proposals-table {
  width: 100%;
}

.proposals-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.quote-number {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
}

.customer-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
}

.quote-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-s);
}

.proposal-total {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-body-s);
}

/* Pagination */
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

.proposals-paginator {
  padding: 0.5rem;
}

/* Prevent horizontal shifting during loading */
.proposals-table :deep(.p-datatable-tbody > tr > td) {
  overflow: hidden;
}

.proposals-table :deep(.p-datatable-thead > tr > th) {
  overflow: hidden;
}

/* Row Expansion Styles */
.proposal-expansion {
  background: var(--color-neutral-200);
  padding: 0;
}

.expansion-content {
  padding: 1.25rem;
}

.expansion-header {
  margin-bottom: 0.5rem;
}

.expansion-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.meta-label {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.meta-value {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.items-loading {
  padding: 2rem;
}

.loading-text {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

.items-table-wrapper {
  background: white;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
}

.expansion-items-table {
  width: 100%;
}

.expansion-items-table :deep(.p-datatable-thead > tr > th) {
  background: var(--color-neutral-300);
  font-size: var(--font-size-body-xs);
  padding: 0.5rem 0.75rem;
}

.expansion-items-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.625rem 0.75rem;
  font-size: var(--font-size-body-s);
}

.item-code {
  font-family: "Monaco", "Courier New", monospace;
  font-size: var(--font-size-body-xs);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.item-description {
  color: var(--color-text-primary);
}

.item-quantity {
  color: var(--color-text-secondary);
}

.item-amount {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.no-items {
  padding: 2.5rem;
  background: white;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.no-items i {
  font-size: 2rem;
  color: var(--color-text-tertiary);
}

.no-items span {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

/* Expansion row styling */
.proposals-table :deep(.p-datatable-row-expansion > td) {
  padding: 0 !important;
  border-bottom: 1px solid var(--color-border-light);
}

/* Consistent row height - force exact match to 45px */
.proposals-table :deep(.p-datatable-tbody > tr) {
  height: 45px;
  max-height: 45px;
  min-height: 45px;
}

.proposals-table :deep(.p-datatable-tbody > tr > td) {
  vertical-align: middle;
  height: 45px;
  line-height: normal;
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
</style>
