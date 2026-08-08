import React from 'react';
import { LayoutDashboard, Home, History, Bell, BarChart3, Settings, Info } from 'lucide-react';
import type { ActiveTab } from '../../types';

interface TabNavigationProps {
  activeTab: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onTabChange?: (tab: ActiveTab) => void;
  pendingRemindersCount?: number;
  unreadRemindersCount?: number;
  theme?: 'light' | 'dark';
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  pendingRemindersCount,
  unreadRemindersCount,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const handleTabSelect = (tab: ActiveTab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const badgeCount = unreadRemindersCount ?? pendingRemindersCount ?? 0;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'homes', label: 'Homes', shortLabel: 'Homes', icon: Home },
    { id: 'history', label: 'Maintenance History', shortLabel: 'Logs', icon: History },
    {
      id: 'reminders',
      label: 'Reminders',
      shortLabel: 'Alerts',
      icon: Bell,
      badge: badgeCount > 0 ? badgeCount : undefined
    },
    { id: 'analytics', label: 'Analytics', shortLabel: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', shortLabel: 'Config', icon: Settings },
    { id: 'about', label: 'About', shortLabel: 'About', icon: Info },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md shadow-2xl transition-colors ${
      isDark 
        ? 'bg-slate-900/95 border-slate-800 text-white' 
        : 'bg-white/95 border-slate-200/90 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id as ActiveTab)}
                className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap relative shrink-0 active:scale-95 touch-manipulation ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs border border-emerald-600'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="relative flex items-center">
                  <Icon className="w-4 h-4" />
                  {tab.badge !== undefined && (
                    <span className="sm:hidden absolute -top-1 -right-1.5 px-1 py-0.2 text-[8px] font-extrabold rounded-full bg-emerald-500 text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* Shortened Button Name on Small Mobile Devices */}
                <span className="sm:hidden tracking-tight">{tab.shortLabel}</span>
                {/* Full Button Name on Tablet and Desktop */}
                <span className="hidden sm:inline">{tab.label}</span>

                {tab.badge !== undefined && (
                  <span className="hidden sm:inline-block ml-0.5 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
