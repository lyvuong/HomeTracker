import type { MaintenanceCategory, MaintenanceSubcategory, MaintenanceType } from '../types';

export const CATEGORIES: MaintenanceCategory[] = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Roofing',
  'Appliances',
  'Landscaping & Lawn',
  'Pest Control',
  'Painting',
  'Flooring',
  'Windows & Doors',
  'Foundation & Structural',
  'Renovation',
  'Inspection',
  'Utilities',
  'General Repair',
  'Property Tax',
  'Mortgage',
  'Homeowners Insurance',
  'HOA Fees',
  'Home Warranty',
  'Other'
];

/**
 * Optional second level, per category. Only Utilities has one today: a
 * utility bill is a recurring cost where "which utility" is the thing you
 * actually want to slice by, unlike a one-off roof repair. Picking one is
 * never required, so "Home - Utilities - Main House" stays valid and every
 * record written before this keeps working.
 */
export const SUBCATEGORIES: Partial<Record<MaintenanceCategory, MaintenanceSubcategory[]>> = {
  'Utilities': [
    'Electricity',
    'Water',
    'Natural Gas',
    'Sewer',
    'Trash & Recycling',
    'Internet',
    'Phone & Mobile',
    'Propane & Heating Oil',
    'Solar'
  ]
};

export const getSubcategories = (category: MaintenanceCategory): MaintenanceSubcategory[] =>
  SUBCATEGORIES[category] || [];

export const TYPES: MaintenanceType[] = ['Maintenance', 'Repair', 'Upgrade', 'Inspection', 'Expense'];

export const CATEGORY_COLORS: Record<string, string> = {
  'HVAC': '#0284c7',
  'Plumbing': '#ef4444',
  'Electrical': '#f59e0b',
  'Roofing': '#8b5cf6',
  'Appliances': '#10b981',
  'Landscaping & Lawn': '#84cc16',
  'Pest Control': '#ec4899',
  'Painting': '#06b6d4',
  'Flooring': '#6366f1',
  'Windows & Doors': '#f97316',
  'Foundation & Structural': '#64748b',
  'Renovation': '#14b8a6',
  'Inspection': '#a3e635',
  'Utilities': '#38bdf8',
  'General Repair': '#f97316',
  'Property Tax': '#eab308',
  'Mortgage': '#d946ef',
  'Homeowners Insurance': '#22c55e',
  'HOA Fees': '#fb7185',
  'Home Warranty': '#0ea5e9',
  'Other': '#94a3b8'
};

export const TYPE_COLORS: Record<string, string> = {
  'Maintenance': '#34d399',
  'Repair': '#f87171',
  'Upgrade': '#c084fc',
  'Inspection': '#a3e635',
  'Expense': '#fbbf24'
};
