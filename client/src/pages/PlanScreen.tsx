import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ProgressRing from '../components/ProgressRing';
import FabMenu from '../components/ui/FabMenu';
import BottomSheet from '../components/ui/BottomSheet';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { createTransaction } from '../services/api';

type Goal = {
  id: string;
  title: string;
  subtitle: string;
  target: number;
  current: number;
};

type Budget = { id: string; name: string; spent: number; total: number; percent: number; color: string; icon: string };

type AddMoneyTarget = { type: 'goal'; id: string } | { type: 'budget'; id: string } | null;
type EditTarget = { type: 'goal'; id: string } | { type: 'budget'; id: string } | null;
type PlanTab = 'goals' | 'budgets';

function loadFromStorage(key: string, fallback: unknown): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export default function PlanScreen() {
  const { user } = useAuth();
  const storageKey = user ? `plan_${user.email}` : 'plan_guest';
  const { currency, formatCurrency, t } = useSettings();
  const [searchParams] = useSearchParams();
  const createParam = searchParams.get('create');
  const [planTab, setPlanTab] = useState<PlanTab>(createParam === 'budget' ? 'budgets' : 'goals');
  const [goals, setGoals] = useState<Goal[]>(() => loadFromStorage(`${storageKey}_goals`, []) as Goal[]);
  const [goalOpen, setGoalOpen] = useState(() => createParam === 'goal');
  const [budgetOpen, setBudgetOpen] = useState(() => createParam === 'budget');
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [budgets, setBudgets] = useState<Budget[]>(() => loadFromStorage(`${storageKey}_budgets`, []) as Budget[]);
  const [addMoneyTarget, setAddMoneyTarget] = useState<AddMoneyTarget>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyError, setAddMoneyError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<EditTarget>(null);

  // Split goals into active and completed
  const activeGoals = useMemo(() => goals.filter(g => g.current < g.target), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.current >= g.target), [goals]);
  
  // Split budgets into active and completed
  const activeBudgets = useMemo(() => budgets.filter(b => b.spent < b.total), [budgets]);
  const completedBudgets = useMemo(() => budgets.filter(b => b.spent >= b.total), [budgets]);

  useEffect(() => {
    saveToStorage(`${storageKey}_goals`, goals);
  }, [goals, storageKey]);

  useEffect(() => {
    saveToStorage(`${storageKey}_budgets`, budgets);
  }, [budgets, storageKey]);

  useEffect(() => {
    if (createParam === 'goal') setGoalOpen(true);
    if (createParam === 'budget') {
      setPlanTab('budgets');
      setBudgetOpen(true);
    }
  }, [createParam]);

  const addGoal = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(target);
    if (!title.trim() || !Number.isFinite(amount) || amount <= 0) return;
    const newGoal: Goal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      title: title.trim(),
      subtitle: 'New savings goal',
      target: amount,
      current: 0,
    };
    setGoals((current) => [...current, newGoal]);
    setTitle('');
    setTarget('');
    setGoalOpen(false);
  };

  const addBudget = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(target);
    if (!title.trim() || !Number.isFinite(amount) || amount <= 0) return;
    const newBudget: Budget = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: title.trim(),
      spent: 0,
      total: amount,
      percent: 0,
      color: '#F59E0B',
      icon: '💳',
    };
    setBudgets((current) => [...current, newBudget]);
    setTitle('');
    setTarget('');
    setBudgetOpen(false);
  };

  const handleAddMoney = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!addMoneyTarget) return;
    setAddMoneyError(null);
    const amount = Number(addMoneyAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    try {
      await createTransaction({
        description: addMoneyTarget.type === 'goal'
          ? `Goal savings: ${goals.find(g => g.id === addMoneyTarget.id)?.title || 'Goal'}`
          : `Budget spending: ${budgets.find(b => b.id === addMoneyTarget.id)?.name || 'Budget'}`,
        amount,
        type: 'expense',
        category: 'Other',
        date: new Date().toISOString(),
      });

      if (addMoneyTarget.type === 'goal') {
        setGoals((current) =>
          current.map((g) => (g.id === addMoneyTarget.id ? { ...g, current: g.current + amount } : g))
        );
      } else if (addMoneyTarget.type === 'budget') {
        setBudgets((current) =>
          current.map((b) => {
            if (b.id === addMoneyTarget.id) {
              const newSpent = b.spent + amount;
              const newPercent = Math.min(100, Math.round((newSpent / b.total) * 100));
              return { ...b, spent: newSpent, percent: newPercent };
            }
            return b;
          })
        );
      }

      setAddMoneyAmount('');
      setAddMoneyTarget(null);
    } catch (err) {
      console.error('Add money failed:', err);
      setAddMoneyError(t('failed_to_save'));
    }
  };

  const openEditGoal = (goal: Goal) => {
    setEditTarget({ type: 'goal', id: goal.id });
    setEditName(goal.title);
    setEditAmount(String(goal.target));
  };

  const openEditBudget = (budget: Budget) => {
    setEditTarget({ type: 'budget', id: budget.id });
    setEditName(budget.name);
    setEditAmount(String(budget.total));
  };

  const handleEdit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(editAmount);
    if (!editName.trim() || !Number.isFinite(amount) || amount <= 0) return;

    if (editTarget?.type === 'goal') {
      setGoals((current) =>
        current.map((g) => (g.id === editTarget.id ? { ...g, title: editName.trim() } : g))
      );
    } else if (editTarget?.type === 'budget') {
      setBudgets((current) =>
        current.map((b) => (b.id === editTarget.id ? { ...b, name: editName.trim() } : b))
      );
    }

    setEditTarget(null);
    setEditName('');
    setEditAmount('');
  };

  const deleteGoal = (id: string) => {
    setGoals((current) => current.filter((g) => g.id !== id));
  };

  const deleteBudget = (id: string) => {
    setBudgets((current) => current.filter((b) => b.id !== id));
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <div>
            <p className="text-xs text-text-secondary font-medium">{t('finance')}</p>
            <h1 className="text-[24px] font-bold text-text-primary tracking-tight">{t('my_plan')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTitle('');
                setTarget('');
                if (planTab === 'goals') setGoalOpen(true);
                else setBudgetOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-card border border-border-light text-text-secondary hover:text-brand transition-colors"
              aria-label={planTab === 'goals' ? t('create_goal') : t('create_budget')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-card border border-border-light text-text-secondary hover:text-brand transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plan tabs */}
        <div className="mt-4 bg-[#F1F1F3] p-1 rounded-full flex" role="tablist" aria-label={t('my_plan')}>
          {(['goals', 'budgets'] as PlanTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={planTab === tab}
              onClick={() => setPlanTab(tab)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                planTab === tab
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {planTab === 'goals' && (
        <div className="mt-6">
          <h3 className="section-title mb-3">{t('goals')}</h3>

          {/* Active Goals */}
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
              const remaining = Math.max(0, goal.target - goal.current);
              return <div className="card-lg p-5" key={goal.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-base font-bold text-text-primary">{goal.title}</h4>
                      <button
                        onClick={() => openEditGoal(goal)}
                        className="w-7 h-7 rounded-lg bg-gray-50 border border-border-light flex items-center justify-center text-sm text-text-secondary hover:bg-gray-100 hover:text-brand transition-colors"
                        aria-label="Edit goal"
                      >✏️</button>
                      <button
                        onClick={() => setConfirmDelete({ type: 'goal', id: goal.id })}
                        className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-sm text-red-500 hover:bg-red-100 transition-colors"
                        aria-label="Delete goal"
                      >🗑️</button>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{goal.subtitle}</p>
                  </div>
                  <div className="text-right"><p className="text-[10px] text-text-secondary font-medium">{t('of')} {formatCurrency(goal.target)}</p><p className="text-lg font-extrabold text-brand">{formatCurrency(goal.current)}</p></div>
                </div>
                <div className="progress-bar h-2.5 mb-3"><div className="progress-fill bg-gradient-to-r from-brand to-brand-light" style={{ width: `${percent}%` }} /></div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-text-secondary">{formatCurrency(remaining)} {t('remaining')}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand">{percent}%</span>
                    <button onClick={() => setAddMoneyTarget({ type: 'goal', id: goal.id })} className="text-xs font-semibold text-brand hover:text-brand-dark">{t('add_money')}</button>
                  </div>
                </div>
              </div>;
            })}
            {activeGoals.length === 0 && <div className="card-lg p-6 text-center text-sm text-text-secondary">{t('no_goals')}</div>}
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                {t('completed_goals')} ({completedGoals.length})
              </h4>
              {completedGoals.map((goal: Goal) => (
                <div key={goal.id} className="card-lg p-5 bg-green-50 border border-green-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-base font-bold text-text-primary">{goal.title}</h4>
                      <p className="text-xs text-text-secondary mt-0.5">{goal.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-right"><p className="text-[10px] text-text-secondary font-medium">{t('of')} {formatCurrency(goal.target)}</p><p className="text-lg font-extrabold text-green-600">{formatCurrency(goal.current)}</p></div>
                      <button
                        onClick={() => setConfirmDelete({ type: 'goal', id: goal.id })}
                        className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-sm text-red-500 hover:bg-red-100 transition-colors"
                        aria-label="Delete goal"
                      >🗑️</button>
                    </div>
                  </div>
                  <div className="progress-bar h-2.5 mb-3"><div className="progress-fill bg-gradient-to-r from-green-500 to-green-400" style={{ width: '100%' }} /></div>
                  <p className="text-xs font-medium text-green-700">{t('goal_completed')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {planTab === 'budgets' && (
        <div className="mt-6">
          <h3 className="section-title mb-3">{t('budgets')}</h3>

          {/* Active Budgets */}
          <div className="grid grid-cols-2 gap-3">
            {activeBudgets.map((budget) => (
              <div key={budget.id} className="card p-4">
                <div className="relative mb-3">
                  <ProgressRing progress={budget.percent} size={48} strokeWidth={6} color={budget.color}>
                    <span className="text-xs font-extrabold text-text-primary">{budget.percent}%</span>
                  </ProgressRing>
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-sm">{budget.icon}</span>
                  <p className="text-xs font-semibold text-text-primary">{budget.name}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditBudget(budget)}
                      className="w-6 h-6 rounded-lg bg-gray-50 border border-border-light flex items-center justify-center text-xs text-text-secondary hover:bg-gray-100 hover:text-brand transition-colors"
                      aria-label="Edit budget"
                    >✏️</button>
                    <button
                      onClick={() => setConfirmDelete({ type: 'budget', id: budget.id })}
                      className="w-6 h-6 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-xs text-red-500 hover:bg-red-100 transition-colors"
                      aria-label="Delete budget"
                    >🗑️</button>
                  </div>
                </div>
                <p className="text-[10px] text-text-secondary font-medium">
                  {formatCurrency(budget.spent)} {t('of')} {formatCurrency(budget.total)}
                </p>
                <button onClick={() => setAddMoneyTarget({ type: 'budget', id: budget.id })} className="mt-2 text-xs font-semibold text-brand hover:text-brand-dark">{t('add_spending')}</button>
              </div>
            ))}
          </div>
          {activeBudgets.length === 0 && <div className="card mt-1 p-6 text-center text-sm text-text-secondary">{t('no_budgets')}</div>}

          {/* Completed Budgets */}
          {completedBudgets.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                {t('completed_budgets')} ({completedBudgets.length})
              </h4>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {completedBudgets.map((budget: Budget) => (
                  <div key={budget.id} className="card p-4 bg-green-50 border border-green-100">
                    <div className="relative mb-3">
                      <ProgressRing progress={100} size={48} strokeWidth={6} color="#22C55E">
                        <span className="text-xs font-extrabold text-green-600">100%</span>
                      </ProgressRing>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="text-sm">{budget.icon}</span>
                      <p className="text-xs font-semibold text-text-primary">{budget.name}</p>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setConfirmDelete({ type: 'budget', id: budget.id })}
                        className="w-6 h-6 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-xs text-red-500 hover:bg-red-100 transition-colors"
                        aria-label="Delete budget"
                      >🗑️</button>
                    </div>
                    <p className="text-[10px] text-green-700 font-medium">{t('budget_completed')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      <BottomNav />

      <FabMenu onAddTransaction={() => {}} />

        <BottomSheet open={goalOpen} onClose={() => setGoalOpen(false)}>
          <form onSubmit={addGoal} className="px-5 pb-8">
            <h2 className="text-xl font-bold text-text-primary">{t('create_goal')}</h2>
            <p className="mt-1 text-sm text-text-secondary">{t('set_savings_target')}</p>
            <label className="mt-6 block text-sm font-semibold text-text-primary">{t('goal_name')}</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="input-field mt-2" placeholder={t('goal_name_placeholder')} required />
            <label className="mt-5 block text-sm font-semibold text-text-primary">{t('target_amount')} ({currency.symbol})</label>
            <input value={target} onChange={(event) => setTarget(event.target.value)} className="input-field mt-2" type="number" min="1" inputMode="decimal" placeholder="0" required />
            <button className="btn-primary mt-6" type="submit">{t('create_goal_btn')}</button>
          </form>
        </BottomSheet>

      <BottomSheet open={budgetOpen} onClose={() => setBudgetOpen(false)}>
        <form onSubmit={addBudget} className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary">{t('create_budget')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('set_spending_limit')}</p>
          <label className="mt-6 block text-sm font-semibold text-text-primary">{t('budget_name')}</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="input-field mt-2" placeholder={t('budget_name_placeholder')} required />
          <label className="mt-5 block text-sm font-semibold text-text-primary">{t('budget_limit')} ({currency.symbol})</label>
          <input value={target} onChange={(event) => setTarget(event.target.value)} className="input-field mt-2" type="number" min="1" inputMode="decimal" placeholder="0" required />
          <button className="btn-primary mt-6" type="submit">{t('create_budget_btn')}</button>
        </form>
      </BottomSheet>

      <BottomSheet open={addMoneyTarget !== null} onClose={() => setAddMoneyTarget(null)}>
        <form onSubmit={handleAddMoney} className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary">
            {addMoneyTarget?.type === 'goal' ? t('add_money') : t('add_spending')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {addMoneyTarget?.type === 'goal'
              ? t('add_money_to_goal')
              : t('add_spending_to_budget')}
          </p>
          {addMoneyError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">{addMoneyError}</div>
          )}
          <label className="mt-6 block text-sm font-semibold text-text-primary">{t('amount')} ({currency.symbol})</label>
          <input
            value={addMoneyAmount}
            onChange={(e) => setAddMoneyAmount(e.target.value)}
            className="input-field mt-2"
            type="number"
            min="1"
            inputMode="decimal"
            placeholder="0"
            required
          />
          <button className="btn-primary mt-6" type="submit">{t('save')}</button>
        </form>
      </BottomSheet>

      <BottomSheet open={editTarget !== null} onClose={() => setEditTarget(null)}>
        <form onSubmit={handleEdit} className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary">{t('edit')}</h2>
          <label className="mt-6 block text-sm font-semibold text-text-primary">{t('name')}</label>
          <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field mt-2" placeholder={t('edit_name_placeholder')} required />
          <label className="mt-5 block text-sm font-semibold text-text-primary">{t('amount')} ({currency.symbol})</label>
          <input value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="input-field mt-2" type="number" min="1" inputMode="decimal" placeholder="0" required />
          <button className="btn-primary mt-6" type="submit">{t('save')}</button>
        </form>
      </BottomSheet>

      <BottomSheet open={confirmDelete !== null} onClose={() => setConfirmDelete(null)}>
        <div className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary">{t('delete_confirm')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('delete_warning')}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 py-3.5 rounded-full border border-gray-200 text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => {
                if (confirmDelete?.type === 'goal') deleteGoal(confirmDelete.id);
                if (confirmDelete?.type === 'budget') deleteBudget(confirmDelete.id);
                setConfirmDelete(null);
              }}
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
