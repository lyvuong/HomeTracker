import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import type { Home, EnrichedHomeRecord } from '../../types';
import { BarChart3, PieChart as PieIcon, DollarSign, TrendingUp, Landmark } from 'lucide-react';
import { CATEGORY_COLORS, TYPE_COLORS } from '../../constants/categories';

interface CostAnalyticsProps {
  homes: Home[];
  activeHomeId: string;
  records: EnrichedHomeRecord[];
  theme?: 'light' | 'dark';
}

export const CostAnalytics: React.FC<CostAnalyticsProps> = ({
  homes,
  activeHomeId,
  records,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const activeHome = homes.find(h => h.id === activeHomeId);
  
  const filteredRecords = useMemo(() => {
    return activeHomeId === 'all'
      ? records
      : records.filter(r => r.homeId === activeHomeId);
  }, [records, activeHomeId]);

  // Aggregate monthly expenses
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { month: string; cost: number }> = {};

    // Sort records chronologically
    const sorted = [...filteredRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(r => {
      if (!r.date) return;
      const monthKey = r.date.substring(0, 7); // YYYY-MM
      if (!monthsMap[monthKey]) {
        const dateObj = new Date(r.date + 'T00:00:00');
        const monthName = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthsMap[monthKey] = { month: monthName, cost: 0 };
      }
      // Outflow is positive, Credit offsets
      monthsMap[monthKey].cost += r.transactionType === 'Credit' ? -r.cost : r.cost;
    });

    return Object.values(monthsMap).map(m => ({ ...m, cost: Math.max(0, m.cost) }));
  }, [filteredRecords]);

  // Aggregate cost by Category
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredRecords.forEach(r => {
      catMap[r.category] = (catMap[r.category] || 0) + (r.transactionType === 'Credit' ? -r.cost : r.cost);
    });
    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value: Math.max(0, value) }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  // Aggregate cost by Type
  const typeData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    filteredRecords.forEach(r => {
      typeMap[r.type] = (typeMap[r.type] || 0) + (r.transactionType === 'Credit' ? -r.cost : r.cost);
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value: Math.max(0, value) }));
  }, [filteredRecords]);

  const totalDebits = filteredRecords
    .filter(r => (r.transactionType || 'Debit') === 'Debit')
    .reduce((sum, r) => sum + r.cost, 0);

  const totalCredits = filteredRecords
    .filter(r => r.transactionType === 'Credit')
    .reduce((sum, r) => sum + r.cost, 0);

  const netSpent = totalDebits - totalCredits;

  const totalTaxDeductible = filteredRecords
    .filter(r => r.isTaxDeductible)
    .reduce((sum, r) => sum + (r.transactionType === 'Credit' ? -r.cost : r.cost), 0);

  // Dynamic Theme Colors for Charts
  const chartColors = {
    grid: isDark ? '#334155' : '#e2e8f0',
    axisText: isDark ? '#94a3b8' : '#64748b',
    legendText: isDark ? '#cbd5e1' : '#334155',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    tooltipColor: isDark ? '#f8fafc' : '#0f172a',
    tooltipShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(0,0,0,0.1)'
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            Financial & Maintenance Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cash flow trends, credits, expenses, and category breakdown for {activeHome ? activeHome.nickname : 'All Homes'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className={`px-4 py-2.5 rounded-2xl border text-right ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
              {totalCredits > 0 ? 'Net Spending' : 'Total Spending'}
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              ${netSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {totalCredits > 0 && (
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                (+$ {totalCredits.toFixed(0)} Credits)
              </span>
            )}
          </div>
          <div className={`px-4 py-2.5 rounded-2xl border text-right ${
            isDark ? 'bg-amber-950/30 border-amber-800/50' : 'bg-amber-50/80 border-amber-200'
          }`}>
            <span className="text-xs text-amber-600 dark:text-amber-400 block font-semibold flex items-center justify-end gap-1">
              <Landmark className="w-3.5 h-3.5" />
              Tax Deductible
            </span>
            <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
              ${totalTaxDeductible.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl text-slate-400 dark:text-slate-500 text-sm">
          No transaction records available to render analytics charts. Log maintenance or expenses first.
        </div>
      ) : (
        <>
          {/* Monthly Trend Chart */}
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Monthly Net Spending & Cash Flow Trend ($)
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis dataKey="month" stroke={chartColors.axisText} tick={{ fill: chartColors.axisText, fontSize: 12 }} />
                  <YAxis stroke={chartColors.axisText} tick={{ fill: chartColors.axisText, fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderColor: chartColors.tooltipBorder,
                      borderRadius: '16px',
                      color: chartColors.tooltipColor,
                      boxShadow: chartColors.tooltipShadow
                    }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Net Amount']}
                  />
                  <Bar dataKey="cost" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Category Pie Chart */}
            <div className="glass-panel p-6 rounded-3xl">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-amber-500" />
                Spending Breakdown by Category
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        borderColor: chartColors.tooltipBorder,
                        borderRadius: '16px',
                        color: chartColors.tooltipColor,
                        boxShadow: chartColors.tooltipShadow
                      }}
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Net Spent']}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(value) => <span style={{ color: chartColors.legendText, fontWeight: 500 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Maintenance Type Breakdown Chart */}
            <div className="glass-panel p-6 rounded-3xl">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Spending by Transaction & Work Type
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {typeData.map((entry) => (
                        <Cell key={entry.name} fill={TYPE_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        borderColor: chartColors.tooltipBorder,
                        borderRadius: '16px',
                        color: chartColors.tooltipColor,
                        boxShadow: chartColors.tooltipShadow
                      }}
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Net Spent']}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      formatter={(value) => <span style={{ color: chartColors.legendText, fontWeight: 500 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
