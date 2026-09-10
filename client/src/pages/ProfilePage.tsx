import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import BottomNav from '../components/BottomNav';
import FabMenu from '../components/ui/FabMenu';

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await updateProfile(name.trim(), email.trim());
          setSuccess(t('profile_updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
          if (newPassword.length < 6) {
      setPasswordError(t('password_min'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwords_dont_match'));
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword(newPassword);
      setSuccess(t('password_updated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="pt-4 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-card border border-border-light text-text-secondary hover:text-brand hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">{t('profile')}</h1>
        </div>

        {/* Profile Header */}
        <div className="card p-5 flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-xl shadow-glow flex-shrink-0">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-text-primary">{user?.name || 'User'}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        {/* Profile Information */}
        <form onSubmit={handleSaveProfile} className="card p-5 mb-4">
          <h2 className="text-lg font-bold text-text-primary mb-1">{t('profile_info')}</h2>
          <p className="text-xs text-text-secondary mb-4">{t('update_profile')}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">{t('full_name')}</label>
              <input
                className="input-field"
                type="text"
                placeholder={t('full_name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">{t('email')}</label>
              <input
                className="input-field"
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary mt-5">
            {saving ? t('saving') : t('save_changes')}
          </button>
        </form>

        {/* Password Section */}
        <form onSubmit={handleSavePassword} className="card p-5 mb-4">
          <h2 className="text-lg font-bold text-text-primary mb-1">{t('password')}</h2>
          <p className="text-xs text-text-secondary mb-4">{t('change_password')}</p>

          {passwordError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
              {passwordError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">{t('current_password')}</label>
              <PasswordInput value={currentPassword} onChange={setCurrentPassword} visible={showCurrentPassword} onToggle={() => setShowCurrentPassword(!showCurrentPassword)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">{t('new_password')}</label>
              <PasswordInput value={newPassword} onChange={setNewPassword} visible={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />
              <p className="text-[10px] text-text-secondary mt-1">{t('new_password_placeholder')}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">{t('confirm_password')}</label>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
            </div>
          </div>

          <button type="submit" disabled={savingPassword} className="btn-primary mt-5">
            {saving ? t('saving') : t('update_password')}
          </button>
        </form>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-[14px] bg-accent-red-light text-accent-red font-semibold text-sm hover:bg-red-100 transition-colors mb-6"
        >
          {t('log_out')}
        </button>
      </div>

      <BottomNav />
      <FabMenu onAddTransaction={() => {}} />
    </div>
  );
}

function PasswordInput({ value, onChange, visible, onToggle }: { value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void }) {
  return <div className="relative"><input className="input-field pr-12" type={visible ? 'text' : 'password'} placeholder="••••••••" value={value} onChange={(e) => onChange(e.target.value)} required /><button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text-secondary hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-r-[14px]" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>{visible ? <EyeOffIcon /> : <EyeIcon />}</button></div>;
}

function EyeIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function EyeOffIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 18 18" /><path d="M10.6 5.2A11.6 11.6 0 0 1 12 5c6.5 0 10 7 10 7a18.1 18.1 0 0 1-3.1 4.1M6.2 6.2C3.5 8.1 2 12 2 12s3.5 7 10 7a10 10 0 0 0 3.1-.5" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>;
}
