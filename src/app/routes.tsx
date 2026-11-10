import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Components } from "./pages/Components";
import { UiKitReference } from "./pages/UiKitReference";
import { Personer } from "./pages/Personer";
import { Schema } from "./pages/Schema";
import { SchemaPrototype } from "./pages/SchemaPrototype";
import { VikarieUrvalTest } from "./pages/VikarieUrvalTest";
import { StaffingAnalytics } from "./pages/StaffingAnalytics";
import { DepartmentStaffingView } from "./pages/DepartmentStaffingView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/components",
    Component: Components,
  },
  {
    path: "/ui-kit",
    Component: UiKitReference,
  },
  {
    path: "/installningar/personer",
    Component: Personer,
  },
  {
    path: "/tid/schema",
    Component: Schema,
  },
  {
    path: "/tid/schema-prototyp",
    Component: SchemaPrototype,
  },
  {
    path: "/vikariehantering/urvalstest",
    Component: VikarieUrvalTest,
  },
  {
    path: "/vikariehantering/statistik",
    Component: StaffingAnalytics,
  },
  {
    path: "/vikariehantering/avdelningsvy",
    Component: DepartmentStaffingView,
  },
]);
