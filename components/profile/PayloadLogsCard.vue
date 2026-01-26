<!-- components/profile/PayloadLogsCard.vue -->
<template>
  <div class="logs-wrapper">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h3 class="section-title">API Payload Logs</h3>
    </div>

    <!-- Search Row -->
    <div class="flex gap-2 mb-3">
      <IconField iconPosition="left" class="search-field">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchInput"
          placeholder="Search by entity, method, or status…"
          class="search-input"
        />
      </IconField>
      <Button
        :icon="showFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
        :label="showFilters ? 'Hide Filters' : 'Filters'"
        severity="secondary"
        @click="showFilters = !showFilters"
      />
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="filters-panel mb-3">
      <div class="filters-content">
        <div class="filters-grid">
          <div class="filter-field">
            <label class="filter-label">Created After</label>
            <Calendar
              v-model="filters.created_after"
              showTime
              hourFormat="12"
              dateFormat="M dd, yy"
              placeholder="Select date"
              class="w-full"
             
            />
          </div>

          <div class="filter-field">
            <label class="filter-label">Created Before</label>
            <Calendar
              v-model="filters.created_before"
              showTime
              hourFormat="12"
              dateFormat="M dd, yy"
              placeholder="Select date"
              class="w-full"
            
            />
          </div>

          <div class="filter-field">
            <label class="filter-label">Entity</label>
            <InputText
              v-model="filters.entity"
              placeholder="e.g. Order, Customer"
              class="w-full"
            />
          </div>

          <div class="filter-field">
            <label class="filter-label">Method</label>
            <Dropdown
              v-model="filters.method"
              :options="methodOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Methods"
              class="w-full"
              showClear
            />
          </div>

          <div class="filter-field">
            <label class="filter-label">Status Code</label>
            <InputNumber
              v-model="filters.status_code"
              placeholder="e.g. 200, 404"
              :useGrouping="false"
              class="w-full"
            />
          </div>

          <div class="filter-field">
            <label class="filter-label">Is Error</label>
            <Dropdown
              v-model="filters.is_error"
              :options="errorOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All"
              class="w-full"
              showClear
            />
          </div>
        </div>

        <div v-if="hasFilters" class="flex justify-content-end mt-3">
          <Button
            label="Clear Filters"
            icon="pi pi-times"
            severity="secondary"
            text
            size="small"
            @click="clearFilters"
          />
        </div>
      </div>
    </div>

    <!-- Logs Table Card -->
    <div class="table-card">
      <!-- Empty State -->
      <div v-if="!loading && logs.length === 0" class="flex flex-column align-items-center justify-content-center gap-3 empty-state">
        <i class="pi pi-inbox"></i>
        <p class="empty-state-text">
          {{ hasActiveSearch ? 'No logs match your search' : 'No logs found' }}
        </p>
        <Button
          v-if="hasActiveSearch"
          label="Clear Search"
          severity="secondary"
          size="small"
          @click="clearSearch"
        />
      </div>

      <!-- DataTable -->
      <DataTable
        v-else
        :value="loading ? skeletonRows : logs"
        class="data-table logs-table"
        stripedRows
      >
      <Column field="id" header="ID" :style="{ width: '70px' }">
        <template #body="{ data }">
          <div v-if="loading" class="skeleton skeleton-text" style="width: 40px;"></div>
          <span v-else class="cell-code">{{ data.id }}</span>
        </template>
      </Column>

      <Column field="method" header="Method" :style="{ width: '80px' }">
        <template #body="{ data }">
          <div v-if="loading" class="skeleton skeleton-button" style="width: 45px;"></div>
          <Tag v-else :value="data.method" :severity="getMethodSeverity(data.method)" />
        </template>
      </Column>

      <Column field="entity" header="Entity" :style="{ width: '100px' }">
        <template #body="{ data }">
          <div v-if="loading" class="skeleton skeleton-text" style="width: 60px;"></div>
          <span v-else class="cell-secondary">{{ data.entity || '—' }}</span>
        </template>
      </Column>

      <Column field="status_code" header="Status" :style="{ width: '70px' }">
        <template #body="{ data }">
          <div v-if="loading" class="skeleton skeleton-button" style="width: 35px;"></div>
          <Tag
            v-else
            :value="String(data.status_code)"
            :severity="getStatusSeverity(data.status_code)"
          />
        </template>
      </Column>

      <Column field="duration_ms" header="Duration" :style="{ width: '80px' }">
        <template #body="{ data }">
          <div v-if="loading" class="skeleton skeleton-text" style="width: 50px;"></div>
          <span v-else class="cell-secondary">{{ data.duration_ms }}ms</span>
        </template>
      </Column>

      <Column field="created_at" header="Created At" :style="{ width: '130px' }">
        <template #body="{ data }">
          <div v-if="loading" class="skeleton skeleton-text" style="width: 90px;"></div>
          <span v-else class="cell-date">{{ formatDateTime(data.created_at) }}</span>
        </template>
      </Column>

      <Column header="" :style="{ width: '60px', textAlign: 'right' }">
        <template #body="{ data }">
          <div v-if="loading" class="skeleton skeleton-circle"></div>
          <Button
            v-else
            icon="pi pi-eye"
            text
            rounded
            size="small"
            @click="viewDetails(data)"
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
          :first="(currentPage - 1) * 10"
          :rows="10"
          :totalRecords="totalRecords"
          @page="onPage"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          :pageLinkSize="9"
          class="custom-paginator"
        />
        
        <div class="flex justify-content-end flex-1"></div>
      </div>
    </div>
  </div>

  <!-- Log Details Dialog -->
  <Dialog
    v-model:visible="detailsDialogVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-lg"
    :style="{ width: '90vw', maxWidth: '800px' }"
  >
    <template #header>
      <h2 class="modal-title">Payload Log #{{ selectedLog?.id }}</h2>
    </template>

    <div v-if="selectedLog" class="log-details">
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">Project</span>
          <span class="detail-value">{{ selectedLog.project_name }} (#{{ selectedLog.project_id }})</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Method</span>
          <Tag :value="selectedLog.method" :severity="getMethodSeverity(selectedLog.method)" />
        </div>
        <div class="detail-item">
          <span class="detail-label">Entity</span>
          <span class="detail-value">{{ selectedLog.entity || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Key</span>
          <span class="detail-value">{{ selectedLog.key || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status</span>
          <Tag :value="String(selectedLog.status_code)" :severity="getStatusSeverity(selectedLog.status_code)" />
        </div>
        <div class="detail-item">
          <span class="detail-label">Duration</span>
          <span class="detail-value">{{ selectedLog.duration_ms }}ms</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Is Error</span>
          <Tag :value="selectedLog.is_error ? 'Yes' : 'No'" :severity="selectedLog.is_error ? 'danger' : 'success'" />
        </div>
        <div class="detail-item">
          <span class="detail-label">Created At</span>
          <span class="detail-value">{{ formatDateTime(selectedLog.created_at) }}</span>
        </div>
      </div>

      <div class="detail-section">
        <span class="detail-label">URL</span>
        <div class="url-box">{{ selectedLog.url }}</div>
      </div>

      <div v-if="selectedLog.error_message" class="detail-section">
        <span class="detail-label">Error Message</span>
        <Message severity="error" :closable="false">
          {{ selectedLog.error_message }}
        </Message>
      </div>

      <div class="detail-section">
        <span class="detail-label">Payload</span>
        <div class="json-box">
          <pre>{{ formatJson(selectedLog.payload) }}</pre>
        </div>
      </div>

      <div class="detail-section">
        <span class="detail-label">Response</span>
        <div class="json-box">
          <pre>{{ formatJson(selectedLog.response) }}</pre>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Close"
        severity="secondary"
        @click="detailsDialogVisible = false"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import type { PayloadLog, PayloadLogDetail } from "~/types/models";
import { DATE_FORMAT_OPTIONS, DEBOUNCE_MS } from "~/utils/constants";

const payloadLogsApi = usePayloadLogs();
const toast = useToast();

// State
const logs = ref<PayloadLog[]>([]);
const totalRecords = ref(0);
const loading = ref(true); // Start with true to prevent empty state flash
const currentPage = ref(1);
const showFilters = ref(false);

// URL-based search
const { searchInput, search, clearSearch } = useUrlSearch({
  param: 'logs_search',
  debounce: DEBOUNCE_MS.SEARCH_DEFAULT,
});

// Filters
const filters = reactive({
  created_after: null as Date | null,
  created_before: null as Date | null,
  entity: "",
  method: null as string | null,
  status_code: null as number | null,
  is_error: null as boolean | null,
});

// Details dialog
const detailsDialogVisible = ref(false);
const selectedLog = ref<PayloadLogDetail | null>(null);

// Options
const methodOptions = [
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PATCH", value: "PATCH" },
  { label: "PUT", value: "PUT" },
  { label: "DELETE", value: "DELETE" },
];

const errorOptions = [
  { label: "Errors Only", value: true },
  { label: "No Errors", value: false },
];

// Skeleton rows
const skeletonRows = computed(() => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    method: "",
    entity: "",
    status_code: 0,
    duration_ms: 0,
    created_at: "",
  }));
});

// Computed
const hasFilters = computed(() => {
  return (
    filters.created_after !== null ||
    filters.created_before !== null ||
    filters.entity !== "" ||
    filters.method !== null ||
    filters.status_code !== null ||
    filters.is_error !== null
  );
});

const hasActiveSearch = computed(() => {
  return search.value || hasFilters.value;
});

const showPagination = computed(() => totalRecords.value > 10);

const paginationRange = computed(() => {
  if (totalRecords.value === 0) {
    return { start: 0, end: 0, total: 0 };
  }
  const start = (currentPage.value - 1) * 10 + 1;
  const end = Math.min(currentPage.value * 10, totalRecords.value);
  return { start, end, total: totalRecords.value };
});

// Watch filters and search
let filterTimeout: NodeJS.Timeout | null = null;
watch(
  () => ({ ...filters }),
  () => {
    if (filterTimeout) clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
      currentPage.value = 1;
      loadLogs();
    }, 500);
  },
  { deep: true }
);

