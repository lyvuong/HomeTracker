import React, { useState, useEffect, useRef } from 'react';
import { X, Home as HomeIcon, Save, Landmark, Check, Upload, Link, ImageOff, Image as ImageIcon } from 'lucide-react';
import type { Home, PropertyType } from '../../types';

type ImageInputMode = 'url' | 'upload';

interface HouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (home: Omit<Home, 'createdAt' | 'updatedAt'>) => void;
  initialHome?: Home | null;
  theme?: 'light' | 'dark';
}

export const HouseModal: React.FC<HouseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHome,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Single Family');
  const [isIncomeProperty, setIsIncomeProperty] = useState(false);
  const [yearBuilt, setYearBuilt] = useState<number | ''>('');
  const [squareFootage, setSquareFootage] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Image upload state
  const [imageMode, setImageMode] = useState<ImageInputMode>('url');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialHome) {
      setNickname(initialHome.nickname);
      setAddress(initialHome.address || '');
      setPropertyType(initialHome.propertyType);
      setIsIncomeProperty(Boolean(initialHome.isIncomeProperty));
      setYearBuilt(initialHome.yearBuilt || '');
      setSquareFootage(initialHome.squareFootage || '');
      setPurchaseDate(initialHome.purchaseDate || '');
      setPhotoUrl(initialHome.photoUrl || '');
      setNotes(initialHome.notes || '');
    } else {
      setNickname('');
      setAddress('');
      setPropertyType('Single Family');
      setIsIncomeProperty(false);
      setYearBuilt('');
      setSquareFootage('');
      setPurchaseDate('');
      setPhotoUrl('');
      setNotes('');
    }
    setImageError(false);
    setIsDragOver(false);
  }, [initialHome, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    onSave({
      id: initialHome ? initialHome.id : `h-${Date.now()}`,
      nickname: nickname.trim(),
      address: address.trim() || undefined,
      propertyType,
      isIncomeProperty,
      yearBuilt: yearBuilt !== '' ? Number(yearBuilt) : undefined,
      squareFootage: squareFootage !== '' ? Number(squareFootage) : undefined,
      purchaseDate: purchaseDate || undefined,
      photoUrl: photoUrl.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoUrl(result);
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const clearImage = () => {
    setPhotoUrl('');
    setImageError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasImage = photoUrl.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8 animate-modal ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>

        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4.5 border-b ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              isDark ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}>
              <HomeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {initialHome ? 'Edit Home Profile' : 'Add New Home'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Property details, specs, and income classification
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Nickname <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Main House, Lake Cabin, Rental Unit 4B"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full glass-input text-sm rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Address <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="123 Maple Street, Springfield"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full glass-input text-sm rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full glass-input text-sm rounded-xl p-2.5 cursor-pointer font-medium"
              >
                <option value="Single Family">Single Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Apartment">Apartment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Year Built
              </label>
              <input
                type="number"
                min={1800}
                max={2030}
                placeholder="2018"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full glass-input text-sm rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Square Footage
              </label>
              <input
                type="number"
                min={0}
                placeholder="2,400"
                value={squareFootage}
                onChange={(e) => setSquareFootage(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full glass-input text-sm rounded-xl p-2.5"
              />
            </div>
          </div>

          {/* Income Property / Rental Toggle Card */}
          <div
            onClick={() => setIsIncomeProperty(!isIncomeProperty)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
              isIncomeProperty
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/50'
                  : 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                : isDark
                  ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
                isIncomeProperty
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                  : isDark
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-slate-200 text-slate-500 border-slate-300'
              }`}>
                <Landmark className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold ${
                    isIncomeProperty
                      ? isDark ? 'text-emerald-300' : 'text-emerald-900'
                      : isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    Income Property (Rental / Investment)
                  </span>
                  {isIncomeProperty && (
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-0.2 rounded-full border ${
                      isDark
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-emerald-200 text-emerald-900 border-emerald-300'
                    }`}>
                      Rental
                    </span>
                  )}
                </div>
                <p className={`text-[11px] leading-snug ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Property is rented or held for investment — expenses default to Schedule E deductions and credits track rental revenue.
                </p>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-1 transition-all ${
              isIncomeProperty
                ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-xs'
                : isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'
            }`}>
              {isIncomeProperty && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Purchase Date <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full glass-input text-sm rounded-xl p-2.5"
            />
          </div>

          {/* ── Home Photo Section ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Home Photo <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              {/* Mode Toggle */}
              <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border text-[10px] font-bold ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    imageMode === 'upload'
                      ? isDark
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-500 text-white shadow-sm'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    imageMode === 'url'
                      ? isDark
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-500 text-white shadow-sm'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  URL
                </button>
              </div>
            </div>

            {/* Live Preview */}
            {hasImage && !imageError && (
              <div className="relative mb-2 rounded-2xl overflow-hidden border group/preview" style={{ height: '160px' }}>
                <img
                  src={photoUrl}
                  alt="Home preview"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/0 group-hover/preview:bg-slate-950/40 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={clearImage}
                    className="opacity-0 group-hover/preview:opacity-100 transition-opacity bg-red-500 hover:bg-red-400 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove Photo
                  </button>
                </div>
              </div>
            )}

            {/* Broken URL placeholder */}
            {hasImage && imageError && (
              <div className={`mb-2 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`} style={{ height: '100px' }}>
                <ImageOff className="w-8 h-8 opacity-40" />
                <span>Could not load image</span>
                <button type="button" onClick={clearImage} className="text-red-400 hover:text-red-500 font-bold underline text-[10px]">Clear</button>
              </div>
            )}

            {imageMode === 'upload' ? (
              /* Drag-and-drop / file picker */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all py-5 px-4 text-center ${
                  isDragOver
                    ? isDark
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : 'border-emerald-400 bg-emerald-50'
                    : isDark
                      ? 'border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/70'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-emerald-400' : 'bg-white border-slate-200 text-emerald-600'
                }`}>
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {isDragOver ? 'Drop to upload' : 'Click or drag & drop an image'}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    JPG, PNG, WebP, GIF — stored locally in your browser
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              /* URL input */
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl.startsWith('data:') ? '' : photoUrl}
                onChange={(e) => { setPhotoUrl(e.target.value); setImageError(false); }}
                className="w-full glass-input text-sm rounded-xl p-2.5"
              />
            )}
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Notes & Specifications <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="HVAC brand/model, roof material, appliance details, lockbox code, notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full glass-input text-sm rounded-xl p-2.5 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Home Profile
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
