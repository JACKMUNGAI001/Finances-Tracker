import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="page-shell">
      <div className="page-panel">
        <section className="home-hero">
          <p className="home-eyebrow">Finances tracker</p>
          <h1 className="home-title">Take control of your money, one transaction at a time.</h1>
          <p className="home-subtitle">
            Track income, log expenses, and see your financial story unfold with beautifully designed charts and a calm, modern dashboard.
          </p>
          <div className="home-cta">
            <Link to="/login" className="btn-primary">Sign In</Link>
            <Link to="/register" className="btn-secondary">Create Account</Link>
          </div>
        </section>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Smart analytics</h3>
            <p className="feature-text">Understand your habits with clear charts for monthly spending and expense categories.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">💰</div>
            <h3 className="feature-title">Instant tracking</h3>
            <p className="feature-text">Add income and expenses quickly, organize them by category, and keep your numbers accurate.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Clear goals</h3>
            <p className="feature-text">Stay focused on your balance and spending patterns with a polished overview of your finances.</p>
          </article>
        </div>

        <section className="info-panel">
          <h2>Why people love it</h2>
          <ul className="info-list">
            <li className="info-item"><span>✓</span><span>Beautiful, balanced layout designed for clarity and comfort.</span></li>
            <li className="info-item"><span>✓</span><span>All amounts are presented in Kenyan Shillings, ready for local use.</span></li>
            <li className="info-item"><span>✓</span><span>Secure sign-in and registration experience for every user.</span></li>
            <li className="info-item"><span>✓</span><span>Built to help you stay organized without feeling overwhelmed.</span></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
