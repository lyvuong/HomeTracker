import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getDatabase, ref, set, remove, onValue } from 'firebase/database';
import type { Database } from 'firebase/database';
import type { FirebaseConfig, Home, HomeRecord, HomeReminder, Transaction, UserProfile, UserAuditInfo, PaymentTypeItem, TaxonomyOverride, TaxonomyOverrideDoc } from '../types';
import { getStoredFirebaseConfig, setStoredFirebaseConfig, getStoredFamilyCode, setStoredFamilyCode } from './storage';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

const envConfig: FirebaseConfig | null = import.meta.env.VITE_FIREBASE_API_KEY ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
} : null;

export const initializeFirebaseService = (customConfig?: FirebaseConfig): boolean => {
  const config = customConfig || getStoredFirebaseConfig() || envConfig;
  if (!config || !config.apiKey || !config.projectId) {
    console.log('[Firebase] Running in Local Demo Mode');
    return false;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    try {
      rtdb = getDatabase(app);
    } catch (rtdbErr) {
      console.warn('[Firebase] Realtime Database init warning:', rtdbErr);
    }
    auth = getAuth(app);
    if (customConfig) {
      setStoredFirebaseConfig(customConfig);
    }
    console.log('[Firebase] Initialized for project:', config.projectId);
    return true;
  } catch (err) {
    console.warn('[Firebase] Initialization failed:', err);
    return false;
  }
};

export const isFirebaseConfigured = (): boolean => {
  return (db !== null || rtdb !== null) && auth !== null;
};

export const subscribeAuth = (callback: (user: UserProfile | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Home Owner',
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous
      });
    } else {
      callback(null);
    }
  });
};

export const loginWithGoogle = async (): Promise<UserProfile | null> => {
  if (!auth) throw new Error('Firebase Auth is not configured.');
  setStoredFamilyCode('');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  const res = await signInWithPopup(auth, provider);
  localStorage.setItem('hometrack_auto_signin_google', 'true');
  return {
    uid: res.user.uid,
    email: res.user.email,
    displayName: res.user.displayName,
    photoURL: res.user.photoURL
  };
};

export const signInWithGoogle = loginWithGoogle;

export const tryAutoSignInGoogle = async (): Promise<UserProfile | null> => {
  if (!auth) return null;
  if (auth.currentUser) {
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      photoURL: auth.currentUser.photoURL
    };
  }
  return null;
};

export const loginWithEmail = async (email: string, pass: string): Promise<UserProfile | null> => {
  if (!auth) throw new Error('Firebase Auth is not configured.');
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return {
    uid: res.user.uid,
    email: res.user.email,
    displayName: res.user.displayName || email.split('@')[0],
    photoURL: res.user.photoURL
  };
};

export const registerWithEmail = async (email: string, pass: string): Promise<UserProfile | null> => {
  if (!auth) throw new Error('Firebase Auth is not configured.');
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  return {
    uid: res.user.uid,
    email: res.user.email,
    displayName: email.split('@')[0],
    photoURL: res.user.photoURL
  };
};

export const logoutFirebase = async (): Promise<void> => {
  localStorage.removeItem('hometrack_auto_signin_google');
  setStoredFamilyCode('');
  if (auth) {
    await firebaseSignOut(auth);
  }
};

const getStorageTarget = (userId: string, familyCode?: string) => {
  const code = (familyCode || getStoredFamilyCode() || '').trim().toUpperCase();
  if (code) {
    return { root: 'households', id: code };
  }
  return { root: 'users', id: userId };
};

export const subscribeFirestoreHomes = (
  userId: string,
  familyCodeOrCb?: string | ((homes: Home[]) => void),
  callback?: (homes: Home[]) => void
) => {
  if (!db) return () => {};
  const cb = typeof familyCodeOrCb === 'function' ? familyCodeOrCb : callback!;
  const code = typeof familyCodeOrCb === 'string' ? familyCodeOrCb : undefined;
  const target = getStorageTarget(userId, code);
  const q = query(collection(db, target.root, target.id, 'houses'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const homes: Home[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Home));
    if (cb) cb(homes);
  }, (error) => {
    console.error('[Firestore] Homes sync error:', error);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied')) {
      console.warn('[Firestore] Permission denied. Clearing invalid household code.');
      setStoredFamilyCode('');
    }
  });
};

