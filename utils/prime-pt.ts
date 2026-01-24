// utils/prime-pt.ts
// Global PrimeVue Pass Through configuration
// This adapts PrimeVue components to our design system

export const primePT = {
  password: {
    root: {
      style: {
        width: "100%",
        display: "block",
      },
    },
  },
  dropdown: {
    root: {
      style: {
        width: "100%",
        display: "inline-flex",
      },
    },
  },
  datatable: {
    root: {
      class: "p-datatable-clean",
    },
    header: {
      class: "p-datatable-header-clean",
    },
    wrapper: {
      style: {
        overflowX: "auto",
      },
    },
  },
  dialog: {
    root: {
      class: "p-dialog-modern",
    },
    header: {
      style: {
        padding: "1.5rem",
        borderBottom: "1px solid var(--color-border-light)",
      },
    },
    content: {
      style: {
        padding: "1.5rem",
      },
    },
  },
  selectbutton: {
    root: {
      style: {
        display: "flex",
        gap: "0.5rem",
      },
    },
  },
  tag: {
    root: {
      style: {
        fontSize: "0.75rem",
        fontWeight: "500",
        padding: "0.25rem 0.625rem",
        borderRadius: "6px",
      },
    },
  },
  inputswitch: {
    slider: {
      style: {
        background: "var(--color-neutral-400)",
      },
    },
  },
};
