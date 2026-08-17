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

export interface TaxGuidance {
  /** Short summary of tax filing treatment/purpose */
  purpose: string;
  /** Relevant IRS Schedule or Form (e.g. Schedule A, Schedule C, Schedule E, Form 1040, Form 5695) */
  scheduleOrForm?: string;
  /** High level deductibility indicator */
  deductibleStatus?: 'deductible' | 'partial' | 'non-deductible' | 'capitalized' | 'taxable-income' | 'tax-credit';
  /**
   * Override guidance to show when the linked Property is confirmed NOT to be a rental/income
   * property — strips out the rental-only (Schedule E) treatment that wouldn't apply.
   */
  personalUse?: {
    purpose: string;
    scheduleOrForm?: string;
    deductibleStatus?: TaxGuidance['deductibleStatus'];
  };
}

/**
 * Resolves which variant of a guidance entry to display. When the linked property is known
 * (isRentalProperty is a boolean, not null/undefined) and is NOT a rental, swaps in the
 * personalUse variant if one is defined so rental-only treatment isn't shown as applicable.
 */
export const resolveTaxGuidance = (
  guidance: TaxGuidance | null | undefined,
  isRentalProperty?: boolean | null
): TaxGuidance | null => {
  if (!guidance) return null;
  if (isRentalProperty === false && guidance.personalUse) {
    const { personalUse, ...base } = guidance;
    return { ...base, ...personalUse };
  }
  return guidance;
};

