/**
 * Parallel schema prototype.
 *
 * This deliberately renders the same Schema component as the production
 * schedule route. React creates a separate component instance, so all local
 * filters, dialogs and schedule changes are isolated from the original page.
 */
export { Schema as SchemaPrototype } from './Schema';
