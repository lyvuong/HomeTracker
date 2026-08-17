import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cloud,
  Users,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  LogOut,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  ShieldAlert,
  CreditCard,
  ChevronRight,
  Layers
} from 'lucide-react';
import type { FirebaseConfig, UserProfile } from '../../types';
import {
  exportDataAsJSON,
  importJSONBackup,
  getStoredFirebaseConfig,
  setStoredFirebaseConfig,
  loadLocalHomes,
  loadLocalRecords,
  loadLocalReminders,
  loadLocalTransactions
} from '../../services/storage';
import {
  initializeFirebaseService,
  loginWithGoogle,
  logoutFirebase
} from '../../services/firebase';

interface SettingsModalProps {
  user: UserProfile | null;
  isFirebaseActive: boolean;
  familyCode: string;
  onSetFamilyCode: (code: string) => Promise<{ success: boolean; message: string }>;
  onRefreshData: () => void;
  onClearDemoData?: () => void;
  onRestoreSampleData: () => void;
  paymentTypesCount?: number;
  onManagePaymentTypes?: () => void;
  categoriesCount?: number;
  onManageCategories?: () => void;
  theme?: 'light' | 'dark';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  isFirebaseActive,
  familyCode,
  onSetFamilyCode,
  onRefreshData,
  onClearDemoData,
  onRestoreSampleData,
  paymentTypesCount = 0,
  onManagePaymentTypes,
  categoriesCount = 9,
  onManageCategories,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const [inputFamilyCode, setInputFamilyCode] = useState(familyCode || '');
  const [familyStatusMsg, setFamilyStatusMsg] = useState('');
  const [isFamilySubmitting, setIsFamilySubmitting] = useState(false);

  // Advanced Firebase Controls State
  const [isAdvancedUnlocked, setIsAdvancedUnlocked] = useState(false);
  const [customConfig, setCustomConfig] = useState<FirebaseConfig>(() => {
    const existing = getStoredFirebaseConfig();
    return existing || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  });
  const [firebaseSavedMsg, setFirebaseSavedMsg] = useState('');

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFamilySubmitting(true);
    setFamilyStatusMsg('');

