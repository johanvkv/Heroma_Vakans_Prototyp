import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Components } from "./pages/Components";
import { UiKitReference } from "./pages/UiKitReference";
import { Personer } from "./pages/Personer";
import { Schema } from "./pages/Schema";

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
]);
