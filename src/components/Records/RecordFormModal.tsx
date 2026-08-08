import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, Save, Wrench, BellPlus, Landmark, Settings2, Home as HomeIcon,
  Calendar, Clock, DollarSign, Tag, User, FileText,
  Zap, Droplets, Thermometer, Sparkles, ShieldCheck, Layers, ChevronDown,
  RotateCcw, Receipt, CheckCircle2, Building, Link2Off, Sun, Moon
} from 'lucide-react';
import type { Home, EnrichedHomeRecord, MaintenanceCategory, MaintenanceType, PaymentType, PaymentTypeItem } from '../../types';
import { CATEGORIES, TYPES, getSubcategories, CATEGORY_COLORS } from '../../constants/categories';

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
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// Visual category icon map for quick selection
const CATEGORY_ICONS: Partial<Record<MaintenanceCategory, React.ComponentType<{ className?: string }>>> = {
  'HVAC': Thermometer,
  'Plumbing': Droplets,
  'Electrical': Zap,
  'Utilities': Zap,
  'Appliances': Sparkles,
  'Landscaping & Lawn': Sparkles,
  'General Repair': Wrench,
  'Renovation': Wrench,
  'Property Tax': Landmark,
  'Mortgage': Building,
  'Homeowners Insurance': ShieldCheck,
  'Inspection': CheckCircle2,
  'Flooring': Layers,
  'Roofing': HomeIcon,
};

