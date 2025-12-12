
import React, { useState, useEffect } from 'react';
import { X, Loader2, Building, User, FileText, Percent } from 'lucide-react';
import { Dealer, DealerFormData, User as UserType } from '../../types';
import { getUsersForDealerAssignment } from '../../lib/api';

interface DealerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DealerFormData) => Promise<void>;
  initialData?: Dealer;
}

const DealerModal: React.FC<DealerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [formData, setFormData] = useState<DealerFormData>({
    userId: '',
    companyName: '',
    taxNumber: '',
    commissionRate: 10,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
    
    if (initialData) {
      setFormData({
        userId: initialData.userId,
        companyName: initialData.companyName,
        taxNumber: initialData.taxNumber || '',
        commissionRate: initialData.commissionRate,
        isActive: initialData.isActive,
      });
    } else {
      setFormData({
        userId: '',
        companyName: '',
        taxNumber: '',
        commissionRate: 10,
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  const loadUsers = async () => {
    try {
      const data = await getUsersForDealerAssignment();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building size={20} className="text-blue-600" />
            {initialData ? 'Edit Dealer' : 'Add New Dealer'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <div className="relative">
               <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Partner Ltd."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Associated User Account</label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <select
                required
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="">Select User...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">Select the user who will login to the dealer panel.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <div className="relative">
                   <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                <div className="relative">
                   <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
             </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 cursor-pointer">
              Dealer Account Active
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {initialData ? 'Update Dealer' : 'Create Dealer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealerModal;
