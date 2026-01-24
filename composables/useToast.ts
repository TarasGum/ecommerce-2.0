// composables/useToast.ts
// Toast notification wrapper with error handling

import { useToast as usePrimeToast } from "primevue/usetoast";
import { getErrorMessage, getErrorSeverity } from "~/utils/errors";

export const useToast = () => {
  const toast = usePrimeToast();

  const showError = (error: unknown, summary?: string) => {
    const message = getErrorMessage(error);
    const severity = getErrorSeverity(error);

    toast.add({
      severity,
      summary: summary || "Error",
      detail: message,
      life: 5000,
      closable: true,
    });
  };

  const showSuccess = (message: string, summary?: string) => {
    toast.add({
      severity: "success",
      summary: summary || "Success",
      detail: message,
      life: 3000,
      closable: true,
    });
  };

  const showWarning = (message: string, summary?: string) => {
    toast.add({
      severity: "warn",
      summary: summary || "Warning",
      detail: message,
      life: 4000,
      closable: true,
    });
  };

  const showInfo = (message: string, summary?: string) => {
    toast.add({
      severity: "info",
      summary: summary || "Info",
      detail: message,
      life: 3000,
      closable: true,
    });
  };

  return {
    ...toast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
};
