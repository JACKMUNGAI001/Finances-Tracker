import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <main className="min-h-screen bg-app-bg px-5 py-8 text-text-primary">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <p className="text-lg font-extrabold tracking-tight text-brand">Finances Tracker</p>
          <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-50 hover:text-brand transition-colors">Sign In</Link>
        </header>

        <section className="mt-12 rounded-[32px] bg-gradient-to-br from-brand-dark via-brand to-brand-light px-6 py-12 text-center text-white shadow-glow md:px-16 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">Simple personal finance</p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Take control of your money, one transaction at a time.</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/85 md:text-base">
            Track income, log expenses, and see your financial story unfold with beautifully designed charts and a calm, modern dashboard.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-brand shadow-card transition-transform hover:scale-[1.02]">Create Account</Link>
            <Link to="/login" className="rounded-full border border-white/50 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">Sign In</Link>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="card p-6">
            <div className="text-3xl">📊</div>
            <h2 className="mt-4 text-lg font-bold text-text-primary">Smart analytics</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Understand your habits with clear charts for monthly spending and expense categories.</p>
          </article>

          <article className="card p-6">
            <div className="text-3xl">💰</div>
            <h2 className="mt-4 text-lg font-bold text-text-primary">Instant tracking</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Add income and expenses quickly, organize them by category, and keep your numbers accurate.</p>
          </article>

          <article className="card p-6">
            <div className="text-3xl">🎯</div>
            <h2 className="mt-4 text-lg font-bold text-text-primary">Clear goals</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Set savings goals and spending budgets, then follow your progress in one place.</p>
          </article>
        </section>

        <section className="card mt-10 p-6 md:p-8">
          <h2 className="text-xl font-bold text-text-primary">Everything you need to stay organised</h2>
          <ul className="mt-5 grid gap-3 text-sm text-text-secondary md:grid-cols-2">
            {['A calm, clear view of your money.', 'Support for Kenyan Shillings and other currencies.', 'Secure accounts for your personal financial data.', 'A simple experience designed for daily use.'].map((item) => (
              <li key={item} className="flex gap-2"><span className="font-bold text-brand">✓</span><span>{item}</span></li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
