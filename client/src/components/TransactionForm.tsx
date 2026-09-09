import { useState } from 'react';
import type { Transaction, TransactionCategory, TransactionType } from '@shared/types';
import { createTransaction } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';

interface Props {
  onAdd: (transaction: Transaction) => void;
}

const expenseCategories: TransactionCategory[] = [
  'Food',
  'Rent',
  'Entertainment',
  'Transport',
  'Utilities',
  'Shopping',
  'Health',
  'Other',
];

const TransactionForm = ({ onAdd }: Props) => {
  const { toBaseCurrency } = useSettings();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Other');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const newTransaction: Transaction = {
        description: description.trim() || 'No description',
        amount: toBaseCurrency(parsedAmount),
        type,
        category: type === 'income' ? 'Salary' : category,
        date: new Date().toISOString(),
      };

      const added = await createTransaction(newTransaction);
      onAdd(added);
      setDescription('');
      setAmount('');
      setCategory('Other');
      setType('expense');
    } catch {
      setError('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="mb-6 pb-4 border-b border-slate-200">
        <p className="eyebrow mb-1">Add transaction</p>
        <h3 className="text-2xl font-bold text-slate-900">New entry</h3>
        <p className="subtle-text">Colorful tracking for income and expenses.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
          <div className="type-switch">
            {(['expense', 'income'] as TransactionType[]).map(item => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setType(item);
                  if (item === 'income') {
                    setCategory('Salary');
                  } else if (category === 'Salary') {
                    setCategory('Other');
                  }
                }}
                className={type === item ? 'active' : ''}
              >
                {item === 'expense' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
          <input
            className="w-full rounded-14px border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <input
            className="w-full rounded-14px border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            type="text"
            placeholder="Enter description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              className="w-full rounded-14px border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              value={category}
              onChange={e => setCategory(e.target.value as TransactionCategory)}
            >
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        <button className="btn-primary mt-6" type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