// One-time fetch of a user's personal homes, bypassing getStorageTarget's
// household fallback. Used to auto-promote a home into an active
// household's scope when a household record references it but it was only
// ever saved under the user's personal users/{uid}/houses.
export const getPersonalHomesOnce = async (userId: string): Promise<Home[]> => {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'houses'));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Home));
  } catch (err) {
    console.error('[Firestore] Error fetching personal homes:', err);
    return [];
  }
};

export const saveFirestoreHome = async (userId: string, home: Home, familyCode?: string): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const cleanHome = JSON.parse(JSON.stringify(home));
    const docRef = doc(db, target.root, target.id, 'houses', home.id);
    await setDoc(docRef, cleanHome, { merge: true });
    console.log(`[Firestore] Home saved successfully to ${target.root}/${target.id}:`, home.id);
  } catch (err: any) {
    console.error('[Firestore] Error saving home:', err);
    if (err.code === 'permission-denied' || err.message?.includes('permission-denied')) {
      setStoredFamilyCode('');
    }
  }
};

export const deleteFirestoreHome = async (userId: string, homeId: string, familyCode?: string): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    await deleteDoc(doc(db, target.root, target.id, 'houses', homeId));
    console.log(`[Firestore] Home deleted successfully from ${target.root}/${target.id}:`, homeId);
  } catch (err) {
    console.error('[Firestore] Error deleting home:', err);
  }
};

export const subscribeFirestoreRecords = (
  userId: string,
  familyCodeOrCb?: string | ((records: HomeRecord[]) => void),
  callback?: (records: HomeRecord[]) => void
) => {
  if (!db) return () => {};
  const cb = typeof familyCodeOrCb === 'function' ? familyCodeOrCb : callback!;
  const code = typeof familyCodeOrCb === 'string' ? familyCodeOrCb : undefined;
  const target = getStorageTarget(userId, code);
  const q = query(collection(db, target.root, target.id, 'homeRecords'));
  return onSnapshot(q, (snapshot) => {
    const records: HomeRecord[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as HomeRecord));
    if (cb) cb(records);
  }, (error) => {
    console.error('[Firestore] Records sync error:', error);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied')) {
      setStoredFamilyCode('');
    }
  });
};

export const saveFirestoreRecord = async (userId: string, record: HomeRecord, familyCode?: string): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const cleanRecord = JSON.parse(JSON.stringify(record));
    const docRef = doc(db, target.root, target.id, 'homeRecords', record.id);
    await setDoc(docRef, cleanRecord, { merge: true });
    console.log(`[Firestore] Record saved successfully to ${target.root}/${target.id}:`, record.id);
  } catch (err) {
    console.error('[Firestore] Error saving record:', err);
  }
};

export const deleteFirestoreRecord = async (userId: string, recordId: string, familyCode?: string): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    await deleteDoc(doc(db, target.root, target.id, 'homeRecords', recordId));
  } catch (err) {
    console.error('[Firestore] Error deleting record:', err);
  }
};

// ==========================================
// Generic Transactions Ledger (Firestore only)
// Shared, app-agnostic collection: this is the exact same
// users/{uid}/transactions or households/{code}/transactions path that
// CarTracker writes to, so car and home cost entries coexist in one ledger.
// ==========================================

export const subscribeFirestoreTransactions = (
  userId: string,
  familyCodeOrCb?: string | ((transactions: Transaction[]) => void),
  callback?: (transactions: Transaction[]) => void
) => {
  if (!db) return () => {};
  const cb = typeof familyCodeOrCb === 'function' ? familyCodeOrCb : callback!;
  const code = typeof familyCodeOrCb === 'string' ? familyCodeOrCb : undefined;
  const target = getStorageTarget(userId, code);
  const q = query(collection(db, target.root, target.id, 'transactions'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Transaction));
    if (cb) cb(transactions);
  }, (error) => {
    console.error('[Firestore] Transactions sync error:', error);
  });
};

