import React from 'react';
import type { Transaction } from '@shared/types';
import { useSettings } from '../contexts/SettingsContext';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string | number) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete }) => {
  const { formatCurrency, t } = useSettings();
  return (
    <section className="transactions-card">
      <div className="section-head">
        <div className="mb-4">
          <p className="eyebrow">{t('transactions')}</p>
          <h3 className="text-2xl font-bold text-slate-900">{t('recent_items')}</h3>
        </div>
        <button className="btn-view">{t('view_all')}</button>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          {t('start_tracking')}
        </div>
      ) : (
        <ul className="space-y-4 mt-4">
          {transactions.map(tx => (
            <li key={tx.id} className={`transaction-item ${tx.type === 'income' ? 'income' : 'expense'}`}>
              <div className="avatar">{tx.category.charAt(0)}</div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">{tx.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {tx.category} · {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="amount-wrap">
                <p className={`amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
                <p className="detail-pill">{tx.type === 'income' ? t('income') : t('expense')}</p>
              </div>
              <button
                className="text-sm font-semibold text-rose-500 transition hover:text-rose-600 ml-2"
                onClick={() => tx.id && onDelete(tx.id)}
              >
                {t('delete')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TransactionList;
