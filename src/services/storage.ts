import type { Home, HomeRecord, HomeReminder, Transaction, EnrichedHomeRecord, FirebaseConfig, PaymentTypeItem, TaxonomyOverride, TaxonomyOverrideDoc } from '../types';

const HOMES_KEY = 'hometrack_homes_v1';
const RECORDS_KEY = 'hometrack_records_v1';
const TRANSACTIONS_KEY = 'hometrack_transactions_v1';
const REMINDERS_KEY = 'hometrack_reminders_v1';
const PAYMENT_TYPES_KEY = 'hometrack_payment_types_v1';
const TAXONOMY_OVERRIDE_KEY = 'hometrack_taxonomy_override_v1';
const ACTIVE_HOME_KEY = 'hometrack_active_home_id';
const FIREBASE_CONFIG_KEY = 'hometrack_firebase_config_custom';
const FAMILY_CODE_KEY = 'hometrack_family_code';

export const loadLocalTaxonomyOverrideDoc = (): TaxonomyOverrideDoc => {
  try {
    const raw = localStorage.getItem(TAXONOMY_OVERRIDE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local taxonomy override doc:', err);
    return {};
  }
};

export const saveLocalTaxonomyOverrideDoc = (doc: TaxonomyOverrideDoc): void => {
  try {
    localStorage.setItem(TAXONOMY_OVERRIDE_KEY, JSON.stringify(doc));
  } catch (err) {
    console.error('Failed to save local taxonomy override doc:', err);
  }
};

export const loadLocalTaxonomyOverride = (target: string = 'Property'): TaxonomyOverride => {
  const doc = loadLocalTaxonomyOverrideDoc();
  return doc[target] || { categories: {}, deleted: [] };
};

export const saveLocalTaxonomyOverride = (override: TaxonomyOverride, target: string = 'Property'): void => {
  const doc = loadLocalTaxonomyOverrideDoc();
  doc[target] = override;
  saveLocalTaxonomyOverrideDoc(doc);
};

export const INITIAL_PAYMENT_TYPES: PaymentTypeItem[] = [
  { id: 'pt-1', name: 'Cash', isSystemDefault: true, isDefault: true },
  { id: 'pt-2', name: 'Credit Card', isSystemDefault: true },
  { id: 'pt-3', name: 'Debit Card', isSystemDefault: true },
  { id: 'pt-4', name: 'Bank Transfer', isSystemDefault: true },
  { id: 'pt-5', name: 'Check', isSystemDefault: true }
];

export const INITIAL_HOMES: Home[] = [
  {
    id: 'demo-h1',
    nickname: 'Main House',
    address: '123 Maple Street, Springfield',
    propertyType: 'Single Family',
    yearBuilt: 1998,
    squareFootage: 2200,
    purchaseDate: '2019-06-01',
    photoUrl: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1200&q=80',
    notes: 'Primary residence. HVAC filters replaced quarterly.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_RECORDS: HomeRecord[] = [
  {
    id: 'rec-1',
    homeId: 'demo-h1',
    category: 'HVAC',
    type: 'Maintenance',
    nextServiceDate: '2026-12-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rec-2',
    homeId: 'demo-h1',
    category: 'Plumbing',
    type: 'Repair',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rec-3',
    homeId: 'demo-h1',
    category: 'Utilities',
    subcategory: 'Electricity',
    type: 'Expense',
    createdAt: new Date().toISOString()
  }
];

// Shares document IDs 1:1 with INITIAL_RECORDS above.
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'rec-1',
    date: '2026-06-15',
    time: '09:30',
    amount: 225.00,
    vendor: 'Springfield HVAC Services',
    notes: 'Annual AC tune-up and filter replacement.',
    category: 'Home - HVAC - Main House',
    paymentType: 'Credit Card',
    user: 'Home Owner'
  },
  {
    id: 'rec-2',
    date: '2026-03-10',
    time: '14:00',
    amount: 480.00,
    vendor: 'ABC Plumbing Co',
    notes: 'Fixed leaking pipe under kitchen sink.',
    category: 'Home - Plumbing - Main House',
    paymentType: 'Debit Card',
    user: 'Home Owner'
  },
  {
    id: 'rec-3',
    date: '2026-07-05',
    time: '08:00',
    amount: 142.37,
    vendor: 'City Power & Light',
    notes: 'June electricity bill.',
    category: 'Home - Utilities - Electricity - Main House',
    paymentType: 'Bank Transfer',
    user: 'Home Owner'
  }
];

export const INITIAL_REMINDERS: HomeReminder[] = [
  {
    id: 'rem-1',
    homeId: 'demo-h1',
    title: 'Replace HVAC Filter',
    category: 'HVAC',
    dueDate: '2026-09-01',
    intervalMonths: 3,
    isCompleted: false,
    notes: '20x25x1 pleated filter'
  },
  {
    id: 'rem-2',
    homeId: 'demo-h1',
    title: 'Gutter Cleaning',
    category: 'General Repair',
    dueDate: '2026-10-15',
    intervalMonths: 12,
    isCompleted: false,
    notes: 'Before winter rains'
  }
];

export const loadLocalHomes = (): Home[] => {
  try {
    const raw = localStorage.getItem(HOMES_KEY);
    if (!raw) {
      localStorage.setItem(HOMES_KEY, JSON.stringify(INITIAL_HOMES));
      return INITIAL_HOMES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local homes:', err);
    return INITIAL_HOMES;
  }
};

export const saveLocalHomes = (homes: Home[]): void => {
  try {
    localStorage.setItem(HOMES_KEY, JSON.stringify(homes));
  } catch (err) {
    console.error('Failed to save local homes:', err);
  }
};

export const loadLocalRecords = (): HomeRecord[] => {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local records:', err);
    return INITIAL_RECORDS;
  }
};