export const saveFirestoreTransaction = async (userId: string, transaction: Transaction, familyCode?: string): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const cleanTransaction = JSON.parse(JSON.stringify(transaction));
    const docRef = doc(db, target.root, target.id, 'transactions', transaction.id);
    await setDoc(docRef, cleanTransaction, { merge: true });
    console.log(`[Firestore] Transaction saved successfully to ${target.root}/${target.id}:`, transaction.id);
  } catch (err) {
    console.error('[Firestore] Error saving transaction:', err);
  }
};

export const deleteFirestoreTransaction = async (userId: string, transactionId: string, familyCode?: string): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    await deleteDoc(doc(db, target.root, target.id, 'transactions', transactionId));
  } catch (err) {
    console.error('[Firestore] Error deleting transaction:', err);
  }
};

export const saveFirestoreReminder = async (userId: string, reminder: HomeReminder, familyCode?: string): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const cleanReminder = JSON.parse(JSON.stringify(reminder));
    const docRef = doc(db, target.root, target.id, 'homeReminders', reminder.id);
    await setDoc(docRef, cleanReminder, { merge: true });
    console.log(`[Firestore] Reminder saved successfully to ${target.root}/${target.id}:`, reminder.id);
  } catch (err) {
    console.error('[Firestore] Error saving reminder:', err);
  }
};

export const subscribeFirestoreReminders = (
  userId: string,
  familyCodeOrCb?: string | ((reminders: HomeReminder[]) => void),
  callback?: (reminders: HomeReminder[]) => void
) => {
  if (!db) return () => {};
  const cb = typeof familyCodeOrCb === 'function' ? familyCodeOrCb : callback!;
  const code = typeof familyCodeOrCb === 'string' ? familyCodeOrCb : undefined;
  const target = getStorageTarget(userId, code);
  const q = query(collection(db, target.root, target.id, 'homeReminders'));
  return onSnapshot(q, (snapshot) => {
    const reminders: HomeReminder[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as HomeReminder));
    if (cb) cb(reminders);
  }, (error) => {
    console.error('[Firestore] Reminders sync error:', error);
  });
};

export const deleteFirestoreReminder = async (userId: string, reminderId: string, familyCode?: string): Promise<void> => {
  if (!db) return;
  const target = getStorageTarget(userId, familyCode);
  await deleteDoc(doc(db, target.root, target.id, 'homeReminders', reminderId));
};

// ==========================================
// Firebase Realtime Database (RTDB) Handlers
// ==========================================

export const subscribeRTDBHomes = (
  userId: string,
  familyCodeOrCb?: string | ((homes: Home[]) => void),
  callback?: (homes: Home[]) => void
) => {
  if (!rtdb) return () => {};
  const cb = typeof familyCodeOrCb === 'function' ? familyCodeOrCb : callback!;
  const code = typeof familyCodeOrCb === 'string' ? familyCodeOrCb : undefined;
  const target = getStorageTarget(userId, code);
  const hRef = ref(rtdb, `${target.root}/${target.id}/houses`);
  return onValue(hRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (cb) cb([]);
      return;
    }
    const homesList: Home[] = Object.values(val);
    if (cb) cb(homesList);
  }, (err) => {
    console.error('[RTDB] Homes sync error:', err);
  });
};

export const saveRTDBHome = async (userId: string, home: Home, familyCode?: string): Promise<void> => {
  if (!rtdb) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const cleanHome = JSON.parse(JSON.stringify(home));
    await set(ref(rtdb, `${target.root}/${target.id}/houses/${home.id}`), cleanHome);
    console.log(`[RTDB] Home saved successfully to ${target.root}/${target.id}:`, home.id);
  } catch (err) {
    console.error('[RTDB] Error saving home:', err);
  }
};

export const deleteRTDBHome = async (userId: string, homeId: string, familyCode?: string): Promise<void> => {
  if (!rtdb) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    await remove(ref(rtdb, `${target.root}/${target.id}/houses/${homeId}`));
    console.log(`[RTDB] Home deleted successfully from ${target.root}/${target.id}:`, homeId);
  } catch (err) {
    console.error('[RTDB] Error deleting home:', err);
  }
};