watch(search, () => {
  currentPage.value = 1;
  loadLogs();
});

// Load on mount
onMounted(() => {
  loadLogs();
});

async function loadLogs() {
  const params: any = {
    page: currentPage.value,
  };

  // Add search
  if (search.value) {
    params.search = search.value;
  }

  if (filters.created_after) {
    params.created_after = filters.created_after.toISOString();
  }
  if (filters.created_before) {
    params.created_before = filters.created_before.toISOString();
  }
  if (filters.entity) {
    params.entity = filters.entity;
  }
  if (filters.method) {
    params.method = filters.method;
  }
  if (filters.status_code) {
    params.status_code = filters.status_code;
  }
  if (filters.is_error !== null) {
    params.is_error = filters.is_error;
  }

  await useApiCall({
    fn: () => payloadLogsApi.list(params),
    errorMessage: "Failed to load logs",
    loading,
    toast,
    onSuccess: (data) => {
      logs.value = data.results;
      totalRecords.value = data.count;
    },
  });
}

function viewDetails(log: PayloadLog) {
  selectedLog.value = log as PayloadLogDetail;
  detailsDialogVisible.value = true;
}

function onPage(event: { first: number; rows: number }) {
  currentPage.value = Math.floor(event.first / event.rows) + 1;
  loadLogs();
}

