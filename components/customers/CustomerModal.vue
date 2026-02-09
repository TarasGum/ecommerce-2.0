<!-- components/customers/CustomerModal.vue -->
<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-md"
  >
    <template #header>
      <h2 class="modal-title">{{ mode === 'create' ? 'New Customer' : 'Edit Customer' }}</h2>
    </template>

    <!-- Loading State (edit mode only) -->
    <div v-if="loadingCustomer" class="flex flex-column align-items-center justify-content-center gap-3 loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--color-text-tertiary);"></i>
      <span class="text-color-secondary">Loading customer data...</span>
    </div>

    <!-- Form -->
    <Form
      v-else-if="mode === 'create' || customerData"
      @submit="handleSubmit"
      :validation-schema="schema"
      :initial-values="initialFormValues"
      :key="formKey"
      class="customer-form"
    >
      <!-- Customer Name -->
      <div class="flex flex-column mb-4">
        <label for="l_name" class="field-label mb-2">Customer Name <span class="required">*</span></label>
        <Field v-slot="{ field, errorMessage }" name="l_name">
          <InputText
            id="l_name"
            v-bind="field"
            placeholder="Enter customer name or company"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="l_name" class="p-error text-sm mt-1" />
      </div>

      <!-- Contact Section -->
      <div class="section-title mb-3">Contact Information</div>

      <!-- Phone & Email -->
      <div class="flex gap-3 mb-4">
        <div class="flex flex-column flex-1">
          <label for="phone" class="field-label mb-2">Phone</label>
          <Field v-slot="{ field, errorMessage }" name="phone">
            <InputText
              id="phone"
              v-bind="field"
              placeholder="Enter phone number"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="phone" class="p-error text-sm mt-1" />
        </div>
        <div class="flex flex-column flex-1">
          <label for="email" class="field-label mb-2">Email</label>
          <Field v-slot="{ field, errorMessage }" name="email">
            <InputText
              id="email"
              v-bind="field"
              placeholder="Enter email address"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="email" class="p-error text-sm mt-1" />
        </div>
      </div>

      <!-- Address Section -->
      <div class="section-title mb-3">Address</div>

      <!-- Address Line 1 -->
      <div class="flex flex-column mb-4">
        <label for="address1" class="field-label mb-2">Address Line 1</label>
        <Field v-slot="{ field, errorMessage }" name="address1">
          <InputText
            id="address1"
            v-bind="field"
            placeholder="Street address"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="address1" class="p-error text-sm mt-1" />
      </div>

      <!-- Address Line 2 -->
      <div class="flex flex-column mb-4">
        <label for="address2" class="field-label mb-2">Address Line 2</label>
        <Field v-slot="{ field, errorMessage }" name="address2">
          <InputText
            id="address2"
            v-bind="field"
            placeholder="Apt, suite, unit, etc."
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="address2" class="p-error text-sm mt-1" />
      </div>

      <!-- City, State, Zip -->
      <div class="flex gap-3 mb-4">
        <div class="flex flex-column flex-1">
          <label for="city" class="field-label mb-2">City</label>
          <Field v-slot="{ field, errorMessage }" name="city">
            <InputText
              id="city"
              v-bind="field"
              placeholder="City"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="city" class="p-error text-sm mt-1" />
        </div>
        <div class="flex flex-column" style="width: 120px;">
          <label for="state" class="field-label mb-2">State</label>
          <Field v-slot="{ field, errorMessage }" name="state">
            <InputText
              id="state"
              v-bind="field"
              placeholder="State"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="state" class="p-error text-sm mt-1" />
        </div>
        <div class="flex flex-column" style="width: 120px;">
          <label for="zip" class="field-label mb-2">Zip</label>
          <Field v-slot="{ field, errorMessage }" name="zip">
            <InputText
              id="zip"
              v-bind="field"
              placeholder="Zip code"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="zip" class="p-error text-sm mt-1" />
        </div>
      </div>

      <!-- Country -->
      <div class="flex flex-column mb-4">
        <label for="country" class="field-label mb-2">Country</label>
        <Field v-slot="{ field, errorMessage }" name="country">
          <InputText
            id="country"
            v-bind="field"
            placeholder="Country"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="country" class="p-error text-sm mt-1" />
      </div>

      <!-- Other Section -->
      <div class="section-title mb-3">Other</div>

      <!-- Type & Status -->
      <div class="flex gap-3 mb-4">
        <div class="flex flex-column flex-1">
          <label for="in_level" class="field-label mb-2">Type</label>
          <Field v-slot="{ field, errorMessage }" name="in_level">
            <Dropdown
              id="in_level"
              :modelValue="field.value"
              @update:modelValue="field.onChange"
              :options="customerTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select type"
              showClear
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="in_level" class="p-error text-sm mt-1" />
        </div>
        <div class="flex flex-column flex-1">
          <label for="inactive" class="field-label mb-2">Status</label>
          <Field v-slot="{ field }" name="inactive">
            <Dropdown
              id="inactive"
              :modelValue="field.value"
              @update:modelValue="field.onChange"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select status"
              class="w-full"
            />
          </Field>
        </div>
      </div>

      <!-- Submit Button -->
      <Button
        type="submit"
        :label="mode === 'create' ? 'Create Customer' : 'Save Changes'"
        severity="success"
        class="w-full"
        :loading="loading"
        :disabled="loading"
      />
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { Form, Field, ErrorMessage } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { createCustomerSchema, editCustomerSchema } from "~/utils/validation";
import { storeToRefs } from "pinia";
import { ValidationError } from "~/utils/errors";
import { USER_ROLES } from "~/utils/constants";
import { useProjectsStore } from "~/stores/projects";
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from "~/types/models";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    mode?: "create" | "edit";
    customerId?: string | null;
    /** Pre-loaded customer data (optional, avoids extra fetch in edit mode) */
    customer?: Customer | null;
  }>(),
  {
    mode: "create",
    customerId: null,
    customer: null,
  }
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  success: [];
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const customersApi = useCustomers();
const toast = useToast();
const auth = useAuth();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId } = storeToRefs(projectsStore);

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

