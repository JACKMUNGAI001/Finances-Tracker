import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import type { Transaction } from '../../../shared/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ExpenseChart: React.FC<Props> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categories = Array.from(new Set(expenses.map(t => t.category)));
  const categoryTotals = categories.map(cat =>
    expenses.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
  );

  const monthlyMap = new Map<string, number>();
  expenses.forEach(transaction => {
    const date = new Date(transaction.date);
    const label = `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
    monthlyMap.set(label, (monthlyMap.get(label) ?? 0) + transaction.amount);
  });

  const monthlyLabels = Array.from(monthlyMap.keys()).slice(-6);
  const monthlyTotals = monthlyLabels.map(label => monthlyMap.get(label) ?? 0);

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: categoryTotals,
        backgroundColor: ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#38bdf8', '#a855f7', '#f43f5e'],
      },
    ],
  };

  const barData = {
    labels: monthlyLabels.length ? monthlyLabels : ['No data'],
    datasets: [
      {
        label: 'Expense',
        data: monthlyLabels.length ? monthlyTotals : [0],
        backgroundColor: 'rgba(79, 70, 229, 0.85)',
        borderRadius: 16,
        maxBarThickness: 38,
      },
    ],
  };

  return (
    <section className="analytics-card">
      <div className="chart-top">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Analytics</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Monthly spending</h3>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">April 2022</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr] mt-6">
        <div className="chart-panel">
          <Bar
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#475569' } },
                y: { grid: { color: '#e2e8f0' }, ticks: { color: '#475569' }, beginAtZero: true },
              },
            }}
            data={barData}
          />
        </div>

        <div className="chart-panel pie-panel">
          <div className="w-full mb-4">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Spend breakdown</p>
            <p className="text-lg font-semibold text-slate-900">By category</p>
          </div>
          {expenses.length > 0 ? (
            <Pie data={pieData} />
          ) : (
            <p className="text-slate-500">No expenses to display.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExpenseChart;
