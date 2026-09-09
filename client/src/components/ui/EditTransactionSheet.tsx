import { useState, useEffect } from 'react';
import type { Transaction, TransactionCategory, TransactionType } from '@shared/types';
import { updateTransaction } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

interface EditTransactionSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
  transaction: Transaction | null;
}

const categories: { value: TransactionCategory; label: string; icon: string; color: string }[] = [
  { value: 'Food', label: 'Food', icon: '🍔', color: '#38ACF5' },
  { value: 'Rent', label: 'Housing', icon: '🏠', color: '#8B5CF6' },
  { value: 'Salary', label: 'Salary', icon: '💰', color: '#10B981' },
  { value: 'Entertainment', label: 'Fun', icon: '🎬', color: '#EC4899' },
  { value: 'Transport', label: 'Transport', icon: '🚗', color: '#06B6D4' },
  { value: 'Utilities', label: 'Bills', icon: '💡', color: '#F59E0B' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#F97316' },
  { value: 'Health', label: 'Health', icon: '💊', color: '#10B981' },
  { value: 'Other', label: 'Other', icon: '📦', color: '#6B7280' },
];

export default function EditTransactionSheet({ open, onClose, onSuccess, transaction }: EditTransactionSheetProps) {
  const { t, currency, fromBaseCurrency, toBaseCurrency } = useSettings();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && transaction) {
      setType(transaction.type);
      setAmount(fromBaseCurrency(transaction.amount).toFixed(2));
      setDescription(transaction.description);
      setCategory(transaction.type === 'income' ? 'Salary' : (transaction.category as TransactionCategory || 'Food'));
      setError(null);
      setLoading(false);
    }
  }, [open, transaction, currency.code]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Salary');
    } else if (category === 'Salary') {
      setCategory('Food');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction?.id) return;
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const updated = await updateTransaction(transaction.id, {
        description: description.trim() || 'No description',
        amount: toBaseCurrency(parsedAmount),
        type,
        category,
        date: transaction.date,
      });
      onSuccess(updated);
      onClose();
    } catch {
      setError('Failed to update transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !transaction) return null;

  return (
    <div className="px-5 pb-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-text-primary">{t('edit_transaction')}</h3>
        <p className="text-sm text-text-secondary mt-1">{t('update_transaction')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Type</label>
          <div className="flex p-1 bg-gray-100 rounded-2xl">
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  type === t
                    ? 'bg-white text-brand shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t === 'expense' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-semibold">{currency.symbol}</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pl-14"
              step="0.01"
              min="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Description</label>
            <input
              type="text"
              placeholder="What was this for? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          {type === 'expense' && (
            <p className="text-[10px] text-text-secondary mt-1">Describe what the expense was for</p>
          )}
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
                    category === cat.value
                      ? 'border-brand bg-brand-soft'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className={`text-xs font-semibold ${category === cat.value ? 'text-brand' : 'text-text-secondary'}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-6">
          {loading ? t('saving') : t('save_changes')}
        </button>
      </form>
    </div>
  );
}