    try {
      const res = await onSetFamilyCode(inputFamilyCode);
      setFamilyStatusMsg(res.message);
      if (!res.success) {
        setInputFamilyCode('');
      }
    } catch (err: any) {
      setFamilyStatusMsg(err.message || 'Error updating household code.');
      setInputFamilyCode('');
    } finally {
      setIsFamilySubmitting(false);
    }
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredFirebaseConfig(customConfig);
    const success = initializeFirebaseService(customConfig);
    if (success) {
      setFirebaseSavedMsg('✅ Custom Firebase Config Saved & Initialized!');
      onRefreshData();
    } else {
      setFirebaseSavedMsg('⚠️ Config saved to LocalStorage, but initialization failed. Check your keys.');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        importJSONBackup(content);
        onRefreshData();
        alert('🎉 Backup data imported successfully!');
      } catch (err: any) {
        alert(`❌ Import Failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    exportDataAsJSON(loadLocalHomes(), loadLocalRecords(), loadLocalReminders(), loadLocalTransactions());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl space-y-1">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-2xl border ${
            isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            <SettingsIcon className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">App Settings & Account Profile</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your login session, household code, data backups, and custom cloud setup.
        </p>
      </div>

      {/* 1. Google Authentication Section */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google User Account</h2>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            user
              ? isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : isDark ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {user ? (isFirebaseActive ? 'Authenticated (Firebase Sync Active)' : 'Authenticated') : 'Offline / Signed Out'}
          </span>
        </div>

        {user ? (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-12 h-12 rounded-full border-2 border-emerald-500/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-lg border border-emerald-500/30">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.displayName}</h3>
                <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => logoutFirebase()}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all active:scale-95 ${
                isDark
                  ? 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border-red-800/80'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className={`p-5 rounded-2xl border text-center space-y-3 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Sign in with your Google account to enable cloud backups, cross-device real-time sync, and multi-user household homes.
            </p>
            <button
              onClick={() => loginWithGoogle()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Cloud className="w-4 h-4" />
              Sign In with Google
            </button>
          </div>
        )}
      </div>

      {/* 2. Shared Household Sync Section */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Shared Household Sync</h2>
          </div>
          {familyCode && (
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              isDark ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              Active: {familyCode}
            </span>
          )}
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Sync homes and maintenance logs with your spouse or family members! Anyone entering the same <strong>Household Code</strong> will automatically view and edit the same shared homes in real time on their own Google account.
        </p>

        <form onSubmit={handleJoinHousehold} className={`p-5 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Household Sync Code (e.g. VUONG-FAMILY, HOME-1234)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="E.G. VUONG-FAMILY"
                value={inputFamilyCode}
                onChange={(e) => setInputFamilyCode(e.target.value.toUpperCase())}
                className="flex-1 glass-input font-mono text-sm px-3.5 py-2.5 rounded-xl uppercase tracking-wider font-bold"
              />
              <button
                type="submit"
                disabled={isFamilySubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {isFamilySubmitting ? 'Verifying...' : 'Save & Join Household'}
              </button>
            </div>
          </div>

          {familyStatusMsg && (
            <p className={`text-xs font-semibold p-3 rounded-xl border ${
              familyStatusMsg.includes('✅') || familyStatusMsg.includes('🎉')
                ? isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isDark ? 'bg-red-950/80 text-red-300 border-red-800' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {familyStatusMsg}
            </p>
          )}
        </form>
      </div>

      {/* Payment Methods Section */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment Methods</h2>
          </div>
          {onManagePaymentTypes && (
            <button
              onClick={onManagePaymentTypes}
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                isDark
                  ? 'text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border-indigo-800/80'
                  : 'text-indigo-700 hover:text-indigo-900 bg-indigo-50 border-indigo-200'
              }`}
            >
              Payment Methods Info <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Manage your personal and household payment methods centrally in ExpenseTracker to tag maintenance records.
        </p>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold ${
              isDark ? 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Active Payment Methods</span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{paymentTypesCount} method{paymentTypesCount === 1 ? '' : 's'} synced</span>
            </div>
          </div>
          {onManagePaymentTypes && (
            <button
              onClick={onManagePaymentTypes}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Info
            </button>
          )}
        </div>
      </div>

      {/* Categories & Subcategories Section */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Categories & Subcategories</h2>
          </div>
          {onManageCategories && (
            <button
              onClick={onManageCategories}
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                isDark
                  ? 'text-blue-400 hover:text-blue-300 bg-blue-950/60 border-blue-800/80'
                  : 'text-blue-700 hover:text-blue-900 bg-blue-50 border-blue-200'
              }`}
            >
              Manage Taxonomy <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Configure the 2-level hierarchical taxonomy (Mortgage & Rent, Tax, Utilities, Insurance, Maintenance & Repairs, Renovations, etc.).
        </p>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold ${
              isDark ? 'bg-blue-950/80 text-blue-400 border-blue-800/60' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Property Taxonomy</span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{categoriesCount} active categories</span>
            </div>
          </div>
          {onManageCategories && (
            <button
              onClick={onManageCategories}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Customize
            </button>
          )}
        </div>
      </div>

      {/* 3. Data Portability & Local Backups */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Portability & Offline Backups</h2>
        </div>

        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Export your complete homes, maintenance logs, and reminders as a JSON backup file or restore previously exported data.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="glass-button text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export Full JSON Backup
          </button>

          <label className="glass-button text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95">
            <Upload className="w-4 h-4 text-emerald-500" />
            Import JSON Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4. Protected Collapsible Advanced Firebase & Demo Data Section */}
      <div className={`rounded-3xl overflow-hidden border ${
        isDark ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>

        {/* Collapsible Header Toggle */}
        <button
          onClick={() => setIsAdvancedUnlocked(!isAdvancedUnlocked)}
          className={`w-full p-6 flex items-center justify-between text-left transition-colors ${
            isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-2xl border ${
              isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {isAdvancedUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Advanced Firebase & Demo Data Controls
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Custom API keys, database credentials, and demo data reset.
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl border ${
            isDark ? 'text-amber-400 bg-amber-950/60 border-amber-800/60' : 'text-amber-800 bg-amber-50 border-amber-200'
          }`}>
            {isAdvancedUnlocked ? 'Hide Advanced Controls' : '[ 🔓 Unlock to View & Edit ]'}
            {isAdvancedUnlocked ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {/* Collapsible Panel Content */}
        {isAdvancedUnlocked && (
          <div className={`p-6 pt-0 space-y-6 border-t ${
            isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-100 bg-slate-50/50'
          }`}>

            {/* Warning Banner */}
            <div className={`p-3.5 border rounded-2xl flex items-center gap-3 text-xs ${
              isDark ? 'bg-amber-950/40 border-amber-800/50 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <span>
                These controls are for advanced setup. Modifying API keys or clearing demo data affects your active browser session.
              </span>
            </div>

            {/* Custom Firebase Form */}
            <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Custom Firebase Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>API Key</label>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    value={customConfig.apiKey || ''}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full glass-input font-mono text-xs px-3 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Project ID</label>
                  <input
                    type="text"
                    placeholder="my-hometracker-app"
                    value={customConfig.projectId || ''}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full glass-input font-mono text-xs px-3 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Auth Domain (Optional)</label>
                  <input
                    type="text"
                    placeholder="my-app.firebaseapp.com"
                    value={customConfig.authDomain || ''}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, authDomain: e.target.value }))}
                    className="w-full glass-input font-mono text-xs px-3 py-2 rounded-xl"
                  />
                </div>

                <div>
                  <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>App ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="1:123456:web:abcd"
                    value={customConfig.appId || ''}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, appId: e.target.value }))}
                    className="w-full glass-input font-mono text-xs px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  Save Custom Firebase Keys
                </button>

                {firebaseSavedMsg && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold">{firebaseSavedMsg}</span>
                )}
              </div>
            </form>

            {/* Demo Data Management Controls */}
            <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Demo Dataset Management
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                {onClearDemoData && (
                  <button
                    onClick={() => {
                      if (confirm('Clear sample demo homes and records from local storage?')) {
                        onClearDemoData();
                      }
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all active:scale-95 ${
                      isDark
                        ? 'bg-slate-800 hover:bg-red-950 text-red-400 border-slate-700 hover:border-red-800'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Purge Demo Homes & Records
                  </button>
                )}

                <button
                  onClick={() => {
                    onRestoreSampleData();
                    alert('Sample dataset restored!');
                  }}
                  className="glass-button text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-500" />
                  Restore Sample Homes & Logs
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