// Featured quick categories for 1-tap selection
const FEATURED_CATEGORIES: MaintenanceCategory[] = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Utilities',
  'Landscaping & Lawn',
  'General Repair',
  'Appliances',
  'Property Tax'
];

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  homes,
  activeHomeId,
  initialRecord,
  paymentTypes = [],
  onManagePaymentTypes,
  onMoveToExpense,
  theme: propsTheme,
  onToggleTheme
}) => {
  const costInputRef = useRef<HTMLInputElement>(null);

  // Local Theme State fallback if propsTheme is omitted
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hometracker_theme') as 'light' | 'dark') || 'light';
  });

  const currentTheme = propsTheme || localTheme;
  const isDark = currentTheme === 'dark';

  const handleToggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const nextTheme = localTheme === 'light' ? 'dark' : 'light';
      setLocalTheme(nextTheme);
      localStorage.setItem('hometracker_theme', nextTheme);
    }
  };

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
      // Auto-focus cost input on open after animation
      const timer = setTimeout(() => {
        costInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
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

  const handleAddCost = (amountToAdd: number) => {
    const currentNum = typeof cost === 'number' ? cost : 0;
    setCost(Math.max(0, Math.round((currentNum + amountToAdd) * 100) / 100));
  };

  const handleSetQuickDate = (preset: 'today' | 'yesterday') => {
    const d = new Date();
    if (preset === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    setDate(d.toISOString().split('T')[0]);
  };

  const handleSetReminderInterval = (months: number) => {
    const baseDate = date ? new Date(date) : new Date();
    baseDate.setMonth(baseDate.getMonth() + months);
    setNextServiceDate(baseDate.toISOString().split('T')[0]);
    setAddNextReminder(true);
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
  const categoryColor = CATEGORY_COLORS[category] || (isDark ? '#34d399' : '#059669');
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md overflow-hidden ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/60'
    }`}>
      {/* Background overlay click handler */}
      <div 
        className="absolute inset-0 bg-transparent" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Main Dialog Container - Supports Selectable Light & Dark Themes */}
      <div className={`relative w-full max-h-[92vh] sm:max-w-2xl border rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-white' 
          : 'bg-white border-slate-200/80 text-slate-900'
      }`}>

        {/* Header */}
        <div className={`sticky top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b backdrop-blur-md shrink-0 ${
          isDark 
            ? 'border-slate-800 bg-slate-900/95 text-white' 
            : 'border-slate-100 bg-white/95 text-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl shrink-0 flex items-center justify-center transition-colors shadow-sm"
              style={{ backgroundColor: `${categoryColor}15`, color: categoryColor, border: `1px solid ${categoryColor}30` }}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-snug tracking-tight">
                {initialRecord ? 'Edit Expense Record' : 'Log New Home Expense'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {homes.length > 1 ? (
                  <div className="relative flex items-center">
                    <HomeIcon className={`w-3.5 h-3.5 mr-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <select
                      value={homeId}
                      onChange={(e) => setHomeId(e.target.value)}
                      className={`text-xs font-semibold rounded-md py-0.5 pl-1.5 pr-5 border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                        isDark 
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                          : 'bg-slate-100 hover:bg-slate-200/70 text-slate-800 border-slate-200'
                      }`}
                    >
                      {homes.map((h) => (
                        <option key={h.id} value={h.id}>{h.nickname}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <HomeIcon className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className="truncate max-w-[200px] sm:max-w-none">{activeHomeNickname}</span>
                  </p>
                )}

                {/* Move to Expense Button */}
                {initialRecord && onMoveToExpense && (
                  <button
                    type="button"
                    onClick={() => onMoveToExpense(initialRecord)}
                    className={`text-[10px] font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-md border transition-colors ml-1 ${
                      isDark 
                        ? 'text-purple-400 hover:text-purple-300 bg-purple-950/60 border-purple-500/40' 
                        : 'text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border-purple-200'
                    }`}
                    title="Remove this log from the home and keep it only as a general expense"
                  >
                    <Link2Off className="w-3 h-3" /> Move to Expense
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Theme Selectable Toggle Switcher */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`p-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 touch-manipulation ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-slate-200'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors active:scale-95 touch-manipulation ${
                isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">

            {/* ROW 1: Hero Amount Entry (Col 7) + Quick Add Chips (Col 5) */}
            <div className={`border rounded-xl p-3.5 relative transition-all ${
              isDark
                ? 'bg-slate-950/70 border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20'
                : 'bg-emerald-50/60 border-emerald-200/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20'
            }`}>
              <div className="grid grid-cols-12 gap-3 items-center">
                
                {/* Cost Input Box */}
                <div className="col-span-12 sm:col-span-7">
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isDark ? 'text-slate-400' : 'text-emerald-900'
                    }`}>
                      <DollarSign className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      Expense Amount <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                    </label>
                    {typeof cost === 'number' && cost > 0 && (
                      <button
                        type="button"
                        onClick={() => setCost('')}
                        className={`text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded border transition-colors ${
                          isDark 
                            ? 'text-slate-400 hover:text-slate-200 bg-slate-900 border-slate-800' 
                            : 'text-slate-500 hover:text-slate-800 bg-white border-slate-200'
                        }`}
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Clear
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <span className={`text-2xl font-extrabold font-mono select-none mr-1.5 ${
                      isDark ? 'text-slate-400' : 'text-emerald-700'
                    }`}>$</span>
                    <input
                      ref={costInputRef}
                      type="number"
                      required
                      step="0.01"
                      min={0}
                      inputMode="decimal"
                      placeholder="0.00"
                      value={cost}
                      onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full bg-transparent text-2xl sm:text-3xl font-black font-mono focus:outline-none tracking-tight ${
                        isDark 
                          ? 'text-white placeholder:text-slate-600' 
                          : 'text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Quick Add Chips */}
                <div className={`col-span-12 sm:col-span-5 sm:border-l pt-2 sm:pt-0 ${
                  isDark ? 'sm:border-slate-800 sm:pl-3' : 'sm:border-emerald-200/80 sm:pl-3'
                }`}>
                  <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-slate-500' : 'text-emerald-800'
                  }`}>Quick Add</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {[10, 50, 100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAddCost(amt)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md border transition-all active:scale-95 touch-manipulation ${
                          isDark
                            ? 'text-slate-300 hover:text-white bg-slate-900 hover:bg-emerald-500/20 border-slate-800 hover:border-emerald-500/40'
                            : 'text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100/80 border-emerald-200 shadow-2xs'
                        }`}
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ROW 2: Category Chips & Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  Category <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                </label>
                
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as MaintenanceCategory)}
                    className={`text-xs font-semibold rounded-lg py-1 px-2.5 pr-6 border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none truncate max-w-[160px] ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200'
                    }`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Visual Category Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {FEATURED_CATEGORIES.map((catName) => {
                  const isSelected = category === catName;
                  const catColor = CATEGORY_COLORS[catName] || (isDark ? '#34d399' : '#059669');
                  const IconComp = CATEGORY_ICONS[catName] || Tag;

                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => handleCategoryChange(catName)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all active:scale-98 touch-manipulation ${
                        isSelected
                          ? isDark
                            ? 'bg-slate-800 text-white font-bold border-emerald-500/60 shadow-md'
                            : 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm'
                          : isDark
                            ? 'bg-slate-950/40 text-slate-400 font-medium border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'
                            : 'bg-slate-50 text-slate-700 font-medium border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isSelected ? (isDark ? `${catColor}35` : 'rgba(255, 255, 255, 0.25)') : `${catColor}15`,
                          color: isSelected ? '#ffffff' : catColor
                        }}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs truncate">{catName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategories Pills */}
              {subcategories.length > 0 && (
                <div className={`border rounded-xl p-2.5 mt-1.5 ${
                  isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className={`block text-[10px] font-bold mb-1.5 uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {category} Subcategory <span className="font-normal lowercase opacity-70">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setSubcategory('')}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md border transition-all ${
                        subcategory === ''
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                          : isDark
                            ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                      }`}
                    >
                      None
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubcategory(sub)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md border transition-all ${
                          subcategory === sub
                            ? isDark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                            : isDark
                              ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ROW 3: Record Type Segmented Bar */}
            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                Record Type <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
              </label>
              <div className={`grid grid-cols-5 gap-1 p-1 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {TYPES.map((t) => {
                  const isSelected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center transition-all active:scale-95 touch-manipulation truncate ${
                        isSelected
                          ? isDark
                            ? 'bg-slate-800 text-white shadow-xs border-l-2 border-l-emerald-400'
                            : 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                          : isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 4: Date & Time Side-by-Side Row */}
            <div className="grid grid-cols-12 gap-3 items-end">
              
              {/* Date Input (7 Cols) */}
              <div className="col-span-12 sm:col-span-7 space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Date <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                  </label>
                  
                  {/* Today & Yesterday Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate('today')}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95 touch-manipulation ${
                        date === todayStr
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : isDark
                            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate('yesterday')}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95 touch-manipulation ${
                        date === yesterdayStr
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : isDark
                            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      Yesterday
                    </button>
                  </div>
                </div>

                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full text-xs sm:text-sm font-semibold rounded-xl py-2 px-3 border focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>

              {/* Time Input (5 Cols) */}
              <div className="col-span-12 sm:col-span-5 space-y-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Time <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full text-xs sm:text-sm font-semibold rounded-xl py-2 px-3 border focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>

            </div>

            {/* ROW 5: Payment Method (Col 5) + Provider / Contractor (Col 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              
              {/* Payment Type (5 Cols) */}
              <div className="sm:col-span-5 space-y-1">
                <div className="flex items-center justify-between">
                  <label className={`text-[11px] font-bold uppercase tracking-wider truncate ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Payment <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                  </label>
                  {onManagePaymentTypes && (
                    <button
                      type="button"
                      onClick={onManagePaymentTypes}
                      className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                        isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                    >
                      <Settings2 className="w-3 h-3" /> Info
                    </button>
                  )}
                </div>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className={`w-full text-xs font-semibold rounded-xl py-2 px-2.5 border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 truncate ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                >
                  {availablePaymentTypes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Provider / Contractor (7 Cols) */}
              <div className="sm:col-span-7 space-y-1">
                <div className="flex items-center justify-between">
                  <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 truncate ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <User className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    Provider / Contractor
                  </label>
                  <button
                    type="button"
                    onClick={() => setProvider(provider === 'Self / DIY' ? '' : 'Self / DIY')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                      provider === 'Self / DIY'
                        ? isDark 
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : 'bg-teal-100 text-teal-800 border-teal-300'
                        : isDark
                          ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800'
                    }`}
                  >
                    Self / DIY
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Springfield HVAC, Home Depot"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className={`w-full text-xs rounded-xl py-2 px-2.5 border focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white placeholder:text-slate-400'
                  }`}
                />
              </div>

            </div>

            {/* ROW 6: Notes & Specifications */}
            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <FileText className="w-3.5 h-3.5 text-teal-500" />
                Notes & Specifications <span className="opacity-70 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={1.5}
                placeholder="Filter size, warranty details, receipt number, work performed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full text-xs rounded-xl p-2 resize-none border focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                  isDark 
                    ? 'bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white placeholder:text-slate-400'
                }`}
              />
            </div>

            {/* ROW 7: Smart Option Toggle Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              
              {/* Tax Deductible Card */}
              <div 
                onClick={() => setIsTaxDeductible(!isTaxDeductible)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 select-none ${
                  isTaxDeductible
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-xs'
                      : 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                    : isDark
                      ? 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  isTaxDeductible
                    ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-200/60 text-amber-700'
                    : isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  <Landmark className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Tax Deductible</span>
                    <input
                      type="checkbox"
                      checked={isTaxDeductible}
                      onChange={(e) => setIsTaxDeductible(e.target.checked)}
                      className={`w-3.5 h-3.5 rounded text-amber-600 border-slate-300 focus:ring-amber-500 touch-manipulation cursor-pointer ${
                        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Flag for tax reporting</p>
                </div>
              </div>

              {/* Schedule Next Reminder Card */}
              <div 
                onClick={() => setAddNextReminder(!addNextReminder)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 select-none ${
                  addNextReminder
                    ? isDark
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-xs'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    : isDark
                      ? 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  addNextReminder
                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-200/60 text-emerald-700'
                    : isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  <BellPlus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Schedule Reminder</span>
                    <input
                      type="checkbox"
                      checked={addNextReminder}
                      onChange={(e) => setAddNextReminder(e.target.checked)}
                      className={`w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 touch-manipulation cursor-pointer ${
                        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Future follow-up notice</p>
                </div>
              </div>

            </div>

            {/* Expandable Reminder Interval Builder */}
            {addNextReminder && (
              <div className={`border rounded-xl p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150 ${
                isDark 
                  ? 'bg-slate-950/70 border-emerald-500/30' 
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-900'
                  }`}>
                    <BellPlus className="w-3.5 h-3.5 text-emerald-600" /> Next Service Due Date
                  </label>
                  
                  {/* Interval Presets */}
                  <div className="flex items-center gap-1">
                    {[
                      { label: '+3 Mo', months: 3 },
                      { label: '+6 Mo', months: 6 },
                      { label: '+1 Yr', months: 12 },
                    ].map((item) => (
                      <button
                        key={item.months}
                        type="button"
                        onClick={() => handleSetReminderInterval(item.months)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all active:scale-95 ${
                          isDark
                            ? 'text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-500/40'
                            : 'text-emerald-800 bg-white hover:bg-emerald-100 border-emerald-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="date"
                  required={addNextReminder}
                  value={nextServiceDate}
                  onChange={(e) => setNextServiceDate(e.target.value)}
                  className={`w-full text-xs font-semibold rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            )}

          </div>

          {/* Sticky Action Footer */}
          <div className={`sticky bottom-0 z-20 flex items-center justify-end gap-2.5 px-4 py-3 sm:px-6 sm:py-3.5 border-t backdrop-blur-md shrink-0 ${
            isDark 
              ? 'border-slate-800 bg-slate-900/95' 
              : 'border-slate-100 bg-white/95'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-colors active:scale-98 touch-manipulation ${
                isDark
                  ? 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cost === ''}
              className={`flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-md transition-all active:scale-98 touch-manipulation ${
                cost !== ''
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : isDark
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{initialRecord ? 'Save Changes' : 'Log Expense'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
