export type PropertyType = 'Single Family' | 'Condo' | 'Townhouse' | 'Apartment' | 'Other';

export interface UserAuditInfo {
  uid: string;
  displayName: string;
  email?: string;
}

export interface HouseholdMetadata {
  code: string;
  passcode: string;
  createdBy: UserAuditInfo;
  createdAt: string;
  members: UserAuditInfo[];
}

export interface Home {
  id: string;
  nickname: string;
  address?: string;
  propertyType: PropertyType;
  isIncomeProperty?: boolean; // Rental/investment property — expenses default to tax-deductible (Schedule E)
  yearBuilt?: number;
  squareFootage?: number;
  purchaseDate?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: UserAuditInfo;
  lastEditedBy?: UserAuditInfo;
}

export const TARGETS = ['Property'] as const;
export type Target = typeof TARGETS[number];

export type StandardPropertyCategory =
  | 'Mortgage & Rent'
  | 'Tax'
  | 'Utilities'
  | 'Insurance'
  | 'Maintenance & Repairs'
  | 'Improvements & Renovations'
  | 'Furnishings & Appliances'
  | 'Services'
  | 'Solar'
  | 'Other';

/**
 * MaintenanceCategory supports standard categories as well as
 * custom user-defined categories and legacy record categories for full backward compatibility.
 */
export type MaintenanceCategory = StandardPropertyCategory | (string & {});

/**
 * Second level under a category (e.g. "Electricity", "Plumbing", "Property Tax").
 */
export type MaintenanceSubcategory = string;

export interface TaxonomyOverride {
  /** Custom category → subcategory additions/overrides */
  categories: Record<string, string[]>;
  /** Soft-deleted keys: category names or "category::subcategory" pairs */
  deleted: string[];
}

export type TaxonomyOverrideDoc = Partial<Record<string, TaxonomyOverride>>;

export type MaintenanceType = 'Maintenance' | 'Repair' | 'Upgrade' | 'Inspection' | 'Expense';

export interface PaymentTypeItem {
  id: string;
  name: string;
  ownerUid?: string;
  ownerName?: string;
  isSystemDefault?: boolean;
  isDefault?: boolean;
  createdAt?: string;
}

export type PaymentType = string;
export type TransactionType = 'Debit' | 'Credit';

// Generic, app-agnostic ledger entry. Shared across any app on this Firebase
// project (users/{uid}/transactions or households/{code}/transactions) —
// this is the exact same collection CarTracker writes to, so home costs and
// car costs coexist in one ledger per household. Shares its document ID 1:1
// with the HomeRecord that created it.
export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  amount: number;
  vendor: string;
  notes?: string;
  category: string;
  paymentType: PaymentType;
  user: string;
  isTaxDeductible?: boolean;
  transactionType?: TransactionType;
}

export interface HomeRecord {
  id: string;
  homeId: string;
  target?: Target | string;
  category: MaintenanceCategory;
  subcategory?: MaintenanceSubcategory; // omitted when the category offers none
  type: MaintenanceType;
  nextServiceDate?: string;
  createdAt: string;
  loggedBy?: UserAuditInfo;
  lastEditedBy?: UserAuditInfo;
}

// Read-side join of a HomeRecord with its linked Transaction. Never
// persisted directly — built in-memory so UI components can read
// date/cost/provider/notes as flat fields.
export interface EnrichedHomeRecord extends HomeRecord {
  date: string;
  time: string;
  cost: number;
  provider: string;
  notes?: string;
  paymentType: PaymentType;
  isTaxDeductible?: boolean;
  transactionType?: TransactionType;
}

export interface HomeReminder {
  id: string;
  homeId: string;
  target?: Target | string;
  title: string;
  category: MaintenanceCategory;
  dueDate?: string;
  intervalMonths?: number;
  isCompleted: boolean;
  notes?: string;
  createdBy?: UserAuditInfo;
  lastEditedBy?: UserAuditInfo;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  databaseURL?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export type ActiveTab = 'dashboard' | 'homes' | 'history' | 'reminders' | 'analytics' | 'settings' | 'about';
