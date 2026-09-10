import { Capacitor } from '@capacitor/core';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const APP_LOCK_KEY = 'biometric_app_lock_enabled';

type AppLockContextType = {
  isNativeApp: boolean;
  isAppLockEnabled: boolean;
  enableAppLock: () => Promise<boolean>;
  disableAppLock: () => Promise<boolean>;
};

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

export function AppLockProvider({ children }: { children: ReactNode }) {
  const isNativeApp = Capacitor.isNativePlatform();
  const [isAppLockEnabled, setIsAppLockEnabled] = useState(() => isNativeApp && localStorage.getItem(APP_LOCK_KEY) === 'true');
  const [isLocked, setIsLocked] = useState(() => isNativeApp && localStorage.getItem(APP_LOCK_KEY) === 'true');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const authenticate = async () => {
    setError('');
    setIsAuthenticating(true);
    try {
      await BiometricAuth.authenticate({
        reason: 'Unlock Finances Tracker',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use device passcode',
        androidTitle: 'Unlock Finances Tracker',
        androidSubtitle: 'Use biometrics or your device PIN',
        androidConfirmationRequired: false,
      });
      setIsLocked(false);
      return true;
    } catch {
      setError('Authentication was not completed. Try again to unlock the app.');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (!isNativeApp || !isAppLockEnabled) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') setIsLocked(true);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAppLockEnabled, isNativeApp]);

  const enableAppLock = async () => {
    if (!isNativeApp) return false;
    try {
      const available = await BiometricAuth.checkBiometry();
      if (!available.isAvailable && !available.deviceIsSecure) {
        setError('Set up biometrics or a device PIN, pattern, or passcode before enabling app lock.');
        return false;
      }
    } catch {
      setError('App lock is not available on this device.');
      return false;
    }
    const authenticated = await authenticate();
    if (authenticated) {
      localStorage.setItem(APP_LOCK_KEY, 'true');
      setIsAppLockEnabled(true);
    }
    return authenticated;
  };

  const disableAppLock = async () => {
    const authenticated = await authenticate();
    if (authenticated) {
      localStorage.removeItem(APP_LOCK_KEY);
      setIsAppLockEnabled(false);
    }
    return authenticated;
  };

  return (
    <AppLockContext.Provider value={{ isNativeApp, isAppLockEnabled, enableAppLock, disableAppLock }}>
      {children}
      {isLocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-app-bg p-6">
          <div className="card w-full max-w-sm p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-2xl">🔒</div>
            <h1 className="mt-4 text-xl font-bold text-text-primary">Finances Tracker is locked</h1>
            <p className="mt-2 text-sm text-text-secondary">Use biometrics or your device PIN to continue.</p>
            {error && <p className="mt-3 text-xs text-accent-red">{error}</p>}
            <button type="button" onClick={() => void authenticate()} disabled={isAuthenticating} className="btn-primary mt-6">
              {isAuthenticating ? 'Authenticating...' : 'Unlock app'}
            </button>
          </div>
        </div>
      )}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) throw new Error('useAppLock must be used within an AppLockProvider');
  return context;
}
