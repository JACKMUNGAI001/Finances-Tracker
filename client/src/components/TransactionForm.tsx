import React, { useState } from 'react';
import type { Transaction, TransactionCategory, TransactionType } from '../../../shared/types';

interface Props {
  onAdd: (transaction: Transaction) => void;
}

const categories: TransactionCategory[] = [
  'Food',
  'Rent',
  'Salary',
  'Entertainment',
  'Transport',
  'Utilities',
  'Shopping',
  'Health',
  'Other',
];

const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Other');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTransaction: Transaction = {
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    };

    const res = await fetch('http://localhost:5001/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    });

    if (res.ok) {
      const added = await res.json();
      onAdd(added);
      setDescription('');
      setAmount('');
      setCategory('Other');
      setType('expense');
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="mb-6 pb-4 border-b border-slate-200">
        <p className="eyebrow mb-1">Add transaction</p>
        <h3 className="text-2xl font-bold text-slate-900">New entry</h3>
        <p className="subtle-text">Colorful tracking for income and expenses.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <input
            className="w-full rounded-14px border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
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
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Type</label>
          <div className="type-switch">
            {(['expense', 'income'] as TransactionType[]).map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setType(item)}
                className={type === item ? 'active' : ''}
              >
                {item === 'expense' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
          <select
            className="w-full rounded-14px border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            value={category}
            onChange={e => setCategory(e.target.value as TransactionCategory)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button className="btn-primary mt-6" type="submit">Add Transaction</button>
      </div>
    </form>
  );
};

export default TransactionForm;
