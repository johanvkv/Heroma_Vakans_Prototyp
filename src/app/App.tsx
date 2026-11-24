import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/fonts.css";
import "@/styles/globals.css";
import "@/styles/css-variables.css";
import "@/styles/overrides.css";
import "@/styles/user-profile-panel.css";
import "@/styles/interface-customization.css";
import "devextreme/dist/css/dx.light.css";
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { RoleProvider } from './components/RoleContext';
import { PrototypeLogin } from './components/PrototypeLogin';
import { FeedbackOverlay } from './feedback/FeedbackOverlay';

/**
 * ROOT APP COMPONENT
 *
 * STRUCTURE:
 * - RouterProvider: Handles routing for all pages
 * - Layout: Contains persistent Header and SubHeader (used in each route)
 * - MainContent: Contains editable dashboard content (SAFE TO MODIFY)
 *
 * When remixing this template, edit the MainContent component to customize your dashboard.
 * The Header and SubHeader will remain persistent across all pages.
 */
export default function App() {
  return (
    <PrototypeLogin>
      <RoleProvider>
        <RouterProvider router={router} />
        <FeedbackOverlay />
      </RoleProvider>
    </PrototypeLogin>
  );
}
