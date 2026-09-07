import { useState } from 'react';
import type { Transaction } from '@shared/types';
import { useSettings } from '../../contexts/SettingsContext';
import BottomSheet from './BottomSheet';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
  onDelete: (id: string | number) => void;
  onEdit?: (transaction: Transaction) => void;
}

const categoryMeta: Record<string, { icon: string; color: string }> = {
  Food: { icon: '🍔', color: '#38ACF5' },
  Rent: { icon: '🏠', color: '#8B5CF6' },
  Salary: { icon: '💰', color: '#10B981' },
  Entertainment: { icon: '🎬', color: '#EC4899' },
  Transport: { icon: '🚗', color: '#06B6D4' },
  Utilities: { icon: '💡', color: '#F59E0B' },
  Shopping: { icon: '🛍️', color: '#F97316' },
  Health: { icon: '💊', color: '#10B981' },
  Other: { icon: '📦', color: '#6B7280' },
};

export default function TransactionDetail({ transaction, onClose, onDelete, onEdit }: TransactionDetailProps) {
  const { t, formatCurrency, language } = useSettings();
  const meta = categoryMeta[transaction.category] || categoryMeta.Other;
  const isIncome = transaction.type === 'income';
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (transaction.id) {
      onDelete(transaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-[2rem] shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-white pt-3 pb-2 px-5 flex justify-center z-10">
          <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary">Transaction Details</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
              style={{ backgroundColor: `${meta.color}15` }}
            >
              {meta.icon}
            </div>
             <p className="text-2xl font-bold text-text-primary mb-1">
               {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
             </p>
             <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
               {transaction.type === 'income' ? t('income') : t('expense')}
             </span>
          </div>

          <div className="space-y-4">
            {[
              { label: t('description'), value: transaction.description },
              { label: t('category'), value: transaction.category },
              { label: t('date'), value: new Date(transaction.date).toLocaleDateString(language === 'sw' ? 'sw-KE' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <span className="text-sm font-semibold text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>

           <div className="mt-8 flex gap-3">
             <button
               onClick={onClose}
               className="flex-1 py-3.5 rounded-full border border-gray-200 text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
             >
               {t('close')}
             </button>
             {onEdit && (
               <button
                 onClick={() => onEdit(transaction)}
                 className="flex-1 py-3.5 rounded-full bg-brand-soft text-brand text-sm font-semibold hover:bg-brand transition-colors"
               >
                 {t('edit')}
               </button>
             )}
             <button
               onClick={() => setConfirmDelete(true)}
               className="flex-1 py-3.5 rounded-full bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
             >
               {t('delete')}
             </button>
           </div>
         </div>

         <BottomSheet open={confirmDelete} onClose={() => setConfirmDelete(false)}>
           <div className="px-5 pb-8">
             <h2 className="text-xl font-bold text-text-primary">{t('delete_confirm')}</h2>
             <p className="mt-1 text-sm text-text-secondary">{t('delete_warning')}</p>
             {transaction.description && (
               <p className="block mt-2 font-medium text-text-primary">"{transaction.description}"</p>
             )}
             <div className="mt-6 flex gap-3">
               <button
                 onClick={() => setConfirmDelete(false)}
                 className="flex-1 py-3.5 rounded-full border border-gray-200 text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
               >
                 {t('cancel')}
               </button>
               <button
                 onClick={handleDelete}
                 className="flex-1 py-3.5 rounded-full bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
               >
                 {t('delete')}
               </button>
             </div>
           </div>
         </BottomSheet>
       </div>
    </div>
  );
}
