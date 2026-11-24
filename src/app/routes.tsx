import { createBrowserRouter, redirect } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/kommentarer/sammanstallning",
    loader: () => redirect("/vikariehantering/schema"),
  },
  {
    path: "/",
    lazy: async () => ({ Component: (await import("./pages/Dashboard")).Dashboard }),
  },
  {
    path: "/components",
    lazy: async () => ({ Component: (await import("./pages/Components")).Components }),
  },
  {
    path: "/ui-kit",
    lazy: async () => ({ Component: (await import("./pages/UiKitReference")).UiKitReference }),
  },
  {
    path: "/installningar/personer",
    lazy: async () => ({ Component: (await import("./pages/Personer")).Personer }),
  },
  {
    path: "/tid/schema",
    lazy: async () => ({ Component: (await import("./pages/Schema")).Schema }),
  },
  {
    path: "/tid/schema-prototyp",
    lazy: async () => ({ Component: (await import("./pages/SchemaPrototype")).SchemaPrototype }),
  },
  {
    path: "/vikariehantering/schema",
    lazy: async () => ({ Component: (await import("./pages/VikariehanteringSchema")).VikariehanteringSchema }),
  },
  {
    path: "/vikariehantering/installningar",
    lazy: async () => {
      const [{ VikariehanteringSettings }, { AutomationProvider }] = await Promise.all([
        import("./pages/VikariehanteringSettings"),
        import("./components/AutomationContext"),
      ]);
      return { Component: () => <AutomationProvider><VikariehanteringSettings /></AutomationProvider> };
    },
  },
  {
    path: "/vikariehantering/urvalstest",
    lazy: async () => ({ Component: (await import("./pages/VikarieUrvalTest")).VikarieUrvalTest }),
  },
  {
    path: "/vikariehantering/statistik",
    lazy: async () => ({ Component: (await import("./pages/StaffingAnalytics")).StaffingAnalytics }),
  },
  {
    path: "/vikariehantering/avdelningsvy",
    lazy: async () => ({ Component: (await import("./pages/DepartmentStaffingView")).DepartmentStaffingView }),
  },
]);
