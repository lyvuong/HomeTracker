import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Check,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import type { Target, TaxonomyOverride, TaxonomyOverrideDoc } from '../../types';
import {
  CATEGORY_TAXONOMY,
  TARGET_META,
  COLOR_STYLES,
  getCategoryMeta,
  getSubcategoryIcon
} from '../../constants/categories';

interface CategoryTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  overrideDoc: TaxonomyOverrideDoc;
  onSaveOverride: (target: string, override: TaxonomyOverride) => Promise<void> | void;
  familyCode?: string;
  initialTarget?: Target;
}

export const CategoryTaxonomyModal: React.FC<CategoryTaxonomyModalProps> = ({
  isOpen,
  onClose,
  overrideDoc = {},
  onSaveOverride,
  familyCode,
  initialTarget = 'Property'
}) => {
  const activeTarget: Target = initialTarget || 'Property';
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Add Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubcategories, setNewCatSubcategories] = useState('');

  // Rename Category State
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [renameCategoryVal, setRenameCategoryVal] = useState('');

  // Add Subcategory State
  const [addingSubcatFor, setAddingSubcatFor] = useState<string | null>(null);
  const [newSubcatName, setNewSubcatName] = useState('');

  // Rename Subcategory State
  const [editingSubcatKey, setEditingSubcatKey] = useState<string | null>(null); // "cat::sub"
  const [renameSubcatVal, setRenameSubcatVal] = useState('');

  const [saving, setSaving] = useState(false);

  const currentOverride = useMemo<TaxonomyOverride>(() => {
    return overrideDoc[activeTarget] || { categories: {}, deleted: [] };
  }, [overrideDoc, activeTarget]);

  const targetMeta = TARGET_META[activeTarget];
  const targetStyles = COLOR_STYLES[targetMeta.color];

  // Compute category list with custom & deleted statuses for active target
  const { allCategoriesWithStatus, activeCount, deletedCount } = useMemo(() => {
    const base = CATEGORY_TAXONOMY[activeTarget] || {};
    const deletedSet = new Set(currentOverride.deleted || []);
    const customCats = currentOverride.categories || {};

    const categoryMap = new Map<
      string,
      {
        name: string;
        isCustom: boolean;
        isDeleted: boolean;
        subcategories: { name: string; isCustom: boolean; isDeleted: boolean }[];
      }
    >();

    // 1. Process base categories
    for (const [catName, baseSubs] of Object.entries(base)) {
      const isCatDeleted = deletedSet.has(catName);
      const customSubList = customCats[catName] || [];

      const subs: { name: string; isCustom: boolean; isDeleted: boolean }[] = [];

      // Base subcategories
      for (const s of baseSubs) {
        subs.push({
          name: s,
          isCustom: false,
          isDeleted: deletedSet.has(`${catName}::${s}`)
        });
      }

      // Custom subcategories added to this base category
      for (const s of customSubList) {
        if (!baseSubs.includes(s)) {
          subs.push({
            name: s,
            isCustom: true,
            isDeleted: deletedSet.has(`${catName}::${s}`)
          });
        }
      }

      categoryMap.set(catName, {
        name: catName,
        isCustom: false,
        isDeleted: isCatDeleted,
        subcategories: subs
      });
    }

    // 2. Process custom categories
    for (const [catName, customSubList] of Object.entries(customCats)) {
      if (categoryMap.has(catName)) continue;
      const isCatDeleted = deletedSet.has(catName);
      categoryMap.set(catName, {
        name: catName,
        isCustom: true,
        isDeleted: isCatDeleted,
        subcategories: customSubList.map(s => ({
          name: s,
          isCustom: true,
          isDeleted: deletedSet.has(`${catName}::${s}`)
        }))
      });
    }

    const all = Array.from(categoryMap.values());
    let active = 0;
    let del = 0;

    for (const c of all) {
      if (c.isDeleted) {
        del++;
      } else {
        active++;
        for (const s of c.subcategories) {
          if (s.isDeleted) del++;
        }
      }
    }

    return { allCategoriesWithStatus: all, activeCount: active, deletedCount: del };
  }, [activeTarget, currentOverride]);

  // Filtered by search & deleted toggle
  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return allCategoriesWithStatus
      .filter(c => {
        if (!showDeleted && c.isDeleted) return false;
        if (!q) return true;
        if (c.name.toLowerCase().includes(q)) return true;
        return c.subcategories.some(s => s.name.toLowerCase().includes(q) && (showDeleted || !s.isDeleted));
      })
      .map(c => ({
        ...c,
        subcategories: c.subcategories.filter(s => {
          if (!showDeleted && s.isDeleted) return false;
          if (!q) return true;
          return c.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
        })
      }));
  }, [allCategoriesWithStatus, searchTerm, showDeleted]);

  if (!isOpen) return null;

  const toggleCategoryExpand = (catName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: prev[catName] === undefined ? false : !prev[catName]
    }));
  };

  const isCategoryExpanded = (catName: string): boolean => {
    if (searchTerm.trim().length > 0) return true;
    return expandedCategories[catName] ?? true;
  };

  const handlePersist = async (updated: TaxonomyOverride) => {
    setSaving(true);
    try {
      await onSaveOverride(activeTarget, updated);
    } finally {
      setSaving(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;

    const subs = newCatSubcategories
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const existingCategories = currentOverride.categories || {};
    const updatedDeleted = (currentOverride.deleted || []).filter(k => k !== name && !k.startsWith(`${name}::`));

    const updated: TaxonomyOverride = {
      categories: {
        ...existingCategories,
        [name]: subs
      },
      deleted: updatedDeleted
    };

    setNewCatName('');
    setNewCatSubcategories('');
    setIsAddingCategory(false);
    await handlePersist(updated);
  };

  // Rename Category Handler
  const handleRenameCategory = async (oldName: string) => {
    const newName = renameCategoryVal.trim();
    if (!newName || newName === oldName) {
      setEditingCategoryName(null);
      return;
    }

    const existingCategories = { ...(currentOverride.categories || {}) };
    const subs = existingCategories[oldName] || CATEGORY_TAXONOMY[activeTarget]?.[oldName] || [];

    delete existingCategories[oldName];
    existingCategories[newName] = subs;

    // Soft delete old category if it's built-in
    const currentDeleted = currentOverride.deleted || [];
    const baseCats = CATEGORY_TAXONOMY[activeTarget] || {};
    const updatedDeleted = baseCats[oldName]
      ? Array.from(new Set([...currentDeleted, oldName]))
      : currentDeleted.filter(k => k !== oldName);

    const updated: TaxonomyOverride = {
      categories: existingCategories,
      deleted: updatedDeleted
    };

    setEditingCategoryName(null);
    setRenameCategoryVal('');
    await handlePersist(updated);
  };

  // Toggle Category Deleted (Hide/Restore)
  const handleToggleCategoryDeleted = async (catName: string, isDeleted: boolean) => {
    const currentDeleted = currentOverride.deleted || [];
    let updatedDeleted: string[];

    if (isDeleted) {
      // Restore
      updatedDeleted = currentDeleted.filter(k => k !== catName && !k.startsWith(`${catName}::`));
    } else {
      // Soft-delete
      updatedDeleted = Array.from(new Set([...currentDeleted, catName]));
    }

    await handlePersist({
      categories: currentOverride.categories || {},
      deleted: updatedDeleted
    });
  };

  // Add Subcategory Handler
  const handleAddSubcategory = async (catName: string) => {
    const subName = newSubcatName.trim();
    if (!subName) return;

    const existingCategories = { ...(currentOverride.categories || {}) };
    const baseSubs = CATEGORY_TAXONOMY[activeTarget]?.[catName] || [];
    const currentSubs = existingCategories[catName] || [...baseSubs];

    if (!currentSubs.includes(subName)) {
      existingCategories[catName] = [...currentSubs, subName];
    }

    const key = `${catName}::${subName}`;
    const updatedDeleted = (currentOverride.deleted || []).filter(k => k !== key);

    setAddingSubcatFor(null);
    setNewSubcatName('');
    await handlePersist({
      categories: existingCategories,
      deleted: updatedDeleted
    });
  };

  // Rename Subcategory Handler
  const handleRenameSubcategory = async (catName: string, oldSubName: string) => {
    const newSubName = renameSubcatVal.trim();
    if (!newSubName || newSubName === oldSubName) {
      setEditingSubcatKey(null);
      return;
    }

    const existingCategories = { ...(currentOverride.categories || {}) };
    const baseSubs = CATEGORY_TAXONOMY[activeTarget]?.[catName] || [];
    const currentSubs = existingCategories[catName] || [...baseSubs];

    const updatedSubs = currentSubs.map(s => (s === oldSubName ? newSubName : s));
    if (!updatedSubs.includes(newSubName)) {
      updatedSubs.push(newSubName);
    }
    existingCategories[catName] = updatedSubs;

    const oldKey = `${catName}::${oldSubName}`;
    const currentDeleted = currentOverride.deleted || [];
    const updatedDeleted = baseSubs.includes(oldSubName)
      ? Array.from(new Set([...currentDeleted, oldKey]))
      : currentDeleted.filter(k => k !== oldKey);

    setEditingSubcatKey(null);
    setRenameSubcatVal('');
    await handlePersist({
      categories: existingCategories,
      deleted: updatedDeleted
    });
  };

  // Toggle Subcategory Deleted (Hide/Restore)
  const handleToggleSubcategoryDeleted = async (catName: string, subName: string, isDeleted: boolean) => {
    const key = `${catName}::${subName}`;
    const currentDeleted = currentOverride.deleted || [];
    let updatedDeleted: string[];

    if (isDeleted) {
      // Restore
      updatedDeleted = currentDeleted.filter(k => k !== key);
    } else {
      // Soft-delete
      updatedDeleted = Array.from(new Set([...currentDeleted, key]));
    }

    await handlePersist({
      categories: currentOverride.categories || {},
      deleted: updatedDeleted
    });
  };

  // Reset to Defaults for Active Target
  const handleResetToDefaults = async () => {
    if (window.confirm(`Reset all ${activeTarget} categories and subcategories back to the standard defaults?`)) {
      await handlePersist({ categories: {}, deleted: [] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${targetStyles.bg} ${targetStyles.border} ${targetStyles.text}`}>
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Categories & Subcategories Taxonomy
                {familyCode && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium">
                    Household: {familyCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize the 2-level Property taxonomy across your household
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTarget} categories or subcategories...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleted(!showDeleted)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  showDeleted
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {showDeleted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showDeleted ? 'Hide Inactive' : `Show Inactive (${deletedCount})`}
              </button>

              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>

          {/* Quick Summary Pill */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Showing {filteredCategories.length} {activeTarget} categories ({activeCount} active)</span>
            {(currentOverride.deleted?.length || Object.keys(currentOverride.categories || {}).length > 0) && (
              <button
                onClick={handleResetToDefaults}
                disabled={saving}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset {activeTarget} to Defaults
              </button>
            )}
          </div>
        </div>

        {/* Add Category Form Drawer */}
        {isAddingCategory && (
          <form onSubmit={handleAddCategory} className="p-6 bg-blue-500/5 dark:bg-blue-950/20 border-b border-blue-500/20 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Create New Custom {activeTarget} Category
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Home & Automation"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sensors, Smart Locks, Cameras, Hub"
                  value={newCatSubcategories}
                  onChange={(e) => setNewCatSubcategories(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !newCatName.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Save Category
              </button>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No matching categories found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query</p>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const meta = getCategoryMeta(cat.name);
              const CatIcon = meta.icon;
              const isExpanded = isCategoryExpanded(cat.name);
              const isRenaming = editingCategoryName === cat.name;

              return (
                <div
                  key={cat.name}
                  className={`border rounded-2xl transition-all ${
                    cat.isDeleted
                      ? 'bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Category Row */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleCategoryExpand(cat.name)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className={`p-2 rounded-xl border ${meta.bgClass} ${meta.borderClass} ${meta.textClass}`}>
                        <CatIcon className="w-4 h-4" />
                      </div>

                      {isRenaming ? (
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                          <input
                            type="text"
                            value={renameCategoryVal}
                            onChange={(e) => setRenameCategoryVal(e.target.value)}
                            className="w-full px-2.5 py-1 text-sm bg-white dark:bg-slate-900 border border-blue-500 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameCategory(cat.name);
                              if (e.key === 'Escape') setEditingCategoryName(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameCategory(cat.name)}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryName(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold truncate ${cat.isDeleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {cat.name}
                            </span>
                            {cat.isCustom && (
                              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                                Custom
                              </span>
                            )}
                            {cat.isDeleted && (
                              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                                Hidden
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {cat.subcategories.filter(s => !s.isDeleted).length} subcategories
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category Action Buttons */}
                    <div className="flex items-center gap-1">
                      {!cat.isDeleted && (
                        <>
                          <button
                            type="button"
                            title="Add Subcategory"
                            onClick={() => {
                              setAddingSubcatFor(cat.name);
                              setNewSubcatName('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Rename Category"
                            onClick={() => {
                              setEditingCategoryName(cat.name);
                              setRenameCategoryVal(cat.name);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        title={cat.isDeleted ? 'Restore Category' : 'Hide Category'}
                        onClick={() => handleToggleCategoryDeleted(cat.name, cat.isDeleted)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          cat.isDeleted
                            ? 'text-emerald-500 hover:bg-emerald-500/10'
                            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10'
                        }`}
                      >
                        {cat.isDeleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Subcategories Accordion Content */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-700/50 space-y-2">
                      
                      {/* Inline Add Subcategory input */}
                      {addingSubcatFor === cat.name && (
                        <div className="flex items-center gap-2 py-2 animate-fade-in">
                          <input
                            type="text"
                            placeholder="Subcategory name..."
                            value={newSubcatName}
                            onChange={(e) => setNewSubcatName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddSubcategory(cat.name);
                              if (e.key === 'Escape') setAddingSubcatFor(null);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-blue-500 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSubcategory(cat.name)}
                            disabled={!newSubcatName.trim()}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm disabled:opacity-50"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingSubcatFor(null)}
                            className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Subcategory Pills Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                        {cat.subcategories.map((sub) => {
                          const SubIcon = getSubcategoryIcon(sub.name);
                          const subKey = `${cat.name}::${sub.name}`;
                          const isRenamingSub = editingSubcatKey === subKey;

                          if (isRenamingSub) {
                            return (
                              <div key={sub.name} className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-blue-500 rounded-xl col-span-1 sm:col-span-2">
                                <input
                                  type="text"
                                  value={renameSubcatVal}
                                  onChange={(e) => setRenameSubcatVal(e.target.value)}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSubcategory(cat.name, sub.name);
                                    if (e.key === 'Escape') setEditingSubcatKey(null);
                                  }}
                                  className="w-full px-2 py-1 text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameSubcategory(cat.name, sub.name)}
                                  className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSubcatKey(null)}
                                  className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={sub.name}
                              className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs border transition-colors ${
                                sub.isDeleted
                                  ? 'bg-slate-100/50 dark:bg-slate-900/20 border-dashed border-slate-300 dark:border-slate-800 text-slate-400'
                                  : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-750 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <SubIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className={`truncate ${sub.isDeleted ? 'line-through' : ''}`}>
                                  {sub.name}
                                </span>
                                {sub.isCustom && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 font-medium">
                                    custom
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!sub.isDeleted && (
                                  <button
                                    type="button"
                                    title="Rename"
                                    onClick={() => {
                                      setEditingSubcatKey(subKey);
                                      setRenameSubcatVal(sub.name);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  title={sub.isDeleted ? 'Restore' : 'Hide'}
                                  onClick={() => handleToggleSubcategoryDeleted(cat.name, sub.name, sub.isDeleted)}
                                  className={`p-1 rounded ${
                                    sub.isDeleted
                                      ? 'text-emerald-500 hover:bg-emerald-500/10'
                                      : 'text-slate-400 hover:text-rose-500'
                                  }`}
                                >
                                  {sub.isDeleted ? <RotateCcw className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Syncs across household devices & Statements PWA
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
