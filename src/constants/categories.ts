import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Banknote,
  Landmark,
  Zap,
  ShieldCheck,
  Wrench,
  Hammer,
  Sofa,
  Sparkles,
  Sun,
  FileCheck,
  Flame,
  Droplets,
  Recycle,
  Wifi,
  Tv,
  ShowerHead,
  Fan,
  Bug,
  Sprout,
  PaintRoller,
  Grid3x3,
  Refrigerator,
  Trees,
  Truck,
  GraduationCap,
  Scale,
  Key,
  Building2,
  FileSignature,
  FileText,
  Plug,
  HelpCircle,
  Thermometer,
  Layers,
  Shield
} from 'lucide-react';
import type { Target, MaintenanceCategory, MaintenanceSubcategory, MaintenanceType, TaxonomyOverrideDoc } from '../types';
import { TARGETS } from '../types';

export { TARGETS };

/**
 * Standard Property Taxonomy aligned 1:1 with Statements PWA
 */
export const CATEGORY_TAXONOMY: Record<Target, Record<string, string[]>> = {
  'Property': {
    'Mortgage & Rent': ['Mortgage Payment', 'Rent Payment', 'HOA / Condo Fees'],
    'Tax': ['Property Tax', 'School District Tax', 'Special Assessment', 'County & City Tax', 'Transfer Tax', 'Supplemental Property Tax'],
    'Utilities': ['Electricity', 'Natural Gas', 'Water & Sewer', 'Trash & Recycling', 'Internet', 'Cable / Streaming'],
    'Insurance': ['Homeowners Insurance', 'Renters Insurance', 'Flood Insurance', 'Home Warranty'],
    'Maintenance & Repairs': ['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Pest Control', 'General Handyman'],
    'Improvements & Renovations': ['Remodeling', 'Landscaping', 'Painting', 'Flooring'],
    'Furnishings & Appliances': ['Furniture', 'Major Appliances', 'Home Decor', 'Small Appliances'],
    'Services': ['Cleaning Service', 'Lawn Care', 'Security System', 'Moving Services', 'Mailbox Rental'],
    'Solar': ['SREC']
  }
};

export const PROPERTY_TAXONOMY = CATEGORY_TAXONOMY['Property'];

export const CATEGORIES: MaintenanceCategory[] = Object.keys(PROPERTY_TAXONOMY);

export const SUBCATEGORIES: Record<string, MaintenanceSubcategory[]> = PROPERTY_TAXONOMY;

export const TYPES: MaintenanceType[] = ['Maintenance', 'Repair', 'Upgrade', 'Inspection', 'Expense'];

