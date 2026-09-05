import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from 'chart.js';
import BottomNav from '../components/BottomNav';
import FabMenu from '../components/ui/FabMenu';
import { useSettings } from '../contexts/SettingsContext';

ChartJS.register(ArcElement, Tooltip);

const categories: { name: string; amount: number; percent: number; color: string; change: number }[] = [];

const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0);

export default function ReportsScreen() {
  const navigate = useNavigate();
  const { currency, formatCurrency, t } = useSettings();
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');

  const chartData = useMemo(() => ({
    labels: categories.map(c => c.name),
    datasets: [
      {
        data: categories.map(c => c.amount),
        backgroundColor: categories.map(c => c.color),
        borderWidth: 0,
        hoverOffset: 6,
        borderRadius: 4,
      },
    ],
  }), []);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#ffffff',
        bodyColor: '#d1d5db',
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: (ctx: { label?: string; parsed?: number }) => {
            const value = ctx.parsed ?? 0;
            return ` ${currency.symbol} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
  }), [currency.symbol]);

  return (
    <div className="app-shell">
      <div className="app-container">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-card border border-border-light text-text-secondary hover:text-brand transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div>
              <p className="text-xs text-text-secondary font-medium">{t('finance')}</p>
              <h1 className="text-[24px] font-bold text-text-primary tracking-tight">{t('report')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-full bg-white shadow-card border border-border-light text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              {t('august_2026')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-card border border-border-light text-text-secondary hover:text-brand transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 bg-[#F1F1F3] p-1 rounded-full flex">
          {(['expenses', 'income'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'expenses' ? t('expense') : t('income')}
            </button>
          ))}
        </div>

        {/* Donut Chart Card */}
        <div className="mt-6 card p-6">
          <div className="text-center mb-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('total')} {activeTab === 'expenses' ? t('expense') : t('income')}</p>
            <p className="text-[28px] font-extrabold text-text-primary mt-1 tracking-tight">
              {formatCurrency(totalExpenses)}
            </p>
          </div>

          <div className="chart-wrapper relative w-56 h-56 mx-auto">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('total')} {activeTab === 'expenses' ? t('expense') : t('income')}</p>
                <p className="text-base font-extrabold text-text-primary">{currency.symbol} {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-6">
          <h3 className="section-title mb-4">{t('expense')} {t('report')}</h3>
          {categories.length === 0 && <div className="card p-6 text-center text-sm text-text-secondary">{t('no_expense_data')}</div>}
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <span className="text-sm font-bold">{cat.percent}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{cat.name}</p>
                    <p className="text-xs text-text-secondary">{t('of_total_expenses')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">{currency.symbol} {cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className={`text-xs font-medium ${cat.change >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {cat.change >= 0 ? '+' : ''}{cat.change}{t('vs_last_month')}
                    </p>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${cat.percent}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />

      <FabMenu onAddTransaction={() => {}} />
    </div>
  );
}
