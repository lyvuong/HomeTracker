import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  Landmark,
  Wrench,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import type { Home, EnrichedHomeRecord, Target, TaxonomyOverrideDoc } from '../../types';
import { exportRecordsAsCSV } from '../../services/storage';
import {
  TYPES,
  getEffectiveCategoriesForTarget,
  getEffectiveSubcategoriesForTarget,
  TARGET_META,
  COLOR_STYLES
} from '../../constants/categories';

interface RecordHistoryProps {
  records: EnrichedHomeRecord[];
  homes: Home[];
  activeHomeId: string;
  onOpenAddService: () => void;
  onEditRecord: (record: EnrichedHomeRecord) => void;
  onDeleteRecord: (id: string) => void;
  overrideDoc?: TaxonomyOverrideDoc;
  theme?: 'light' | 'dark';
}

export const RecordHistory: React.FC<RecordHistoryProps> = ({
  records,
  homes,
  activeHomeId,
  onOpenAddService,
  onEditRecord,
  onDeleteRecord,
  overrideDoc,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const [selectedHomeFilter, setSelectedHomeFilter] = useState<string>(activeHomeId || 'all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedDirectionFilter, setSelectedDirectionFilter] = useState<'all' | 'Debit' | 'Credit'>('all');
  const [taxDeductibleOnly, setTaxDeductibleOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'cost-desc'>('date-desc');

  const homeMap = useMemo(() => {
    return new Map(homes.map(h => [h.id, h]));
  }, [homes]);

  // Combine effective Property categories with any distinct categories in records
  const filterCategories = useMemo(() => {
    const effective = getEffectiveCategoriesForTarget('Property', overrideDoc);
    const fromRecords = Array.from(new Set(records.map(r => r.category))).filter(Boolean);
    return Array.from(new Set([...effective, ...fromRecords]));
  }, [overrideDoc, records]);

  // Subcategories are per-category
  const availableSubcategories = useMemo(() => {
    if (selectedCategoryFilter === 'all') return [];
    return getEffectiveSubcategoriesForTarget('Property', selectedCategoryFilter, overrideDoc);
  }, [selectedCategoryFilter, overrideDoc]);

  const handleCategoryFilterChange = (value: string) => {
    setSelectedCategoryFilter(value);
    setSelectedSubcategoryFilter('all');
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedHomeFilter !== 'all' && r.homeId !== selectedHomeFilter) return false;
      if (selectedCategoryFilter !== 'all' && r.category !== selectedCategoryFilter) return false;
      if (selectedSubcategoryFilter !== 'all' && r.subcategory !== selectedSubcategoryFilter) return false;
      if (selectedTypeFilter !== 'all' && r.type !== selectedTypeFilter) return false;
      if (selectedDirectionFilter !== 'all' && (r.transactionType || 'Debit') !== selectedDirectionFilter) return false;
      if (taxDeductibleOnly && !r.isTaxDeductible) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const home = homeMap.get(r.homeId);
        const homeName = home ? home.nickname.toLowerCase() : '';
        const matchCategory = r.category.toLowerCase().includes(query);
        const matchSubcategory = (r.subcategory || '').toLowerCase().includes(query);
        const matchProvider = (r.provider || '').toLowerCase().includes(query);
        const matchNotes = (r.notes || '').toLowerCase().includes(query);
        const matchCost = r.cost.toString().includes(query);

        return (
          homeName.includes(query) ||
          matchCategory ||
          matchSubcategory ||
          matchProvider ||
          matchNotes ||
          matchCost
        );
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'cost-desc') return b.cost - a.cost;
      return 0;
    });
  }, [records, selectedHomeFilter, selectedCategoryFilter, selectedSubcategoryFilter, selectedTypeFilter, selectedDirectionFilter, taxDeductibleOnly, searchQuery, sortBy, homeMap]);

  const totalDebits = useMemo(() => {
    return filteredRecords
      .filter(r => (r.transactionType || 'Debit') === 'Debit')
      .reduce((sum, r) => sum + r.cost, 0);
  }, [filteredRecords]);

  const totalCredits = useMemo(() => {
    return filteredRecords
      .filter(r => r.transactionType === 'Credit')
      .reduce((sum, r) => sum + r.cost, 0);
  }, [filteredRecords]);

  const netCost = totalDebits - totalCredits;

  const handleExportCSV = () => {
    exportRecordsAsCSV(filteredRecords, homes);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header with Title and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-emerald-500" />
            Home Expense & Transaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete logs of all maintenance, repairs, upgrades, property debits, and credits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="glass-button text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onOpenAddService}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Log Expense / Credit
          </button>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="glass-card p-4.5 rounded-3xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">

          {/* Search Box */}
          <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Filter Home */}
          <select
            value={selectedHomeFilter}
            onChange={(e) => setSelectedHomeFilter(e.target.value)}
            className="glass-input text-xs rounded-xl px-3 py-2.5 cursor-pointer font-medium"
          >
            <option value="all">🏠 All Homes ({homes.length})</option>
            {homes.map(h => (
              <option key={h.id} value={h.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {h.nickname}
              </option>
            ))}
          </select>

          {/* Filter Category */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
            className="glass-input text-xs rounded-xl px-3 py-2.5 cursor-pointer font-medium"
          >
            <option value="all">📋 All Categories</option>
            {filterCategories.map(cat => (
              <option key={cat} value={cat} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {cat}
              </option>
            ))}
          </select>

          {/* Filter Subcategory */}
          {availableSubcategories.length > 0 ? (
            <select
              value={selectedSubcategoryFilter}
              onChange={(e) => setSelectedSubcategoryFilter(e.target.value)}
              className="glass-input text-xs rounded-xl px-3 py-2.5 cursor-pointer font-medium"
            >
              <option value="all">💡 All {selectedCategoryFilter}</option>
              {availableSubcategories.map(sub => (
                <option key={sub} value={sub} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {sub}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="glass-input text-xs rounded-xl px-3 py-2.5 cursor-pointer font-medium"
            >
              <option value="all">🔧 All Types</option>
              {TYPES.map(t => (
                <option key={t} value={t} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {t}
                </option>
              ))}
            </select>
          )}

          {/* Filter Direction (Debit vs Credit) */}
          <select
            value={selectedDirectionFilter}
            onChange={(e: any) => setSelectedDirectionFilter(e.target.value)}
            className="glass-input text-xs rounded-xl px-3 py-2.5 cursor-pointer font-medium"
          >
            <option value="all">💸 All Debits & Credits</option>
            <option value="Debit">💸 Debits (Expenses Only)</option>
            <option value="Credit">💰 Credits (Income / Refunds)</option>
          </select>

        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="glass-input text-xs rounded-xl px-3 py-2 cursor-pointer font-medium"
            >
              <option value="date-desc">📅 Newest First</option>
              <option value="date-asc">📅 Oldest First</option>
              <option value="cost-desc">💲 Highest Amount</option>
            </select>
          </div>

          <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer select-none ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={taxDeductibleOnly}
              onChange={(e) => setTaxDeductibleOnly(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 border-slate-300 focus:ring-emerald-500"
            />
            <Landmark className="w-3.5 h-3.5 text-amber-500" />
            Tax Deductible Only
          </label>
        </div>

        {/* Filter Summary & Total Bar */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-3 border-t ${
          isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
        }`}>
          <span>Showing <strong className="text-emerald-600 dark:text-emerald-400">{filteredRecords.length}</strong> log entries</span>
          
          <div className="flex items-center gap-3 flex-wrap">
            <span>Expenses: <strong className="text-slate-900 dark:text-white font-mono">${totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            {totalCredits > 0 && (
              <span>Credits: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            )}
            <span className="pl-1 border-l border-slate-700">Net: <strong className="text-slate-900 dark:text-white font-mono text-sm">${netCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
          </div>
        </div>
      </div>

      {/* Records Table / List */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const home = homeMap.get(record.homeId);
            const recTarget = (record.target || 'Property') as Target;
            const targetMeta = TARGET_META[recTarget] || TARGET_META['Property'];
            const targetStyles = COLOR_STYLES[targetMeta.color];
            const TargetIcon = targetMeta.icon;
            const isCredit = record.transactionType === 'Credit';

            return (
              <div
                key={record.id}
                className={`glass-card p-5 rounded-3xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                  isCredit ? (isDark ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-emerald-500') : ''
                }`}
              >

                <div className="flex items-start gap-4 min-w-0">
                  <div className={`p-3 rounded-2xl border shrink-0 mt-0.5 ${
                    isCredit
                      ? isDark
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {record.target && record.target !== 'Property' && (
                        <span className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${targetStyles.bg} ${targetStyles.border} ${targetStyles.text}`}>
                          <TargetIcon className="w-3 h-3" />
                          <span>{record.target}</span>
                        </span>
                      )}
                      
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        isCredit
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isDark
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isCredit ? 'Credit (Income/Refund)' : 'Debit (Expense)'}
                      </span>

                      <h3 className={`font-extrabold text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {record.category}
                        {record.subcategory && (
                          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {' '}· {record.subcategory}
                          </span>
                        )}
                      </h3>

                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${
                        record.type === 'Repair' ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' :
                        record.type === 'Maintenance' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                        record.type === 'Upgrade' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' :
                        record.type === 'Expense' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                        'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                      }`}>
                        {record.type}
                      </span>

                      {record.isTaxDeductible && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Landmark className="w-3 h-3" />
                          Tax Deductible
                        </span>
                      )}
                    </div>

                    {home && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>🏠 {home.nickname}</span>
                      </p>
                    )}

                    {record.provider && (
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {isCredit ? 'Source / Payer: ' : 'Provider: '}<strong>{record.provider}</strong>
                      </p>
                    )}

                    {record.notes && (
                      <p className={`text-xs line-clamp-2 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        "{record.notes}"
                      </p>
                    )}

                    {/* Multi-User Audit Tracking Info */}
                    {(record.loggedBy || record.lastEditedBy) && (
                      <div className={`p-1.5 rounded-xl border inline-flex flex-wrap items-center gap-2 text-[10px] mt-1 ${
                        isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {record.loggedBy && (
                          <span>👤 Logged by <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{record.loggedBy.displayName}</strong></span>
                        )}
                        {record.lastEditedBy && record.lastEditedBy.uid !== record.loggedBy?.uid && (
                          <span>✏️ Edited by <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{record.lastEditedBy.displayName}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Amount, Date, Actions */}
                <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/40">
                  <div className="text-left md:text-right">
                    <span className={`text-xl font-extrabold font-mono block ${
                      isCredit
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {isCredit ? '+' : ''}${record.cost.toFixed(2)}
                    </span>
                    <span className={`text-xs font-mono block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {record.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditRecord(record)}
                      className={`p-2 rounded-xl transition-colors ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-3xl text-slate-400 dark:text-slate-500 text-sm">
          No records match your selected filters.
        </div>
      )}

    </div>
  );
};
