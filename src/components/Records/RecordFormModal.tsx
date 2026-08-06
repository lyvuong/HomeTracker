import React, { useState, useEffect } from 'react';
import { X, Save, Wrench, BellPlus, Landmark } from 'lucide-react';
import type { Home, EnrichedHomeRecord, MaintenanceCategory, MaintenanceType, PaymentType } from '../../types';
import { CATEGORIES, TYPES } from '../../constants/categories';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<EnrichedHomeRecord>) => void;
  homes: Home[];
  activeHomeId: string;
  initialRecord?: EnrichedHomeRecord | null;
}

const PAYMENT_TYPES: PaymentType[] = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Other'];

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  homes,
  activeHomeId,
  initialRecord
}) => {
  const [homeId, setHomeId] = useState(activeHomeId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [cost, setCost] = useState<number | ''>('');
  const [category, setCategory] = useState<MaintenanceCategory>('HVAC');
  const [type, setType] = useState<MaintenanceType>('Maintenance');
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);

  // Optional Reminder
  const [addNextReminder, setAddNextReminder] = useState(false);
  const [nextServiceDate, setNextServiceDate] = useState('');

  useEffect(() => {
    if (initialRecord) {
      setHomeId(initialRecord.homeId);
      setDate(initialRecord.date);
      setTime(initialRecord.time || new Date().toTimeString().slice(0, 5));
      setCost(initialRecord.cost);
      setCategory(initialRecord.category);
      setType(initialRecord.type);
      setProvider(initialRecord.provider || '');
      setNotes(initialRecord.notes || '');
      setPaymentType(initialRecord.paymentType || 'Cash');
      setIsTaxDeductible(Boolean(initialRecord.isTaxDeductible));
      setNextServiceDate(initialRecord.nextServiceDate || '');
      setAddNextReminder(Boolean(initialRecord.nextServiceDate));
    } else {
      setHomeId(activeHomeId || (homes[0]?.id || ''));
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setCost('');
      setCategory('HVAC');
      setType('Maintenance');
      setProvider('');
      setNotes('');
      setPaymentType('Cash');
      setIsTaxDeductible(false);
      setNextServiceDate('');
      setAddNextReminder(false);
    }
  }, [initialRecord, isOpen, activeHomeId, homes]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCategory: MaintenanceCategory) => {
    setCategory(newCategory);
    setIsTaxDeductible(newCategory === 'Property Tax');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeId || cost === '') return;

    const recordData: Partial<EnrichedHomeRecord> = {
      id: initialRecord ? initialRecord.id : `rec-${Date.now()}`,
      homeId,
      date,
      time,
      cost: Number(cost),
      category,
      type,
      provider: provider.trim() || 'Self / DIY',
      notes: notes.trim() || undefined,
      paymentType,
      isTaxDeductible,
      nextServiceDate: addNextReminder && nextServiceDate ? nextServiceDate : undefined,
    };

    onSave(recordData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {initialRecord ? 'Edit Log Entry' : 'Log New Home Expense'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Home Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Home *</label>
            <select
              value={homeId}
              onChange={(e) => setHomeId(e.target.value)}
              required
              className="w-full glass-input text-white text-sm rounded-xl p-2.5 bg-slate-900 font-semibold"
            >
              {homes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nickname}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cost ($ USD) *</label>
              <input
                type="number"
                required
                step="0.01"
                min={0}
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as MaintenanceCategory)}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5 bg-slate-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5 bg-slate-900"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Type *</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5 bg-slate-900"
              >
                {PAYMENT_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Service Provider / Contractor Name</label>
            <input
              type="text"
              placeholder="e.g. Springfield HVAC Services, County Tax Assessor, State Farm Insurance, DIY"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full glass-input text-white text-sm rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes, Parts Used & Specifications</label>
            <textarea
              rows={3}
              placeholder="Filter model, warranty info, materials used, policy number..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full glass-input text-white text-sm rounded-xl p-2.5 resize-none"
            />
          </div>

          {/* Tax Deductible Toggle */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTaxDeductible}
                onChange={(e) => setIsTaxDeductible(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-400" />
                Tax Deductible Expense
              </span>
            </label>
          </div>

          {/* Toggle Next Service Reminder */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addNextReminder}
                  onChange={(e) => setAddNextReminder(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <BellPlus className="w-4 h-4 text-amber-400" />
                  Schedule Next Service Reminder
                </span>
              </label>
            </div>

            {addNextReminder && (
              <div className="pt-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Next Service Target Date</label>
                <input
                  type="date"
                  value={nextServiceDate}
                  onChange={(e) => setNextServiceDate(e.target.value)}
                  className="w-full glass-input text-white text-xs rounded-xl p-2"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              Save Log Entry
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
