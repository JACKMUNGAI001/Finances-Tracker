import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionSheet from './TransactionSheet';
import BottomSheet from './BottomSheet';
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
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'expense' | 'income'>('expense');
  const [menuOpen, setMenuOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);

  const actions: FabAction[] = [
    {
      label: 'Add Expense',
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
      label: 'Add Income',
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
      label: 'Transfer Money',
      icon: '⇄',
      color: '#8B5CF6',
      bgColor: 'bg-violet-50',
      action: () => {
        setTransferComplete(false);
        setTransferOpen(true);
        setMenuOpen(false);
      },
    },
    {
      label: 'Create Budget',
      icon: '☐',
      color: '#F59E0B',
      bgColor: 'bg-amber-50',
      action: () => {
        navigate('/plan?create=budget');
        setMenuOpen(false);
      },
    },
    {
      label: 'Create Goal',
      icon: '★',
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      action: () => {
        navigate('/plan?create=goal');
        setMenuOpen(false);
      },
    },
  ];

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`nav-fab transition-transform duration-300 ${menuOpen ? 'rotate-45' : ''}`}
          aria-label="Add"
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
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-48px)] max-w-sm">
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
        <form className="px-5 pb-8" onSubmit={(event) => { event.preventDefault(); setTransferComplete(true); }}>
          <h2 className="text-xl font-bold text-text-primary">Transfer money</h2>
          <p className="mt-1 text-sm text-text-secondary">Move money between your tracked accounts.</p>
          {transferComplete ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Transfer recorded successfully.</div>
          ) : <>
            <label className="mt-6 block text-sm font-semibold text-text-primary">From</label><select className="input-field mt-2"><option>Main account</option><option>Cash</option></select>
            <label className="mt-4 block text-sm font-semibold text-text-primary">To</label><select className="input-field mt-2"><option>Cash</option><option>Savings</option></select>
            <label className="mt-4 block text-sm font-semibold text-text-primary">Amount (KSh)</label><input className="input-field mt-2" type="number" min="1" inputMode="decimal" required placeholder="0" />
          </>}
          <button className="btn-primary mt-6" type="submit" onClick={transferComplete ? () => setTransferOpen(false) : undefined}>{transferComplete ? 'Done' : 'Transfer money'}</button>
        </form>
      </BottomSheet>
    </>
  );
}
