import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Bell, Calendar, Repeat } from 'lucide-react';
import type { Home, HomeReminder, MaintenanceCategory, Target, TaxonomyOverrideDoc } from '../../types';
import { getEffectiveCategoriesForTarget } from '../../constants/categories';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: HomeReminder) => void;
  homes: Home[];
  activeHomeId: string;
  initialReminder?: HomeReminder | null;
  overrideDoc?: TaxonomyOverrideDoc;
  theme?: 'light' | 'dark';
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  homes,
  activeHomeId,
  initialReminder,
  overrideDoc,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const [homeId, setHomeId] = useState(activeHomeId);
  const [target] = useState<Target>('Property');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('Maintenance & Repairs');
  const [dueDate, setDueDate] = useState('');
  const [intervalMonths, setIntervalMonths] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const effectiveCategories = useMemo(
    () => getEffectiveCategoriesForTarget('Property', overrideDoc),
    [overrideDoc]
  );

  useEffect(() => {
    if (initialReminder) {
      setHomeId(initialReminder.homeId);
      setTitle(initialReminder.title);
      setCategory(initialReminder.category);
      setDueDate(initialReminder.dueDate || '');
      setIntervalMonths(initialReminder.intervalMonths || '');
      setNotes(initialReminder.notes || '');
    } else {
      setHomeId(activeHomeId || (homes[0]?.id || ''));
      setTitle('Seasonal Maintenance Inspection');
      setCategory(getEffectiveCategoriesForTarget('Property', overrideDoc)[0] || 'Maintenance & Repairs');
      setDueDate('');
      setIntervalMonths('');
      setNotes('');
    }
  }, [initialReminder, isOpen, activeHomeId, homes, overrideDoc]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !homeId) return;

    onSave({
      id: initialReminder ? initialReminder.id : `rem-${Date.now()}`,
      homeId,
      target,
      title: title.trim(),
      category,
      dueDate: dueDate || undefined,
      intervalMonths: intervalMonths !== '' ? Number(intervalMonths) : undefined,
      isCompleted: initialReminder ? initialReminder.isCompleted : false,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  const handleSetQuickInterval = (months: number) => {
    setIntervalMonths(months);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className={`border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8 animate-modal ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {initialReminder ? 'Edit Maintenance Reminder' : 'Set Service Alert Reminder'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Schedule proactive home inspections and recurrent service reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Target Home <span className="text-amber-500">*</span>
            </label>
            <select
              value={homeId}
              onChange={(e) => setHomeId(e.target.value)}
              className="w-full glass-input text-sm rounded-xl p-2.5 font-semibold cursor-pointer"
            >
              {homes.map(h => (
                <option key={h.id} value={h.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  🏠 {h.nickname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Reminder Title <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HVAC Filter Replacement, Gutter Cleaning, Water Heater Flush"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input text-sm rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
              className="w-full glass-input text-sm rounded-xl p-2.5 cursor-pointer font-medium"
            >
              {effectiveCategories.map(cat => (
                <option key={cat} value={cat} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full glass-input text-sm rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Repeat className="w-3.5 h-3.5 text-amber-500" />
                Repeat Interval (Months)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 3, 6, 12"
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full glass-input text-sm rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          {/* Quick Interval Preset Pills */}
          <div className="space-y-1">
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '3 Months (Quarterly)', months: 3 },
                { label: '6 Months (Bi-Annual)', months: 6 },
                { label: '12 Months (Annual)', months: 12 },
              ].map(preset => (
                <button
                  key={preset.months}
                  type="button"
                  onClick={() => handleSetQuickInterval(preset.months)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95 ${
                    intervalMonths === preset.months
                      ? isDark
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                        : 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Notes & Details <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Model numbers, filter sizes (e.g. 20x25x1 MERV 11), contractor details, instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full glass-input text-sm rounded-xl p-2.5 resize-none"
            />
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Reminder
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
