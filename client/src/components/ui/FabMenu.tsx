import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionSheet from './TransactionSheet';
import BottomSheet from './BottomSheet';
import { useSettings } from '../../contexts/SettingsContext';
import { createTransaction } from '../../services/api';
import type { Transaction } from '@shared/types';

interface FabAction {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  action: () => void;
}

interface FabMenuProps {
  onAddTransaction: (tx: Transaction) => void;
}

export default function FabMenu({ onAddTransaction }: FabMenuProps) {
  const { t, currency, toBaseCurrency } = useSettings();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'expense' | 'income'>('expense');
  const [menuOpen, setMenuOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);

  const accountsFrom = [{ value: 'Main', label: 'Main account' }, { value: 'Cash', label: 'Cash' }];
  const accountsTo = [{ value: 'Cash', label: 'Cash' }, { value: 'Savings', label: 'Savings' }];
  const [fromAccount, setFromAccount] = useState(accountsFrom[0].value);
  const [toAccount, setToAccount] = useState(accountsTo[0].value);

  const actions: FabAction[] = useMemo(() => [
    {
      label: t('add_expense'),
      icon: '−',
      color: '#EF4444',
      bgColor: 'bg-red-50',
      action: () => {
        setSheetMode('expense');
        setSheetOpen(true);
        setMenuOpen(false);
      },
    },
    {
      label: t('add_income'),
      icon: '+',
      color: '#22C55E',
      bgColor: 'bg-emerald-50',
      action: () => {
        setSheetMode('income');
        setSheetOpen(true);
        setMenuOpen(false);
      },
    },
    {
      label: t('transfer_money'),
      icon: '⇄',
      color: '#8B5CF6',
      bgColor: 'bg-violet-50',
      action: () => {
        setTransferComplete(false);
        setTransferAmount('');
        setTransferError(null);
        setFromAccount(accountsFrom[0].value);
        setToAccount(accountsTo[0].value);
        setTransferOpen(true);
        setMenuOpen(false);
      },
    },
    {
      label: t('create_budget'),
      icon: '☐',
      color: '#F59E0B',
      bgColor: 'bg-amber-50',
      action: () => {
        navigate('/plan?create=budget');
        setMenuOpen(false);
      },
    },
    {
      label: t('create_goal'),
      icon: '★',
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      action: () => {
        navigate('/plan?create=goal');
        setMenuOpen(false);
      },
    },
  ], [t, navigate]);

  const handleTransfer = async (event: React.FormEvent) => {
    event.preventDefault();
    setTransferError(null);
    const parsedAmount = parseFloat(transferAmount);
    if (!transferAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setTransferError(t('enter_valid_amount'));
      return;
    }
    try {
      const added = await createTransaction({
        description: `Transfer to ${toAccount}`,
        amount: toBaseCurrency(parsedAmount),
        type: 'expense',
        category: 'Other',
        date: new Date().toISOString(),
      });
      onAddTransaction(added);
      setTransferComplete(true);
    } catch (err) {
      console.error('Transfer failed:', err);
      setTransferError(t('failed_to_save'));
    }
  };

  return (
    <>
      {/* FAB Button */}
      <div className="mobile-fab fixed left-1/2 -translate-x-1/2 z-[60]">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`nav-fab bg-header-gradient transition-transform duration-300 ${menuOpen ? 'rotate-45' : ''}`}
          aria-label={t('add_transaction')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Action Menu Overlay */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[55]" onClick={() => setMenuOpen(false)} />
          <div className="fab-menu fixed left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-32px)] max-w-sm">
            <div className="bg-white rounded-[24px] shadow-2xl border border-border-light/60 p-3 animate-slide-up">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${action.bgColor}`}
                    style={{ color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Transaction form is only mounted inside its modal when opened. */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <TransactionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSuccess={onAddTransaction}
          initialType={sheetMode}
        />
      </BottomSheet>

      <BottomSheet open={transferOpen} onClose={() => setTransferOpen(false)}>
        <form className="px-5 pb-8" onSubmit={handleTransfer}>
          <h2 className="text-xl font-bold text-text-primary">{t('transfer_money')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('move_money')}</p>
          {transferError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">{transferError}</div>
          )}
          {transferComplete ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{t('transfer_recorded')}</div>
          ) : <>
            <label className="mt-6 block text-sm font-semibold text-text-primary">{t('from')}</label>
            <select className="input-field mt-2" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
              {accountsFrom.map((account) => <option key={account.value} value={account.value}>{account.label}</option>)}
            </select>
            <label className="mt-4 block text-sm font-semibold text-text-primary">{t('to')}</label>
            <select className="input-field mt-2" value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
              {accountsTo.map((account) => <option key={account.value} value={account.value}>{account.label}</option>)}
            </select>
            <label className="mt-4 block text-sm font-semibold text-text-primary">{t('amount')} ({currency.symbol})</label>
            <input className="input-field mt-2" type="number" min="1" inputMode="decimal" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0" required />
          </>}
          <button className="btn-primary mt-6" type="submit" onClick={transferComplete ? () => setTransferOpen(false) : undefined}>{transferComplete ? t('done') : t('transfer')}</button>
        </form>
      </BottomSheet>
    </>
  );
}