export const saveLocalRecords = (records: HomeRecord[]): void => {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save local records:', err);
  }
};

export const loadLocalTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local transactions:', err);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveLocalTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save local transactions:', err);
  }
};

export const loadLocalReminders = (): HomeReminder[] => {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(INITIAL_REMINDERS));
      return INITIAL_REMINDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load local reminders:', err);
    return INITIAL_REMINDERS;
  }
};

export const saveLocalReminders = (reminders: HomeReminder[]): void => {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save local reminders:', err);
  }
};

export const clearDemoData = (): void => {
  try {
    const homes = loadLocalHomes().filter(h => !h.id.startsWith('demo-'));
    const records = loadLocalRecords().filter(r => !r.id.startsWith('rec-') && !r.homeId.startsWith('demo-'));
    const transactions = loadLocalTransactions().filter(t => !t.id.startsWith('rec-'));
    const reminders = loadLocalReminders().filter(rem => !rem.id.startsWith('rem-') && !rem.homeId.startsWith('demo-'));
    saveLocalHomes(homes);
    saveLocalRecords(records);
    saveLocalTransactions(transactions);
    saveLocalReminders(reminders);
  } catch (err) {
    console.error('Failed to clear demo data:', err);
  }
};

export const clearLocalDemoData = clearDemoData;

export const restoreSampleData = (): void => {
  saveLocalHomes(INITIAL_HOMES);
  saveLocalRecords(INITIAL_RECORDS);
  saveLocalTransactions(INITIAL_TRANSACTIONS);
  saveLocalReminders(INITIAL_REMINDERS);
};

export const loadLocalPaymentTypes = (): PaymentTypeItem[] => {
  try {
    const raw = localStorage.getItem(PAYMENT_TYPES_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENT_TYPES_KEY, JSON.stringify(INITIAL_PAYMENT_TYPES));
      return INITIAL_PAYMENT_TYPES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PAYMENT_TYPES;
  } catch (err) {
    console.error('Failed to load local payment types:', err);
    return INITIAL_PAYMENT_TYPES;
  }
};

export const saveLocalPaymentTypes = (paymentTypes: PaymentTypeItem[]): void => {
  try {
    localStorage.setItem(PAYMENT_TYPES_KEY, JSON.stringify(paymentTypes));
  } catch (err) {
    console.error('Failed to save local payment types:', err);
  }
};

export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredFirebaseConfig = (config: FirebaseConfig | null): void => {
  if (!config) {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  } else {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  }
};

export const getActiveHomeId = (): string => {
  const active = localStorage.getItem(ACTIVE_HOME_KEY);
  if (active) return active;
  const homes = loadLocalHomes();
  return homes.length > 0 ? homes[0].id : '';
};

export const setActiveHomeId = (id: string): void => {
  localStorage.setItem(ACTIVE_HOME_KEY, id);
};

export const getStoredFamilyCode = (): string => {
  return localStorage.getItem(FAMILY_CODE_KEY) || '';
};

export const setStoredFamilyCode = (code: string): void => {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    localStorage.removeItem(FAMILY_CODE_KEY);
  } else {
    localStorage.setItem(FAMILY_CODE_KEY, clean);
  }
};

export const exportRecordsAsCSV = (records: EnrichedHomeRecord[], homes: Home[]): void => {
  const homeMap = new Map(homes.map(h => [h.id, h.nickname]));
  const headers = ['Home', 'Date', 'Time', 'Category', 'Subcategory', 'Type', 'Transaction Type', 'Cost ($)', 'Payment Type', 'Provider', 'Notes', 'Tax Deductible'];
  const rows = records.map(r => [
    `"${homeMap.get(r.homeId) || 'Unknown Home'}"`,
    `"${r.date}"`,
    `"${r.time}"`,
    `"${r.category}"`,
    `"${r.subcategory || ''}"`,
    `"${r.type}"`,
    `"${r.transactionType || 'Debit'}"`,
    r.cost.toFixed(2),
    `"${r.paymentType}"`,
    `"${(r.provider || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
    r.isTaxDeductible ? 'Yes' : 'No'
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HomeTracker_Transaction_History_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDataAsJSON = (
  homes: Home[],
  records: HomeRecord[],
  reminders: HomeReminder[],
  transactions: Transaction[]
): void => {
  const backupObj = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    homes,
    records,
    transactions,
    reminders
  };
  const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HomeTracker_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importJSONBackup = (jsonString: string): { homes: Home[]; records: HomeRecord[]; reminders: HomeReminder[]; transactions: Transaction[] } => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.homes || !Array.isArray(data.homes)) {
      throw new Error('Invalid JSON backup file structure.');
    }
    const homes: Home[] = data.homes || [];
    const records: HomeRecord[] = data.records || [];
    const reminders: HomeReminder[] = data.reminders || [];
    const transactions: Transaction[] = data.transactions || [];

    saveLocalHomes(homes);
    saveLocalRecords(records);
    saveLocalTransactions(transactions);
    saveLocalReminders(reminders);

    return { homes, records, reminders, transactions };
  } catch (err: any) {
    throw new Error(err.message || 'Failed to parse JSON backup file.');
  }
};
