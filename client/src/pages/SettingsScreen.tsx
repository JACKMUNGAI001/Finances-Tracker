import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { useAuth } from '../contexts/AuthContext';
import { useSettings, currencies } from '../contexts/SettingsContext';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import FabMenu from '../components/ui/FabMenu';
import BottomSheet from '../components/ui/BottomSheet';
import { deleteAccount, fetchTransactions } from '../services/api';
import { useAppLock } from '../contexts/AppLockContext';
import { useNotifications } from '../contexts/NotificationContext';
import type { Transaction } from '../shared/types';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isNativeApp, isAppLockEnabled, enableAppLock, disableAppLock } = useAppLock();
  const { currency, language, setCurrency, setLanguage, exchangeRateUpdatedAt, exchangeRateError, refreshExchangeRates, t } = useSettings();
  const navigate = useNavigate();
  const [selectedSetting, setSelectedSetting] = useState<{ label: string; desc: string } | null>(null);
  const { isNativeApp: notificationsAvailable, isEnabled: notificationsEnabled, permission: notificationPermission, enableNotifications, disableNotifications, sendTestNotification } = useNotifications();
  const [notificationStatus, setNotificationStatus] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
  const [exportingData, setExportingData] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');
  const [appLockError, setAppLockError] = useState('');
  const [isUpdatingAppLock, setIsUpdatingAppLock] = useState(false);
  const [showDeletionConfirmation, setShowDeletionConfirmation] = useState(false);
  const [deletionRequestError, setDeletionRequestError] = useState('');
  const [requestingDeletion, setRequestingDeletion] = useState(false);

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

  const handleExportData = async () => {
    setExportError('');
    setExportSuccess('');
    setExportingData(true);
    try {
      const transactions = await fetchTransactions();
      const receipt = createTransactionReceipt(transactions, user?.email, currency.code);
      const fileName = `finances-tracker-transaction-receipt-${new Date().toISOString().slice(0, 10)}.pdf`;

      if (Capacitor.isNativePlatform()) {
        if (!Capacitor.isPluginAvailable('Filesystem')) {
          throw new Error('Exporting files requires the latest app update. Please install the newest version of Finances Tracker and try again.');
        }
        const isIos = Capacitor.getPlatform() === 'ios';
        await Filesystem.writeFile({
          path: isIos ? fileName : `Finances Tracker/${fileName}`,
          data: btoa(receipt),
          directory: Directory.Documents,
          recursive: true,
        });
        setExportSuccess(isIos
          ? `Receipt saved. Find it in Files > On My iPhone > Finances Tracker > ${fileName}`
          : `Receipt saved. Find it in your Files app under Documents > Finances Tracker > ${fileName}`);
      } else {
        const file = new Blob([receipt], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(downloadUrl);
        setExportSuccess('Receipt downloaded successfully. Check your browser Downloads folder.');
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Your data could not be exported. Please try again.');
    } finally {
      setExportingData(false);
    }
  };

  const handleAppLock = async () => {
    setAppLockError('');
    setIsUpdatingAppLock(true);
    try {
      const changed = isAppLockEnabled ? await disableAppLock() : await enableAppLock();
      if (!changed) setAppLockError('Unable to update app lock. Set up biometrics or a device passcode and try again.');
    } finally {
      setIsUpdatingAppLock(false);
    }
  };

  const handleNotifications = async () => {
    setNotificationStatus('');
    try {
      if (notificationsEnabled) {
        await disableNotifications();
        setNotificationStatus('Finance reminders are off.');
      } else if (await enableNotifications()) {
        setNotificationStatus('Finance reminders are enabled. A weekly check-in is scheduled for Monday at 9:00 AM.');
      } else {
        setNotificationStatus('Notifications are blocked. Enable them for Finances Tracker in your device settings.');
      }
    } catch {
      setNotificationStatus('Unable to update notification permissions. Please try again.');
    }
  };

  const handleTestNotification = async () => {
    setNotificationStatus('');
    if (await sendTestNotification()) setNotificationStatus('Test notification scheduled. It will appear in a moment.');
    else setNotificationStatus('Enable notifications first, then try again.');
  };

  const handleDeletionRequest = async () => {
    if (!user?.email) return;
    setDeletionRequestError('');
    setRequestingDeletion(true);
    try {
      await deleteAccount();
      // The auth user is already gone, so a remote sign-out can legitimately
      // fail. Clear the local session and continue to the login screen either way.
      await logout().catch(() => undefined);
      navigate('/login', { replace: true });
    } catch (error) {
      setDeletionRequestError(error instanceof Error ? error.message : 'Unable to submit your deletion request. Please try again.');
    } finally {
      setRequestingDeletion(false);
    }
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
          {selectedSetting?.label === t('help_support') ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm leading-6 text-text-secondary">Need help with Finances Tracker? Contact our support team.</p>
              <a href="tel:+254792856882" className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-left transition-colors hover:bg-brand-soft">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg">📞</span>
                <span>
                  <span className="block text-sm font-semibold text-text-primary">Phone</span>
                  <span className="mt-0.5 block text-xs text-text-secondary">+254 792 856 882</span>
                </span>
              </a>
              <a href="mailto:jacksonmungai001@gmail.com" className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-left transition-colors hover:bg-brand-soft">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg">✉️</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text-primary">Email</span>
                  <span className="mt-0.5 block truncate text-xs text-text-secondary">jacksonmungai001@gmail.com</span>
                </span>
              </a>
            </div>
          ) : selectedSetting?.label === t('data_privacy') ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-text-primary">Your data</h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">Your profile, transactions, budgets, goals, and preferences are used to provide your personal finance experience. Your data is associated with your signed-in account.</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-text-primary">App permissions</h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">Notifications: {notificationPermission === 'granted' ? 'allowed' : notificationPermission === 'unavailable' ? 'available after installing the latest app update' : 'not allowed'}. The app does not require access to your contacts or photos.</p>
              </div>
              <button type="button" onClick={() => void handleExportData()} disabled={exportingData} className="flex w-full items-center justify-between rounded-2xl bg-brand-soft p-4 text-left transition-colors hover:bg-brand/15 disabled:cursor-not-allowed disabled:opacity-60">
                <span><span className="block text-sm font-semibold text-brand">{exportingData ? 'Creating your receipt…' : 'Export my transactions'}</span><span className="mt-0.5 block text-xs text-text-secondary">Download a receipt-style PDF of your transaction data.</span></span>
                <span className="text-lg">↓</span>
              </button>
              {exportError && <p className="text-xs text-accent-red">{exportError}</p>}
              {exportSuccess && <div role="status" className="rounded-2xl border border-green-100 bg-green-50 p-3 text-xs leading-5 text-green-800">✓ {exportSuccess}</div>}
              <button type="button" onClick={() => { setDeletionRequestError(''); setShowDeletionConfirmation(true); }} className="block w-full rounded-2xl border border-red-100 bg-red-50 p-4 text-left transition-colors hover:bg-red-100">
                <span className="block text-sm font-semibold text-accent-red">Request account deletion</span>
                <span className="mt-0.5 block text-xs leading-5 text-text-secondary">Submit a verified request to permanently delete your account and associated data.</span>
              </button>
              {deletionRequestError && <p className="text-xs text-accent-red">{deletionRequestError}</p>}
            </div>
          ) : selectedSetting?.label === t('security') ? (
            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedSetting(null);
                  navigate('/profile');
                }}
                className="flex w-full items-center justify-between rounded-2xl bg-gray-50 p-4 text-left transition-colors hover:bg-brand-soft"
              >
                <span><span className="block text-sm font-semibold text-text-primary">Change password</span><span className="mt-0.5 block text-xs text-text-secondary">Update your password from your profile.</span></span>
                <span className="text-text-muted">›</span>
              </button>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <span><span className="block text-sm font-semibold text-text-primary">Biometric or PIN lock</span><span className="mt-1 block text-xs leading-5 text-text-secondary">Require Face ID, fingerprint, or your device PIN whenever the app is reopened.</span></span>
                  <button type="button" onClick={() => void handleAppLock()} disabled={!isNativeApp || isUpdatingAppLock} className={`relative mt-0.5 h-7 w-12 flex-shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isAppLockEnabled ? 'bg-brand' : 'bg-gray-300'}`} aria-label={isAppLockEnabled ? 'Disable app lock' : 'Enable app lock'} aria-pressed={isAppLockEnabled}><span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${isAppLockEnabled ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                </div>
                <p className="mt-3 text-xs text-text-secondary">{isUpdatingAppLock ? 'Opening device authentication…' : isNativeApp ? (isAppLockEnabled ? 'App lock is enabled.' : 'App lock is off.') : 'Available in the installed Android or iOS app.'}</p>
                {appLockError && <p className="mt-2 text-xs text-accent-red">{appLockError}</p>}
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-text-primary">Active session</h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">You are signed in on this device as {user?.email || 'your account'}.</p>
                <button type="button" onClick={() => void handleLogout()} className="mt-3 text-sm font-semibold text-accent-red hover:underline">Log out of this device</button>
              </div>
              <div className="rounded-2xl bg-brand-soft p-4">
                <h3 className="text-sm font-semibold text-text-primary">Keep your account safe</h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">Choose a strong, unique password and never share it with anyone. We will never ask you to send your password by email or message.</p>
              </div>
            </div>
          ) : selectedSetting?.label === t('about') ? (
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
            <div className="mt-6 space-y-3">
              <button type="button" onClick={() => void handleNotifications()} disabled={!notificationsAvailable} className="flex w-full items-center justify-between rounded-2xl bg-gray-50 p-4 text-left disabled:cursor-not-allowed disabled:opacity-60">
                <span><span className="block text-sm font-semibold text-text-primary">{t('push_notifications')}</span><span className="mt-0.5 block text-xs text-text-secondary">Weekly finance reminders on your device.</span></span>
                <span className={`relative h-7 w-12 rounded-full transition-colors ${notificationsEnabled ? 'bg-brand' : 'bg-gray-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></span>
              </button>
              <button type="button" onClick={() => void handleTestNotification()} disabled={!notificationsEnabled} className="w-full rounded-2xl bg-brand-soft p-4 text-left text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-60">Send a test notification</button>
              {!notificationsAvailable && <p className="text-xs leading-5 text-text-secondary">Install the latest Android or iOS app update to use device notifications.</p>}
              {notificationStatus && <p role="status" className="text-xs leading-5 text-text-secondary">{notificationStatus}</p>}
            </div>
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

      <BottomSheet open={showDeletionConfirmation} onClose={() => !requestingDeletion && setShowDeletionConfirmation(false)}>
        <div className="px-5 pb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">⚠️</div>
          <h2 className="mt-4 text-xl font-bold text-text-primary">Request account deletion?</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">This immediately and permanently deletes {user?.email}, including associated transactions, goals, budgets, and preferences. You will be signed out.</p>
          <p className="mt-3 text-xs leading-5 text-text-secondary">This cannot be undone.</p>
          {deletionRequestError && <p className="mt-3 text-xs text-accent-red">{deletionRequestError}</p>}
          <button type="button" onClick={() => void handleDeletionRequest()} disabled={requestingDeletion} className="mt-6 w-full rounded-[14px] bg-accent-red py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{requestingDeletion ? 'Deleting account…' : 'Permanently delete account'}</button>
          <button type="button" onClick={() => setShowDeletionConfirmation(false)} disabled={requestingDeletion} className="mt-3 w-full py-3 text-sm font-semibold text-text-secondary disabled:opacity-60">Cancel</button>
        </div>
      </BottomSheet>
    </div>
  );
}

/** Creates a compact, printable receipt-style PDF without sending financial data to another service. */
function createTransactionReceipt(transactions: Transaction[], email: string | undefined, currencyCode: string): string {
  const income = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expenses = transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const formatAmount = (amount: number) => `${currencyCode} ${Math.abs(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  const rows = transactions.flatMap((transaction) => [
    `${formatDate(transaction.date)} | ${transaction.category} | ${transaction.type === 'income' ? 'INCOME' : 'EXPENSE'}`,
    `${truncate(transaction.description || 'No description', 28)}  ${transaction.type === 'income' ? '+' : '-'} ${formatAmount(Number(transaction.amount))}`,
  ]);
  const summary = [
    `Account: ${email || 'Signed-in account'}`,
    `Generated: ${new Date().toLocaleString('en-KE')}`,
    `Transactions: ${transactions.length}`,
    `Total income: + ${formatAmount(income)}`,
    `Total expenses: - ${formatAmount(expenses)}`,
    `Net balance: ${income - expenses < 0 ? '-' : ''}${formatAmount(income - expenses)}`,
    '',
    'DATE | CATEGORY | TYPE',
    'DESCRIPTION                                         AMOUNT',
    '------------------------------------------------------------',
  ];
  const bodyLines = [...summary, ...(rows.length ? rows : ['No transactions recorded.'])];
  const linesPerPage = 43;
  const pages = Array.from({ length: Math.max(1, Math.ceil(bodyLines.length / linesPerPage)) }, (_, index) => bodyLines.slice(index * linesPerPage, (index + 1) * linesPerPage));
  const pageObjects: string[] = [];

  pages.forEach((lines, index) => {
    const pageObject = 4 + index * 2;
    const contentObject = pageObject + 1;
    const heading = index === 0 ? ['FINANCES TRACKER', 'TRANSACTION RECEIPT', '============================================================', ''] : ['FINANCES TRACKER - TRANSACTION RECEIPT (continued)', '============================================================', ''];
    const content = pdfTextStream([...heading, ...lines]);
    pageObjects.push(`${pageObject} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>\nendobj`);
    pageObjects.push(`${contentObject} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`);
  });

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    `2 0 obj\n<< /Type /Pages /Kids [${pages.map((_, index) => `${4 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj`,
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    ...pageObjects,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function pdfTextStream(lines: string[]): string {
  return `BT\n/F1 9 Tf\n32 760 Td\n${lines.map((line, index) => `${index === 0 ? '' : '0 -15 Td\n'}(${escapePdfText(line)}) Tj`).join('\n')}\nET`;
}

function escapePdfText(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '?').replace(/([\\()])/g, '\\$1');
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}
