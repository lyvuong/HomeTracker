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
  address: string;
  propertyType: PropertyType;
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

export type MaintenanceCategory =
  | 'HVAC'
  | 'Plumbing'
  | 'Electrical'
  | 'Roofing'
  | 'Appliances'
  | 'Landscaping & Lawn'
  | 'Pest Control'
  | 'Painting'
  | 'Flooring'
  | 'Windows & Doors'
  | 'Foundation & Structural'
  | 'Renovation'
  | 'Inspection'
  | 'Utilities'
  | 'General Repair'
  | 'Property Tax'
  | 'Mortgage'
  | 'Homeowners Insurance'
  | 'HOA Fees'
  | 'Home Warranty'
  | 'Other';

/**
 * Optional second level under a category — currently only Utilities has one,
 * so a recurring bill can say which utility it was. Written into the shared
 * ledger by concatenating it onto the category string with a hyphen the way
 * CarTracker appends the vehicle: "Home - Utilities - Electricity - Main House".
 */
export type MaintenanceSubcategory = string;

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
}

export interface HomeRecord {
  id: string;
  homeId: string;
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
}

export interface HomeReminder {
  id: string;
  homeId: string;
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
