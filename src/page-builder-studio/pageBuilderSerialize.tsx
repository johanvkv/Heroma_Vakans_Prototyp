/**
 * Shared serialize / deserialize for the Page Builder design tree (Phase 2, Step 4).
 *
 * Previously `saveDraft` / `exportDesign` each had a VERBATIM copy of the serialize logic, and
 * `loadDraft` / `importDesign` each had a copy of the deserialize logic. The copies had drifted:
 * e.g. `loadDraft` dropped `stepperSteps`; `importDesign` dropped `buttonIcon`/`inputType`/… and
 * the tab `icon`; save/export disagreed on which active-state map to persist. These single
 * implementations are now the source of truth for all four call sites, and restore ALL fields.
 */
import React from 'react';
import { DroppedComponent } from './pageBuilderTypes';

/** Serialize one component to plain JSON (strips React elements). Recurses into every child list. */
export function serializeComponent(comp: DroppedComponent): any {
  return {
    id: comp.id,
    type: comp.type,
    name: comp.name,
    colSize: comp.colSize,
    buttonText: comp.buttonText,
    textContent: comp.textContent,
    title: comp.title,
    stepperData: comp.stepperData,
    gridData: comp.gridData,
    alignment: comp.alignment,
    sidebarAlignment: comp.sidebarAlignment,
    selectedMenuItem: comp.selectedMenuItem,
    children: comp.children ? comp.children.map(serializeComponent) : undefined,
    headerLeftChildren: comp.headerLeftChildren ? comp.headerLeftChildren.map(serializeComponent) : undefined,
    headerRightChildren: comp.headerRightChildren ? comp.headerRightChildren.map(serializeComponent) : undefined,
    detailChildrenByRow: comp.detailChildrenByRow ?
      Object.keys(comp.detailChildrenByRow).reduce((acc, key) => {
        acc[key] = comp.detailChildrenByRow![key].map(serializeComponent);
        return acc;
      }, {} as { [key: string]: any[] }) : undefined,
    accordionSections: comp.accordionSections ?
      comp.accordionSections.map(section => ({
        id: section.id,
        title: section.title,
        children: section.children.map(serializeComponent)
      })) : undefined,
    tabSections: comp.tabSections ?
      comp.tabSections.map(section => ({
        id: section.id,
        title: section.title,
        icon: section.icon,
        children: section.children.map(serializeComponent)
      })) : undefined,
    stepperSteps: comp.stepperSteps ?
      comp.stepperSteps.map(step => ({
        id: step.id,
        label: step.label,
        description: step.description,
        children: step.children.map(serializeComponent)
      })) : undefined,
    sidebarContent: comp.sidebarContent ?
      Object.keys(comp.sidebarContent).reduce((acc, key) => {
        acc[key] = comp.sidebarContent![key].map(serializeComponent);
        return acc;
      }, {} as { [key: string]: any[] }) : undefined,
    sidebarNavData: comp.sidebarNavData,
    gridFeatures: comp.gridFeatures,
    alertVariant: comp.alertVariant,
    alertMessage: comp.alertMessage,
    showAlertLink: comp.showAlertLink,
    buttonIcon: comp.buttonIcon,
    buttonIconPosition: comp.buttonIconPosition,
    segmentedButtonIcons: comp.segmentedButtonIcons,
    inputType: comp.inputType,
    inputWidth: comp.inputWidth
  };
}

export function serializeComponents(list: DroppedComponent[]): any[] {
  return (list || []).map(serializeComponent);
}

/** Placeholder element for a deserialized component (real rendering happens by type in the canvas). */
const createComponentElement = (type: string, name: string) => <div data-component-type={type}>{name}</div>;

/** Rebuild one component from plain JSON. Restores ALL fields (the union of the old copies). */
export function deserializeComponent(serialized: any): DroppedComponent {
  return {
    id: serialized.id,
    type: serialized.type,
    name: serialized.name,
    component: createComponentElement(serialized.type, serialized.name),
    colSize: serialized.colSize,
    buttonText: serialized.buttonText,
    textContent: serialized.textContent,
    title: serialized.title,
    stepperData: serialized.stepperData,
    gridData: serialized.gridData,
    alignment: serialized.alignment,
    sidebarAlignment: serialized.sidebarAlignment,
    selectedMenuItem: serialized.selectedMenuItem,
    children: serialized.children ? serialized.children.map(deserializeComponent) : undefined,
    headerLeftChildren: serialized.headerLeftChildren ? serialized.headerLeftChildren.map(deserializeComponent) : undefined,
    headerRightChildren: serialized.headerRightChildren ? serialized.headerRightChildren.map(deserializeComponent) : undefined,
    detailChildrenByRow: serialized.detailChildrenByRow ?
      Object.keys(serialized.detailChildrenByRow).reduce((acc, key) => {
        acc[key] = serialized.detailChildrenByRow[key].map(deserializeComponent);
        return acc;
      }, {} as { [key: string]: DroppedComponent[] }) : undefined,
    accordionSections: serialized.accordionSections ?
      serialized.accordionSections.map((section: any) => ({
        id: section.id,
        title: section.title,
        children: section.children.map(deserializeComponent)
      })) : undefined,
    tabSections: serialized.tabSections ?
      serialized.tabSections.map((section: any) => ({
        id: section.id,
        title: section.title,
        icon: section.icon,
        children: section.children.map(deserializeComponent)
      })) : undefined,
    stepperSteps: serialized.stepperSteps ?
      serialized.stepperSteps.map((step: any) => ({
        id: step.id,
        label: step.label,
        description: step.description,
        children: step.children.map(deserializeComponent)
      })) : undefined,
    sidebarContent: serialized.sidebarContent ?
      Object.keys(serialized.sidebarContent).reduce((acc, key) => {
        acc[key] = serialized.sidebarContent[key].map(deserializeComponent);
        return acc;
      }, {} as { [key: string]: DroppedComponent[] }) : undefined,
    sidebarNavData: serialized.sidebarNavData,
    gridFeatures: serialized.gridFeatures,
    alertVariant: serialized.alertVariant,
    alertMessage: serialized.alertMessage,
    showAlertLink: serialized.showAlertLink,
    buttonIcon: serialized.buttonIcon,
    buttonIconPosition: serialized.buttonIconPosition,
    segmentedButtonIcons: serialized.segmentedButtonIcons,
    inputType: serialized.inputType,
    inputWidth: serialized.inputWidth
  };
}

export function deserializeComponents(list: any[]): DroppedComponent[] {
  return (list || []).map(deserializeComponent);
}
