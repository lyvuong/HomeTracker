import React from 'react';
import {
  DollarSign,
  Wrench,
  AlertTriangle,
  PlusCircle,
  Calendar,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Home,
  Tag,
  Ruler,
  Landmark
} from 'lucide-react';
import type { Home as HomeType, EnrichedHomeRecord, HomeReminder } from '../../types';

interface DashboardOverviewProps {
  activeHome: HomeType | null;
  records: EnrichedHomeRecord[];
  reminders: HomeReminder[];
  onOpenAddService: () => void;
  onOpenAddHome: () => void;
  onOpenAddReminder: () => void;
  onSelectTab: (tab: 'history' | 'reminders' | 'analytics' | 'homes') => void;
  theme?: 'light' | 'dark';
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  activeHome,
  records,
  reminders,
  onOpenAddService,
  onOpenAddHome,
  onOpenAddReminder,
  onSelectTab,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  if (!activeHome) {
    return (
      <div className={`text-center py-16 px-4 rounded-3xl border my-8 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
          isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          <Home className="w-8 h-8" />
        </div>
        <h2 className={`text-xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Home Selected</h2>
        <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Add your first home profile to start tracking maintenance logs, repair costs, and service reminders.
        </p>
        <button
          onClick={onOpenAddHome}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          + Add First Home
        </button>
      </div>
    );
  }

  // Calculate metrics for active home
  const homeRecords = records.filter(r => r.homeId === activeHome.id);
  const homeDebits = homeRecords.filter(r => (r.transactionType || 'Debit') === 'Debit').reduce((sum, r) => sum + r.cost, 0);
  const homeCredits = homeRecords.filter(r => r.transactionType === 'Credit').reduce((sum, r) => sum + r.cost, 0);
  const homeNetCost = homeDebits - homeCredits;

  const homeReminders = reminders.filter(r => r.homeId === activeHome.id && !r.isCompleted);
  const overdueReminders = homeReminders.filter(r => {
    if (r.dueDate && new Date(r.dueDate) <= new Date()) return true;
    return false;
  });

  const recentRecords = [...homeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Active Home Hero Card - Mobile-Optimized & Spacious */}
      <div className={`relative overflow-hidden rounded-3xl p-5 sm:p-7 border transition-all ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 border-slate-800 text-white shadow-xl'
          : 'bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 border-slate-200 text-slate-900 shadow-md'
      }`}>
        <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-emerald-500/15' : 'bg-emerald-500/10'
        }`} />

        <div className="relative z-10 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6">

          {/* Property Identity Info */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
            {activeHome.photoUrl ? (
              <img
                src={activeHome.photoUrl}
                alt={activeHome.nickname}
                className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-emerald-400/50 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                <Home className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {activeHome.propertyType}
                </span>
                {activeHome.isIncomeProperty && (
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isDark
                      ? 'bg-emerald-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                  }`}>
                    <Landmark className="w-3 h-3" />
                    Income Property (Rental)
                  </span>
                )}
                {activeHome.yearBuilt && (
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                    isDark
                      ? 'bg-slate-800/90 text-slate-200 border-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    Built {activeHome.yearBuilt}
                  </span>
                )}
              </div>
              <h1 className={`text-xl sm:text-3xl font-extrabold tracking-tight leading-tight truncate ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {activeHome.nickname}
              </h1>
              {activeHome.address && (
                <p className={`text-xs mt-0.5 truncate flex items-center gap-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <span>{activeHome.address}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Specs Pill Row */}
          <div className={`flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 ${
            isDark ? 'border-slate-800/80' : 'border-slate-200'
          }`}>
            <div className={`px-4 py-2.5 rounded-2xl flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start border ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/80 text-white shadow-inner'
                : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>Square Footage</span>
                  <span className={`text-base sm:text-lg font-mono font-black tracking-wide ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {activeHome.squareFootage ? `${activeHome.squareFootage.toLocaleString()} sq ft` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Overdue Maintenance Banner Alert */}
      {overdueReminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/80 via-red-950/60 to-amber-950/80 border border-amber-500/40 rounded-3xl p-4 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-2xl text-amber-400 border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                {overdueReminders.length} Maintenance Task{overdueReminders.length > 1 ? 's' : ''} Due or Overdue!
              </h3>
              <p className="text-xs text-amber-300/80">
                {overdueReminders.map(r => r.title).join(', ')} require attention.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('reminders')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-3.5 py-2 rounded-xl whitespace-nowrap shadow transition-all active:scale-95"
          >
            View Reminders
          </button>
        </div>
      )}

      {/* Metrics Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Cost Spent Card */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {homeCredits > 0 ? 'Net Expenses' : 'Total Expenses'}
            </span>
            <div className={`p-2 rounded-2xl border ${
              isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            ${homeNetCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            {homeCredits > 0 ? (
              <span>Outflow: ${homeDebits.toFixed(0)} · Inflow: +${homeCredits.toFixed(0)}</span>
            ) : (
              <span>Across {homeRecords.length} logged records</span>
            )}
          </p>
        </div>

        {/* Service Logs Count Card */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logs Recorded</span>
            <div className={`p-2 rounded-2xl border ${
              isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {homeRecords.length}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">entries</span>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold mt-1 flex items-center gap-0.5"
          >
            View history timeline <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Reminders Count Card */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Reminders</span>
            <div className={`p-2 rounded-2xl border ${
              isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {homeReminders.length}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">tasks</span>
          </div>
          <button
            onClick={() => onSelectTab('reminders')}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold mt-1 flex items-center gap-0.5"
          >
            Manage alerts <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Property Type Card */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property Type</span>
            <div className={`p-2 rounded-2xl border ${
              isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeHome.propertyType}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeHome.purchaseDate ? `Purchased on ${activeHome.purchaseDate}` : 'No purchase date recorded'}
          </p>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="glass-panel p-5 rounded-3xl">
        <h2 className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenAddService}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Log Transaction
          </button>

          <button
            onClick={onOpenAddReminder}
            className={`flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl border transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700/80 text-amber-300 border-slate-700 hover:border-amber-500/40'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            Set Reminder
          </button>

          <button
            onClick={onOpenAddHome}
            className={`flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl border transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700 hover:border-emerald-500/40'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-500" />
            Add New Home
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl border transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700/80 text-indigo-300 border-slate-700 hover:border-indigo-500/40'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Financial Analytics
          </button>
        </div>
      </div>

      {/* Recent Records Timeline Preview */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions & Maintenance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest logged activity for {activeHome.nickname}</p>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className={`text-xs font-bold flex items-center gap-1 border px-3 py-1.5 rounded-xl transition-all ${
              isDark
                ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border-emerald-800/60'
                : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 border-emerald-200'
            }`}
          >
            View All ({homeRecords.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
            No log entries yet for this home.
            <div className="mt-3">
              <button
                onClick={onOpenAddService}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-xs"
              >
                Log your first transaction now
              </button>
            </div>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group px-2 rounded-2xl transition-all ${
                  isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-all ${
                    isDark ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'
                  }`}>
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {record.category}
                        {record.subcategory && (
                          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {' '}· {record.subcategory}
                          </span>
                        )}
                      </span>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${
                        record.type === 'Repair' ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' :
                        record.type === 'Maintenance' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                        record.type === 'Upgrade' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' :
                        record.type === 'Expense' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                        'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                      }`}>
                        {record.type}
                      </span>
                    </div>
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {record.provider || 'Self / DIY'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {record.date}
                  </span>
                  <span className={`text-base font-extrabold font-mono px-3 py-1 rounded-xl border ${
                    record.transactionType === 'Credit'
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                      : isDark ? 'text-white bg-slate-800 border-slate-700' : 'text-slate-900 bg-slate-100 border-slate-200'
                  }`}>
                    {record.transactionType === 'Credit' ? '+' : ''}${record.cost.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
