import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import FabMenu from '../components/ui/FabMenu';
import TransactionDetail from '../components/ui/TransactionDetail';
import BottomSheet from '../components/ui/BottomSheet';
import type { Transaction } from '@shared/types';
import { fetchTransactions, createTransaction, deleteTransaction } from '../services/api';

const formatCurrency = (value: number) =>
  `KSh ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

export default function HomeScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [sheet, setSheet] = useState<'notifications' | 'month' | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');

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

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') acc.income += tx.amount;
        if (tx.type === 'expense') acc.expense += tx.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const balance = totals.income - totals.expense;
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const handleAdd = async (newTx: Transaction) => {
    try {
      const added = await createTransaction(newTx);
      setTransactions(prev => [added, ...prev]);
    } catch {
      // silent
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      // silent
    }
  };

  return (
    <div className="app-shell">
      <div className="app-container pt-3">
        {/* Balance hero */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#8c61ed] via-[#8b5cf6] to-[#c4adff] px-5 pb-20 pt-5 text-white shadow-[0_18px_36px_rgba(124,58,237,0.24)]">
          <div className="absolute -right-14 top-20 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-14 left-16 h-36 w-64 -rotate-12 rounded-[44px] bg-white/10" />
          <div className="absolute inset-0 bg-[linear-gradient(132deg,transparent_37%,rgba(255,255,255,.11)_37%,rgba(255,255,255,.05)_60%,transparent_60%)]" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/70 bg-white/20 text-sm font-bold shadow-sm">
                {user?.name?.charAt(0) || 'J'}
              </div>
              <button onClick={() => setSheet('month')} className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-[10px] font-semibold backdrop-blur-sm">
                {selectedMonth}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
              </button>
            </div>
            <button onClick={() => setSheet('notifications')} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-[#9b70f0] bg-[#ff655a]" />
            </button>
          </div>
          <div className="relative z-10 mt-7 text-center">
            <p className="mb-1 text-[10px] font-medium text-white/80">Current Balance</p>
            <h1 className="text-[31px] font-extrabold tracking-tight">
              {loading ? '...' : formatCurrency(balance)}
            </h1>
            <p className="mt-1 text-[10px] font-medium text-white/85">
              +KSh 784 more than last month
            </p>
          </div>
        </section>

        {/* Your Money overlaps the hero like the reference design. */}
        <section className="relative z-20 -mt-12 rounded-t-[25px] bg-white px-4 pb-1 pt-4 shadow-[0_-4px_18px_rgba(36,25,68,.05)]">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[13px] font-bold text-text-primary">Your Money <span className="ml-0.5 text-text-muted">ⓘ</span></h2>
            <span className="rounded-full bg-[#f7f7f8] px-2.5 py-1 text-[9px] font-medium text-text-secondary">Details ›</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[16px] border border-[#f0f0f2] bg-white p-3 shadow-[0_3px_12px_rgba(17,24,39,.04)]">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#e5f4ff]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-text-secondary">Income ⓘ</p>
                <p className="mt-0.5 text-[14px] font-bold text-text-primary">
                  {loading ? '...' : formatCurrency(totals.income)}
                </p>
              </div>
            </div>
            <div className="rounded-[16px] border border-[#f0f0f2] bg-white p-3 shadow-[0_3px_12px_rgba(17,24,39,.04)]">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0ed]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-text-secondary">Expenses ⓘ</p>
                <p className="mt-0.5 text-[14px] font-bold text-text-primary">
                  {loading ? '...' : formatCurrency(totals.expense)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Insight Card */}
        <div className="mx-1 mt-4 flex items-center justify-between rounded-[16px] bg-[#131116] px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white">Your insight is ready</p>
              <p className="text-[9px] text-gray-400">Your monthly overview</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-semibold text-white transition-colors hover:bg-white/20"
          >
            View
          </button>
        </div>

        {/* Transactions Section */}
        <div className="mt-5 px-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-text-primary">Transactions</h3>
            <button
              onClick={() => navigate('/transactions')}
              className="rounded-full bg-[#f3edff] px-2.5 py-1 text-[9px] font-semibold text-brand hover:text-brand-dark transition-colors"
            >
              See All
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4 flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-24 rounded-lg" />
                    <div className="skeleton h-3 w-16 rounded-lg" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-soft flex items-center justify-center text-3xl">
                📊
              </div>
              <p className="text-sm font-semibold text-text-primary mb-1">No transactions yet</p>
              <p className="text-xs text-text-secondary mb-4">Start tracking your spending</p>
              <p className="text-xs text-text-muted">Tap the + button to add one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const meta = categoryMeta[tx.category] || categoryMeta.Other;
                return (
                  <button
                    key={tx.id}
                    onClick={() => tx.id && setSelectedTx(tx)}
                    className="w-full rounded-[16px] border border-[#f2f2f4] bg-white p-3 flex items-center gap-3 text-left shadow-[0_3px_12px_rgba(17,24,39,.035)] transition-all duration-200 active:scale-[0.98]"
                  >
                    <div
                      className="h-9 w-9 rounded-[11px] flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-text-primary truncate">{tx.description}</p>
                      <p className="text-[10px] text-text-secondary">{tx.category} · {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <p className={`text-[12px] font-semibold ${tx.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <FabMenu onAddTransaction={handleAdd} />

      <BottomNav />

      {selectedTx && (
        <TransactionDetail
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onDelete={handleDelete}
        />
      )}

      <BottomSheet open={sheet !== null} onClose={() => setSheet(null)}>
        <div className="px-5 pb-8">
          {sheet === 'notifications' ? (
            <>
              <h2 className="text-xl font-bold text-text-primary">Notifications</h2>
              <p className="mt-1 text-sm text-text-secondary">Keep up with your money.</p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-brand-soft p-4"><p className="text-sm font-semibold text-text-primary">Monthly report is ready</p><p className="mt-1 text-xs text-text-secondary">Review your spending for this month.</p></div>
                <div className="rounded-2xl bg-gray-50 p-4"><p className="text-sm font-semibold text-text-primary">Budget reminder</p><p className="mt-1 text-xs text-text-secondary">Set a goal in My Plan to start tracking progress.</p></div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary">Choose month</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {['July 2026', 'August 2026', 'September 2026', 'October 2026'].map((month) => (
                  <button key={month} onClick={() => { setSelectedMonth(month); setSheet(null); }} className={`rounded-2xl px-3 py-4 text-sm font-semibold ${selectedMonth === month ? 'bg-brand text-white shadow-glow' : 'bg-gray-50 text-text-primary'}`}>{month}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
