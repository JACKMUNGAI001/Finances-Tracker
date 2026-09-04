import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Transaction } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { fetchTransactions, createTransaction, deleteTransaction } from '../services/api';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ExpenseChart from '../components/ExpenseChart';

const formatCurrency = (value: number) =>
  `KSh ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function DashboardPage() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch {
      setError('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = async (newTransaction: Transaction) => {
    try {
      const added = await createTransaction(newTransaction);
      setTransactions(prev => [added, ...prev]);
    } catch {
      setError('Failed to add transaction');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Failed to delete transaction');
    }
  };

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') acc.income += transaction.amount;
        if (transaction.type === 'expense') acc.expense += transaction.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const balance = totals.income - totals.expense;

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="page-title">Home</h1>
            <p className="subtle-text">Your finances in one polished view.</p>
          </div>
          <div className="profile-pill">
            <button className="icon-button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className="profile-card">
              <div className="avatar">{user?.name?.charAt(0) || 'J'}</div>
              <div>
                <p className="profile-label">Welcome back</p>
                <p className="profile-name">{user?.name || 'User'}</p>
              </div>
            </div>
            <button onClick={logout} className="btn-view" style={{ marginLeft: '8px' }}>
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-bold">Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading transactions...</div>
        ) : (
          <div className="content-grid">
            <div className="left-column">
              <section className="hero-card">
                <div className="hero-top">
                  <div>
                    <p className="hero-label">Total Balance</p>
                    <h2 className="balance-value">{formatCurrency(balance)}</h2>
                  </div>
                  <div className="hero-badge">
                    <p className="badge-label">Accounts</p>
                    <p className="badge-value">{transactions.length}</p>
                    <p className="badge-caption">Recent items</p>
                  </div>
                </div>

                <div className="stat-grid">
                  <div className="stat-card">
                    <p className="stat-label">Total Income</p>
                    <p className="stat-value">{formatCurrency(totals.income)}</p>
                    <p className="stat-caption">Bank account</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Total Expense</p>
                    <p className="stat-value">{formatCurrency(totals.expense)}</p>
                    <p className="stat-caption">Credit card</p>
                  </div>
                </div>
              </section>

              <ExpenseChart transactions={transactions} />
            </div>

            <div className="right-column">
              <TransactionForm onAdd={addTransaction} />
              <TransactionList transactions={transactions} onDelete={handleDelete} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
