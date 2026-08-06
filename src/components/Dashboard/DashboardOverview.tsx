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
  Ruler
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
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  activeHome,
  records,
  reminders,
  onOpenAddService,
  onOpenAddHome,
  onOpenAddReminder,
  onSelectTab
}) => {
  if (!activeHome) {
    return (
      <div className="text-center py-16 px-4 bg-slate-900/60 rounded-3xl border border-slate-800 my-8">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <Home className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Home Selected</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Add your first home profile to start tracking maintenance logs, repair costs, and service reminders.
        </p>
        <button
          onClick={onOpenAddHome}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          + Add First Home
        </button>
      </div>
    );
  }

  // Calculate metrics for active home
  const homeRecords = records.filter(r => r.homeId === activeHome.id);
  const totalSpent = homeRecords.reduce((sum, r) => sum + r.cost, 0);

  const homeReminders = reminders.filter(r => r.homeId === activeHome.id && !r.isCompleted);
  const overdueReminders = homeReminders.filter(r => {
    if (r.dueDate && new Date(r.dueDate) <= new Date()) return true;
    return false;
  });

  const recentRecords = [...homeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="space-y-6">

      {/* Active Home Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div className="flex items-center gap-5">
            {activeHome.photoUrl ? (
              <img
                src={activeHome.photoUrl}
                alt={activeHome.nickname}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10">
                <Home className="w-10 h-10 text-white" />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {activeHome.propertyType}
                </span>
                {activeHome.yearBuilt && (
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono px-2 py-0.5 rounded-md font-semibold">
                    Built {activeHome.yearBuilt}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeHome.nickname}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {activeHome.address}
              </p>
            </div>
          </div>

          {/* Square Footage Display */}
          <div className="bg-slate-850/90 border border-slate-750 p-4 rounded-2xl flex flex-col justify-center min-w-[220px] shadow-inner">
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-1">
              <Ruler className="w-3.5 h-3.5 text-emerald-400" />
              Square Footage
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-extrabold text-white tracking-wider">
                {activeHome.squareFootage ? activeHome.squareFootage.toLocaleString() : '—'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">sq ft</span>
            </div>
          </div>

        </div>
      </div>

      {/* Overdue Maintenance Banner Alert */}
      {overdueReminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/80 via-red-950/60 to-amber-950/80 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
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
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap shadow transition-all"
          >
            View Reminders
          </button>
        </div>
      )}

      {/* Metrics Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Cost Spent Card */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Maintenance Cost</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Across {homeRecords.length} logged services
          </p>
        </div>

        {/* Service Logs Count Card */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Maintenance History</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {homeRecords.length}
            <span className="text-xs text-slate-400 font-normal ml-1">records</span>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-1 flex items-center gap-0.5"
          >
            View history timeline <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Reminders Count Card */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {homeReminders.length}
            <span className="text-xs text-slate-400 font-normal ml-1">reminders</span>
          </div>
          <button
            onClick={() => onSelectTab('reminders')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium mt-1 flex items-center gap-0.5"
          >
            Manage maintenance schedule <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Property Type Card */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Property</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {activeHome.propertyType}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activeHome.purchaseDate ? `Owned since ${activeHome.purchaseDate}` : 'Purchase date not set'}
          </p>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="glass-panel p-5 rounded-2xl">
        <h2 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenAddService}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Log Expense
          </button>

          <button
            onClick={onOpenAddReminder}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700/80 text-amber-300 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl border border-slate-700 hover:border-amber-500/40 transition-all"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            Set Service Alert
          </button>

          <button
            onClick={onOpenAddHome}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl border border-slate-700 hover:border-emerald-500/40 transition-all"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            Add New Home
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700/80 text-indigo-300 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl border border-slate-700 hover:border-indigo-500/40 transition-all"
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Cost Analytics
          </button>
        </div>
      </div>

      {/* Recent Records Timeline Preview */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Expense & Maintenance Logs</h2>
            <p className="text-xs text-slate-400">Latest logged activity for {activeHome.nickname}</p>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl transition-all"
          >
            View All ({homeRecords.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No log entries yet for this home.
            <div className="mt-3">
              <button
                onClick={onOpenAddService}
                className="text-emerald-400 underline font-semibold text-xs"
              >
                Log your first expense now
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentRecords.map((record) => (
              <div key={record.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-800/30 px-2 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-emerald-400 group-hover:border-emerald-500/40 transition-all">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">
                        {record.category}
                        {record.subcategory && (
                          <span className="text-slate-400 font-semibold"> · {record.subcategory}</span>
                        )}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        record.type === 'Repair' ? 'bg-red-950 text-red-400 border border-red-800/60' :
                        record.type === 'Maintenance' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                        record.type === 'Upgrade' ? 'bg-purple-950 text-purple-400 border border-purple-800/60' :
                        record.type === 'Expense' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {record.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {record.provider || 'Self / DIY'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-xs text-slate-400 font-mono">{record.date}</span>
                  <span className="text-base font-extrabold text-white font-mono bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-700">
                    ${record.cost.toFixed(2)}
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