export const CATEGORY_TAX_GUIDANCE: Record<string, TaxGuidance> = {
  'Mortgage & Rent': {
    purpose: 'Mortgage interest is itemized on Schedule A; rent is deductible for rentals (Schedule E) or home office (Schedule C).',
    scheduleOrForm: 'Schedule A / Schedule E',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Mortgage interest is itemized on Schedule A (Form 1098, up to $750k debt limit); rent paid for a personal residence is non-deductible.',
      scheduleOrForm: 'Schedule A Line 8a',
      deductibleStatus: 'partial'
    }
  },
  'Tax': {
    purpose: 'State & local real estate taxes itemized on Schedule A (SALT, $10k cap) or 100% deductible on Schedule E for rentals.',
    scheduleOrForm: 'Schedule A (SALT) / Schedule E',
    deductibleStatus: 'deductible',
    personalUse: {
      purpose: 'State & local real estate taxes itemized on Schedule A, subject to the $10k SALT cap.',
      scheduleOrForm: 'Schedule A Line 5b (SALT)',
      deductibleStatus: 'partial'
    }
  },
  'Utilities': {
    purpose: '100% deductible for rental properties (Schedule E) or prorated for home office (Schedule C); non-deductible for personal home.',
    scheduleOrForm: 'Schedule E / Schedule C',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal home, unless a portion qualifies for the home office deduction on Schedule C.',
      scheduleOrForm: 'Schedule C (Home Office)',
      deductibleStatus: 'non-deductible'
    }
  },
  'Insurance': {
    purpose: 'Hazard & flood insurance deductible on Schedule E for rentals; non-deductible for personal residence.',
    scheduleOrForm: 'Schedule E (Rentals)',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Maintenance & Repairs': {
    purpose: 'Current-year repairs to keep property in operating condition (Schedule E / Schedule C); distinct from capital improvements.',
    scheduleOrForm: 'Schedule E / Schedule C',
    deductibleStatus: 'deductible',
    personalUse: {
      purpose: 'Non-deductible for a personal residence; repairs only affect cost basis if part of a larger capital improvement.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Improvements & Renovations': {
    purpose: 'Capital expenditures added to cost basis (reduces future capital gains tax on sale) or depreciated on Schedule E.',
    scheduleOrForm: 'Cost Basis / Form 4562',
    deductibleStatus: 'capitalized',
    personalUse: {
      purpose: 'Capital expenditures added to cost basis, reducing future capital gains tax on sale; no current-year depreciation for a personal residence.',
      scheduleOrForm: 'Cost Basis',
      deductibleStatus: 'capitalized'
    }
  },
  'Furnishings & Appliances': {
    purpose: 'Depreciable assets (5-7 yr property, Section 179/MACRS) for rentals/offices; personal furniture is non-deductible.',
    scheduleOrForm: 'Schedule E / Form 4562',
    deductibleStatus: 'capitalized',
    personalUse: {
      purpose: 'Non-deductible personal furniture and appliances.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Services': {
    purpose: 'Property maintenance, cleaning, and security deductible on Schedule E (rentals) or Schedule C (business).',
    scheduleOrForm: 'Schedule E / Schedule C',
    deductibleStatus: 'deductible',
    personalUse: {
      purpose: 'Non-deductible for personal residence upkeep.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Solar': {
    purpose: 'Residential Clean Energy Credit (Form 5695, 30% tax credit); SREC sales reportable as taxable other income.',
    scheduleOrForm: 'Form 5695 / Form 1040',
    deductibleStatus: 'tax-credit'
  }
};

export const SUBCATEGORY_TAX_GUIDANCE: Record<string, TaxGuidance> = {
  // Property — Mortgage & Rent
  'Mortgage Payment': {
    purpose: 'Interest portion is deductible on Schedule A (Form 1098, up to $750k debt limit); principal is non-deductible.',
    scheduleOrForm: 'Schedule A Line 8a (Form 1098)',
    deductibleStatus: 'deductible'
  },
  'Rent Payment': {
    purpose: 'Non-deductible for personal home; 100% deductible on Schedule E (rental property) or Schedule C (home office).',
    scheduleOrForm: 'Schedule E Line 8 / Schedule C',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Rent paid for a personal residence is non-deductible.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'HOA / Condo Fees': {
    purpose: 'Non-deductible for personal residence; 100% deductible on Schedule E for rental properties.',
    scheduleOrForm: 'Schedule E Line 19',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },

  // Property — Tax
  'Property Tax': {
    purpose: 'State & local property taxes deductible on Schedule A (subject to $10k SALT cap) or 100% on Schedule E (rentals).',
    scheduleOrForm: 'Schedule A Line 5b (SALT) / Schedule E',
    deductibleStatus: 'deductible',
    personalUse: {
      purpose: 'Deductible on Schedule A, subject to the $10k SALT cap.',
      scheduleOrForm: 'Schedule A Line 5b (SALT)',
      deductibleStatus: 'partial'
    }
  },
  'School District Tax': {
    purpose: 'Local school taxes deductible under real estate taxes on Schedule A (SALT cap) or Schedule E.',
    scheduleOrForm: 'Schedule A Line 5b (SALT) / Schedule E',
    deductibleStatus: 'deductible',
    personalUse: {
      purpose: 'Deductible under real estate taxes on Schedule A, subject to the SALT cap.',
      scheduleOrForm: 'Schedule A Line 5b (SALT)',
      deductibleStatus: 'partial'
    }
  },
  'Special Assessment': {
    purpose: 'Local assessments for improvements (sidewalks, sewer lines) are added to property cost basis; maintenance assessments are deductible on Schedule E.',
    scheduleOrForm: 'Cost Basis / Schedule E',
    deductibleStatus: 'capitalized',
    personalUse: {
      purpose: 'Assessments for improvements are added to property cost basis; maintenance assessments are non-deductible for a personal residence.',
      scheduleOrForm: 'Cost Basis',
      deductibleStatus: 'capitalized'
    }
  },
  'County & City Tax': {
    purpose: 'County/municipal property taxes deductible on Schedule A (SALT limit) or Schedule E.',
    scheduleOrForm: 'Schedule A Line 5b / Schedule E',
    deductibleStatus: 'deductible',
    personalUse: {
      purpose: 'Deductible on Schedule A, subject to the SALT cap.',
      scheduleOrForm: 'Schedule A Line 5b',
      deductibleStatus: 'partial'
    }
  },
  'Transfer Tax': {
    purpose: 'Closing transfer taxes are added to purchase basis (lowers future capital gains) or subtracted from sale proceeds.',
    scheduleOrForm: 'Cost Basis / Form 8949',
    deductibleStatus: 'capitalized'
  },
  'Supplemental Property Tax': {
    purpose: 'Supplemental tax bills from property re-assessment; deductible on Schedule A (SALT) or Schedule E.',
    scheduleOrForm: 'Schedule A Line 5b (SALT) / Schedule E',
    deductibleStatus: 'deductible',
    personalUse: {
      purpose: 'Supplemental tax bills from property re-assessment; deductible on Schedule A, subject to the SALT cap.',
      scheduleOrForm: 'Schedule A Line 5b (SALT)',
      deductibleStatus: 'partial'
    }
  },

  // Property — Utilities
  'Electricity': {
    purpose: 'Deductible on Schedule E for rentals or Schedule C for home office; non-deductible for personal use.',
    scheduleOrForm: 'Schedule E Line 17 / Schedule C',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for personal use, unless a portion qualifies for the home office deduction on Schedule C.',
      scheduleOrForm: 'Schedule C (Home Office)',
      deductibleStatus: 'non-deductible'
    }
  },
  'Natural Gas': {
    purpose: 'Deductible on Schedule E for rentals or Schedule C for home office; non-deductible for personal use.',
    scheduleOrForm: 'Schedule E Line 17 / Schedule C',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for personal use, unless a portion qualifies for the home office deduction on Schedule C.',
      scheduleOrForm: 'Schedule C (Home Office)',
      deductibleStatus: 'non-deductible'
    }
  },
  'Water & Sewer': {
    purpose: 'Deductible on Schedule E for rentals; non-deductible for personal residence.',
    scheduleOrForm: 'Schedule E Line 17',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Trash & Recycling': {
    purpose: 'Deductible on Schedule E for rentals; non-deductible for personal residence.',
    scheduleOrForm: 'Schedule E Line 17',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Internet': {
    purpose: 'Business/home office portion deductible on Schedule C or Schedule E; personal portion non-deductible.',
    scheduleOrForm: 'Schedule C Line 22 / Schedule E',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'The home-office portion may be deductible on Schedule C; the personal-use portion is non-deductible.',
      scheduleOrForm: 'Schedule C Line 22',
      deductibleStatus: 'partial'
    }
  },
  'Cable / Streaming': {
    purpose: 'Deductible on Schedule E if provided as a tenant amenity; non-deductible for personal residence.',
    scheduleOrForm: 'Schedule E Line 19',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },

  // Property — Insurance
  'Homeowners Insurance': {
    purpose: '100% deductible on Schedule E for rentals; non-deductible on Schedule A for personal home.',
    scheduleOrForm: 'Schedule E Line 9',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal home.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Renters Insurance': {
    purpose: 'Deductible on Schedule C for business portion (home office); non-deductible for personal use.',
    scheduleOrForm: 'Schedule C (Home Office)',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for personal use, unless a portion qualifies for the home office deduction.',
      scheduleOrForm: 'Schedule C (Home Office)',
      deductibleStatus: 'non-deductible'
    }
  },
  'Flood Insurance': {
    purpose: '100% deductible on Schedule E for rental properties; non-deductible for personal residence.',
    scheduleOrForm: 'Schedule E Line 9',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Home Warranty': {
    purpose: '100% deductible on Schedule E for rental properties; non-deductible for personal residence.',
    scheduleOrForm: 'Schedule E Line 9',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },

  // Property — Maintenance & Repairs
  'Plumbing': {
    purpose: 'Current-year repair expense on Schedule E for rentals; non-deductible for personal home.',
    scheduleOrForm: 'Schedule E Line 14',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal home.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Electrical': {
    purpose: 'Current-year repair expense on Schedule E for rentals; non-deductible for personal home.',
    scheduleOrForm: 'Schedule E Line 14',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal home.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'HVAC': {
    purpose: 'Routine servicing is deductible on Schedule E; full system replacement must be capitalized & depreciated (27.5 yr).',
    scheduleOrForm: 'Schedule E Line 14 / Form 4562',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal home; a full system replacement may add to cost basis when the home is sold.',
      scheduleOrForm: 'Cost Basis',
      deductibleStatus: 'non-deductible'
    }
  },
  'Roofing': {
    purpose: 'Roof patching/repairs deductible on Schedule E; complete roof replacement is capitalized & depreciated.',
    scheduleOrForm: 'Schedule E Line 14 / Form 4562',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible repairs for a personal home; a full roof replacement adds to cost basis.',
      scheduleOrForm: 'Cost Basis',
      deductibleStatus: 'non-deductible'
    }
  },
  'Pest Control': {
    purpose: 'Operating maintenance expense deductible on Schedule E for rentals; non-deductible for personal home.',
    scheduleOrForm: 'Schedule E Line 14',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal home.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'General Handyman': {
    purpose: 'Current-year repairs deductible on Schedule E (rentals) or Schedule C (business); non-deductible for personal home.',
    scheduleOrForm: 'Schedule E Line 14 / Schedule C',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal home.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },

  // Property — Improvements & Renovations
  'Remodeling': {
    purpose: 'Capital improvement added to property basis (lowers taxable gain on sale) or depreciated over 27.5 yrs on Schedule E.',
    scheduleOrForm: 'Cost Basis / Form 4562',
    deductibleStatus: 'capitalized',
    personalUse: {
      purpose: 'Capital improvement added to property basis, lowering taxable gain on sale; no current-year depreciation for a personal residence.',
      scheduleOrForm: 'Cost Basis',
      deductibleStatus: 'capitalized'
    }
  },
  'Landscaping': {
    purpose: 'Permanent landscape architecture adds to cost basis; routine lawn care is an operating expense on Schedule E.',
    scheduleOrForm: 'Cost Basis / Schedule E',
    deductibleStatus: 'capitalized',
    personalUse: {
      purpose: 'Permanent landscape architecture adds to cost basis; routine lawn care is a non-deductible personal expense.',
      scheduleOrForm: 'Cost Basis',
      deductibleStatus: 'capitalized'
    }
  },
  'Painting': {
    purpose: 'Rental repainting is deductible repair on Schedule E; full pre-sale renovation adds to cost basis.',
    scheduleOrForm: 'Schedule E Line 14 / Cost Basis',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for routine upkeep of a personal home; a full pre-sale renovation adds to cost basis.',
      scheduleOrForm: 'Cost Basis',
      deductibleStatus: 'non-deductible'
    }
  },
  'Flooring': {
    purpose: 'New flooring is a capital improvement added to property basis or depreciated over 27.5 yrs on Schedule E.',
    scheduleOrForm: 'Cost Basis / Form 4562',
    deductibleStatus: 'capitalized',
    personalUse: {
      purpose: 'New flooring is a capital improvement added to property basis; no current-year depreciation for a personal residence.',
      scheduleOrForm: 'Cost Basis',
      deductibleStatus: 'capitalized'
    }
  },

  // Property — Furnishings & Appliances
  'Furniture': {
    purpose: 'Depreciable over 5–7 yrs (Section 179 / bonus depreciation eligible) for rental properties or office.',
    scheduleOrForm: 'Form 4562 / Schedule E',
    deductibleStatus: 'capitalized',
    personalUse: {
      purpose: 'Non-deductible personal furniture.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Major Appliances': {
    purpose: 'Depreciable over 5 yrs (MACRS / Section 179) for rental properties on Schedule E.',
    scheduleOrForm: 'Form 4562 / Schedule E',
    deductibleStatus: 'capitalized',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Home Decor': {
    purpose: 'Staging or rental decor deductible on Schedule E; non-deductible for personal home.',
    scheduleOrForm: 'Schedule E Line 19',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal home.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Small Appliances': {
    purpose: 'De minimis safe harbor expensing (<$2,500) on Schedule E for rental units; non-deductible for personal use.',
    scheduleOrForm: 'Schedule E Line 19',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for personal use.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },

  // Property — Services
  'Cleaning Service': {
    purpose: 'Turnover & maintenance cleaning deductible on Schedule E (rentals) or Schedule C (business).',
    scheduleOrForm: 'Schedule E Line 19 / Schedule C',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for personal residence cleaning.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Lawn Care': {
    purpose: 'Routine yard maintenance deductible on Schedule E for rentals; non-deductible for personal residence.',
    scheduleOrForm: 'Schedule E Line 19',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for a personal residence.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Security System': {
    purpose: 'Alarm monitoring deductible on Schedule E (rentals) or Schedule C (office); personal use non-deductible.',
    scheduleOrForm: 'Schedule E Line 19 / Schedule C',
    deductibleStatus: 'partial',
    personalUse: {
      purpose: 'Non-deductible for personal use.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Moving Services': {
    purpose: 'Non-deductible for individuals under TCJA (except active-duty military); rental acquisition moves added to basis.',
    scheduleOrForm: 'Non-deductible / Cost Basis',
    deductibleStatus: 'non-deductible',
    personalUse: {
      purpose: 'Non-deductible for individuals under TCJA (except active-duty military).',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },
  'Mailbox Rental': {
    purpose: 'Deductible business address on Schedule C or property management address on Schedule E.',
    scheduleOrForm: 'Schedule C Line 18 / Schedule E',
    deductibleStatus: 'deductible',
    personalUse: {
      purpose: 'Non-deductible personal mailbox rental.',
      scheduleOrForm: undefined,
      deductibleStatus: 'non-deductible'
    }
  },

  // Property — Solar
  'SREC': {
    purpose: 'SREC sales reported as taxable other income (Form 1040 Schedule 1); clean energy equipment receives 30% credit on Form 5695.',
    scheduleOrForm: 'Schedule 1 / Form 5695',
    deductibleStatus: 'taxable-income'
  }
};

export const getCategoryTaxGuidance = (category?: string | null): TaxGuidance | null => {
  if (!category) return null;
  return CATEGORY_TAX_GUIDANCE[category] || null;
};

export const getSubcategoryTaxGuidance = (subcategory?: string | null): TaxGuidance | null => {
  if (!subcategory) return null;
  return SUBCATEGORY_TAX_GUIDANCE[subcategory] || null;
};

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
