import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/fonts.css";
import "@/styles/globals.css";
import "@/styles/css-variables.css";
import "@/styles/overrides.css";
import "@/styles/user-profile-panel.css";
import "@/styles/interface-customization.css";
import "devextreme/dist/css/dx.light.css";
import config from 'devextreme/core/config';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { RoleProvider } from './components/RoleContext';

// Configure DevExtreme license
config({
  licenseKey: 'ewogICJmb3JtYXQiOiAxLAogICJjdXN0b21lcklkIjogIjY3MDU1OTFlLTA5YTctNGU2Ny05ZDE2LTA3NDJiMGMwODc0MyIsCiAgIm1heFZlcnNpb25BbGxvd2VkIjogMjUyCn0=.BPxFdR9QD0IL3as1ylWdYPbWsyPFMbWcJDLRYFWgdUFv6wJofl5G3gP3Cxo6aNJP3+EZaJQKLeLcyPpyIleyexOz7yHpiYgHH+YOd766eM8+3qz5Iz7hJWAjte8umMoOoM44vA=='
});

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
    <RoleProvider>
      <RouterProvider router={router} />
    </RoleProvider>
  );
}