const loading = ref(false);
const loadingCustomer = ref(false);
const customerData = ref<Customer | null>(null);
const formKey = ref(0);

// Customer type options
const customerTypeOptions = [
  { label: "Wholesale", value: "Wholesale" },
  { label: "Retail", value: "Retail" },
];

// Status options
const statusOptions = [
  { label: "Active", value: false },
  { label: "Inactive", value: true },
];

// Fetch customer data when modal opens in edit mode
watch(
  () => props.visible,
  async (visible) => {
    if (visible && props.mode === "edit") {
      if (props.customer) {
        // Use pre-loaded customer data
        customerData.value = props.customer;
        formKey.value++;
      } else if (props.customerId) {
        // Fetch customer data
        await fetchCustomerData(props.customerId);
      }
    } else if (visible && props.mode === "create") {
      // Reset for create mode
      customerData.value = null;
      formKey.value++;
    } else if (!visible) {
      // Reset when modal closes
      customerData.value = null;
    }
  }
);

async function fetchCustomerData(id: string) {
  await useApiCall({
    fn: () => customersApi.getById(id),
    errorMessage: 'Failed to Load Customer',
    loading: loadingCustomer,
    toast,
    onSuccess: (data) => {
      customerData.value = data;
      formKey.value++;
    },
    onError: () => {
      isVisible.value = false;
    },
  });
}

// Initial form values
const initialFormValues = computed(() => {
  if (props.mode === "edit" && customerData.value) {
    const c = customerData.value;
    return {
      l_name: c.l_name || "",
      phone: c.phone || "",
      email: c.email || "",
      address1: c.address1 || "",
      address2: c.address2 || "",
      city: c.city || "",
      state: c.state || "",
      zip: c.zip || "",
      country: c.country || "",
      in_level: c.in_level || "",
      inactive: c.inactive ?? false,
    };
  }
  // Create mode defaults
  return {
    l_name: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    in_level: "",
    inactive: false,
  };
});

// Validation schema (dynamic based on mode)
const schema = computed(() => {
  if (props.mode === "create") {
    return toTypedSchema(createCustomerSchema);
  }
  return toTypedSchema(editCustomerSchema);
});

