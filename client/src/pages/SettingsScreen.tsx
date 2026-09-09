import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings, currencies } from '../contexts/SettingsContext';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import FabMenu from '../components/ui/FabMenu';
import BottomSheet from '../components/ui/BottomSheet';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { currency, language, setCurrency, setLanguage, exchangeRateUpdatedAt, exchangeRateError, refreshExchangeRates, t } = useSettings();
  const navigate = useNavigate();
  const [selectedSetting, setSelectedSetting] = useState<{ label: string; desc: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigateProfile = () => {
    navigate('/profile');
  };

  const languageOptions = [
    { value: 'en', label: t('english') },
    { value: 'sw', label: t('swahili') },
  ];

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="pt-4 pb-2">
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">{t('settings')}</h1>
        </div>

        {/* Profile Card */}
        <div className="card-lg p-5 mt-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-xl shadow-glow flex-shrink-0">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-text-primary">{user?.name || 'User'}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
          <button onClick={handleNavigateProfile} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 text-text-secondary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* Account Section */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">{t('account')}</p>
          <div className="card overflow-hidden">
            {[
              { icon: '👤', label: t('profile_info'), desc: t('profile_desc'), action: 'profile' as const },
              { icon: '🔒', label: t('security'), desc: t('security_desc') },
              { icon: '🔔', label: t('notification'), desc: t('notification_desc') },
              {
                icon: '💱',
                label: t('currency_language'),
                desc: `${currency.symbol} · ${language === 'en' ? t('english') : t('swahili')}`,
              },
            ].map((item, idx) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action === 'profile') {
                    handleNavigateProfile();
                  } else {
                    setSelectedSetting(item);
                  }
                }}
                className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left ${idx !== 3 ? 'border-b border-border-light' : ''}`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-secondary">{item.desc}</p>
                </div>
                {item.action !== 'profile' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted flex-shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">{t('preferences')}</p>
          <div className="card overflow-hidden">
            {[
              { icon: '🎨', label: t('appearance'), desc: t('appearance_desc') },
              { icon: '🔒', label: t('data_privacy'), desc: 'Backup, encryption' },
              { icon: '❓', label: t('help_support'), desc: 'FAQ, contact us' },
              { icon: 'ℹ️', label: t('about'), desc: 'Version 1.0.0' },
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
            {t('log_out')}
          </button>
        </div>
      </div>

      <BottomNav />

      <FabMenu onAddTransaction={() => {}} />

      <BottomSheet open={selectedSetting !== null} onClose={() => setSelectedSetting(null)}>
        <div className="px-5 pb-8">
          <h2 className="text-xl font-bold text-text-primary">{selectedSetting?.label}</h2>
          <p className="mt-1 text-sm text-text-secondary">{selectedSetting?.desc}</p>
          {selectedSetting?.label === t('about') ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm leading-6 text-text-secondary">{t('about_intro')}</p>
              {[
                { icon: '↕️', title: t('about_track_title'), description: t('about_track_desc') },
                { icon: '🎯', title: t('about_plan_title'), description: t('about_plan_desc') },
                { icon: '📊', title: t('about_insights_title'), description: t('about_insights_desc') },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-3 rounded-2xl bg-gray-50 p-4">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg">{feature.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{feature.title}</h3>
                    <p className="mt-0.5 text-xs leading-5 text-text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedSetting?.label === t('notification') ? (
            <button onClick={() => setNotificationsEnabled((enabled) => !enabled)} className="mt-6 flex w-full items-center justify-between rounded-2xl bg-gray-50 p-4 text-left">
              <span><span className="block text-sm font-semibold text-text-primary">{t('push_notifications')}</span><span className="mt-0.5 block text-xs text-text-secondary">{t('notification_desc')}</span></span>
              <span className={`relative h-7 w-12 rounded-full transition-colors ${notificationsEnabled ? 'bg-brand' : 'bg-gray-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></span>
            </button>
          ) : selectedSetting?.label === t('currency_language') ? (
            <>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">{t('currency')}</label>
                  <button onClick={() => void refreshExchangeRates()} className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors">{t('refresh_rates')}</button>
                </div>
                <p className="mb-3 text-xs leading-5 text-text-secondary">
                  {exchangeRateError
                    ? t('exchange_rate_unavailable')
                    : exchangeRateUpdatedAt
                      ? `${t('rates_updated')} ${new Date(exchangeRateUpdatedAt).toLocaleString()}`
                      : t('rates_loading')}
                  {' '}<a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" className="text-brand underline">ExchangeRate-API</a>
                </p>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => void setCurrency(c)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all ${
                        currency.code === c.code
                          ? 'bg-brand-soft border-2 border-brand text-brand'
                          : 'bg-gray-50 text-text-primary hover:bg-gray-100'
                      }`}
                    >
                      <span>
                        <span className="font-semibold">{c.symbol}</span>
                        <span className="text-xs text-text-secondary ml-2">{c.name}</span>
                      </span>
                      {currency.code === c.code && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{t('language')}</label>
                <div className="space-y-1">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLanguage(opt.value as 'en' | 'sw')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all ${
                        language === opt.value
                          ? 'bg-brand-soft border-2 border-brand text-brand'
                          : 'bg-gray-50 text-text-primary hover:bg-gray-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {language === opt.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : selectedSetting?.label === t('appearance') ? (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {(['light', 'dark'] as const).map((option) => <button key={option} onClick={() => setTheme(option)} className={`rounded-2xl border-2 p-4 text-left transition-colors ${theme === option ? 'border-brand bg-brand-soft text-brand' : 'border-transparent bg-gray-50 text-text-primary'}`}><span className="block text-lg">{option === 'light' ? '☀️' : '🌙'}</span><span className="mt-2 block text-sm font-semibold capitalize">{option} mode</span></button>)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-text-secondary">This setting is ready for its account preference controls. Your current preference is applied across the app.</div>
          )}
          <button onClick={() => setSelectedSetting(null)} className="btn-primary mt-6">
            {t('done')}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
