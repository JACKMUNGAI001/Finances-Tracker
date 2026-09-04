import type { Transaction } from '@shared/types';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
  onDelete: (id: number) => void;
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

export default function TransactionDetail({ transaction, onClose, onDelete }: TransactionDetailProps) {
  const meta = categoryMeta[transaction.category] || categoryMeta.Other;
  const isIncome = transaction.type === 'income';

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
              {isIncome ? '+' : '-'}KSh {transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {transaction.type === 'income' ? 'Income' : 'Expense'}
            </span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Description', value: transaction.description },
              { label: 'Category', value: transaction.category },
              { label: 'Date', value: new Date(transaction.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
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
              Close
            </button>
            <button
              onClick={() => {
                if (transaction.id) {
                  onDelete(transaction.id);
                  onClose();
                }
              }}
              className="flex-1 py-3.5 rounded-full bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
