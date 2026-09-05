import React from 'react';
import type { Transaction } from '@shared/types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string | number) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete }) => {
  return (
    <section className="transactions-card">
      <div className="section-head">
        <div className="mb-4">
          <p className="eyebrow">Transactions</p>
          <h3 className="text-2xl font-bold text-slate-900">Recent activity</h3>
        </div>
        <button className="btn-view">View all</button>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Add your first transaction to get started.
        </div>
      ) : (
        <ul className="space-y-4 mt-4">
          {transactions.map(t => (
            <li key={t.id} className={`transaction-item ${t.type === 'income' ? 'income' : 'expense'}`}>
              <div className="avatar">{t.category.charAt(0)}</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">{t.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {t.category} · {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="amount-wrap">
                <p className={`amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}KSh {t.amount.toFixed(2)}
                </p>
                <p className="detail-pill">{t.type}</p>
              </div>
              <button
                className="text-sm font-semibold text-rose-500 transition hover:text-rose-600 ml-2"
                onClick={() => t.id && onDelete(t.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TransactionList;
