import React, { useState, useEffect } from 'react';
import { X, Home as HomeIcon, Save } from 'lucide-react';
import type { Home, PropertyType } from '../../types';

interface HouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (home: Omit<Home, 'createdAt' | 'updatedAt'>) => void;
  initialHome?: Home | null;
}

export const HouseModal: React.FC<HouseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHome
}) => {
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Single Family');
  const [yearBuilt, setYearBuilt] = useState<number | ''>('');
  const [squareFootage, setSquareFootage] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialHome) {
      setNickname(initialHome.nickname);
      setAddress(initialHome.address);
      setPropertyType(initialHome.propertyType);
      setYearBuilt(initialHome.yearBuilt || '');
      setSquareFootage(initialHome.squareFootage || '');
      setPurchaseDate(initialHome.purchaseDate || '');
      setPhotoUrl(initialHome.photoUrl || '');
      setNotes(initialHome.notes || '');
    } else {
      setNickname('');
      setAddress('');
      setPropertyType('Single Family');
      setYearBuilt('');
      setSquareFootage('');
      setPurchaseDate('');
      setPhotoUrl('');
      setNotes('');
    }
  }, [initialHome, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !address.trim()) return;

    onSave({
      id: initialHome ? initialHome.id : `h-${Date.now()}`,
      nickname: nickname.trim(),
      address: address.trim(),
      propertyType,
      yearBuilt: yearBuilt !== '' ? Number(yearBuilt) : undefined,
      squareFootage: squareFootage !== '' ? Number(squareFootage) : undefined,
      purchaseDate: purchaseDate || undefined,
      photoUrl: photoUrl.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <HomeIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {initialHome ? 'Edit Home Profile' : 'Add New Home'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nickname *</label>
            <input
              type="text"
              required
              placeholder="e.g. Main House, Lake Cabin"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full glass-input text-white text-sm rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Address *</label>
            <input
              type="text"
              required
              placeholder="123 Maple Street, Springfield"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full glass-input text-white text-sm rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5 bg-slate-900"
              >
                <option value="Single Family">Single Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Apartment">Apartment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Year Built</label>
              <input
                type="number"
                min={1800}
                max={2030}
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Square Footage</label>
              <input
                type="number"
                min={0}
                value={squareFootage}
                onChange={(e) => setSquareFootage(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full glass-input text-white text-sm rounded-xl p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full glass-input text-white text-sm rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Home Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full glass-input text-white text-sm rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes & Specifications</label>
            <textarea
              rows={3}
              placeholder="HVAC brand/model, roof material, appliance details, notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full glass-input text-white text-sm rounded-xl p-2.5 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
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
