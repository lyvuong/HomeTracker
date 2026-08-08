import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { TabNavigation } from './components/Navigation/TabNavigation';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { HouseGarage } from './components/Homes/HouseGarage';
import { RecordHistory } from './components/Records/RecordHistory';
import { CostAnalytics } from './components/Analytics/CostAnalytics';
import { ReminderManager } from './components/Reminders/ReminderManager';
import { SettingsModal } from './components/Settings/SettingsModal';
import { PaymentTypesModal } from './components/Settings/PaymentTypesModal';
import { AboutPage } from './components/About/AboutPage';
import { RecordFormModal } from './components/Records/RecordFormModal';
import { HouseModal } from './components/Homes/HouseModal';
import { ReminderModal } from './components/Reminders/ReminderModal';
import { PWAInstallPrompt } from './components/PWA/PWAInstallPrompt';
import { LoginScreen } from './components/Auth/LoginScreen';

import type { Home, HomeRecord, HomeReminder, Transaction, EnrichedHomeRecord, UserProfile, ActiveTab, PaymentTypeItem } from './types';
import { buildTransactionCategory } from './utils/homeRecords';
import {
  loadLocalHomes,
  saveLocalHomes,
  loadLocalRecords,
  saveLocalRecords,
  loadLocalTransactions,
  saveLocalTransactions,
  loadLocalReminders,
  saveLocalReminders,
  loadLocalPaymentTypes,
  saveLocalPaymentTypes,
  INITIAL_PAYMENT_TYPES,
  clearDemoData,
  restoreSampleData,
  getActiveHomeId,
  setActiveHomeId,
  getStoredFamilyCode,
  setStoredFamilyCode
} from './services/storage';

import {
  initializeFirebaseService,
  isFirebaseConfigured,
  subscribeAuth,
  loginWithGoogle,
  tryAutoSignInGoogle,
  subscribeFirestoreHomes,
  getPersonalHomesOnce,
  subscribeFirestoreRecords,
  subscribeFirestoreTransactions,
  subscribeFirestoreReminders,
  saveFirestoreHome,
  deleteFirestoreHome,
  saveFirestoreRecord,
  deleteFirestoreRecord,
  saveFirestoreTransaction,
  deleteFirestoreTransaction,
  saveFirestoreReminder,
  deleteFirestoreReminder,
  subscribeFirestorePaymentTypes,
  saveFirestorePaymentType,
  verifyOrCreateHousehold,
  subscribeRTDBHomes,
  subscribeRTDBRecords,
  subscribeRTDBReminders,
  saveRTDBHome,
  deleteRTDBHome,
  saveRTDBRecord,
  deleteRTDBRecord,
  saveRTDBReminder,
  deleteRTDBReminder
} from './services/firebase';