export const subscribeRTDBRecords = (
  userId: string,
  familyCodeOrCb?: string | ((records: HomeRecord[]) => void),
  callback?: (records: HomeRecord[]) => void
) => {
  if (!rtdb) return () => {};
  const cb = typeof familyCodeOrCb === 'function' ? familyCodeOrCb : callback!;
  const code = typeof familyCodeOrCb === 'string' ? familyCodeOrCb : undefined;
  const target = getStorageTarget(userId, code);
  const rRef = ref(rtdb, `${target.root}/${target.id}/homeRecords`);
  return onValue(rRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (cb) cb([]);
      return;
    }
    const recordsList: HomeRecord[] = Object.values(val);
    recordsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (cb) cb(recordsList);
  }, (err) => {
    console.error('[RTDB] Records sync error:', err);
  });
};

export const saveRTDBRecord = async (userId: string, record: HomeRecord, familyCode?: string): Promise<void> => {
  if (!rtdb) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const cleanRecord = JSON.parse(JSON.stringify(record));
    await set(ref(rtdb, `${target.root}/${target.id}/homeRecords/${record.id}`), cleanRecord);
    console.log(`[RTDB] Record saved successfully to ${target.root}/${target.id}:`, record.id);
  } catch (err) {
    console.error('[RTDB] Error saving record:', err);
  }
};

export const deleteRTDBRecord = async (userId: string, recordId: string, familyCode?: string): Promise<void> => {
  if (!rtdb) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    await remove(ref(rtdb, `${target.root}/${target.id}/homeRecords/${recordId}`));
  } catch (err) {
    console.error('[RTDB] Error deleting record:', err);
  }
};

export const subscribeRTDBReminders = (
  userId: string,
  familyCodeOrCb?: string | ((reminders: HomeReminder[]) => void),
  callback?: (reminders: HomeReminder[]) => void
) => {
  if (!rtdb) return () => {};
  const cb = typeof familyCodeOrCb === 'function' ? familyCodeOrCb : callback!;
  const code = typeof familyCodeOrCb === 'string' ? familyCodeOrCb : undefined;
  const target = getStorageTarget(userId, code);
  const remRef = ref(rtdb, `${target.root}/${target.id}/homeReminders`);
  return onValue(remRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (cb) cb([]);
      return;
    }
    const remindersList: HomeReminder[] = Object.values(val);
    if (cb) cb(remindersList);
  }, (err) => {
    console.error('[RTDB] Reminders sync error:', err);
  });
};

export const saveRTDBReminder = async (userId: string, reminder: HomeReminder, familyCode?: string): Promise<void> => {
  if (!rtdb) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const cleanReminder = JSON.parse(JSON.stringify(reminder));
    await set(ref(rtdb, `${target.root}/${target.id}/homeReminders/${reminder.id}`), cleanReminder);
    console.log(`[RTDB] Reminder saved successfully to ${target.root}/${target.id}:`, reminder.id);
  } catch (err) {
    console.error('[RTDB] Error saving reminder:', err);
  }
};

export const deleteRTDBReminder = async (userId: string, reminderId: string, familyCode?: string): Promise<void> => {
  if (!rtdb) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    await remove(ref(rtdb, `${target.root}/${target.id}/homeReminders/${reminderId}`));
  } catch (err) {
    console.error('[RTDB] Error deleting reminder:', err);
  }
};