async function handleSubmit(
  values: any,
  { setFieldError }: { setFieldError: (field: string, message: string) => void }
) {
  if (props.mode === "create") {
    const payload: CreateCustomerPayload = {
      l_name: values.l_name,
    };

    // Add optional fields only if they have values
    if (values.phone) payload.phone = values.phone;
    if (values.email) payload.email = values.email;
    if (values.address1) payload.address1 = values.address1;
    if (values.address2) payload.address2 = values.address2;
    if (values.city) payload.city = values.city;
    if (values.state) payload.state = values.state;
    if (values.zip) payload.zip = values.zip;
    if (values.country) payload.country = values.country;
    if (values.in_level) payload.in_level = values.in_level;
    if (values.inactive !== undefined) payload.inactive = values.inactive;

    // Resolve project_id query param for superadmin
    const projectId = isSuperAdmin.value && selectedProjectId.value !== null
      ? selectedProjectId.value
      : undefined;

    await useApiCall({
      fn: () => customersApi.create(payload, projectId),
      successMessage: 'Customer created successfully',
      errorMessage: 'Failed to Create Customer',
      showSuccess: true,
      loading,
      toast,
      onSuccess: () => {
        emit('success');
        isVisible.value = false;
      },
      onError: (error) => {
        handleValidationErrors(error, setFieldError);
      },
    });
  } else {
    // Edit mode: only send changed fields
    if (!customerData.value) {
      toast.showError("Customer data not loaded", "Error");
      return;
    }

    const payload: UpdateCustomerPayload = {};
    const c = customerData.value;

    // Check for changes
    if (values.l_name !== (c.l_name || "")) payload.l_name = values.l_name;
    if (values.phone !== (c.phone || "")) payload.phone = values.phone;
    if (values.email !== (c.email || "")) payload.email = values.email;
    if (values.address1 !== (c.address1 || "")) payload.address1 = values.address1;
    if (values.address2 !== (c.address2 || "")) payload.address2 = values.address2;
    if (values.city !== (c.city || "")) payload.city = values.city;
    if (values.state !== (c.state || "")) payload.state = values.state;
    if (values.zip !== (c.zip || "")) payload.zip = values.zip;
    if (values.country !== (c.country || "")) payload.country = values.country;
    if (values.in_level !== (c.in_level || "")) payload.in_level = values.in_level;
    if (values.inactive !== (c.inactive ?? false)) payload.inactive = values.inactive;

    // Only send PATCH if there are changes
    if (Object.keys(payload).length === 0) {
      toast.showInfo("No changes to save");
      return;
    }

    // Resolve project_id query param for superadmin
    const projectId = isSuperAdmin.value && selectedProjectId.value !== null
      ? selectedProjectId.value
      : undefined;

    await useApiCall({
      fn: () => customersApi.update(c.id, payload, projectId),
      successMessage: 'Customer updated successfully',
      errorMessage: 'Failed to Update Customer',
      showSuccess: true,
      loading,
      toast,
      onSuccess: () => {
        emit('success');
        isVisible.value = false;
      },
      onError: (error) => {
        handleValidationErrors(error, setFieldError);
      },
    });
  }
}

function handleValidationErrors(error: unknown, setFieldError: (field: string, message: string) => void) {
  if (error instanceof ValidationError && error.fields) {
    const errorMessages: string[] = [];

    Object.keys(error.fields).forEach((field) => {
      const fieldErrors = error.fields![field];
      if (fieldErrors && Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        // Set field error for inline display
        setFieldError(field, fieldErrors.join(", "));

        // Collect ALL error messages for toast
        const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        fieldErrors.forEach(errorMsg => {
          errorMessages.push(`${fieldLabel}: ${errorMsg}`);
        });
      }
    });

    // Show all errors in a toast
    if (errorMessages.length > 0) {
      toast.add({
        severity: "warn",
        summary: "Validation Error",
        detail: errorMessages.join('\n'),
        life: 6000,
        closable: true,
      });
    }
  }
}
</script>

<style scoped>
.customer-form {
  padding: 0.25rem 0 0;
}

.field-label {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  display: block;
}

.required {
  color: var(--color-status-error);
}

.section-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.text-color-secondary {
  color: var(--color-text-secondary);
}

.loading-state {
  padding: 3rem 2rem;
}
</style>