export const App: React.FC = () => {
  // State Initialization
  const [homes, setHomes] = useState<Home[]>(() => loadLocalHomes());
  const [records, setRecords] = useState<HomeRecord[]>(() => loadLocalRecords());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadLocalTransactions());
  const [reminders, setReminders] = useState<HomeReminder[]>(() => loadLocalReminders());
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeItem[]>(() => loadLocalPaymentTypes());
  const [activeHomeId, setActiveHomeIdState] = useState<string>(() => getActiveHomeId());
  const [familyCode, setFamilyCodeState] = useState<string>(() => getStoredFamilyCode());

  // Global App-wide Theme State ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hometracker_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('hometracker_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const handleSetFamilyCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) {
      setStoredFamilyCode('');
      setFamilyCodeState('');
      return { success: true, message: 'Returned to Personal Homes.' };
    }

    if (user && isFirebaseActive) {
      const res = await verifyOrCreateHousehold(cleanCode, user);
      if (!res.success) {
        setStoredFamilyCode('');
        setFamilyCodeState('');
        return { success: false, message: res.message };
      }
      setStoredFamilyCode(cleanCode);
      setFamilyCodeState(cleanCode);
      return { success: true, message: res.message };
    } else {
      setStoredFamilyCode(cleanCode);
      setFamilyCodeState(cleanCode);
      return { success: true, message: `Joined Household ${cleanCode}` };
    }
  };

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnrichedHomeRecord | null>(null);

  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<HomeReminder | null>(null);

  const [isPaymentTypesModalOpen, setIsPaymentTypesModalOpen] = useState(false);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync activeHomeId to storage
  const handleSelectHome = (id: string) => {
    setActiveHomeIdState(id);
    setActiveHomeId(id);
  };

  // Initialize Firebase service if configured
  useEffect(() => {
    const initialized = initializeFirebaseService();
    const active = initialized && isFirebaseConfigured();
    setIsFirebaseActive(active);

    if (!active) {
      setIsAuthLoading(false);
    }

    if (initialized) {
      const unsubscribeAuth = subscribeAuth((userProfile) => {
        setUser(userProfile);
        setIsAuthLoading(false);
        if (userProfile) {
          let hasSeededHomes = false;
          let hasSeededRecords = false;
          let hasSeededReminders = false;

          // Subscribe to cloud Firestore & Realtime Database changes
          const unSubHomesFS = subscribeFirestoreHomes(userProfile.uid, familyCode, (cloudHomes) => {
            if (cloudHomes.length > 0) {
              hasSeededHomes = true;
              setHomes(cloudHomes);
              saveLocalHomes(cloudHomes);
            } else if (hasSeededHomes) {
              setHomes([]);
              saveLocalHomes([]);
            } else {
              hasSeededHomes = true;
              const local = loadLocalHomes().filter((h: Home) => !h.id.startsWith('demo-'));
              if (local.length > 0) {
                setHomes(local);
                local.forEach((h: Home) => {
                  saveFirestoreHome(userProfile.uid, h, familyCode);
                  saveRTDBHome(userProfile.uid, h, familyCode);
                });
              } else {
                setHomes([]);
                saveLocalHomes([]);
              }
            }
          });

          const unSubHomesRTDB = subscribeRTDBHomes(userProfile.uid, familyCode, (rtdbHomes) => {
            if (rtdbHomes.length > 0) {
              hasSeededHomes = true;
              setHomes(rtdbHomes);
              saveLocalHomes(rtdbHomes);
            } else if (hasSeededHomes) {
              setHomes([]);
              saveLocalHomes([]);
            }
          });

          const unSubRecordsFS = subscribeFirestoreRecords(userProfile.uid, familyCode, (cloudRecords) => {
            if (cloudRecords.length > 0) {
              hasSeededRecords = true;
              setRecords(cloudRecords);
              saveLocalRecords(cloudRecords);
            } else if (hasSeededRecords) {
              setRecords([]);
              saveLocalRecords([]);
            } else {
              hasSeededRecords = true;
              const local = loadLocalRecords().filter((r: HomeRecord) => !r.id.startsWith('rec-') && !r.homeId.startsWith('demo-'));
              if (local.length > 0) {
                setRecords(local);
                local.forEach((r: HomeRecord) => {
                  saveFirestoreRecord(userProfile.uid, r, familyCode);
                  saveRTDBRecord(userProfile.uid, r, familyCode);
                });
              } else {
                setRecords([]);
                saveLocalRecords([]);
              }
            }
          });

          const unSubRecordsRTDB = subscribeRTDBRecords(userProfile.uid, familyCode, (rtdbRecords) => {
            if (rtdbRecords.length > 0) {
              hasSeededRecords = true;
              setRecords(rtdbRecords);
              saveLocalRecords(rtdbRecords);
            } else if (hasSeededRecords) {
              setRecords([]);
              saveLocalRecords([]);
            }
          });

          let hasSeededTransactions = false;
          const unSubTransactionsFS = subscribeFirestoreTransactions(userProfile.uid, familyCode, (cloudTransactions) => {
            if (cloudTransactions.length > 0) {
              hasSeededTransactions = true;
              setTransactions(cloudTransactions);
              saveLocalTransactions(cloudTransactions);
            } else if (hasSeededTransactions) {
              setTransactions([]);
              saveLocalTransactions([]);
            } else {
              hasSeededTransactions = true;
              const local = loadLocalTransactions().filter((t: Transaction) => !t.id.startsWith('rec-'));
              if (local.length > 0) {
                setTransactions(local);
                local.forEach((t: Transaction) => saveFirestoreTransaction(userProfile.uid, t, familyCode));
              } else {
                setTransactions([]);
                saveLocalTransactions([]);
              }
            }
          });

          const unSubRemindersFS = subscribeFirestoreReminders(userProfile.uid, familyCode, (cloudReminders) => {
            if (cloudReminders.length > 0) {
              hasSeededReminders = true;
              setReminders(cloudReminders);
              saveLocalReminders(cloudReminders);
            } else if (hasSeededReminders) {
              setReminders([]);
              saveLocalReminders([]);
            } else {
              hasSeededReminders = true;
              const local = loadLocalReminders().filter((rem: HomeReminder) => !rem.id.startsWith('rem-') && !rem.homeId.startsWith('demo-'));
              if (local.length > 0) {
                setReminders(local);
                local.forEach((rem: HomeReminder) => {
                  saveFirestoreReminder(userProfile.uid, rem, familyCode);
                  saveRTDBReminder(userProfile.uid, rem, familyCode);
                });
              } else {
                setReminders([]);
                saveLocalReminders([]);
              }
            }
          });

          const unSubRemindersRTDB = subscribeRTDBReminders(userProfile.uid, familyCode, (rtdbReminders) => {
            if (rtdbReminders.length > 0) {
              hasSeededReminders = true;
              setReminders(rtdbReminders);
              saveLocalReminders(rtdbReminders);
            } else if (hasSeededReminders) {
              setReminders([]);
              saveLocalReminders([]);
            }
          });

          let hasSeededPaymentTypes = false;
          const unSubPaymentTypesFS = subscribeFirestorePaymentTypes(userProfile.uid, familyCode, (cloudTypes) => {
            if (cloudTypes.length > 0) {
              hasSeededPaymentTypes = true;
              setPaymentTypes(cloudTypes);
              saveLocalPaymentTypes(cloudTypes);
            } else if (hasSeededPaymentTypes) {
              setPaymentTypes([]);
              saveLocalPaymentTypes([]);
            } else {
              hasSeededPaymentTypes = true;
              const localTypes = loadLocalPaymentTypes();
              const typesToSeed = localTypes.length > 0 ? localTypes : INITIAL_PAYMENT_TYPES;
              setPaymentTypes(typesToSeed);
              saveLocalPaymentTypes(typesToSeed);
              typesToSeed.forEach(pt => saveFirestorePaymentType(userProfile.uid, pt, familyCode));
            }
          });

          return () => {
            unSubHomesFS();
            unSubHomesRTDB();
            unSubRecordsFS();
            unSubRecordsRTDB();
            unSubTransactionsFS();
            unSubRemindersFS();
            unSubRemindersRTDB();
            unSubPaymentTypesFS();
          };
        } else {
          tryAutoSignInGoogle().catch(() => {});
          setStoredFamilyCode('');
          setFamilyCodeState('');
        }
      });

      return () => unsubscribeAuth();
    }
  }, [familyCode]);

  // Persist to local storage
  useEffect(() => {
    saveLocalHomes(homes);
  }, [homes]);

  useEffect(() => {
    saveLocalRecords(records);
  }, [records]);

  useEffect(() => {
    saveLocalTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveLocalReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    saveLocalPaymentTypes(paymentTypes);
  }, [paymentTypes]);

  // Handle home selection safely
  useEffect(() => {
    if (homes.length > 0) {
      const exists = homes.some(h => h.id === activeHomeId);
      if (!exists || !activeHomeId) {
        handleSelectHome(homes[0].id);
      }
    }
  }, [homes, activeHomeId]);

  const activeHome = homes.find(h => h.id === activeHomeId) || null;

  // Self-heal: when a household is active but has no homes yet, a member
  // may still have records referencing a home that only ever lived under
  // their personal users/{uid}/houses (created before the household had
  // any homes of its own). Promote any such referenced home into the
  // active household scope, reusing the same home ID so the reference
  // keeps resolving.
  useEffect(() => {
    if (!isFirebaseActive || !user || !familyCode || homes.length > 0 || records.length === 0) return;

    getPersonalHomesOnce(user.uid).then(personalHomes => {
      const neededIds = new Set(records.map(r => r.homeId));
      const toPromote = personalHomes.filter(h => neededIds.has(h.id));
      if (toPromote.length === 0) return;

      toPromote.forEach(h => {
        saveFirestoreHome(user.uid, h, familyCode);
        saveRTDBHome(user.uid, h, familyCode);
      });

      setHomes(prev => {
        const merged = [...prev];
        toPromote.forEach(h => {
          if (!merged.some(m => m.id === h.id)) merged.push(h);
        });
        return merged;
      });
    });
  }, [isFirebaseActive, user, familyCode, homes.length, records]);

  // Join records with their linked transaction for display. Existing UI
  // components keep reading flat date/cost/provider/notes fields.
  const enrichedRecords: EnrichedHomeRecord[] = useMemo(() => {
    const transactionsById = new Map(transactions.map(t => [t.id, t]));
    return records
      .map((r): EnrichedHomeRecord | null => {
        const t = transactionsById.get(r.id);
        if (!t) return null;
        return {
          ...r,
          date: t.date,
          time: t.time,
          cost: t.amount,
          provider: t.vendor,
          notes: t.notes,
          paymentType: t.paymentType,
          isTaxDeductible: t.isTaxDeductible
        };
      })
      .filter((r): r is EnrichedHomeRecord => r !== null)
      .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }, [records, transactions]);

  // Handlers for Homes
  const handleSaveHome = (homeData: Omit<Home, 'createdAt' | 'updatedAt'>) => {
    const isEdit = homes.some(h => h.id === homeData.id);
    const timestamp = new Date().toISOString();

    const auditInfo = user ? {
      uid: user.uid,
      displayName: user.displayName || 'Home Owner',
      email: user.email || undefined
    } : undefined;

    const existing = homes.find(h => h.id === homeData.id);

    const newHome: Home = {
      ...homeData,
      createdAt: isEdit && existing ? existing.createdAt : timestamp,
      updatedAt: timestamp,
      createdBy: isEdit && existing ? (existing.createdBy || auditInfo) : auditInfo,
      lastEditedBy: auditInfo
    };

    setHomes(prev => {
      const exists = prev.some(h => h.id === newHome.id);
      if (exists) {
        return prev.map(h => h.id === newHome.id ? newHome : h);
      }
      return [newHome, ...prev];
    });

    handleSelectHome(newHome.id);
    setIsHomeModalOpen(false);

    // Sync to Cloud
    if (user && isFirebaseActive) {
      saveFirestoreHome(user.uid, newHome, familyCode);
      saveRTDBHome(user.uid, newHome, familyCode);
    }
  };

  const handleDeleteHome = (id: string) => {
    if (!confirm('Are you sure you want to delete this home and all associated maintenance records?')) return;
    const removedRecordIds = records.filter(r => r.homeId === id).map(r => r.id);

    setHomes(prev => prev.filter(h => h.id !== id));
    setRecords(prev => prev.filter(r => r.homeId !== id));
    setTransactions(prev => prev.filter(t => !removedRecordIds.includes(t.id)));
    setReminders(prev => prev.filter(rem => rem.homeId !== id));

    if (activeHomeId === id) {
      const remaining = homes.filter(h => h.id !== id);
      if (remaining.length > 0) {
        handleSelectHome(remaining[0].id);
      }
    }

    if (user && isFirebaseActive) {
      deleteFirestoreHome(user.uid, id, familyCode);
      deleteRTDBHome(user.uid, id, familyCode);
      removedRecordIds.forEach(recordId => {
        deleteFirestoreRecord(user.uid, recordId, familyCode);
        deleteRTDBRecord(user.uid, recordId, familyCode);
        deleteFirestoreTransaction(user.uid, recordId, familyCode);
      });
    }
  };

  // Handlers for Maintenance Records
  const handleSaveRecord = (recordData: Partial<EnrichedHomeRecord>) => {
    if (!activeHomeId) return;
    // The form's "Target Home" selector lets a record be (re)assigned to any
    // home, not just the one currently active in the app — always defer to
    // it when present so editing a record's home actually moves it.
    const targetHomeId = recordData.homeId || activeHomeId;
    const home = homes.find(h => h.id === targetHomeId);
    if (!home) return;

    const isEdit = !!editingRecord;
    const recordId = editingRecord ? editingRecord.id : `rec-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const auditInfo = user ? {
      uid: user.uid,
      displayName: user.displayName || 'Home Owner',
      email: user.email || undefined
    } : undefined;

    const category = recordData.category || 'General Repair';
    const subcategory = recordData.subcategory || undefined;

    const newRecord: HomeRecord = {
      id: recordId,
      homeId: targetHomeId,
      category,
      subcategory,
      type: recordData.type || 'Maintenance',
      nextServiceDate: recordData.nextServiceDate || undefined,
      createdAt: isEdit ? editingRecord.createdAt : timestamp,
      loggedBy: isEdit ? (editingRecord.loggedBy || auditInfo) : auditInfo,
      lastEditedBy: auditInfo
    };

    const newTransaction: Transaction = {
      id: recordId,
      date: recordData.date || new Date().toISOString().split('T')[0],
      time: recordData.time || new Date().toTimeString().slice(0, 5),
      amount: Number(recordData.cost) || 0,
      vendor: recordData.provider || 'DIY',
      notes: recordData.notes || '',
      category: buildTransactionCategory(category, home, subcategory),
      paymentType: recordData.paymentType || 'Cash',
      user: auditInfo?.displayName || 'Home Owner',
      isTaxDeductible: recordData.isTaxDeductible ?? false
    };

    setRecords(prev => {
      const exists = prev.some(r => r.id === recordId);
      if (exists) {
        return prev.map(r => r.id === recordId ? newRecord : r);
      }
      return [newRecord, ...prev];
    });

    setTransactions(prev => {
      const exists = prev.some(t => t.id === recordId);
      if (exists) {
        return prev.map(t => t.id === recordId ? newTransaction : t);
      }
      return [newTransaction, ...prev];
    });

    setIsServiceModalOpen(false);
    setEditingRecord(null);

    if (user && isFirebaseActive) {
      saveFirestoreRecord(user.uid, newRecord, familyCode);
      saveRTDBRecord(user.uid, newRecord, familyCode);
      saveFirestoreTransaction(user.uid, newTransaction, familyCode);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (!confirm('Delete this maintenance record log?')) return;
    setRecords(prev => prev.filter(r => r.id !== id));
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (user && isFirebaseActive) {
      deleteFirestoreRecord(user.uid, id, familyCode);
      deleteRTDBRecord(user.uid, id, familyCode);
      deleteFirestoreTransaction(user.uid, id, familyCode);
    }
  };

  // Detaches a record from its home, keeping only the underlying Transaction
  // (the shared, app-agnostic ledger entry) intact — used when a logged item
  // turns out not to be a home expense at all. Only the HomeRecord is
  // removed; the Transaction document is left alone so it still shows up
  // wherever the generic transactions collection is consumed. Its category
  // is reset to the "Expense - Other" namespace (rather than left as
  // "Home - ...") so the shared Expense app recognizes it as its own
  // editable row instead of a foreign, read-only Home entry.
  const handleMoveRecordToExpense = (record: EnrichedHomeRecord) => {
    if (!confirm('Move this log out of the home history and keep it only as a general expense? It will no longer appear on this home.')) return;
    setRecords(prev => prev.filter(r => r.id !== record.id));
    setIsServiceModalOpen(false);
    setEditingRecord(null);

    const transaction = transactions.find(t => t.id === record.id);
    if (transaction && transaction.category !== 'Expense - Other') {
      const updatedTransaction: Transaction = { ...transaction, category: 'Expense - Other' };
      setTransactions(prev => prev.map(t => (t.id === record.id ? updatedTransaction : t)));
      if (user && isFirebaseActive) {
        saveFirestoreTransaction(user.uid, updatedTransaction, familyCode);
      }
    }

    if (user && isFirebaseActive) {
      deleteFirestoreRecord(user.uid, record.id, familyCode);
      deleteRTDBRecord(user.uid, record.id, familyCode);
    }
  };

  // Handlers for Maintenance Reminders
  const handleSaveReminder = (reminderData: HomeReminder) => {
    const isEdit = reminders.some(rem => rem.id === reminderData.id);
    const auditInfo = user ? {
      uid: user.uid,
      displayName: user.displayName || 'Home Owner',
      email: user.email || undefined
    } : undefined;

    const newReminder: HomeReminder = {
      ...reminderData,
      createdBy: isEdit ? reminderData.createdBy : auditInfo,
      lastEditedBy: auditInfo
    };

    setReminders(prev => {
      const exists = prev.some(rem => rem.id === newReminder.id);
      if (exists) {
        return prev.map(rem => rem.id === newReminder.id ? newReminder : rem);
      }
      return [newReminder, ...prev];
    });

    setIsReminderModalOpen(false);
    setEditingReminder(null);

    if (user && isFirebaseActive) {
      saveFirestoreReminder(user.uid, newReminder, familyCode);
      saveRTDBReminder(user.uid, newReminder, familyCode);
    }
  };

  const handleToggleCompleteReminder = (reminder: HomeReminder) => {
    const auditInfo = user ? {
      uid: user.uid,
      displayName: user.displayName || 'Home Owner',
      email: user.email || undefined
    } : undefined;

    const updated = {
      ...reminder,
      isCompleted: !reminder.isCompleted,
      lastEditedBy: auditInfo
    };

    setReminders(prev => prev.map(rem => rem.id === reminder.id ? updated : rem));

    if (user && isFirebaseActive) {
      saveFirestoreReminder(user.uid, updated, familyCode);
      saveRTDBReminder(user.uid, updated, familyCode);
    }
  };

  const handleCompleteAndLogService = (reminder: HomeReminder) => {
    handleToggleCompleteReminder(reminder);
    setEditingRecord(null);
    setIsServiceModalOpen(true);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(rem => rem.id !== id));
    if (user && isFirebaseActive) {
      deleteFirestoreReminder(user.uid, id, familyCode);
      deleteRTDBReminder(user.uid, id, familyCode);
    }
  };

  const handleRefreshData = () => {
    setHomes(loadLocalHomes());
    setRecords(loadLocalRecords());
    setTransactions(loadLocalTransactions());
    setReminders(loadLocalReminders());
  };

  const handleClearDemoData = () => {
    clearDemoData();
    setHomes([]);
    setRecords([]);
    setTransactions([]);
    setReminders([]);
  };

  const handleRestoreSampleData = () => {
    restoreSampleData();
    const freshHomes = loadLocalHomes();
    setHomes(freshHomes);
    setRecords(loadLocalRecords());
    setTransactions(loadLocalTransactions());
    setReminders(loadLocalReminders());
    if (freshHomes.length > 0) {
      handleSelectHome(freshHomes[0].id);
    }
  };

  // Render Login Screen if mandatory Auth is loading or user signed out
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <span>Authenticating HomeTracker Session...</span>
        </div>
      </div>
    );
  }

  if (isFirebaseActive && !user) {
    return (
      <LoginScreen
        onGoogleSignIn={loginWithGoogle}
      />
    );
  }

  const unreadRemindersCount = reminders.filter(rem => !rem.isCompleted).length;

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-24 lg:pb-0 transition-colors ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>

      {/* Top Banner Navigation Header */}
      <Navbar
        homes={homes}
        activeHomeId={activeHomeId}
        onSelectHome={handleSelectHome}
        onOpenAddService={() => {
          setEditingRecord(null);
          setIsServiceModalOpen(true);
        }}
        onOpenAddHome={() => {
          setIsHomeModalOpen(true);
        }}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenAbout={() => setActiveTab('about')}
        isOnline={isOnline}
        isFirebaseActive={isFirebaseActive}
        user={user}
        familyCode={familyCode}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Tab View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            activeHome={activeHome}
            records={enrichedRecords}
            reminders={reminders}
            onOpenAddService={() => {
              setEditingRecord(null);
              setIsServiceModalOpen(true);
            }}
            onOpenAddHome={() => {
              setIsHomeModalOpen(true);
            }}
            onOpenAddReminder={() => {
              setEditingReminder(null);
              setIsReminderModalOpen(true);
            }}
            onSelectTab={(tab: 'history' | 'reminders' | 'analytics' | 'homes') => setActiveTab(tab)}
          />
        )}

        {activeTab === 'homes' && (
          <HouseGarage
            homes={homes}
            activeHomeId={activeHomeId}
            familyCode={familyCode}
            onSelectHome={handleSelectHome}
            onSaveHome={handleSaveHome}
            onDeleteHome={handleDeleteHome}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'history' && (
          <RecordHistory
            records={enrichedRecords}
            homes={homes}
            activeHomeId={activeHomeId}
            onOpenAddService={() => {
              setEditingRecord(null);
              setIsServiceModalOpen(true);
            }}
            onEditRecord={(rec: EnrichedHomeRecord) => {
              setEditingRecord(rec);
              setIsServiceModalOpen(true);
            }}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'reminders' && (
          <ReminderManager
            reminders={reminders}
            homes={homes}
            activeHomeId={activeHomeId}
            onSaveReminder={handleSaveReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleComplete={handleToggleCompleteReminder}
            onCompleteAndLogService={handleCompleteAndLogService}
          />
        )}

        {activeTab === 'analytics' && (
          <CostAnalytics
            homes={homes}
            activeHomeId={activeHomeId}
            records={enrichedRecords}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            user={user}
            isFirebaseActive={isFirebaseActive}
            familyCode={familyCode}
            onSetFamilyCode={handleSetFamilyCode}
            onRefreshData={handleRefreshData}
            onClearDemoData={handleClearDemoData}
            onRestoreSampleData={handleRestoreSampleData}
            paymentTypesCount={paymentTypes.length}
            onManagePaymentTypes={() => setIsPaymentTypesModalOpen(true)}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

      </main>

      {/* Shared Modals */}
      <RecordFormModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleSaveRecord}
        homes={homes}
        activeHomeId={activeHomeId}
        initialRecord={editingRecord}
        paymentTypes={paymentTypes}
        onManagePaymentTypes={() => setIsPaymentTypesModalOpen(true)}
        onMoveToExpense={handleMoveRecordToExpense}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <HouseModal
        isOpen={isHomeModalOpen}
        onClose={() => setIsHomeModalOpen(false)}
        onSave={handleSaveHome}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleSaveReminder}
        homes={homes}
        activeHomeId={activeHomeId}
        initialReminder={editingReminder}
      />

      <PaymentTypesModal
        isOpen={isPaymentTypesModalOpen}
        onClose={() => setIsPaymentTypesModalOpen(false)}
        paymentTypes={paymentTypes}
      />

      {/* Navigation Bar */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadRemindersCount={unreadRemindersCount}
      />

      {/* PWA Home Screen Install Banner */}
      <PWAInstallPrompt />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 no-print">
        <p>HomeTracker Progressive Web App • Cloudflare Pages Ready • Offline Capable</p>
      </footer>

    </div>
  );
};

export default App;
