import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Wrench, BellPlus, Landmark, Settings2, Home as HomeIcon, Calendar, Clock, DollarSign, Tag, User, FileText, Link2Off } from 'lucide-react';
import type { Home, EnrichedHomeRecord, MaintenanceCategory, MaintenanceType, PaymentType, PaymentTypeItem } from '../../types';
import { CATEGORIES, TYPES, getSubcategories } from '../../constants/categories';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<EnrichedHomeRecord>) => void;
  homes: Home[];
  activeHomeId: string;
  initialRecord?: EnrichedHomeRecord | null;
  paymentTypes?: PaymentTypeItem[];
  onManagePaymentTypes?: () => void;
  onMoveToExpense?: (record: EnrichedHomeRecord) => void;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  homes,
  activeHomeId,
  initialRecord,
  paymentTypes = [],
  onManagePaymentTypes,
  onMoveToExpense
}) => {
  const availablePaymentTypes = useMemo(() => {
    const rawNames = (paymentTypes && paymentTypes.length > 0)
      ? paymentTypes.map(p => p.name)
      : ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Other'];
    const withoutCash = rawNames.filter(n => n.toLowerCase() !== 'cash');
    return ['Cash', ...Array.from(new Set(withoutCash))];
  }, [paymentTypes]);

  const [homeId, setHomeId] = useState(activeHomeId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [cost, setCost] = useState<number | ''>('');
  const [category, setCategory] = useState<MaintenanceCategory>('HVAC');
  const [subcategory, setSubcategory] = useState('');
  const [type, setType] = useState<MaintenanceType>('Maintenance');
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);

  // Optional Reminder
  const [addNextReminder, setAddNextReminder] = useState(false);
  const [nextServiceDate, setNextServiceDate] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialRecord) {
      setHomeId(initialRecord.homeId);
      setDate(initialRecord.date);
      setTime(initialRecord.time || new Date().toTimeString().slice(0, 5));
      setCost(initialRecord.cost);
      setCategory(initialRecord.category);
      setSubcategory(
        getSubcategories(initialRecord.category).includes(initialRecord.subcategory || '')
          ? initialRecord.subcategory || ''
          : ''
      );
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
      setSubcategory('');
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

  const subcategories = getSubcategories(category);

  const handleCategoryChange = (newCategory: MaintenanceCategory) => {
    setCategory(newCategory);
    setSubcategory('');
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
      subcategory: subcategory || undefined,
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

  const activeHomeNickname = homes.find(h => h.id === homeId)?.nickname || 'Home';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
      {/* Background overlay click handler for desktop */}
      <div 
        className="absolute inset-0 bg-transparent" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Main Modal Container: Fullscreen on mobile, centered dialog on desktop */}
      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-slate-900 border-0 sm:border sm:border-slate-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">

        {/* Compact Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <Wrench className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                {initialRecord ? 'Edit Log Entry' : 'Log New Home Expense'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <HomeIcon className="w-3 h-3 text-slate-500" />
                <span className="truncate max-w-[160px] sm:max-w-none">{activeHomeNickname}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full sm:rounded-xl hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Ultra Compact Grid */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 sm:space-y-3.5">

            {/* Row 1: Target Home (7 cols) + Cost ($ USD) (5 cols) */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <HomeIcon className="w-3 h-3 text-emerald-400" />
                    Target Home *
                  </label>
                  {initialRecord && onMoveToExpense && (
                    <button
                      type="button"
                      onClick={() => onMoveToExpense(initialRecord)}
                      className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
                      title="Remove this log from the home and keep it only as a general expense"
                    >
                      <Link2Off className="w-3 h-3" /> Move to Expense
                    </button>
                  )}
                </div>
                <select
                  value={homeId}
                  onChange={(e) => setHomeId(e.target.value)}
                  required
                  className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 px-2.5 bg-slate-900 font-semibold touch-manipulation truncate"
                >
                  {homes.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nickname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-5">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  Cost ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">$</span>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min={0}
                    inputMode="decimal"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 pl-6 pr-2 font-mono font-bold tracking-wide touch-manipulation focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Date (6 cols) + Time (6 cols) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 px-2.5 touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 px-2.5 touch-manipulation"
                />
              </div>
            </div>

            {/* Row 3: Category (6 cols) + Type (6 cols) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400" />
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as MaintenanceCategory)}
                  className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 px-2.5 bg-slate-900 touch-manipulation truncate"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-amber-400" />
                  Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MaintenanceType)}
                  className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 px-2.5 bg-slate-900 touch-manipulation truncate"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4: Payment Type (5 cols) + Contractor / Provider (7 cols) */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-300 truncate">Payment *</label>
                  {onManagePaymentTypes && (
                    <button
                      type="button"
                      onClick={onManagePaymentTypes}
                      className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                      title="Payment Methods Info"
                    >
                      <Settings2 className="w-2.5 h-2.5" /> Info
                    </button>
                  )}
                </div>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 px-2 bg-slate-900 touch-manipulation truncate"
                >
                  {availablePaymentTypes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-7">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1 truncate">
                  <User className="w-3 h-3 text-teal-400 shrink-0" />
                  Provider / Contractor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Springfield HVAC, DIY"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 px-2.5 touch-manipulation truncate"
                />
              </div>
            </div>

            {/* Optional Subcategory */}
            {subcategories.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {category} Subcategory <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full glass-input text-white text-xs sm:text-sm rounded-xl py-2 px-2.5 bg-slate-900 touch-manipulation truncate"
                >
                  <option value="">— None —</option>
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Row 5: Notes & Parts Used */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-teal-400" />
                Notes, Parts & Specifications
              </label>
              <textarea
                rows={2}
                placeholder="Filter model, warranty info, materials used, policy number..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full glass-input text-white text-xs sm:text-sm rounded-xl p-2.5 resize-none touch-manipulation"
              />
            </div>

            {/* Row 6: Ultra-Compact Toggles Bar (Tax Deductible & Schedule Reminder Side-by-Side) */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="grid grid-cols-2 gap-2 items-center">
                {/* Tax Deductible Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isTaxDeductible}
                    onChange={(e) => setIsTaxDeductible(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 touch-manipulation shrink-0"
                  />
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1 truncate">
                    <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Tax Deductible
                  </span>
                </label>

                {/* Schedule Reminder Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addNextReminder}
                    onChange={(e) => setAddNextReminder(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 touch-manipulation shrink-0"
                  />
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1 truncate">
                    <BellPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Next Reminder
                  </span>
                </label>
              </div>

              {/* Conditional Next Service Date inline */}
              {addNextReminder && (
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center gap-2">
                  <label className="text-[10px] font-semibold text-slate-400 shrink-0">Reminder Date:</label>
                  <input
                    type="date"
                    value={nextServiceDate}
                    onChange={(e) => setNextServiceDate(e.target.value)}
                    className="flex-1 glass-input text-white text-xs rounded-lg py-1 px-2 touch-manipulation"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Sticky Action Footer */}
          <div className="sticky bottom-0 z-20 flex items-center justify-between sm:justify-end gap-2.5 px-3.5 py-2.5 sm:px-6 sm:py-3.5 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/50 text-center transition-colors active:scale-98 touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-98 transition-all touch-manipulation"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Save Log Entry</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};


