import React from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Gift,
  Building2,
  Wallet,
  Lock,
  UserCheck,
  Info
} from 'lucide-react';
import type { PaymentTypeItem } from '../../types';

interface PaymentTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentTypes: PaymentTypeItem[];
  theme?: 'light' | 'dark';
}

const getPaymentIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('cash')) return Banknote;
  if (lower.includes('gift')) return Gift;
  if (lower.includes('bank') || lower.includes('transfer') || lower.includes('check')) return Building2;
  if (lower.includes('visa') || lower.includes('mastercard') || lower.includes('card') || lower.includes('amex')) return CreditCard;
  return Wallet;
};

export const PaymentTypesModal: React.FC<PaymentTypesModalProps> = ({
  isOpen,
  onClose,
  paymentTypes,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const hasCashInList = paymentTypes.some(p => p.name.toLowerCase() === 'cash' || p.isSystemDefault);
  const cashItem: PaymentTypeItem = hasCashInList
    ? (paymentTypes.find(p => p.name.toLowerCase() === 'cash' || p.isSystemDefault)!)
    : { id: 'pt-system-cash', name: 'Cash', isSystemDefault: true };

  const customPaymentTypes = paymentTypes.filter(p => p.id !== cashItem.id && p.name.toLowerCase() !== 'cash');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-modal ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Payment Methods Info
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Shared household payment methods configuration
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Explanation Banner */}
          <div className={`border rounded-2xl p-4 space-y-2 ${
            isDark ? 'bg-indigo-950/40 border-indigo-800/60' : 'bg-indigo-50/80 border-indigo-200'
          }`}>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Info className="w-4 h-4 shrink-0" />
              <span>Managed in ExpenseTracker</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Payment types are centrally managed in <strong>ExpenseTracker</strong>. Any payment methods (credit cards, debit cards, bank accounts) added or updated in ExpenseTracker will automatically sync here across your shared household in real-time.
            </p>
          </div>

          {/* List of Available Synced Payment Methods */}
          <div className="space-y-3">
            <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              System Default Method
            </p>

            {/* Always-available Cash row */}
            <div className={`flex items-center justify-between p-3.5 border rounded-2xl ${
              isDark ? 'bg-emerald-950/30 border-emerald-800/50' : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700/60' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                }`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Cash</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Available to all household members
                  </span>
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                isDark ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700/80' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                <Lock className="w-3 h-3" /> Default
              </span>
            </div>

            <p className={`text-[11px] font-bold uppercase tracking-wider pt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Synced Custom Payment Methods ({customPaymentTypes.length})
            </p>

            {customPaymentTypes.length === 0 ? (
              <p className={`text-xs italic py-4 text-center border border-dashed rounded-2xl ${
                isDark ? 'text-slate-500 border-slate-800 bg-slate-950/30' : 'text-slate-400 border-slate-200 bg-slate-50'
              }`}>
                No custom payment methods synced from ExpenseTracker yet.
              </p>
            ) : (
              <div className={`divide-y border rounded-2xl overflow-hidden ${
                isDark ? 'divide-slate-800/60 border-slate-800 bg-slate-950/40' : 'divide-slate-200 border-slate-200 bg-white'
              }`}>
                {customPaymentTypes.map(item => {
                  const IconComponent = getPaymentIcon(item.name);
                  const ownerDisplay = item.ownerName || 'Household Member';

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3.5 transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                          isDark ? 'bg-indigo-950/60 border-indigo-800/60 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-sm font-bold truncate block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {item.name}
                          </span>
                          <span className={`text-[11px] truncate block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Owner: {ownerDisplay}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${
                        isDark ? 'text-indigo-300 bg-indigo-950/80 border-indigo-800/60' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                      }`}>
                        Synced
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