export const COLOR_STYLES: Record<string, { text: string; icon: string; bg: string; border: string; bgSolid: string; hex: string }> = {
  blue: { text: 'text-blue-500 dark:text-blue-300', icon: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30', bgSolid: 'bg-blue-500/20', hex: '#3b82f6' },
  orange: { text: 'text-orange-500 dark:text-orange-300', icon: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', bgSolid: 'bg-orange-500/20', hex: '#f97316' },
  teal: { text: 'text-teal-500 dark:text-teal-300', icon: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-500/30', bgSolid: 'bg-teal-500/20', hex: '#14b8a6' },
  emerald: { text: 'text-emerald-500 dark:text-emerald-300', icon: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', bgSolid: 'bg-emerald-500/20', hex: '#10b981' },
  amber: { text: 'text-amber-500 dark:text-amber-300', icon: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', bgSolid: 'bg-amber-500/20', hex: '#f59e0b' },
  sky: { text: 'text-sky-500 dark:text-sky-300', icon: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/30', bgSolid: 'bg-sky-500/20', hex: '#0284c7' },
  purple: { text: 'text-purple-500 dark:text-purple-300', icon: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', bgSolid: 'bg-purple-500/20', hex: '#a855f7' },
  pink: { text: 'text-pink-500 dark:text-pink-300', icon: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/15', border: 'border-pink-500/30', bgSolid: 'bg-pink-500/20', hex: '#ec4899' },
  indigo: { text: 'text-indigo-500 dark:text-indigo-300', icon: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', bgSolid: 'bg-indigo-500/20', hex: '#6366f1' },
  rose: { text: 'text-rose-500 dark:text-rose-300', icon: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', bgSolid: 'bg-rose-500/20', hex: '#f43f5e' },
  violet: { text: 'text-violet-500 dark:text-violet-300', icon: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30', bgSolid: 'bg-violet-500/20', hex: '#8b5cf6' },
  fuchsia: { text: 'text-fuchsia-500 dark:text-fuchsia-300', icon: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-500/30', bgSolid: 'bg-fuchsia-500/20', hex: '#d946ef' }
};

export interface TargetTaxonomyMeta {
  icon: LucideIcon;
  color: keyof typeof COLOR_STYLES;
  label: string;
}

export const TARGET_META: Record<Target, TargetTaxonomyMeta> = {
  'Property': { icon: Home, color: 'blue', label: 'Property' }
};

export interface TaxonomyMeta {
  icon: LucideIcon;
  colorName: keyof typeof COLOR_STYLES;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  taxGuidance?: string;
}

export const CATEGORY_META: Record<string, TaxonomyMeta> = {
  'Mortgage & Rent': {
    icon: Banknote,
    colorName: 'emerald',
    hex: '#10b981',
    bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    taxGuidance: 'Interest portion is deductible on Schedule A (Itemized) or 100% on Schedule E for rental properties.'
  },
  'Tax': {
    icon: Landmark,
    colorName: 'blue',
    hex: '#3b82f6',
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/20',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-600 dark:text-blue-400',
    taxGuidance: 'Property taxes deductible up to $10,000 SALT limit on Schedule A, or 100% on Schedule E for rentals.'
  },
  'Utilities': {
    icon: Zap,
    colorName: 'amber',
    hex: '#f59e0b',
    bgClass: 'bg-amber-500/15 dark:bg-amber-500/20',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-600 dark:text-amber-400',
    taxGuidance: '100% deductible for rental properties (Schedule E) or prorated for home office (Schedule C).'
  },
  'Insurance': {
    icon: ShieldCheck,
    colorName: 'sky',
    hex: '#0284c7',
    bgClass: 'bg-sky-500/15 dark:bg-sky-500/20',
    borderClass: 'border-sky-500/30',
    textClass: 'text-sky-600 dark:text-sky-400',
    taxGuidance: 'Deductible for rental properties on Schedule E or home office prorated; non-deductible for personal primary home.'
  },
  'Maintenance & Repairs': {
    icon: Wrench,
    colorName: 'orange',
    hex: '#f97316',
    bgClass: 'bg-orange-500/15 dark:bg-orange-500/20',
    borderClass: 'border-orange-500/30',
    textClass: 'text-orange-600 dark:text-orange-400',
    taxGuidance: 'Current year expense for rentals/office. Maintains property in normal operating condition.'
  },
  'Improvements & Renovations': {
    icon: Hammer,
    colorName: 'purple',
    hex: '#a855f7',
    bgClass: 'bg-purple-500/15 dark:bg-purple-500/20',
    borderClass: 'border-purple-500/30',
    textClass: 'text-purple-600 dark:text-purple-400',
    taxGuidance: 'Capital improvement: adds to property basis (reduces capital gains on sale) or depreciable over 27.5 yrs for rentals.'
  },
  'Furnishings & Appliances': {
    icon: Sofa,
    colorName: 'pink',
    hex: '#ec4899',
    bgClass: 'bg-pink-500/15 dark:bg-pink-500/20',
    borderClass: 'border-pink-500/30',
    textClass: 'text-pink-600 dark:text-pink-400',
    taxGuidance: 'Eligible for Section 179 / bonus depreciation or 5-7 year MACRS for income properties.'
  },
  'Services': {
    icon: Sparkles,
    colorName: 'teal',
    hex: '#14b8a6',
    bgClass: 'bg-teal-500/15 dark:bg-teal-500/20',
    borderClass: 'border-teal-500/30',
    textClass: 'text-teal-600 dark:text-teal-400',
    taxGuidance: 'Deductible operating expense for rental properties or qualifying home office.'
  },
  'Solar': {
    icon: Sun,
    colorName: 'amber',
    hex: '#eab308',
    bgClass: 'bg-amber-500/15 dark:bg-amber-500/20',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-600 dark:text-amber-400',
    taxGuidance: 'Federal clean energy tax credits (IRC 25D) & SREC income reporting.'
  },
  // Legacy / fallback categories for backward compatibility
  'HVAC': { icon: Thermometer, colorName: 'orange', hex: '#f97316', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', textClass: 'text-orange-500' },
  'Plumbing': { icon: Droplets, colorName: 'blue', hex: '#0284c7', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-500' },
  'Electrical': { icon: Zap, colorName: 'amber', hex: '#f59e0b', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', textClass: 'text-amber-500' },
  'Roofing': { icon: Home, colorName: 'purple', hex: '#8b5cf6', bgClass: 'bg-purple-500/15', borderClass: 'border-purple-500/30', textClass: 'text-purple-500' },
  'Appliances': { icon: Refrigerator, colorName: 'emerald', hex: '#10b981', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-500' },
  'Landscaping & Lawn': { icon: Trees, colorName: 'emerald', hex: '#84cc16', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-500' },
  'Pest Control': { icon: Bug, colorName: 'rose', hex: '#ec4899', bgClass: 'bg-rose-500/15', borderClass: 'border-rose-500/30', textClass: 'text-rose-500' },
  'Painting': { icon: PaintRoller, colorName: 'teal', hex: '#06b6d4', bgClass: 'bg-teal-500/15', borderClass: 'border-teal-500/30', textClass: 'text-teal-500' },
  'Flooring': { icon: Layers, colorName: 'indigo', hex: '#6366f1', bgClass: 'bg-indigo-500/15', borderClass: 'border-indigo-500/30', textClass: 'text-indigo-500' },
  'Windows & Doors': { icon: Home, colorName: 'amber', hex: '#f97316', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', textClass: 'text-amber-500' },
  'Foundation & Structural': { icon: Home, colorName: 'sky', hex: '#64748b', bgClass: 'bg-slate-500/15', borderClass: 'border-slate-500/30', textClass: 'text-slate-500' },
  'Renovation': { icon: Hammer, colorName: 'purple', hex: '#14b8a6', bgClass: 'bg-purple-500/15', borderClass: 'border-purple-500/30', textClass: 'text-purple-500' },
  'Inspection': { icon: FileCheck, colorName: 'emerald', hex: '#a3e635', bgClass: 'bg-lime-500/15', borderClass: 'border-lime-500/30', textClass: 'text-lime-500' },
  'General Repair': { icon: Wrench, colorName: 'orange', hex: '#f97316', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', textClass: 'text-orange-500' },
  'Property Tax': { icon: Landmark, colorName: 'blue', hex: '#eab308', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-500' },
  'Mortgage': { icon: Banknote, colorName: 'emerald', hex: '#d946ef', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-500' },
  'Homeowners Insurance': { icon: ShieldCheck, colorName: 'sky', hex: '#22c55e', bgClass: 'bg-sky-500/15', borderClass: 'border-sky-500/30', textClass: 'text-sky-500' },
  'HOA Fees': { icon: Banknote, colorName: 'pink', hex: '#fb7185', bgClass: 'bg-pink-500/15', borderClass: 'border-pink-500/30', textClass: 'text-pink-500' },
  'Home Warranty': { icon: Shield, colorName: 'sky', hex: '#0ea5e9', bgClass: 'bg-sky-500/15', borderClass: 'border-sky-500/30', textClass: 'text-sky-500' },
  'Other': { icon: HelpCircle, colorName: 'sky', hex: '#94a3b8', bgClass: 'bg-slate-500/15', borderClass: 'border-slate-500/30', textClass: 'text-slate-500' }
};

export const SUBCATEGORY_ICONS: Record<string, LucideIcon> = {
  // Property — Mortgage & Rent
  'Mortgage Payment': Landmark,
  'Rent Payment': Key,
  'HOA / Condo Fees': Building2,
  // Property — Tax
  'Property Tax': Landmark,
  'School District Tax': GraduationCap,
  'Special Assessment': Scale,
  'County & City Tax': Building2,
  'Transfer Tax': FileSignature,
  'Supplemental Property Tax': FileText,
  // Property — Utilities
  'Electricity': Plug,
  'Natural Gas': Flame,
  'Water & Sewer': Droplets,
  'Trash & Recycling': Recycle,
  'Internet': Wifi,
  'Cable / Streaming': Tv,
  // Property — Insurance
  'Homeowners Insurance': ShieldCheck,
  'Renters Insurance': ShieldCheck,
  'Flood Insurance': ShieldCheck,
  'Home Warranty': Shield,
  // Property — Maintenance & Repairs
  'Plumbing': ShowerHead,
  'Electrical': Zap,
  'HVAC': Fan,
  'Roofing': Home,
  'Pest Control': Bug,
  'General Handyman': Wrench,
  // Property — Improvements & Renovations
  'Remodeling': Hammer,
  'Landscaping': Sprout,
  'Painting': PaintRoller,
  'Flooring': Grid3x3,
  // Property — Furnishings & Appliances
  'Furniture': Sofa,
  'Major Appliances': Refrigerator,
  'Home Decor': Sparkles,
  'Small Appliances': Zap,
  // Property — Services
  'Cleaning Service': Sparkles,
  'Lawn Care': Trees,
  'Security System': ShieldCheck,
  'Moving Services': Truck,
  'Mailbox Rental': Landmark,
  // Property — Solar
  'SREC': Sun
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Mortgage & Rent': '#10b981',
  'Tax': '#3b82f6',
  'Utilities': '#f59e0b',
  'Insurance': '#0284c7',
  'Maintenance & Repairs': '#f97316',
  'Improvements & Renovations': '#a855f7',
  'Furnishings & Appliances': '#ec4899',
  'Services': '#14b8a6',
  'Solar': '#eab308',
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

/**
 * Returns effective category→subcategory map for Property target
 */
export const buildEffectiveTaxonomyForTarget = (
  target: Target = 'Property',
  overrideDoc?: TaxonomyOverrideDoc | null
): Record<string, string[]> => {
  const base = CATEGORY_TAXONOMY['Property'] || {};
  const override = overrideDoc?.[target] || overrideDoc?.['Property'];
  if (!override) return base;

  const deletedCategories = new Set(
    (override.deleted || []).filter(k => !k.includes('::'))
  );
  const deletedSubcategories = new Set(
    (override.deleted || []).filter(k => k.includes('::'))
  );

  const merged: Record<string, string[]> = {};
  for (const [cat, subs] of Object.entries(base)) {
    if (deletedCategories.has(cat)) continue;
    const filteredSubs = subs.filter(s => !deletedSubcategories.has(`${cat}::${s}`));
    merged[cat] = filteredSubs;
  }

  for (const [cat, subs] of Object.entries(override.categories || {})) {
    if (deletedCategories.has(cat)) continue;
    const existing = merged[cat] || [];
    const newSubs = subs.filter(
      s => !deletedSubcategories.has(`${cat}::${s}`) && !existing.includes(s)
    );
    merged[cat] = [...existing, ...newSubs];
  }

  return merged;
};

export const getEffectiveCategoriesForTarget = (
  target: Target = 'Property',
  overrideDoc?: TaxonomyOverrideDoc | null
): string[] => {
  return Object.keys(buildEffectiveTaxonomyForTarget(target, overrideDoc));
};

export const getEffectiveSubcategoriesForTarget = (
  target: Target = 'Property',
  category: string,
  overrideDoc?: TaxonomyOverrideDoc | null
): string[] => {
  const taxonomy = buildEffectiveTaxonomyForTarget(target, overrideDoc);
  return taxonomy[category] || [];
};

/**
 * Backwards compatibility helpers
 */
export const buildEffectiveTaxonomy = (overrideDoc?: TaxonomyOverrideDoc | null): Record<string, string[]> => {
  return buildEffectiveTaxonomyForTarget('Property', overrideDoc);
};

export const getEffectiveCategories = (overrideDoc?: TaxonomyOverrideDoc | null): string[] => {
  return getEffectiveCategoriesForTarget('Property', overrideDoc);
};

export const getEffectiveSubcategories = (
  category: string,
  overrideDoc?: TaxonomyOverrideDoc | null
): string[] => {
  return getEffectiveSubcategoriesForTarget('Property', category, overrideDoc);
};

export const getSubcategories = (category: string, overrideDoc?: TaxonomyOverrideDoc | null): string[] => {
  return getEffectiveSubcategories(category, overrideDoc);
};

export const getTargetMeta = (target?: string | null): TargetTaxonomyMeta | null => {
  if (target === 'Property' || !target) {
    return TARGET_META['Property'];
  }
  return null;
};

export const getCategoryMeta = (category?: string | null): TaxonomyMeta => {
  if (category && CATEGORY_META[category]) {
    return CATEGORY_META[category];
  }
  return {
    icon: HelpCircle,
    colorName: 'sky',
    hex: '#94a3b8',
    bgClass: 'bg-slate-500/15 dark:bg-slate-500/20',
    borderClass: 'border-slate-500/30',
    textClass: 'text-slate-600 dark:text-slate-400'
  };
};

export const getSubcategoryIcon = (subcategory?: string | null): LucideIcon => {
  if (!subcategory) return Sparkles;
  return SUBCATEGORY_ICONS[subcategory] || Sparkles;
};
