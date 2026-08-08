import React, { useState } from 'react';
import { Home as HomeIcon, Plus, Edit2, Trash2, CheckCircle2, Ruler, Users, Key } from 'lucide-react';
import type { Home } from '../../types';
import { HouseModal } from './HouseModal';

interface HouseGarageProps {
  homes: Home[];
  activeHomeId: string;
  familyCode?: string;
  onSelectHome: (id: string) => void;
  onSaveHome: (home: Omit<Home, 'createdAt' | 'updatedAt'>) => void;
  onDeleteHome: (id: string) => void;
  onOpenSettings?: () => void;
}

export const HouseGarage: React.FC<HouseGarageProps> = ({
  homes,
  activeHomeId,
  familyCode,
  onSelectHome,
  onSaveHome,
  onDeleteHome,
  onOpenSettings
}) => {
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
    <div className="space-y-6">

      {/* Shared Household Status Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {familyCode ? 'Shared Household Homes' : 'Personal Mode'}
              </span>
              {familyCode ? (
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                  <Key className="w-3 h-3" /> {familyCode}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Private
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {familyCode
                ? `Syncing homes & maintenance logs in real time across family members with code "${familyCode}".`
                : 'Join or create a Household Code in Settings to share homes in real time with your spouse.'}
            </p>
          </div>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 px-3.5 py-2 rounded-xl border border-indigo-800/80 transition-all self-end sm:self-auto flex items-center gap-1.5 whitespace-nowrap"
          >
            <Key className="w-3.5 h-3.5" />
            {familyCode ? 'Manage Code' : 'Set Household Code'}
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <HomeIcon className="w-6 h-6 text-emerald-400" />
            Homes ({homes.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your registered homes, condos, and rental properties. Select a home to view its active log history.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Home
        </button>
      </div>

      {/* Home Grid */}
      {homes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
          <HomeIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No homes yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Get started by creating your first home record.
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
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
                className={`glass-panel rounded-3xl overflow-hidden flex flex-col justify-between transition-all group hover:border-emerald-500/40 relative ${
                  isActive ? 'ring-2 ring-emerald-500 border-emerald-500/60 shadow-xl shadow-emerald-500/10' : ''
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
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center">
                      <HomeIcon className="w-16 h-16 text-slate-700 group-hover/photo:scale-110 transition-transform" />
                    </div>
                  )}

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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-slate-800 text-slate-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">
                        {h.propertyType}
                      </span>
                      {h.yearBuilt && (
                        <span className="text-xs text-slate-400 font-semibold">Built {h.yearBuilt}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight group-hover/title:text-emerald-400 transition-colors">
                      {h.nickname}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">{h.address}</p>
                  </div>

                  {/* Stats */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                      Square Footage:
                    </span>
                    <span className="text-white font-mono font-bold">{h.squareFootage ? `${h.squareFootage.toLocaleString()} sq ft` : '—'}</span>
                  </div>

                  {h.notes && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic">"{h.notes}"</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenEdit(h)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold py-2 rounded-xl border border-slate-700 transition-all"
                      title="Edit Home Details"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                      Edit Home
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${h.nickname}?`)) {
                          onDeleteHome(h.id);
                        }
                      }}
                      className="p-2 text-red-400 hover:text-red-300 bg-slate-800 hover:bg-red-950/40 rounded-xl border border-slate-700 hover:border-red-800/60 transition-all"
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
      />

    </div>
  );
};
