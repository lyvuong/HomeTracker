import React, { useState } from 'react';
import { Home as HomeIcon, Plus, Edit2, Trash2, CheckCircle2, Ruler, Users, Key, Building2, Building, Hotel, Warehouse, Landmark } from 'lucide-react';
import type { Home, PropertyType } from '../../types';
import { HouseModal } from './HouseModal';

const PROPERTY_TYPE_VISUALS: Record<PropertyType, { icon: React.ComponentType<{ className?: string }>; gradient: string }> = {
  'Single Family': { icon: HomeIcon, gradient: 'from-slate-900 via-slate-800 to-emerald-950' },
  'Condo': { icon: Building2, gradient: 'from-slate-900 via-slate-800 to-indigo-950' },
  'Townhouse': { icon: Building, gradient: 'from-slate-900 via-slate-800 to-amber-950' },
  'Apartment': { icon: Hotel, gradient: 'from-slate-900 via-slate-800 to-sky-950' },
  'Other': { icon: Warehouse, gradient: 'from-slate-900 via-slate-800 to-slate-700' },
};

interface HouseGarageProps {
  homes: Home[];
  activeHomeId: string;
  familyCode?: string;
  onSelectHome: (id: string) => void;
  onSaveHome: (home: Omit<Home, 'createdAt' | 'updatedAt'>) => void;
  onDeleteHome: (id: string) => void;
  onOpenSettings?: () => void;
  theme?: 'light' | 'dark';
}

export const HouseGarage: React.FC<HouseGarageProps> = ({
  homes,
  activeHomeId,
  familyCode,
  onSelectHome,
  onSaveHome,
  onDeleteHome,
  onOpenSettings,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHome, setEditingHome] = useState<Home | null>(null);

  const handleOpenAdd = () => {
    setEditingHome(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (home: Home) => {
    setEditingHome(home);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Shared Household Status Banner */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-2xl border shrink-0 ${
            isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {familyCode ? 'Shared Household Mode' : 'Personal Mode'}
              </span>
              {familyCode ? (
                <span className={`text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  isDark ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  <Key className="w-3 h-3" /> {familyCode}
                </span>
              ) : (
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                  isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-100 border-slate-200'
                }`}>
                  Private
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {familyCode
                ? `Syncing homes & maintenance logs in real time across family members with code "${familyCode}".`
                : 'Join or create a Household Code in Settings to share homes in real time with your family.'}
            </p>
          </div>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all self-end sm:self-auto flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              isDark
                ? 'text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border-indigo-800/80'
                : 'text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            {familyCode ? 'Manage Code' : 'Set Household Code'}
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HomeIcon className="w-6 h-6 text-emerald-500" />
            Homes & Properties ({homes.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your registered houses, condos, and income rental units. Click any home to view its active log history.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Home
        </button>
      </div>

      {/* Home Grid */}
      {homes.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDark ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <HomeIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No homes yet</h3>
          <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Get started by creating your first home record.
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            + Add First Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homes.map((h) => {
            const isActive = h.id === activeHomeId;

            return (
              <div
                key={h.id}
                className={`rounded-3xl overflow-hidden flex flex-col justify-between transition-all group relative border ${
                  isActive
                    ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-xl shadow-emerald-500/10'
                    : isDark
                      ? 'glass-panel border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Photo Header (Clickable to select active home) */}
                <div
                  onClick={() => onSelectHome(h.id)}
                  className="relative h-44 bg-slate-900 overflow-hidden cursor-pointer group/photo"
                  title={isActive ? 'Active Home' : `Click to set ${h.nickname} as active home`}
                >
                  {h.photoUrl ? (
                    <img
                      src={h.photoUrl}
                      alt={h.nickname}
                      className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                    />
                  ) : (() => {
                    const { icon: TypeIcon, gradient } = PROPERTY_TYPE_VISUALS[h.propertyType] ?? PROPERTY_TYPE_VISUALS.Other;
                    return (
                      <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center`}>
                        <TypeIcon className="w-16 h-16 text-slate-300 group-hover/photo:scale-110 transition-transform" />
                      </div>
                    );
                  })()}

                  {/* Hover Overlay Prompt for Non-Active Homes */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-emerald-500 text-slate-950 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg transform -translate-y-1 group-hover/photo:translate-y-0 transition-transform">
                        Select Active
                      </span>
                    </div>
                  )}

                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Home
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div
                    onClick={() => onSelectHome(h.id)}
                    className="cursor-pointer group/title"
                    title={isActive ? 'Active Home' : `Click to set ${h.nickname} as active home`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {h.propertyType}
                      </span>
                      {h.isIncomeProperty && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                          isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          <Landmark className="w-3 h-3 text-emerald-500" />
                          Rental
                        </span>
                      )}
                      {h.yearBuilt && (
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Built {h.yearBuilt}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-extrabold tracking-tight group-hover/title:text-emerald-500 transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {h.nickname}
                    </h3>
                    {h.address && (
                      <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {h.address}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`flex items-center gap-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                      Square Footage:
                    </span>
                    <span className={`font-mono font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {h.squareFootage ? `${h.squareFootage.toLocaleString()} sq ft` : '—'}
                    </span>
                  </div>

                  {h.notes && (
                    <p className={`text-xs line-clamp-2 italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      "{h.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className={`flex items-center gap-2 pt-2 border-t ${
                    isDark ? 'border-slate-800/80' : 'border-slate-100'
                  }`}>
                    <button
                      onClick={() => handleOpenEdit(h)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border transition-all ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                      }`}
                      title="Edit Home Details"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
                      Edit Home
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${h.nickname}?`)) {
                          onDeleteHome(h.id);
                        }
                      }}
                      className={`p-2 rounded-xl border transition-all ${
                        isDark
                          ? 'text-red-400 hover:text-red-300 bg-slate-800 hover:bg-red-950/40 border-slate-700 hover:border-red-800/60'
                          : 'text-red-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 border-slate-200 hover:border-red-200'
                      }`}
                      title="Delete Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <HouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveHome}
        initialHome={editingHome}
        theme={theme}
      />

    </div>
  );
};
