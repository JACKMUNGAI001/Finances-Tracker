import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import FabMenu from '../components/ui/FabMenu';
import BottomSheet from '../components/ui/BottomSheet';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedSetting, setSelectedSetting] = useState<{ label: string; desc: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="pt-4 pb-2">
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="card-lg p-5 mt-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-xl shadow-glow flex-shrink-0">
            {user?.name?.charAt(0) || 'J'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-text-primary">{user?.name || 'User'}</p>
            <p className="text-xs text-text-secondary">{user?.email || 'user@example.com'}</p>
          </div>
          <button onClick={() => setSelectedSetting({ label: 'Profile Information', desc: 'Your name and email are managed from your signed-in account.' })} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 text-text-secondary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* Account Section */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">Account</p>
          <div className="card overflow-hidden">
            {[
              { icon: '👤', label: 'Profile Information', desc: 'Name, email, phone' },
              { icon: '🔒', label: 'Security', desc: 'Password, biometrics' },
              { icon: '🔔', label: 'Notifications', desc: 'Push, email alerts' },
              { icon: '💱', label: 'Currency & Language', desc: 'KSh, English' },
            ].map((item, idx) => (
              <button
                key={item.label}
                onClick={() => setSelectedSetting(item)}
                className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left ${idx !== 3 ? 'border-b border-border-light' : ''}`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-secondary">{item.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">Preferences</p>
          <div className="card overflow-hidden">
            {[
              { icon: '🎨', label: 'Appearance', desc: 'Theme, font size' },
              { icon: '🔒', label: 'Data & Privacy', desc: 'Backup, encryption' },
              { icon: '❓', label: 'Help & Support', desc: 'FAQ, contact us' },
              { icon: 'ℹ️', label: 'About', desc: 'Version 1.0.0' },
            ].map((item, idx) => (
              <button
                key={item.label}
                onClick={() => setSelectedSetting(item)}
                className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left ${idx !== 3 ? 'border-b border-border-light' : ''}`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-secondary">{item.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="mt-6 mb-8">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-[14px] bg-accent-red-light text-accent-red font-semibold text-sm hover:bg-red-100 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <BottomNav />

      <FabMenu onAddTransaction={() => {}} />

      <BottomSheet open={selectedSetting !== null} onClose={() => setSelectedSetting(null)}>
        <div className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary">{selectedSetting?.label}</h2>
          <p className="mt-1 text-sm text-text-secondary">{selectedSetting?.desc}</p>
          {selectedSetting?.label === 'Notifications' ? (
            <button onClick={() => setNotificationsEnabled((enabled) => !enabled)} className="mt-6 flex w-full items-center justify-between rounded-2xl bg-gray-50 p-4 text-left">
              <span><span className="block text-sm font-semibold text-text-primary">Push notifications</span><span className="mt-0.5 block text-xs text-text-secondary">Transaction and budget updates</span></span>
              <span className={`relative h-7 w-12 rounded-full transition-colors ${notificationsEnabled ? 'bg-brand' : 'bg-gray-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></span>
            </button>
          ) : selectedSetting?.label === 'Currency & Language' ? (
            <div className="mt-6 rounded-2xl border border-brand bg-brand-soft p-4"><p className="text-sm font-semibold text-text-primary">Kenyan Shilling (KSh)</p><p className="mt-1 text-xs text-text-secondary">All balances, plans, reports, and transactions use KSh.</p></div>
          ) : selectedSetting?.label === 'Appearance' ? (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {(['light', 'dark'] as const).map((option) => <button key={option} onClick={() => setTheme(option)} className={`rounded-2xl border-2 p-4 text-left transition-colors ${theme === option ? 'border-brand bg-brand-soft text-brand' : 'border-transparent bg-gray-50 text-text-primary'}`}><span className="block text-lg">{option === 'light' ? '☀️' : '🌙'}</span><span className="mt-2 block text-sm font-semibold capitalize">{option} mode</span></button>)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-text-secondary">This setting is ready for its account preference controls. Your current preference is applied across the app.</div>
          )}
          <button onClick={() => setSelectedSetting(null)} className="btn-primary mt-6">Done</button>
        </div>
      </BottomSheet>
    </div>
  );
}
