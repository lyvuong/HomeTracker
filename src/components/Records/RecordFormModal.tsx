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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-3 backdrop-blur-md overflow-hidden ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/60'
    }`}>
      {/* Background overlay click handler */}
      <div 
        className="absolute inset-0 bg-transparent" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Main Dialog Container - Ultra Compact Dimensions to Avoid Scrolling */}
      <div className={`relative w-full max-h-[96vh] sm:max-w-2xl border rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-white' 
          : 'bg-white border-slate-200/80 text-slate-900'
      }`}>

        {/* Compact Header */}
        <div className={`sticky top-0 z-20 flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3 border-b backdrop-blur-md shrink-0 ${
          isDark 
            ? 'border-slate-800 bg-slate-900/95 text-white' 
            : 'border-slate-100 bg-white/95 text-slate-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div 
              className="p-1.5 rounded-lg shrink-0 flex items-center justify-center transition-colors shadow-xs"
              style={{ backgroundColor: `${categoryColor}15`, color: categoryColor, border: `1px solid ${categoryColor}30` }}
            >
              <Receipt className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight tracking-tight">
                {initialRecord ? 'Edit Expense Record' : 'Log New Home Expense'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {homes.length > 1 ? (
                  <div className="relative flex items-center">
                    <HomeIcon className={`w-3 h-3 mr-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <select
                      value={homeId}
                      onChange={(e) => setHomeId(e.target.value)}
                      className={`text-[11px] font-semibold rounded-md py-0.5 pl-1.5 pr-4 border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                        isDark 
                          ? 'bg-slate-800 text-slate-200 border-slate-700' 
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {homes.map((h) => (
                        <option key={h.id} value={h.id}>{h.nickname}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className={`text-[11px] font-medium flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <HomeIcon className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className="truncate max-w-[180px] sm:max-w-none">{activeHomeNickname}</span>
                  </p>
                )}

                {/* Move to Expense Button */}
                {initialRecord && onMoveToExpense && (
                  <button
                    type="button"
                    onClick={() => onMoveToExpense(initialRecord)}
                    className={`text-[10px] font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-md border transition-colors ${
                      isDark 
                        ? 'text-purple-400 bg-purple-950/60 border-purple-500/40' 
                        : 'text-purple-600 bg-purple-50 border-purple-200'
                    }`}
                  >
                    <Link2Off className="w-3 h-3" /> Move to Expense
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95 touch-manipulation ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-slate-200'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors active:scale-95 touch-manipulation ${
                isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              aria-label="Close dialog"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Compact Form Body - Fits Viewport Without Vertical Scrolling */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 custom-scrollbar">

            {/* ROW 1: Hero Amount Entry & Quick Add Chips */}
            <div className={`border rounded-lg p-2.5 relative transition-all ${
              isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-emerald-50/60 border-emerald-200/80'
            }`}>
              <div className="grid grid-cols-12 gap-2 items-center">
                
                {/* Cost Input Box */}
                <div className="col-span-12 sm:col-span-7">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isDark ? 'text-slate-400' : 'text-emerald-900'
                    }`}>
                      <DollarSign className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      Expense Amount <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                    </label>
                    {typeof cost === 'number' && cost > 0 && (
                      <button
                        type="button"
                        onClick={() => setCost('')}
                        className={`text-[9px] font-semibold flex items-center gap-0.5 px-1 py-0.2 rounded border ${
                          isDark 
                            ? 'text-slate-400 bg-slate-900 border-slate-800' 
                            : 'text-slate-500 bg-white border-slate-200'
                        }`}
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Clear
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <span className={`text-xl font-extrabold font-mono select-none mr-1 ${
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
                      className={`w-full bg-transparent text-xl sm:text-2xl font-black font-mono focus:outline-none tracking-tight ${
                        isDark 
                          ? 'text-white placeholder:text-slate-600' 
                          : 'text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Quick Add Chips */}
                <div className={`col-span-12 sm:col-span-5 sm:border-l pt-1 sm:pt-0 ${
                  isDark ? 'sm:border-slate-800 sm:pl-2.5' : 'sm:border-emerald-200/80 sm:pl-2.5'
                }`}>
                  <span className={`block text-[9px] font-bold uppercase tracking-wider mb-0.5 ${
                    isDark ? 'text-slate-500' : 'text-emerald-800'
                  }`}>Quick Add</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {[10, 50, 100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAddCost(amt)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition-all active:scale-95 touch-manipulation ${
                          isDark
                            ? 'text-slate-300 bg-slate-900 hover:bg-emerald-500/20 border-slate-800'
                            : 'text-emerald-800 bg-white hover:bg-emerald-100/80 border-emerald-200 shadow-2xs'
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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Tag className="w-3 h-3 text-amber-500" />
                  Category <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                </label>
                
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as MaintenanceCategory)}
                    className={`text-[11px] font-semibold rounded-md py-0.5 px-2 pr-5 border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none truncate max-w-[150px] ${
                      isDark
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Visual Category Chips (Compact 4 Columns) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {FEATURED_CATEGORIES.map((catName) => {
                  const isSelected = category === catName;
                  const catColor = CATEGORY_COLORS[catName] || (isDark ? '#34d399' : '#059669');
                  const IconComp = CATEGORY_ICONS[catName] || Tag;

                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => handleCategoryChange(catName)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all active:scale-98 touch-manipulation ${
                        isSelected
                          ? isDark
                            ? 'bg-slate-800 text-white font-bold border-emerald-500/60 shadow-xs'
                            : 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                          : isDark
                            ? 'bg-slate-950/40 text-slate-400 font-medium border-slate-800 hover:bg-slate-800/50'
                            : 'bg-slate-50 text-slate-700 font-medium border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isSelected ? (isDark ? `${catColor}35` : 'rgba(255, 255, 255, 0.25)') : `${catColor}15`,
                          color: isSelected ? '#ffffff' : catColor
                        }}
                      >
                        <IconComp className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] truncate">{catName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategories Pills */}
              {subcategories.length > 0 && (
                <div className={`border rounded-lg p-2 mt-1 ${
                  isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className={`block text-[9px] font-bold mb-1 uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {category} Subcategory <span className="font-normal lowercase opacity-70">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setSubcategory('')}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        subcategory === ''
                          ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                          : isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      None
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubcategory(sub)}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          subcategory === sub
                            ? isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                            : isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
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
              <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Wrench className="w-3 h-3 text-indigo-500" />
                Record Type <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
              </label>
              <div className={`grid grid-cols-5 gap-1 p-0.5 rounded-lg border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {TYPES.map((t) => {
                  const isSelected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-1 px-1 rounded text-[11px] font-bold text-center transition-all active:scale-95 touch-manipulation truncate ${
                        isSelected
                          ? isDark
                            ? 'bg-slate-800 text-white shadow-xs border-l-2 border-l-emerald-400'
                            : 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                          : isDark
                            ? 'text-slate-400 hover:text-slate-200'
                            : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 4: Date & Time Side-by-Side Row */}
            <div className="grid grid-cols-12 gap-2 items-end">
              
              {/* Date Input (7 Cols) */}
              <div className="col-span-12 sm:col-span-7 space-y-0.5">
                <div className="flex items-center justify-between mb-0.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Calendar className="w-3 h-3 text-indigo-500" />
                    Date <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                  </label>
                  
                  {/* Today & Yesterday Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate('today')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-all active:scale-95 touch-manipulation ${
                        date === todayStr
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : isDark
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetQuickDate('yesterday')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-all active:scale-95 touch-manipulation ${
                        date === yesterdayStr
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : isDark
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200/80'
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
                  className={`w-full text-xs font-semibold rounded-lg py-1.5 px-2.5 border focus:outline-none focus:border-indigo-500 ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>

              {/* Time Input (5 Cols) */}
              <div className="col-span-12 sm:col-span-5 space-y-0.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-0.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Clock className="w-3 h-3 text-indigo-500" />
                  Time <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full text-xs font-semibold rounded-lg py-1.5 px-2.5 border focus:outline-none focus:border-indigo-500 ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>

            </div>

            {/* ROW 5: Payment Method (Col 5) + Provider / Contractor (Col 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              
              {/* Payment Type (5 Cols) */}
              <div className="sm:col-span-5 space-y-0.5">
                <div className="flex items-center justify-between mb-0.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Payment <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                  </label>
                  {onManagePaymentTypes && (
                    <button
                      type="button"
                      onClick={onManagePaymentTypes}
                      className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                        isDark ? 'text-indigo-400' : 'text-indigo-600'
                      }`}
                    >
                      <Settings2 className="w-2.5 h-2.5" /> Info
                    </button>
                  )}
                </div>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className={`w-full text-xs font-semibold rounded-lg py-1.5 px-2 border focus:outline-none focus:border-emerald-500 truncate ${
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
              <div className="sm:col-span-7 space-y-0.5">
                <div className="flex items-center justify-between mb-0.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 truncate ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <User className="w-3 h-3 text-teal-500 shrink-0" />
                    Provider / Contractor
                  </label>
                  <button
                    type="button"
                    onClick={() => setProvider(provider === 'Self / DIY' ? '' : 'Self / DIY')}
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      provider === 'Self / DIY'
                        ? isDark 
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : 'bg-teal-100 text-teal-800 border-teal-300'
                        : isDark
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
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
                  className={`w-full text-xs rounded-lg py-1.5 px-2 border focus:outline-none focus:border-teal-500 ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white placeholder:text-slate-400'
                  }`}
                />
              </div>

            </div>

            {/* ROW 6: Notes & Specifications */}
            <div className="space-y-0.5">
              <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <FileText className="w-3 h-3 text-teal-500" />
                Notes & Specifications <span className="opacity-70 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={1}
                placeholder="Filter size, warranty details, receipt number, work performed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full text-xs rounded-lg p-1.5 resize-none border focus:outline-none focus:border-teal-500 ${
                  isDark 
                    ? 'bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white placeholder:text-slate-400'
                }`}
              />
            </div>

            {/* ROW 7: Smart Option Toggle Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              
              {/* Tax Deductible Card */}
              <div 
                onClick={() => setIsTaxDeductible(!isTaxDeductible)}
                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 select-none ${
                  isTaxDeductible
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-xs'
                      : 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                    : isDark
                      ? 'bg-slate-950/50 border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600'
                }`}
              >
                <div className={`p-1 rounded shrink-0 ${
                  isTaxDeductible
                    ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-200/60 text-amber-700'
                    : isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  <Landmark className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Tax Deductible</span>
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
                  <p className={`text-[9px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Flag for tax reporting</p>
                </div>
              </div>

              {/* Schedule Next Reminder Card */}
              <div 
                onClick={() => setAddNextReminder(!addNextReminder)}
                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 select-none ${
                  addNextReminder
                    ? isDark
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-xs'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    : isDark
                      ? 'bg-slate-950/50 border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600'
                }`}
              >
                <div className={`p-1 rounded shrink-0 ${
                  addNextReminder
                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-200/60 text-emerald-700'
                    : isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  <BellPlus className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Schedule Reminder</span>
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
                  <p className={`text-[9px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Future follow-up notice</p>
                </div>
              </div>

            </div>

            {/* Expandable Reminder Interval Builder */}
            {addNextReminder && (
              <div className={`border rounded-lg p-2 space-y-1.5 animate-in fade-in duration-150 ${
                isDark 
                  ? 'bg-slate-950/70 border-emerald-500/30' 
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-900'
                  }`}>
                    <BellPlus className="w-3 h-3 text-emerald-600" /> Next Service Due Date
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
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          isDark
                            ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                            : 'text-emerald-800 bg-white border-emerald-300'
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
                  className={`w-full text-xs font-semibold rounded py-1 px-2 border focus:outline-none ${
                    isDark 
                      ? 'bg-slate-900 border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            )}

          </div>

          {/* Sticky Action Footer */}
          <div className={`sticky bottom-0 z-20 flex items-center justify-end gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 border-t backdrop-blur-md shrink-0 ${
            isDark 
              ? 'border-slate-800 bg-slate-900/95' 
              : 'border-slate-100 bg-white/95'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors active:scale-98 touch-manipulation ${
                isDark
                  ? 'text-slate-300 bg-slate-800/80 border-slate-700/60'
                  : 'text-slate-600 bg-slate-100 border-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cost === ''}
              className={`flex items-center justify-center gap-1 font-bold text-xs px-4 py-1.5 rounded-lg shadow-md transition-all active:scale-98 touch-manipulation ${
                cost !== ''
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : isDark
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialRecord ? 'Save Changes' : 'Log Expense'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
