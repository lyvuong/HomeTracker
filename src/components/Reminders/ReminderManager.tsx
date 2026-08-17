import React, { useState } from 'react';
import { Bell, Plus, CheckCircle2, Clock, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import type { Home, HomeReminder, TaxonomyOverrideDoc } from '../../types';
import { ReminderModal } from './ReminderModal';

interface ReminderManagerProps {
  reminders: HomeReminder[];
  homes: Home[];
  activeHomeId: string;
  onSaveReminder: (reminder: HomeReminder) => void;
  onDeleteReminder: (id: string) => void;
  onToggleComplete: (reminder: HomeReminder) => void;
  onCompleteAndLogService: (reminder: HomeReminder) => void;
  overrideDoc?: TaxonomyOverrideDoc;
  theme?: 'light' | 'dark';
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  homes,
  activeHomeId,
  onSaveReminder,
  onDeleteReminder,
  onToggleComplete: _onToggleComplete,
  onCompleteAndLogService,
  overrideDoc,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<HomeReminder | null>(null);

  const homeMap = new Map(homes.map(h => [h.id, h]));

  const filteredReminders = reminders.filter(r => r.homeId === activeHomeId || activeHomeId === 'all');

  const pendingReminders = filteredReminders.filter(r => !r.isCompleted);
  const completedReminders = filteredReminders.filter(r => r.isCompleted);

  const isReminderOverdue = (reminder: HomeReminder): boolean => {
    if (reminder.isCompleted) return false;
    if (reminder.dueDate && new Date(reminder.dueDate) <= new Date()) return true;
    return false;
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            Maintenance Reminders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated alerts based on calendar dates and repeat intervals.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingReminder(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Set Reminder
        </button>
      </div>

      {/* Pending Reminders Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Active Reminders ({pendingReminders.length})
        </h2>

        {pendingReminders.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-3xl text-slate-500 dark:text-slate-400 text-sm">
            🎉 No pending maintenance reminders! All scheduled tasks are up to date.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReminders.map((r) => {
              const home = homeMap.get(r.homeId);
              const overdue = isReminderOverdue(r);

              return (
                <div
                  key={r.id}
                  className={`glass-panel p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 group ${
                    overdue
                      ? isDark
                        ? 'border-red-500/50 bg-red-950/20 shadow-lg shadow-red-500/10'
                        : 'border-red-300 bg-red-50/60 shadow-sm'
                      : isDark
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-2xl shrink-0 ${
                        overdue
                          ? isDark
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-red-100 text-red-700 border border-red-200'
                          : isDark
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {overdue ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-extrabold text-base truncate block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {r.title}
                          </span>
                          {overdue && (
                            <span className="bg-red-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-semibold mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>🏠 {home ? home.nickname : 'Home'}</span>
                          <span>•</span>
                          <span>{r.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingReminder(r);
                          setIsModalOpen(true);
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Edit Reminder"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteReminder(r.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Target Details */}
                  <div className={`grid grid-cols-2 gap-2 p-3 rounded-2xl border text-xs ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {r.dueDate && (
                      <div>
                        <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Target Date
                        </span>
                        <span className={`font-mono font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {r.dueDate}
                        </span>
                      </div>
                    )}
                    {r.intervalMonths && (
                      <div>
                        <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Repeats Every
                        </span>
                        <span className={`font-mono font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {r.intervalMonths} months
                        </span>
                      </div>
                    )}
                  </div>

                  {r.notes && (
                    <p className={`text-xs italic line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      "{r.notes}"
                    </p>
                  )}

                  {/* Multi-User Audit Tracking Info */}
                  {(r.createdBy || r.lastEditedBy) && (
                    <div className={`p-2 rounded-xl border flex flex-wrap items-center justify-between gap-1 text-[10px] ${
                      isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      {r.createdBy && (
                        <span>👤 Created by <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{r.createdBy.displayName}</strong></span>
                      )}
                      {r.lastEditedBy && r.lastEditedBy.uid !== r.createdBy?.uid && (
                        <span>✏️ Edited by <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{r.lastEditedBy.displayName}</strong></span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className={`flex items-center gap-2 pt-2 border-t ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <button
                      onClick={() => onCompleteAndLogService(r)}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete & Log Expense
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Reminders History */}
      {completedReminders.length > 0 && (
        <div className={`space-y-3 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <h2 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Completed Reminders History ({completedReminders.length})
          </h2>

          <div className={`divide-y glass-panel rounded-3xl overflow-hidden ${
            isDark ? 'divide-slate-800/80' : 'divide-slate-200'
          }`}>
            {completedReminders.map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className={`font-bold block truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {r.title}
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {r.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteReminder(r.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'text-slate-500 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveReminder}
        homes={homes}
        activeHomeId={activeHomeId}
        initialReminder={editingReminder}
        overrideDoc={overrideDoc}
        theme={theme}
      />

    </div>
  );
};
