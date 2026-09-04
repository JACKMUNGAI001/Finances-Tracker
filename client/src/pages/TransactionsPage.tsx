import { useState, useEffect, useMemo } from 'react';
import type { Transaction } from '@shared/types';
import { fetchTransactions, createTransaction, deleteTransaction } from '../services/api';
import TransactionDetail from '../components/ui/TransactionDetail';
import BottomNav from '../components/BottomNav';
import FabMenu from '../components/ui/FabMenu';

const categoryMeta: Record<string, { icon: string; color: string }> = {
  Food: { icon: '🍔', color: '#3B82F6' },
  Rent: { icon: '🏠', color: '#8B5CF6' },
  Salary: { icon: '💰', color: '#22C55E' },
  Entertainment: { icon: '🎬', color: '#EC4899' },
  Transport: { icon: '🚗', color: '#06B6D4' },
  Utilities: { icon: '💡', color: '#F59E0B' },
  Shopping: { icon: '🛍️', color: '#F97316' },
  Health: { icon: '💊', color: '#22C55E' },
  Other: { icon: '📦', color: '#6B7280' },
};

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const loadTransactions = async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);

  const handleAdd = async (newTx: Transaction) => {
    try {
      const added = await createTransaction(newTx);
      setTransactions(prev => [added, ...prev]);
    } catch {
      // silent
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      // silent
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(tx => {
      const dateKey = new Date(tx.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return groups;
  }, [filtered]);

  const formatCurrency = (value: number) =>
    `KSh ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="pt-4 pb-2">
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">Transactions</h1>
          <p className="text-xs text-text-secondary mt-1 font-medium">{filtered.length} transactions</p>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 bg-[#F1F1F3] p-1 rounded-full flex">
          {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 capitalize ${
                filter === f
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card p-4 flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-28 rounded-lg" />
                    <div className="skeleton h-3 w-20 rounded-lg" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-soft flex items-center justify-center text-3xl">
                📋
              </div>
              <p className="text-sm font-semibold text-text-primary mb-1">No transactions found</p>
              <p className="text-xs text-text-secondary">Try adjusting your filters</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, txs]) => (
              <div key={date} className="mb-5">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 px-1">{date}</p>
                <div className="space-y-3">
                  {txs.map((tx) => {
                    const meta = categoryMeta[tx.category] || categoryMeta.Other;
                    return (
                      <button
                        key={tx.id}
                        onClick={() => tx.id && setSelectedTx(tx)}
                        className="w-full card p-4 flex items-center gap-3 text-left hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: `${meta.color}15` }}
                        >
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{tx.description}</p>
                          <p className="text-xs text-text-secondary">{tx.category} · {new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />

      <FabMenu onAddTransaction={handleAdd} />

      {selectedTx && (
        <TransactionDetail
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
