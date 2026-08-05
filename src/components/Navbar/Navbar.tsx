import React from 'react';
import { PlusCircle, Wifi, WifiOff, Cloud, Database, Settings, Info } from 'lucide-react';
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
}) => {

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="HomeTracker Icon"
              className="w-10 h-10 rounded-xl shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 object-cover"
            />
            <div>
              <span className="text-xl font-black tracking-tight text-white font-display">
                Home<span className="text-emerald-400">Tracker</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md tracking-wider">
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
                className="w-full bg-slate-950/80 border border-slate-700/80 text-emerald-400 font-bold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner truncate"
              >
                {homes.map(h => (
                  <option key={h.id} value={h.id} className="bg-slate-900 text-slate-100">
                    🏠 {h.nickname}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={onOpenAddHome}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 border-dashed flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>+ Add First Home</span>
              </button>
            )}
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">

            {/* Network Offline / Online Badge */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
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
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 hover:border-emerald-500'
                  : 'bg-slate-800/90 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {isFirebaseActive ? <Cloud className="w-3.5 h-3.5 text-emerald-400" /> : <Database className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isFirebaseActive ? 'Firebase Sync' : 'Demo Storage'}</span>
            </button>

            {/* Quick Log Service Button */}
            <button
              onClick={onOpenAddService}
              disabled={homes.length === 0}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Log Maintenance</span>
            </button>

            {/* About Page Button */}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-all"
                title="About HomeTracker & App Info"
              >
                <Info className="w-4 h-4" />
              </button>
            )}

            {/* Settings & Config Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-all"
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
