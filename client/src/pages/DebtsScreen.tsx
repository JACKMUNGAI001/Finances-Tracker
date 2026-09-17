import { useState, useEffect, useMemo, useCallback } from 'react';
import BottomNav from '../components/BottomNav';
import BottomSheet from '../components/ui/BottomSheet';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchDebts, createDebt, updateDebt, deleteDebt, createTransaction } from '../services/api';
import type { Debt } from '@shared/types';
import TimeFilter from '../components/TimeFilter';
import type { FilterState } from '../lib/filterUtils';
import { filterByDate } from '../lib/filterUtils';

const categoryIcons: Record<string, string> = {
  'Food': '🍔', 'Rent': '🏠', 'Salary': '💰', 'Entertainment': '🎬',
  'Transport': '🚗', 'Utilities': '💡', 'Shopping': '🛍️', 'Health': '🏥', 'Other': '📦',
};

export default function DebtsScreen() {
  const { t, formatCurrency, toBaseCurrency } = useSettings();
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [debtFilter, setDebtFilter] = useState<FilterState>({ preset: 'all', range: { from: null, to: null } });
  const [sheet, setSheet] = useState<'add' | null>(null);
  const [paySheetOpen, setPaySheetOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payError, setPayError] = useState('');
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'owed' | 'lent'>('owed');
  const [formPerson, setFormPerson] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');

  const loadDebts = useCallback(async () => {
    if (!user) {
      setDebts([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchDebts();
      const normalized = data.map(d => ({
        ...d,
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
        paidAmount: d.paidAmount ?? 0,
      }));
      setDebts(normalized);
    } catch {
      setDebts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const filteredDebts = useMemo(() => filterByDate(debts, debtFilter), [debts, debtFilter]);

  const owedDebts = useMemo(() => filteredDebts.filter(d => d.type === 'owed' && d.status === 'pending'), [filteredDebts]);
  const lentDebts = useMemo(() => filteredDebts.filter(d => d.type === 'lent' && d.status === 'pending'), [filteredDebts]);

  const remainingOwed = (d: Debt) => Number(d.amount) - Number(d.paidAmount ?? 0);
  const remainingLent = (d: Debt) => Number(d.amount) - Number(d.paidAmount ?? 0);

  const totalOwed = useMemo(() => owedDebts.reduce((sum, d) => sum + remainingOwed(d), 0), [owedDebts]);
  const totalLent = useMemo(() => lentDebts.reduce((sum, d) => sum + remainingLent(d), 0), [lentDebts]);

  const handleAdd = async () => {
    setFormError('');
    const parsed = parseFloat(formAmount);
    if (!formName.trim() || !formPerson.trim() || isNaN(parsed) || parsed <= 0) {
      setFormError(t('enter_valid_amount'));
      return;
    }
    try {
      const newDebt = await createDebt({
        name: formName.trim(),
        amount: toBaseCurrency(parsed),
        type: formType,
        person: formPerson,
        dueDate: formDueDate || undefined,
        description: formDescription || undefined,
        status: 'pending',
        paidAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setDebts(prev => [newDebt, ...prev]);
      setSheet(null);
      resetForm();
    } catch {
      setFormError(t('failed_to_save'));
    }
  };

  const handlePaySubmit = async () => {
    setPayError('');
    if (!payTarget) return;
    const parsed = parseFloat(payAmount);
    const remaining = Number(payTarget.amount) - Number(payTarget.paidAmount ?? 0);
    if (isNaN(parsed) || parsed <= 0 || parsed > remaining) {
      setPayError(t('enter_valid_amount'));
      return;
    }
    try {
      await createTransaction({
        description: `${t('debts')}: ${payTarget.name}`,
        amount: toBaseCurrency(parsed),
        type: payTarget.type === 'owed' ? 'expense' : 'income',
        category: 'Other',
        date: new Date().toISOString(),
      });
      const newPaidAmount = Number(payTarget.paidAmount ?? 0) + parsed;
      const updated = await updateDebt(payTarget.id!, {
        paidAmount: toBaseCurrency(newPaidAmount),
        status: newPaidAmount >= Number(payTarget.amount) ? 'paid' : 'pending',
        updatedAt: new Date().toISOString(),
      });
      setDebts(prev => prev.map(d => d.id === payTarget.id ? updated : d));
      setPaySheetOpen(false);
      setPayTarget(null);
      setPayAmount('');
    } catch {
      setPayError(t('failed_to_save'));
    }
  };

  const handleDelete = async (id: string | number) => {
    const ok = confirm('Delete this debt?');
    if (!ok) return;
    try {
      await deleteDebt(id);
      setDebts(prev => prev.filter(d => d.id !== id));
    } catch {
      // silent
    }
  };

  const handleMarkPaid = async (debt: Debt) => {
    try {
      const updated = await updateDebt(debt.id!, {
        status: 'paid',
        updatedAt: new Date().toISOString(),
      });
      setDebts(prev => prev.map(d => d.id === debt.id ? updated : d));
    } catch {
      // silent
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormAmount('');
    setFormType('owed');
    setFormPerson('');
    setFormDueDate('');
    setFormDescription('');
    setFormError('');
  };

  const openPaySheet = (debt: Debt) => {
    setPayTarget(debt);
    setPayAmount('');
    setPayError('');
    setPaySheetOpen(true);
  };

  const remainingFor = (d: Debt) => Number(d.amount) - Number(d.paidAmount ?? 0);

  return (
    <div className="app-shell">
      <div className="app-container pt-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-text-muted mb-1">{t('debts')}</p>
            <h1 className="text-[24px] font-bold text-text-primary tracking-tight">{t('debts')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <TimeFilter value={debtFilter} onChange={setDebtFilter} />
            <button
              onClick={() => setSheet('add')}
              className="h-9 px-3.5 rounded-[12px] bg-brand text-white text-sm font-semibold flex items-center gap-1 whitespace-nowrap hover:bg-brand-dark transition-colors"
            >
              + {t('add_debt')}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-[20px] bg-white p-4 shadow-card border border-border-light">
            <p className="text-xs font-medium text-text-secondary">{t('i_owe')}</p>
            <p className="mt-1 text-[22px] font-bold text-accent-red">-{formatCurrency(totalOwed)}</p>
            <p className="mt-1 text-xs text-text-muted">{owedDebts.length} {t('debts')}</p>
          </div>
          <div className="rounded-[20px] bg-white p-4 shadow-card border border-border-light">
            <p className="text-xs font-medium text-text-secondary">{t('i_am_owed')}</p>
            <p className="mt-1 text-[22px] font-bold text-accent-green">+{formatCurrency(totalLent)}</p>
            <p className="mt-1 text-xs text-text-muted">{lentDebts.length} {t('debts')}</p>
          </div>
        </div>

        {/* Money I Owe */}
        <div className="mb-6">
          <h2 className="text-[13px] font-bold text-text-primary mb-3">{t('i_owe')}</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-16 w-full rounded-[16px]"></div>
              ))}
            </div>
          ) : owedDebts.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">You owe nothing right now.</p>
          ) : (
            <div className="space-y-2">
              {owedDebts.map(debt => (
                <DebtItem
                  key={debt.id}
                  debt={debt}
                  formatCurrency={formatCurrency}
                  onPay={() => openPaySheet(debt)}
                  onMarkPaid={() => handleMarkPaid(debt)}
                  onDelete={() => handleDelete(debt.id!)}
                  categoryIcons={categoryIcons}
                />
              ))}
            </div>
          )}
        </div>

        {/* Money I'm Owed */}
        <div>
          <h2 className="text-[13px] font-bold text-text-primary mb-3">{t('i_am_owed')}</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-16 w-full rounded-[16px]"></div>
              ))}
            </div>
          ) : lentDebts.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">No one owes you right now.</p>
          ) : (
            <div className="space-y-2">
              {lentDebts.map(debt => (
                <DebtItem
                  key={debt.id}
                  debt={debt}
                  formatCurrency={formatCurrency}
                  onPay={() => openPaySheet(debt)}
                  onMarkPaid={() => handleMarkPaid(debt)}
                  onDelete={() => handleDelete(debt.id!)}
                  categoryIcons={categoryIcons}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Add Debt Sheet */}
      <BottomSheet open={sheet === 'add'} onClose={() => { setSheet(null); resetForm(); }}>
        <div className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary mb-1">{t('add_debt')}</h2>
          <p className="mt-1 text-sm text-text-secondary">Track money you owe or are owed</p>

          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-[14px] text-xs text-red-600 font-medium">{formError}</div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">{t('name')}</label>
              <input className="input-field" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t('debt_name')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">{t('amount')}</label>
              <input className="input-field" type="number" min="0" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">{t('type')}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('owed')}
                  className={`flex-1 py-3 rounded-[14px] text-sm font-semibold transition-all ${
                    formType === 'owed' ? 'bg-red-50 text-accent-red border-2 border-accent-red' : 'bg-gray-50 text-text-secondary border border-border-light'
                  }`}
                >
                  {t('i_owe')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('lent')}
                  className={`flex-1 py-3 rounded-[14px] text-sm font-semibold transition-all ${
                    formType === 'lent' ? 'bg-green-50 text-accent-green border-2 border-accent-green' : 'bg-gray-50 text-text-secondary border border-border-light'
                  }`}
                >
                  {t('i_am_owed')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">{t('person')}</label>
              <input className="input-field" value={formPerson} onChange={(e) => setFormPerson(e.target.value)} placeholder={t('person_name')} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">{t('due_date')}</label>
              <input className="input-field" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">{t('notes')}</label>
              <textarea className="input-field" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder={t('notes_optional')} rows={3} />
            </div>
          </div>

          <button className="btn-primary mt-6" type="submit" onClick={handleAdd}>
            {t('save_debt')}
          </button>
        </div>
      </BottomSheet>

      {/* Payment Sheet */}
      <BottomSheet open={paySheetOpen} onClose={() => { setPaySheetOpen(false); setPayTarget(null); setPayAmount(''); setPayError(''); }}>
        <div className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary mb-1">{t('add_payment')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{payTarget?.name || ''}</p>

          {payTarget && (
            <div className="mt-4 p-3 bg-gray-50 rounded-[14px]">
              <p className="text-xs text-text-muted">{t('total_amount')}</p>
              <p className="text-lg font-semibold text-text-primary">{formatCurrency(Number(payTarget.amount))}</p>
              <p className="text-xs text-text-muted mt-2">{t('debt_remaining')}</p>
              <p className="text-lg font-semibold text-accent-red">{formatCurrency(remainingFor(payTarget))}</p>
            </div>
          )}

          {payError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-[14px] text-xs text-red-600 font-medium">{payError}</div>
          )}

          <div className="mt-6">
            <label className="block text-xs font-semibold text-text-primary mb-2">{t('payment_amount')}</label>
            <div className="relative">
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0"
              />
              {payTarget && (
                <button
                  onClick={() => setPayAmount(String(remainingFor(payTarget)))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand hover:text-brand-dark"
                >
                  {t('pay_all')}
                </button>
              )}
            </div>
          </div>

          <button className="btn-primary mt-6" type="submit" onClick={handlePaySubmit}>
            {t('save_payment')}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

interface DebtItemProps {
  debt: Debt;
  formatCurrency: (amount: number) => string;
  onPay: () => void;
  onMarkPaid: () => void;
  onDelete: () => void;
  categoryIcons: Record<string, string>;
}

function DebtItem({ debt, formatCurrency, onPay, onMarkPaid, onDelete, categoryIcons }: DebtItemProps) {
  const { t } = useSettings();
  const isOwed = debt.type === 'owed';
  const icon = debt.description ? categoryIcons[debt.description.split(' ')[0]] || '💳' : '💳';
  const remaining = Number(debt.amount) - Number(debt.paidAmount ?? 0);
  const isFullyPaid = remaining <= 0;

  return (
    <div className="rounded-[16px] border border-[#f0f0f2] bg-white p-4 shadow-[0_3px_12px_rgba(17,24,39,.04)] flex items-center gap-3">
      <div className="h-10 w-10 rounded-[11px] flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{debt.name}</p>
        <p className="text-xs text-text-secondary truncate">{debt.person}</p>
        {debt.dueDate && (
          <p className="text-xs text-text-secondary mt-0.5">
            Due: {new Date(debt.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div>
          <p className={`text-sm font-semibold ${isOwed ? 'text-accent-red' : 'text-accent-green'}`}>
            {isOwed ? '-' : '+'} {formatCurrency(remaining)}
          </p>
          {Number(debt.paidAmount) > 0 && (
            <p className="text-xs text-text-muted text-right">
              {t('paid')}: {formatCurrency(Number(debt.paidAmount))}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {debt.status === 'pending' && !isFullyPaid && (
            <button
              onClick={onPay}
              className="px-2 py-1 rounded-[8px] bg-blue-50 text-accent-blue text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              {t('pay')}
            </button>
          )}
          {debt.status === 'pending' && isFullyPaid && (
            <button
              onClick={onMarkPaid}
              className="px-2 py-1 rounded-[8px] bg-green-50 text-accent-green text-xs font-semibold hover:bg-green-100 transition-colors"
            >
              ✓ {t('mark_paid')}
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-2 py-1 rounded-[8px] bg-red-50 text-accent-red text-xs font-semibold hover:bg-red-100 transition-colors"
            aria-label="Delete debt"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
