// plugins/primevue.ts
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import Tooltip from "primevue/tooltip";
import { primePT } from "~/utils/prime-pt";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true,
    inputStyle: "outlined",
    pt: primePT, // Global Pass Through configuration
  });

  // Register services globally (Toast and ConfirmDialog)
  nuxtApp.vueApp.use(ToastService);
  nuxtApp.vueApp.use(ConfirmationService);

  // Register directives
  nuxtApp.vueApp.directive("tooltip", Tooltip);

  // Components will be imported locally where needed for better tree-shaking
});
