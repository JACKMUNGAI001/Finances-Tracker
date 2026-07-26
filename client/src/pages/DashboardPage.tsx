import { useState, useEffect, useMemo } from 'react';
import type { Transaction } from '../../../shared/types';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ExpenseChart from '../components/ExpenseChart';

const fallbackTransactions: Transaction[] = [
  { id: 1, description: 'Salary Deposit', amount: 5200, type: 'income', category: 'Salary', date: '2026-07-01T00:00:00.000Z' },
  { id: 2, description: 'Groceries', amount: 128.45, type: 'expense', category: 'Food', date: '2026-07-03T00:00:00.000Z' },
  { id: 3, description: 'Rent', amount: 1450, type: 'expense', category: 'Rent', date: '2026-07-05T00:00:00.000Z' },
  { id: 4, description: 'Streaming', amount: 24.99, type: 'expense', category: 'Entertainment', date: '2026-07-07T00:00:00.000Z' },
];

const formatCurrency = (value: number) =>
  `KSh ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(fallbackTransactions);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadTransactions = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/transactions');
        if (!res.ok) throw new Error('Unable to load transactions');

        const data = await res.json();
        if (active) {
          setTransactions(Array.isArray(data) && data.length > 0 ? data : fallbackTransactions);
        }
      } catch {
        if (active) {
          setTransactions(fallbackTransactions);
        }
      }
    };

    loadTransactions();
    return () => {
      active = false;
    };
  }, []);

  const addTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = async (id: number) => {
    try {
      await fetch(`http://localhost:5001/api/transactions/${id}`, { method: 'DELETE' });
    } catch {
      // fall through and update UI locally
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
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
          </div>
        </header>

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
                  <p className="stat-label">Total Salary</p>
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
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
