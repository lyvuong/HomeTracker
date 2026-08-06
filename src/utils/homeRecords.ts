import type { MaintenanceCategory, MaintenanceSubcategory, Home } from '../types';

/**
 * The namespaced category string every app on the shared ledger writes, so
 * each one can pick its own rows out of a household's combined ledger:
 * "Home - Utilities - Electricity - Main House", or "Home - Roofing - Main
 * House" when the category has no subcategory. The subcategory sits directly
 * after the category — the same hyphen concatenation ExpenseTracker uses and
 * CarTracker uses for the vehicle.
 */
export const buildTransactionCategory = (
  category: MaintenanceCategory,
  home: Home,
  subcategory?: MaintenanceSubcategory
): string =>
  ['Home', category, subcategory?.trim(), home.nickname].filter(Boolean).join(' - ');
