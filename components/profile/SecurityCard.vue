<!-- components/profile/SecurityCard.vue -->
<template>
  <div class="info-card">
    <h3 class="info-card-title">Security</h3>
    <p class="info-description">
      Keep your account secure by using a strong password.
    </p>
    <Button
      label="Change Password"
      icon="pi pi-lock"
      severity="secondary"
      outlined
      size="small"
      @click="openDialog"
    />
  </div>

  <!-- Change Password Dialog -->
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-sm"
    @hide="resetForm"
  >
    <template #header>
      <h2 class="modal-title">Change Password</h2>
    </template>

    <Form
      ref="formRef"
      @submit="handleSubmit"
      :validation-schema="schema"
      class="flex flex-column gap-4"
    >
      <!-- Current Password -->
      <div class="flex flex-column gap-2">
        <label for="old_password" class="field-label">Current Password</label>
        <Field v-slot="{ handleChange, value, errorMessage }" name="old_password">
          <Password
            id="old_password"
            :modelValue="value"
            @update:modelValue="handleChange"
            placeholder="Enter current password"
            :feedback="false"
            toggleMask
            :inputClass="errorMessage ? 'p-invalid' : ''"
            :disabled="loading"
          />
        </Field>
        <ErrorMessage name="old_password" class="p-error" />
      </div>

      <!-- New Password -->
      <div class="flex flex-column gap-2">
        <label for="new_password" class="field-label">New Password</label>
        <Field v-slot="{ handleChange, value, errorMessage }" name="new_password">
          <Password
            id="new_password"
            :modelValue="value"
            @update:modelValue="handleChange"
            placeholder="Enter new password"
            :feedback="false"
            toggleMask
            :inputClass="errorMessage ? 'p-invalid' : ''"
            :disabled="loading"
          />
        </Field>
        <ErrorMessage name="new_password" class="p-error" />
      </div>

      <!-- Confirm New Password -->
      <div class="flex flex-column gap-2">
        <label for="new_password_confirm" class="field-label">Confirm New Password</label>
        <Field v-slot="{ handleChange, value, errorMessage }" name="new_password_confirm">
          <Password
            id="new_password_confirm"
            :modelValue="value"
            @update:modelValue="handleChange"
            placeholder="Confirm new password"
            :feedback="false"
            toggleMask
            :inputClass="errorMessage ? 'p-invalid' : ''"
            :disabled="loading"
          />
        </Field>
        <ErrorMessage name="new_password_confirm" class="p-error" />
      </div>

      <!-- Hidden submit button for form submission -->
      <button type="submit" style="display: none;"></button>
    </Form>

    <template #footer>
      <Button
        label="Cancel"
        severity="secondary"
        text
        :disabled="loading"
        @click="dialogVisible = false"
      />
      <Button
        label="Change Password"
        severity="primary"
        :loading="loading"
        :disabled="loading"
        @click="submitForm"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Password from "primevue/password";
import { Form, Field, ErrorMessage } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { changePasswordSchema } from "~/utils/validation";
import { ValidationError } from "~/utils/errors";

const profileApi = useProfile();
const toast = useToast();

const dialogVisible = ref(false);
const loading = ref(false);
const formRef = ref<InstanceType<typeof Form> | null>(null);

// Zod schema for VeeValidate
const schema = toTypedSchema(changePasswordSchema);

function openDialog() {
  dialogVisible.value = true;
}

function resetForm() {
  formRef.value?.resetForm();
}

function submitForm() {
  // Trigger form submission
  formRef.value?.$el.querySelector('button[type="submit"]')?.click();
}

async function handleSubmit(
  values: any,
  { setFieldError }: { setFieldError: (field: string, message: string) => void }
) {
  loading.value = true;
  
  try {
    await profileApi.changePassword({
      old_password: values.old_password,
      new_password: values.new_password,
      new_password_confirm: values.new_password_confirm,
    });
    
    toast.showSuccess("Password changed successfully");
    dialogVisible.value = false;
    resetForm();
  } catch (error) {
    // Handle server-side validation errors
    if (error instanceof ValidationError && error.fields) {
      let hasFieldErrors = false;
      Object.keys(error.fields).forEach((field) => {
        const fieldErrors = error.fields![field];
        if (fieldErrors && Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          setFieldError(field, fieldErrors.join(", "));
          hasFieldErrors = true;
        }
      });
      
      // Only show toast if no field-specific errors were set
      if (!hasFieldErrors) {
        toast.showError(error, "Failed to change password");
      }
    } else {
      toast.showError(error, "Failed to change password");
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.info-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  padding: 1.25rem;
}

.info-card-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.info-description {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
}

.field-label {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}
</style>
