<!-- components/profile/DangerZoneCard.vue -->
<template>
  <div class="info-card danger-card">
    <h3 class="info-card-title">Danger Zone</h3>

    <div class="flex flex-column gap-3">
      <!-- Deactivate Account -->
      <div class="flex flex-column gap-1">
        <span class="info-label">Deactivate Account</span>
        <span class="info-description">Temporarily disable your account. You can reactivate it later.</span>
        <div class="mt-2">
          <Button
            label="Deactivate Account"
            severity="secondary"
            outlined
            size="small"
            @click="openDeactivateDialog"
          />
        </div>
      </div>

      <!-- Delete Account -->
      <div class="flex flex-column gap-1">
        <span class="info-label">Delete Account</span>
        <span class="info-description">Permanently delete your account. This cannot be undone.</span>
        <div class="mt-2">
          <Button
            label="Delete Account"
            severity="secondary"
            outlined
            size="small"
            @click="openDeleteDialog"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Deactivate Account Dialog -->
  <Dialog
    v-model:visible="deactivateDialogVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-sm"
  >
    <template #header>
      <h2 class="modal-title">Deactivate Account</h2>
    </template>

    <div class="flex flex-column gap-4">
      <p class="dialog-description">
        Your account will be temporarily disabled. You won't be able to log in until an administrator reactivates your account.
      </p>
      <p class="dialog-description">
        Are you sure you want to deactivate your account?
      </p>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        severity="secondary"
        text
        :disabled="deactivateLoading"
        @click="deactivateDialogVisible = false"
      />
      <Button
        label="Deactivate"
        severity="warning"
        :loading="deactivateLoading"
        :disabled="deactivateLoading"
        @click="handleDeactivate"
      />
    </template>
  </Dialog>

  <!-- Delete Account Dialog -->
  <Dialog
    v-model:visible="deleteDialogVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-sm"
    @hide="resetDeleteForm"
  >
    <template #header>
      <h2 class="modal-title">Delete Account</h2>
    </template>

    <div class="flex flex-column gap-4">
      <p class="dialog-description dialog-description-danger">
        <strong>Warning:</strong> This action is permanent and cannot be undone. All your data will be permanently deleted.
      </p>

      <div class="flex flex-column gap-2">
        <label for="deleteConfirmation" class="field-label">
          Type <strong>DELETE MY ACCOUNT</strong> to confirm
        </label>
        <InputText
          id="deleteConfirmation"
          v-model="deleteConfirmation"
          placeholder="DELETE MY ACCOUNT"
          class="w-full"
          :class="{ 'p-invalid': deleteConfirmation && !isDeleteConfirmationValid }"
          :disabled="deleteLoading"
        />
        <small v-if="deleteConfirmation && !isDeleteConfirmationValid" class="p-error">
          Confirmation text does not match
        </small>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        severity="secondary"
        text
        :disabled="deleteLoading"
        @click="deleteDialogVisible = false"
      />
      <Button
        label="Delete Account"
        severity="danger"
        :loading="deleteLoading"
        :disabled="!isDeleteConfirmationValid || deleteLoading"
        @click="handleDelete"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { useAuthStore } from "~/stores/auth";

const DELETE_CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

const auth = useAuth();
const profileApi = useProfile();
const toast = useToast();
const router = useRouter();

// Deactivate state
const deactivateDialogVisible = ref(false);
const deactivateLoading = ref(false);

// Delete state
const deleteDialogVisible = ref(false);
const deleteConfirmation = ref("");
const deleteLoading = ref(false);

// Computed
const isDeleteConfirmationValid = computed(() => {
  return deleteConfirmation.value === DELETE_CONFIRMATION_TEXT;
});

// Dialog openers
function openDeactivateDialog() {
  deactivateDialogVisible.value = true;
}

function openDeleteDialog() {
  deleteDialogVisible.value = true;
}

// Form resetters
function resetDeleteForm() {
  deleteConfirmation.value = "";
}

// Handlers
async function handleDeactivate() {
  await useApiCall({
    fn: () => profileApi.deactivateAccount(),
    successMessage: "Account deactivated successfully",
    errorMessage: "Failed to deactivate account",
    showSuccess: true,
    loading: deactivateLoading,
    toast,
    onSuccess: async () => {
      deactivateDialogVisible.value = false;
      await auth.logout();
    },
  });
}

async function handleDelete() {
  if (!isDeleteConfirmationValid.value) {
    toast.showError("Please type the confirmation text exactly as shown");
    return;
  }

  await useApiCall({
    fn: () => profileApi.deleteAccount(),
    successMessage: "Account deleted successfully",
    errorMessage: "Failed to delete account",
    showSuccess: true,
    loading: deleteLoading,
    toast,
    onSuccess: async () => {
      deleteDialogVisible.value = false;
      const authStore = useAuthStore();
      authStore.clearAuth();
      
      const accessCookie = useCookie("auth.access");
      const refreshCookie = useCookie("auth.refresh");
      accessCookie.value = null;
      refreshCookie.value = null;
      
      await router.push("/login");
    },
  });
}
</script>

<style scoped>
.info-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  padding: 1.25rem;
}

.danger-card {
  border-color: var(--red-300);
}

.info-card-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
}

.info-label {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.info-description {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

/* Dialog styles */
.field-label {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.dialog-description {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.dialog-description-danger {
  color: var(--red-600);
}
</style>