export const verifyOrCreateHousehold = async (
  familyCode: string,
  userProfile: UserProfile
): Promise<{ success: boolean; message: string; isNew?: boolean }> => {
  if (!db) return { success: true, message: 'Offline mode active.' };

  const code = familyCode.trim().toUpperCase();
  if (!code) return { success: false, message: 'Please enter a Household Code.' };

  try {
    const metaRef = doc(db, 'households', code, 'metadata', 'info');
    const docSnap = await getDoc(metaRef);

    const auditUser: UserAuditInfo = {
      uid: userProfile.uid,
      displayName: userProfile.displayName || 'User',
      email: userProfile.email || undefined
    };

    if (docSnap.exists()) {
      // Update members list & memberUids map if needed
      const data = docSnap.data();
      const members: UserAuditInfo[] = data.members || [];
      const memberUids: Record<string, boolean> = data.memberUids || {};

      if (!members.some(m => m.uid === userProfile.uid) || !memberUids[userProfile.uid]) {
        if (!members.some(m => m.uid === userProfile.uid)) {
          members.push(auditUser);
        }
        memberUids[userProfile.uid] = true;
        await setDoc(metaRef, { members, memberUids }, { merge: true });
      }

      return {
        success: true,
        isNew: false,
        message: `✅ Joined Household ${code}!`
      };
    } else {
      // Create new Household Metadata (Allowed only if user is Admin)
      const memberUids: Record<string, boolean> = { [userProfile.uid]: true };
      const newHousehold = {
        code,
        createdBy: auditUser,
        createdAt: new Date().toISOString(),
        members: [auditUser],
        memberUids
      };
      await setDoc(metaRef, newHousehold);
      return {
        success: true,
        isNew: true,
        message: `🎉 Successfully created new Household ${code}!`
      };
    }
  } catch (err: any) {
    console.error('[Firestore] Error verifying household:', err);
    if (err.code === 'permission-denied' || err.message?.includes('permission-denied') || err.message?.includes('insufficient permissions')) {
      return {
        success: false,
        message: '❌ Creation of new Household Codes is restricted to System Administrators. Please ask your Admin for an existing Household Code.'
      };
    }
    return { success: false, message: err.message || 'Error joining Household Code.' };
  }
};

// ==========================================
// Household / User Payment Types Collection
// ==========================================

export const subscribeFirestorePaymentTypes = (
  userId: string,
  familyCode: string | undefined,
  callback: (paymentTypes: PaymentTypeItem[]) => void
) => {
  if (!db) return () => {};
  const target = getStorageTarget(userId, familyCode);
  const q = collection(db, target.root, target.id, 'payment_types');
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as PaymentTypeItem)));
  }, (error) => {
    console.error('[Firestore] Payment types sync error:', error);
  });
};

export const saveFirestorePaymentType = async (
  userId: string,
  paymentType: PaymentTypeItem,
  familyCode?: string
): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const clean = JSON.parse(JSON.stringify(paymentType));
    await setDoc(doc(db, target.root, target.id, 'payment_types', paymentType.id), clean, { merge: true });
    console.log(`[Firestore] Payment type saved to ${target.root}/${target.id}:`, paymentType.name);
  } catch (err) {
    console.error('[Firestore] Error saving payment type:', err);
  }
};

// ==========================================
// Taxonomy Overrides (Property Categories & Subcategories)
// Syncs to households/{familyCode}/settings/taxonomy
// ==========================================

export const subscribeTaxonomyOverride = (
  userId: string,
  familyCode: string | undefined,
  callback: (data: TaxonomyOverrideDoc) => void
) => {
  if (!db) {
    callback({});
    return () => {};
  }
  const target = getStorageTarget(userId, familyCode);
  const refDoc = doc(db, target.root, target.id, 'settings', 'taxonomy');
  return onSnapshot(refDoc, (snap) => {
    callback(snap.exists() ? (snap.data() as TaxonomyOverrideDoc) : {});
  }, (err) => {
    console.warn('[Firestore] Taxonomy override sync error:', err);
    callback({});
  });
};

export const saveTaxonomyOverride = async (
  userId: string,
  familyCode: string | undefined,
  targetName: string,
  override: TaxonomyOverride
): Promise<void> => {
  if (!db) return;
  try {
    const target = getStorageTarget(userId, familyCode);
    const refDoc = doc(db, target.root, target.id, 'settings', 'taxonomy');
    const cleanOverride = JSON.parse(JSON.stringify(override));
    await setDoc(refDoc, { [targetName]: cleanOverride }, { merge: true });
    console.log(`[Firestore] Taxonomy override saved to ${target.root}/${target.id}:`, targetName);
  } catch (err) {
    console.error('[Firestore] Error saving taxonomy override:', err);
  }
};

