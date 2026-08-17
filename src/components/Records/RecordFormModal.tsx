import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, Save, BellPlus, Landmark, Settings2, Home as HomeIcon,
  Calendar, Clock, DollarSign, Tag, User, FileText,
  RotateCcw, Receipt, Link2Off, Sun, Moon, Check
} from 'lucide-react';
import type { Home, EnrichedHomeRecord, MaintenanceCategory, MaintenanceType, PaymentType, PaymentTypeItem, Target, TaxonomyOverrideDoc } from '../../types';
import {
  getEffectiveCategoriesForTarget,
  getEffectiveSubcategoriesForTarget,
  CATEGORY_COLORS,
  COLOR_STYLES,
  getCategoryMeta,
  getSubcategoryIcon,
  getCategoryTaxGuidance,
  getSubcategoryTaxGuidance,
  resolveTaxGuidance
} from '../../constants/categories';

interface TaxTreatmentAdvice {
  propertyBadge: string;
  propertyBadgeClass: string;
  headline: string;
  explanation: string;
  scheduleBadge: string;
  scheduleBadgeClass: string;
  isDeductibleDefault: boolean;
}

const getTaxTreatmentAdvice = (
  isIncomeProperty: boolean,
  category: string,
  type: MaintenanceType,
  isDark: boolean,
  transactionType: 'Debit' | 'Credit' = 'Debit'
): TaxTreatmentAdvice => {
  // Scenario 1: Credit / Inflow / Income / Reimbursement
  if (transactionType === 'Credit') {
    if (isIncomeProperty) {
      if (category === 'Improvements & Renovations' || type === 'Upgrade') {
        return {
          propertyBadge: 'Rental Property',
          propertyBadgeClass: isDark
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          headline: 'Capital Rebate / Insurance Payout (Adjusts Depreciation Basis)',
          explanation: 'Insurance payouts, contractor refunds, or vendor rebates for major capital renovations reduce the depreciable asset cost basis on Schedule E (Form 4562).',
          scheduleBadge: 'Schedule E · Basis Offset',
          scheduleBadgeClass: isDark
            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
            : 'bg-indigo-100 text-indigo-800 border-indigo-200',
          isDeductibleDefault: false,
        };
      }

      if (category === 'Tax' || category === 'Property Tax' || category === 'Mortgage & Rent' || category === 'Services' || category === 'Utilities') {
        return {
          propertyBadge: 'Rental Property',
          propertyBadgeClass: isDark
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          headline: 'Expense Refund / Rebate (Offsets Schedule E Deductions)',
          explanation: 'Utility overcharge refunds, property tax abatements, or vendor discounts reduce your total deductible operating expenses on Schedule E in the year received.',
          scheduleBadge: 'Schedule E · Expense Offset',
          scheduleBadgeClass: isDark
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-amber-100 text-amber-800 border-amber-200',
          isDeductibleDefault: false,
        };
      }

      // Default Rental Credit -> Tenant Rent Income
      return {
        propertyBadge: 'Rental Property',
        propertyBadgeClass: isDark
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300',
        headline: 'Reportable Gross Rental Income (Schedule E, Line 3)',
        explanation: 'Rent payments, tenant pet/parking fees, or late charges collected are reportable as gross rental income on IRS Schedule E (Line 3).',
        scheduleBadge: 'Schedule E · Gross Revenue',
        scheduleBadgeClass: isDark
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300',
        isDeductibleDefault: false,
      };
    }

    // Main Residence Credits
    if (category === 'Solar') {
      return {
        propertyBadge: 'Main Residence',
        propertyBadgeClass: isDark
          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          : 'bg-blue-100 text-blue-800 border-blue-200',
        headline: 'Clean Energy Rebate / Utility Incentive',
        explanation: 'Manufacturer rebates or state utility incentives reduce your qualifying expenditure before computing the 30% clean energy tax credit on Form 5695.',
        scheduleBadge: 'Form 5695 · Credit Offset',
        scheduleBadgeClass: isDark
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
          : 'bg-cyan-100 text-cyan-800 border-cyan-200',
        isDeductibleDefault: false,
      };
    }

    if (category === 'Improvements & Renovations' || type === 'Upgrade') {
      return {
        propertyBadge: 'Main Residence',
        propertyBadgeClass: isDark
          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          : 'bg-blue-100 text-blue-800 border-blue-200',
        headline: 'Renovation Refund / Insurance Payout (Adjusts Cost Basis)',
        explanation: 'Casualty insurance claim payouts or contractor overpayment refunds for renovations reduce the capital improvement additions to your home’s adjusted cost basis.',
        scheduleBadge: 'Cost Basis Adjustment',
        scheduleBadgeClass: isDark
          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
          : 'bg-purple-100 text-purple-800 border-purple-200',
        isDeductibleDefault: false,
      };
    }

    if (category === 'Tax' || category === 'Property Tax') {
      return {
        propertyBadge: 'Main Residence',
        propertyBadgeClass: isDark
          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          : 'bg-blue-100 text-blue-800 border-blue-200',
        headline: 'Property Tax Refund / Abatement (Schedule A Recovery)',
        explanation: 'Real estate tax refunds from county reassessments or escrow surpluses offset prior deductions or reduce current tax expenses.',
        scheduleBadge: 'Schedule A · Tax Recovery',
        scheduleBadgeClass: isDark
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : 'bg-amber-100 text-amber-800 border-amber-200',
        isDeductibleDefault: false,
      };
    }

    return {
      propertyBadge: 'Main Residence',
      propertyBadgeClass: isDark
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        : 'bg-blue-100 text-blue-800 border-blue-200',
      headline: 'Expense Reimbursement / Rebate (Non-Taxable)',
      explanation: 'Casualty insurance payouts, manufacturer warranty reimbursements, or contractor refunds are non-taxable inflows that offset your out-of-pocket home maintenance costs.',
      scheduleBadge: 'Personal · Reimbursement',
      scheduleBadgeClass: isDark
        ? 'bg-slate-800 text-slate-400 border-slate-700'
        : 'bg-slate-100 text-slate-600 border-slate-200',
      isDeductibleDefault: false,
    };
  }

  // Scenario 2: Debit / Outflow / Expense
  if (isIncomeProperty) {
    if (category === 'Improvements & Renovations' || type === 'Upgrade') {
      return {
        propertyBadge: 'Rental Property',
        propertyBadgeClass: isDark
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300',
        headline: 'Capital Improvement (Depreciated over 27.5 Years)',
        explanation: 'Major renovations and structural replacements on rental properties add to your depreciation basis and are written off over 27.5 years on Schedule E (Form 4562).',
        scheduleBadge: 'Schedule E · Depreciated',
        scheduleBadgeClass: isDark
          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
          : 'bg-indigo-100 text-indigo-800 border-indigo-200',
        isDeductibleDefault: true,
      };
    }

    return {
      propertyBadge: 'Rental Property',
      propertyBadgeClass: isDark
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        : 'bg-emerald-100 text-emerald-800 border-emerald-300',
      headline: '100% Deductible Operating Expense',
      explanation: 'Routine repairs, maintenance, property taxes, utilities, insurance, and management services on rental properties are fully deductible against rental income in the tax year paid.',
      scheduleBadge: 'Schedule E · 100% Deductible',
      scheduleBadgeClass: isDark
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        : 'bg-emerald-100 text-emerald-800 border-emerald-300',
      isDeductibleDefault: true,
    };
  }

  // Primary Residence / Personal Home
  if (category === 'Tax' || category === 'Property Tax') {
    return {
      propertyBadge: 'Main Residence',
      propertyBadgeClass: isDark
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        : 'bg-blue-100 text-blue-800 border-blue-200',
      headline: 'Real Estate Tax (Schedule A Itemized)',
      explanation: 'State and local real estate property taxes on your primary residence are deductible if you itemize deductions (subject to the $10,000 total SALT limit).',
      scheduleBadge: 'Schedule A · Itemized',
      scheduleBadgeClass: isDark
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      isDeductibleDefault: true,
    };
  }

  if (category === 'Mortgage & Rent') {
    return {
      propertyBadge: 'Main Residence',
      propertyBadgeClass: isDark
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        : 'bg-blue-100 text-blue-800 border-blue-200',
      headline: 'Mortgage Interest (Schedule A Itemized)',
      explanation: 'Qualified home mortgage interest on loans up to $750k ($1M if pre-2017) is deductible on Schedule A when itemizing (reported on Form 1098).',
      scheduleBadge: 'Schedule A · Mortgage',
      scheduleBadgeClass: isDark
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      isDeductibleDefault: true,
    };
  }

  if (category === 'Solar') {
    return {
      propertyBadge: 'Main Residence',
      propertyBadgeClass: isDark
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        : 'bg-blue-100 text-blue-800 border-blue-200',
      headline: '30% Clean Energy Tax Credit (Form 5695)',
      explanation: 'Solar electric, solar water heating, and battery storage installations on your main home qualify for a 30% federal clean energy tax credit directly against your tax bill.',
      scheduleBadge: 'Form 5695 · Tax Credit',
      scheduleBadgeClass: isDark
        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        : 'bg-cyan-100 text-cyan-800 border-cyan-200',
      isDeductibleDefault: true,
    };
  }

  if (category === 'Improvements & Renovations' || type === 'Upgrade') {
    return {
      propertyBadge: 'Main Residence',
      propertyBadgeClass: isDark
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        : 'bg-blue-100 text-blue-800 border-blue-200',
      headline: 'Capital Improvement (Adjusts Cost Basis)',
      explanation: 'Not deductible in the current tax year, but permanently increases your home’s cost basis to reduce taxable capital gains when you sell (Pub. 523 / Section 121).',
      scheduleBadge: 'Cost Basis Adjustment',
      scheduleBadgeClass: isDark
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        : 'bg-purple-100 text-purple-800 border-purple-200',
      isDeductibleDefault: false,
    };
  }

  // General routine upkeep on personal residence
  return {
    propertyBadge: 'Main Residence',
    propertyBadgeClass: isDark
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      : 'bg-blue-100 text-blue-800 border-blue-200',
    headline: 'Personal Living Expense (Non-Deductible)',
    explanation: 'Routine upkeep, handyman repairs, lawn care, utilities, and general maintenance on your personal home are non-deductible personal living expenses.',
    scheduleBadge: 'Personal · Non-Deductible',
    scheduleBadgeClass: isDark
      ? 'bg-slate-800 text-slate-400 border-slate-700'
      : 'bg-slate-100 text-slate-600 border-slate-200',
    isDeductibleDefault: false,
  };
};

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
  overrideDoc?: TaxonomyOverrideDoc;
  onManageCategories?: () => void;
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
  onMoveToExpense,
  theme: propsTheme,
  onToggleTheme,
  overrideDoc,
  onManageCategories
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
  const selectedHome = useMemo(() => homes.find(h => h.id === homeId), [homes, homeId]);
  const [target, setTarget] = useState<Target>('Property');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [cost, setCost] = useState<number | ''>('');
  const [category, setCategory] = useState<MaintenanceCategory>('Maintenance & Repairs');
  const [subcategory, setSubcategory] = useState('');
  const [type, setType] = useState<MaintenanceType>('Maintenance');
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
  const [transactionType, setTransactionType] = useState<'Debit' | 'Credit'>('Debit');
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

  const effectiveCategories = useMemo(
    () => getEffectiveCategoriesForTarget(target, overrideDoc),
    [target, overrideDoc]
  );

  const subcategories = useMemo(
    () => getEffectiveSubcategoriesForTarget(target, category, overrideDoc),
    [target, category, overrideDoc]
  );

  useEffect(() => {
    if (initialRecord) {
      const initialHome = homes.find(h => h.id === initialRecord.homeId);
      setHomeId(initialRecord.homeId || activeHomeId || (homes[0]?.id || ''));
      setTarget('Property');
      setDate(initialRecord.date);
      setTime(initialRecord.time || new Date().toTimeString().slice(0, 5));
      setCost(initialRecord.cost);
      setCategory(initialRecord.category);
      setSubcategory(
        getEffectiveSubcategoriesForTarget('Property', initialRecord.category, overrideDoc).includes(initialRecord.subcategory || '')
          ? initialRecord.subcategory || ''
          : ''
      );
      setType(initialRecord.type);
      setProvider(initialRecord.provider || '');
      setNotes(initialRecord.notes || '');
      setPaymentType(initialRecord.paymentType || 'Cash');
      setTransactionType(initialRecord.transactionType || 'Debit');
      setIsTaxDeductible(initialRecord.isTaxDeductible !== undefined ? Boolean(initialRecord.isTaxDeductible) : Boolean(initialHome?.isIncomeProperty));
      setNextServiceDate(initialRecord.nextServiceDate || '');
      setAddNextReminder(Boolean(initialRecord.nextServiceDate));
    } else {
      const targetHomeId = activeHomeId || (homes[0]?.id || '');
      const defaultHome = homes.find(h => h.id === targetHomeId);
      setHomeId(targetHomeId);
      setTarget('Property');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setCost('');
      const defaultCat = getEffectiveCategoriesForTarget('Property', overrideDoc)[0] || 'Maintenance & Repairs';
      setCategory(defaultCat);
      setSubcategory('');
      setType('Maintenance');
      setProvider('');
      setNotes('');
      setPaymentType('Cash');
      setTransactionType('Debit');
      setIsTaxDeductible(Boolean(defaultHome?.isIncomeProperty) || defaultCat === 'Tax' || defaultCat === 'Property Tax');
      setNextServiceDate('');
      setAddNextReminder(false);
    }
  }, [initialRecord, isOpen, activeHomeId, homes, overrideDoc]);

  const isIncomeProp = Boolean(selectedHome?.isIncomeProperty);

  const taxAdvice = useMemo(() => {
    return getTaxTreatmentAdvice(isIncomeProp, category, type, isDark, transactionType);
  }, [isIncomeProp, category, type, isDark, transactionType]);

  if (!isOpen) return null;

  const handleHomeChange = (newHomeId: string) => {
    setHomeId(newHomeId);
    const newHome = homes.find(h => h.id === newHomeId);
    const isNewIncome = Boolean(newHome?.isIncomeProperty);
    const advice = getTaxTreatmentAdvice(isNewIncome, category, type, isDark, transactionType);
    setIsTaxDeductible(advice.isDeductibleDefault);
  };

  const handleCategoryChange = (newCategory: MaintenanceCategory) => {
    setCategory(newCategory);
    setSubcategory('');
    const advice = getTaxTreatmentAdvice(isIncomeProp, newCategory, type, isDark, transactionType);
    setIsTaxDeductible(advice.isDeductibleDefault);
  };

  const handleTransactionTypeChange = (newDirection: 'Debit' | 'Credit') => {
    setTransactionType(newDirection);
    const advice = getTaxTreatmentAdvice(isIncomeProp, category, type, isDark, newDirection);
    setIsTaxDeductible(advice.isDeductibleDefault);
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
      target,
      date,
      time,
      cost: Number(cost),
      category,
      subcategory: subcategory || undefined,
      type,
      provider: provider.trim() || 'Self / DIY',
      notes: notes.trim() || undefined,
      paymentType,
      transactionType,
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
                {initialRecord 
                  ? 'Edit Transaction Record' 
                  : transactionType === 'Credit' 
                    ? 'Log Property Credit / Inflow' 
                    : 'Log Home Expense / Outflow'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {homes.length > 1 ? (
                  <div className="relative flex items-center">
                    <HomeIcon className={`w-3 h-3 mr-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <select
                      value={homeId}
                      onChange={(e) => handleHomeChange(e.target.value)}
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

            {/* ROW 1: Transaction Type & Hero Amount Entry & Quick Add Chips */}
            <div className={`border rounded-lg p-2.5 relative transition-all space-y-2 ${
              transactionType === 'Credit'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : 'bg-emerald-50/90 border-emerald-300'
                : isDark
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-50 border-slate-200/90'
            }`}>
              
              {/* Transaction Type Segmented Switch */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-dashed border-slate-700/30">
                <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <DollarSign className="w-3 h-3 text-emerald-500" />
                  Transaction Type <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                </label>
                <div className={`p-0.5 rounded-lg border inline-flex items-center gap-0.5 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <button
                    type="button"
                    onClick={() => handleTransactionTypeChange('Debit')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all touch-manipulation active:scale-95 ${
                      transactionType === 'Debit'
                        ? isDark
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                          : 'bg-rose-50 text-rose-700 border border-rose-300 shadow-xs'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>💸 Debit (Expense)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransactionTypeChange('Credit')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all touch-manipulation active:scale-95 ${
                      transactionType === 'Credit'
                        ? isDark
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>💰 Credit (Income / Refund)</span>
                  </button>
                </div>
              </div>

              {/* Cost Input Box */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    transactionType === 'Credit'
                      ? isDark ? 'text-emerald-300' : 'text-emerald-900'
                      : isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    <DollarSign className={`w-3 h-3 ${transactionType === 'Credit' ? 'text-emerald-400' : isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                    {transactionType === 'Credit' ? 'Credit / Income Amount' : 'Expense Amount'}{' '}
                    <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
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
                    transactionType === 'Credit'
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    {transactionType === 'Credit' ? '+$' : '$'}
                  </span>
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
            </div>

            {/* ROW 2: Category Chips & Selector (Statements PWA style) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  Select a Category <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>*</span>
                </label>
                
                {onManageCategories && (
                  <button
                    type="button"
                    onClick={onManageCategories}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                      isDark ? 'bg-slate-800 text-blue-400 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-blue-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Manage Categories
                  </button>
                )}
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-0.5 custom-scrollbar">
                {effectiveCategories.map((catName) => {
                  const isSelected = category === catName;
                  const meta = getCategoryMeta(catName);
                  const styles = COLOR_STYLES[meta.colorName] || COLOR_STYLES.indigo;
                  const IconComp = meta.icon;

                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => handleCategoryChange(catName)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-manipulation ${
                        isSelected
                          ? isDark
                            ? `${styles.border} ${styles.bg} ${styles.text} shadow-xs ring-1 ring-emerald-500/30`
                            : `${styles.border} ${styles.bg} ${styles.text} shadow-xs ring-1 ring-emerald-500/40`
                          : isDark
                            ? 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? styles.icon : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span>{catName}</span>
                      {isSelected && <Check className={`w-3 h-3 ${styles.icon}`} />}
                    </button>
                  );
                })}
              </div>

              {/* Category Tax Guidance Callout (Statements PWA Style) */}
              {category && (() => {
                const guidance = resolveTaxGuidance(getCategoryTaxGuidance(category), isIncomeProp);
                if (!guidance) return null;
                return (
                  <div className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/90 border-slate-200'
                  }`}>
                    <div className="h-5 w-5 rounded-md bg-teal-500/15 text-teal-500 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Landmark className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Tax Treatment:</span>
                        {guidance.scheduleOrForm && (
                          <span className={`px-2 py-0.2 rounded-full font-mono text-[10px] font-semibold border ${
                            isDark ? 'bg-slate-800 text-teal-300 border-teal-500/30' : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}>
                            {guidance.scheduleOrForm}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {guidance.purpose}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Subcategories Rich Grid (Statements PWA style) */}
              {subcategories.length > 0 && (() => {
                const selectedCatMeta = getCategoryMeta(category);
                const catStyles = COLOR_STYLES[selectedCatMeta.colorName] || COLOR_STYLES.indigo;

                return (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <span>Select a Subcategory</span>
                        <span className="text-[10px] normal-case font-normal opacity-70">(optional)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
                      {/* None / General Card */}
                      <button
                        type="button"
                        onClick={() => setSubcategory('')}
                        className={`p-2.5 rounded-xl border text-left transition-all active:scale-98 touch-manipulation ${
                          subcategory === ''
                            ? isDark
                              ? `${catStyles.border} ${catStyles.bg} ${catStyles.text} shadow-xs`
                              : `${catStyles.border} ${catStyles.bg} ${catStyles.text} shadow-xs`
                            : isDark
                              ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-xs">None / General {category}</div>
                        <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No specific subcategory tag</div>
                      </button>

                      {/* Subcategory Cards with Tax Badges & Guidance */}
                      {subcategories.map((sub) => {
                        const isSubSelected = subcategory === sub;
                        const SubIcon = getSubcategoryIcon(sub);
                        const subGuidance = resolveTaxGuidance(getSubcategoryTaxGuidance(sub), isIncomeProp);

                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setSubcategory(sub)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 active:scale-98 touch-manipulation ${
                              isSubSelected
                                ? isDark
                                  ? `${catStyles.border} ${catStyles.bg} ${catStyles.text} shadow-xs ring-1 ring-emerald-500/30`
                                  : `${catStyles.border} ${catStyles.bg} ${catStyles.text} shadow-xs ring-1 ring-emerald-500/40`
                                : isDark
                                  ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                {SubIcon && <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubSelected ? catStyles.icon : isDark ? 'text-slate-400' : 'text-slate-500'}`} />}
                                <span className="font-bold text-xs truncate">{sub}</span>
                              </div>
                              {subGuidance?.scheduleOrForm && (
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 font-semibold ${
                                  isSubSelected
                                    ? isDark ? 'bg-slate-900/80 border-slate-700 text-teal-300' : 'bg-white/90 border-slate-300 text-teal-700'
                                    : isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-white text-slate-500 border-slate-200'
                                }`}>
                                  {subGuidance.scheduleOrForm}
                                </span>
                              )}
                            </div>
                            {subGuidance?.purpose && (
                              <p className={`text-[10px] leading-snug line-clamp-2 ${
                                isSubSelected ? (isDark ? 'text-slate-300' : 'text-slate-800') : (isDark ? 'text-slate-400' : 'text-slate-500')
                              }`}>
                                {subGuidance.purpose}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
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
                    {transactionType === 'Credit' ? 'Source / Payer / Tenant' : 'Provider / Contractor'}
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
                  placeholder={transactionType === 'Credit' ? 'e.g. Tenant, Insurance Payout, Vendor Refund' : 'e.g. Springfield HVAC, Home Depot'}
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

            {/* ROW 7: Tax Treatment Guidance Banner */}
            <div className={`p-2.5 rounded-xl border transition-all space-y-1.5 ${
              transactionType === 'Credit'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                  : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : isIncomeProp
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                    : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : isDark
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Landmark className={`w-3.5 h-3.5 shrink-0 ${
                    transactionType === 'Credit'
                      ? 'text-emerald-500'
                      : isIncomeProp
                        ? 'text-emerald-500'
                        : category === 'Tax' || category === 'Mortgage & Rent' || category === 'Solar'
                          ? 'text-amber-500'
                          : 'text-slate-400'
                  }`} />
                  <span className="text-[11px] font-extrabold truncate">
                    {isIncomeProp ? 'Rental Property Tax Treatment' : 'Main Residence Tax Treatment'}{' '}
                    <span className="text-[10px] opacity-75">({transactionType === 'Credit' ? 'Credit / Inflow' : 'Debit / Outflow'})</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${taxAdvice.propertyBadgeClass}`}>
                    {taxAdvice.propertyBadge}
                  </span>
                  <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${taxAdvice.scheduleBadgeClass}`}>
                    {taxAdvice.scheduleBadge}
                  </span>
                </div>
              </div>

              <p className={`text-[11px] leading-snug ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{taxAdvice.headline}: </strong>
                {taxAdvice.explanation}
              </p>
            </div>

            {/* ROW 8: Smart Option Toggle Cards */}
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
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  isTaxDeductible
                    ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-200/60 text-amber-700'
                    : isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  <Landmark className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                        {transactionType === 'Credit' ? 'Tax Deductible / Offset' : 'Flag as Tax Deductible'}
                      </span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase border ${taxAdvice.scheduleBadgeClass}`}>
                        {taxAdvice.scheduleBadge}
                      </span>
                    </div>
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
                  <p className={`text-[9px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {taxAdvice.headline}
                  </p>
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
              <span>
                {initialRecord 
                  ? 'Save Changes' 
                  : transactionType === 'Credit' 
                    ? 'Log Credit' 
                    : 'Log Expense'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