function clearFilters() {
  filters.created_after = null;
  filters.created_before = null;
  filters.entity = "";
  filters.method = null;
  filters.status_code = null;
  filters.is_error = null;
  clearSearch();
}

// Helpers
function getMethodSeverity(method: string): string {
  switch (method) {
    case "GET": return "info";
    case "POST": return "success";
    case "PATCH":
    case "PUT": return "warning";
    case "DELETE": return "danger";
    default: return "secondary";
  }
}

function getStatusSeverity(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return "success";
  if (statusCode >= 300 && statusCode < 400) return "info";
  if (statusCode >= 400 && statusCode < 500) return "warning";
  if (statusCode >= 500) return "danger";
  return "secondary";
}

function formatDateTime(isoString: string): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      ...DATE_FORMAT_OPTIONS.DISPLAY,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function formatJson(obj: Record<string, any> | null): string {
  if (!obj) return "null";
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}
</script>

<style scoped>

.logs-table :deep(.p-datatable-tbody > tr){
  height: 51px !important;
  max-height: 51px !important;
  min-height: 51px !important;
}
.logs-wrapper {
  width: 100%;
}

.section-title {
  font-size: var(--font-size-heading-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.search-field {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.filters-panel {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
}

.filters-content {
  padding: 1rem 1.25rem;
}

.table-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-label {
  font-size: var(--font-size-body-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.logs-table {
  width: 100%;
}

.logs-table :deep(table) {
  table-layout: fixed;
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

/* Log Details Dialog */
.log-details {
  max-height: 60vh;
  overflow-y: auto;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 576px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: var(--font-size-body-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
}

.detail-section {
  margin-bottom: 1rem;
}

.detail-section .detail-label {
  display: block;
  margin-bottom: 0.5rem;
}

.url-box {
  font-family: var(--font-family-mono, monospace);
  font-size: var(--font-size-body-xs);
  background: var(--surface-100);
  padding: 0.75rem;
  border-radius: var(--border-radius);
  word-break: break-all;
}

.json-box {
  background: var(--surface-100);
  border-radius: var(--border-radius);
  max-height: 200px;
  overflow: auto;
}

.json-box pre {
  font-family: var(--font-family-mono, monospace);
  font-size: var(--font-size-body-xs);
  padding: 0.75rem;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
