import React from 'react';
import { PlusCircle, Wifi, WifiOff, Cloud, Database, Settings, Info, Sun, Moon } from 'lucide-react';
import type { Home, UserProfile } from '../../types';

interface NavbarProps {
  homes: Home[];
  activeHomeId: string;
  onSelectHome: (id: string) => void;
  onOpenAddService?: () => void;
  onOpenAddHome: () => void;
  onOpenSettings: () => void;
  onOpenAbout?: () => void;
  user: UserProfile | null;
  isOnline: boolean;
  isFirebaseActive: boolean;
  familyCode?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  homes,
  activeHomeId,
  onSelectHome,
  onOpenAddService,
  onOpenAddHome,
  onOpenSettings,
  onOpenAbout,
  user,
  isOnline,
  isFirebaseActive,
  theme = 'light',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-lg transition-colors ${
      isDark 
        ? 'bg-slate-900/90 border-slate-800 text-white' 
        : 'bg-white/90 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Logo & App Name */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/favicon.svg"
              alt="HomeTracker Icon"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 object-cover"
            />
            <div className="hidden sm:block">
              <span className={`text-xl font-black tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Home<span className="text-emerald-500">Tracker</span>
              </span>
              <span className={`hidden md:inline-block ml-2 text-[10px] uppercase font-bold px-2 py-0.5 border rounded-md tracking-wider ${
                isDark 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                PWA v1.0
              </span>
            </div>
          </div>

          {/* Home Selector Dropdown */}
          <div className="flex-1 max-w-xs sm:max-w-sm mx-2">
            {homes.length > 0 ? (
              <select
                value={activeHomeId}
                onChange={(e) => onSelectHome(e.target.value)}
                className={`w-full font-bold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs truncate border ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700/80 text-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-emerald-700 font-extrabold'
                }`}
              >
                {homes.map(h => (
                  <option key={h.id} value={h.id} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                    🏠 {h.nickname}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={onOpenAddHome}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border border-dashed flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-500" />
                <span>+ Add First Home</span>
              </button>
            )}
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">

            {/* App-Wide Selectable Theme Switcher Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 touch-manipulation ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-slate-200'
                }`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden md:inline">Dark</span>
                  </>
                )}
              </button>
            )}

            {/* Network Offline / Online Badge */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? isDark
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/80 animate-pulse'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
            </div>

            {/* Firebase Status Badge */}
            <button
              onClick={onOpenSettings}
              title={isFirebaseActive ? `Synced with Firebase Cloud (${user?.email || 'Cloud Firestore'})` : 'Local / Demo Storage (Click to setup Firebase)'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                isFirebaseActive
                  ? isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 hover:border-emerald-500'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400'
                  : isDark
                    ? 'bg-slate-800/90 text-slate-400 border-slate-700 hover:text-slate-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              {isFirebaseActive ? <Cloud className="w-3.5 h-3.5 text-emerald-500" /> : <Database className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isFirebaseActive ? 'Firebase Sync' : 'Demo Storage'}</span>
            </button>

            {/* Quick Log Service Button */}
            <button
              onClick={onOpenAddService}
              disabled={homes.length === 0}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Log Expense</span>
            </button>

            {/* About Page Button */}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className={`p-2 rounded-xl border transition-all ${
                  isDark
                    ? 'text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700/80 border-slate-700'
                    : 'text-slate-500 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
                title="About HomeTracker & App Info"
              >
                <Info className="w-4 h-4" />
              </button>
            )}

            {/* Settings & Config Button */}
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
              title="Settings & Firebase Config"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
