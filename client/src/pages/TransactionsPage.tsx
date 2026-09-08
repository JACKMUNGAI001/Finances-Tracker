import { useState, useEffect, useMemo } from 'react';
import type { Transaction } from '@shared/types';
import { fetchTransactions, createTransaction, deleteTransaction } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import TransactionDetail from '../components/ui/TransactionDetail';
import BottomSheet from '../components/ui/BottomSheet';
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
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);
  const { formatCurrency, t } = useSettings();

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

  const handleDelete = async (id: string | number) => {
    setDeleteTx(transactions.find(t => t.id === id) || null);
  };

  const confirmDelete = async (id: string | number) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      // silent
    } finally {
      setDeleteTx(null);
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

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="pt-4 pb-2">
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">{t('transactions')}</h1>
          <p className="text-xs text-text-secondary mt-1 font-medium">{filtered.length} {t('transactions')}</p>
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
              <p className="text-sm font-semibold text-text-primary mb-1">{t('no_transactions_found')}</p>
              <p className="text-xs text-text-secondary">{t('try_adjusting')}</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, txs]) => (
              <div key={date} className="mb-5">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 px-1">{date}</p>
                <div className="space-y-3">
                  {txs.map((tx) => {
                    const meta = categoryMeta[tx.category] || categoryMeta.Other;
                    const txDate = new Date(tx.date);
                    const timeStr = txDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const isExpense = tx.type === 'expense';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 card p-4"
                      >
                        <button
                          onClick={() => tx.id && setSelectedTx(tx)}
                          className="flex-1 flex items-center gap-3 text-left"
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: `${meta.color}15` }}
                          >
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">{tx.description}</p>
                            <p className="text-xs text-text-secondary">
                              {isExpense ? (
                                <>
                                  {tx.category}
                                  {' · '}
                                  <span className="font-medium">Purpose: {tx.description}</span>
                                </>
                              ) : (
                                tx.description
                              )}
                            </p>
                            <p className="text-[10px] text-text-muted mt-0.5">
                              {txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {timeStr}
                            </p>
                          </div>
                          <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                        </button>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            onClick={() => tx.id && handleDelete(tx.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label="Delete"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
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

      <BottomSheet open={!!deleteTx} onClose={() => setDeleteTx(null)}>
        <div className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary">{t('delete_confirm')}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t('delete_warning')}
            {deleteTx && deleteTx.description && (
              <span className="block mt-2 font-medium text-text-primary">"{deleteTx.description}"</span>
            )}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setDeleteTx(null)}
              className="flex-1 py-3.5 rounded-full border border-gray-200 text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => deleteTx && deleteTx.id && confirmDelete(deleteTx.id)}
              className="flex-1 py-3.5 rounded-full bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
