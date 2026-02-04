<!-- pages/login.vue -->
<template>
  <div class="flex align-items-center justify-content-center login-container">
    <div ref="cardRef" class="login-card">
      <h1 ref="titleRef" class="heading-s mb-6">Login</h1>

      <Form @submit="handleLogin" :validation-schema="schema" class="w-full">
        <div class="flex flex-column gap-2 mb-4">
          <label for="email" class="field-label">Email</label>
          <Field v-slot="{ field, errorMessage }" name="email">
            <InputText
              id="email"
              v-bind="field"
              type="email"
              placeholder="Enter your email"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="email" class="p-error" />
        </div>

        <div class="flex flex-column gap-2 mb-6">
          <label for="password" class="field-label">Password</label>
          <Field v-slot="{ handleChange, value, errorMessage }" name="password">
            <div class="w-full relative">
              <Password
                id="password"
                :modelValue="value"
                @update:modelValue="handleChange"
                placeholder="Enter your password"
                :inputClass="errorMessage ? 'p-invalid' : ''"
                :feedback="false"
                toggleMask
              />
            </div>
          </Field>
          <ErrorMessage name="password" class="p-error" />
        </div>

        <Button
          type="submit"
          label="Login"
          severity="success"
          class="w-full"
          :loading="loading"
          :disabled="loading"
        />
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import { Form, Field, ErrorMessage, type FormActions } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useToast } from "~/composables/useToast";
import { ValidationError } from "~/utils/errors";
import { loginSchema } from "~/utils/validation";
import { useMotionPresets } from "~/composables/useMotion";

// Form values interface
interface LoginFormValues {
  email: string;
  password: string;
}

definePageMeta({
  layout: "auth",
  middleware: "redirect-if-authenticated",
});

const auth = useAuth();
const toast = useToast();
const { fadeInUp, scaleIn } = useMotionPresets();

// Motion refs
const cardRef = ref<HTMLElement>();
const titleRef = ref<HTMLElement>();

// Setup animations on mount
onMounted(async () => {
  // Setup animations using @vueuse/motion (only on client)
  if (process.client) {
    try {
      const { useMotion } = await import("@vueuse/motion");
      if (cardRef.value) {
        useMotion(cardRef, scaleIn);
      }
      if (titleRef.value) {
        useMotion(titleRef, fadeInUp);
      }
    } catch (error) {
      // Motion library not available, log and continue
      console.warn("Failed to load motion library:", error);
    }
  }
});

const loading = ref(false);

// Zod schema for VeeValidate
const schema = toTypedSchema(loginSchema);

async function handleLogin(values: any, actions: any) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/daded37d-1917-4bfe-ab38-248d8de3a39a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.vue:108',message:'handleLogin called',data:{email:values.email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const { setFieldError } = actions as FormActions<LoginFormValues>;
  const formValues = values as LoginFormValues;

  await useApiCall({
    fn: () => auth.login(formValues.email, formValues.password),
    successMessage: "Logged in successfully",
    errorMessage: "Login Failed",
    showSuccess: true,
    loading,
    toast,
    onError: (error) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/daded37d-1917-4bfe-ab38-248d8de3a39a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.vue:119',message:'Login error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Handle server-side validation errors
      handleLoginValidationErrors(error, setFieldError);
    },
  });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/daded37d-1917-4bfe-ab38-248d8de3a39a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.vue:124',message:'handleLogin completed',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
}

function handleLoginValidationErrors(error: unknown, setFieldError: any) {
  if (error instanceof ValidationError && error.fields) {
    const errorMessages: string[] = [];

    // Set field errors in VeeValidate form
    Object.keys(error.fields).forEach((field) => {
      const fieldErrors = error.fields![field];
      if (fieldErrors && Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        // Map API field names to form field names
        if (field === "email" || field === "password") {
          setFieldError(field, fieldErrors.join(", "));
          // Collect errors for toast
          const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
          fieldErrors.forEach((errorMsg) => {
            errorMessages.push(`${fieldLabel}: ${errorMsg}`);
          });
        } else if (field === "non_field_errors") {
          // Show non-field errors as toast
          fieldErrors.forEach((errorMsg) => {
            errorMessages.push(errorMsg);
          });
        }
      }
    });

    // Show all errors in toast
    if (errorMessages.length > 0) {
      toast.add({
        severity: "warn",
        summary: "Login Failed",
        detail: errorMessages.join("\n"),
        life: 5000,
        closable: true,
      });
    }
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  padding: var(--spacing-8);
  background: var(--color-bg-secondary);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-9);
  box-shadow: var(--shadow-lg);
  /* Initial state for animation - prevents flash of content */
  opacity: 0;
  transform: scale(0.95);
}

.login-card h1 {
  /* Initial state for animation - prevents flash of content */
  opacity: 0;
  transform: translateY(20px);
}

.field-label {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}
</style>
