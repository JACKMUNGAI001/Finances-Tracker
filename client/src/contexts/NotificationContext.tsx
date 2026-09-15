import { Capacitor, type PermissionState } from '@capacitor/core';
import { LocalNotifications, Weekday, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const WEEKLY_REMINDER_ID = 1001;
const TEST_NOTIF_ID = 9001;

export type AppNotification = Pick<LocalNotificationSchema, 'id' | 'title' | 'body'>;

type NotificationContextType = {
  isNativeApp: boolean;
  isWebNotificationAvailable: boolean;
  isEnabled: boolean;
  permission: PermissionState | 'unavailable' | 'default';
  notifications: AppNotification[];
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<boolean>;
  markAllRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const isWebNotificationAvailable = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window && !Capacitor.isNativePlatform();

export function NotificationProvider({ children }: { children: ReactNode }) {
  const isNativeApp = Capacitor.isNativePlatform();
  const webNotifAvailable = isWebNotificationAvailable();
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'true');
  const [permission, setPermission] = useState<PermissionState | 'unavailable' | 'default'>(
    isNativeApp ? 'prompt' : (webNotifAvailable ? Notification.permission as unknown as PermissionState : 'unavailable')
  );
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const isPluginAvailable = isNativeApp && Capacitor.isPluginAvailable('LocalNotifications');

  const loadDeliveredNotifications = useCallback(async () => {
    if (!isPluginAvailable) return;
    const { notifications: delivered } = await LocalNotifications.getDeliveredNotifications();
    setNotifications(delivered.map(({ id, title, body }) => ({ id, title, body })));
  }, [isPluginAvailable]);

  useEffect(() => {
    if (!isPluginAvailable) return;
    void LocalNotifications.checkPermissions().then(({ display }) => {
      setPermission(display);
      if (display !== 'granted') setIsEnabled(false);
    });
    void loadDeliveredNotifications();
  }, [isPluginAvailable, loadDeliveredNotifications]);

  useEffect(() => {
    if (!webNotifAvailable) return;
    if (Notification.permission === 'granted') {
      setPermission('granted' as PermissionState);
      setIsEnabled(localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'true');
    } else if (Notification.permission === 'denied') {
      setPermission('denied' as PermissionState);
    }
  }, [webNotifAvailable]);

  const enableNotifications = async () => {
    if (!isPluginAvailable && !webNotifAvailable) return false;

    if (webNotifAvailable) {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setPermission('granted' as PermissionState);
        localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
        setIsEnabled(true);

        const lastReminder = localStorage.getItem('last_weekly_reminder');
        const now = Date.now();
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        if (!lastReminder || now - Number(lastReminder) > weekMs) {
          setTimeout(() => {
            new Notification('Weekly finance check-in', {
              body: 'Take a moment to review your spending and update your transactions.',
            });
            setNotifications((prev) => [{
              id: WEEKLY_REMINDER_ID,
              title: 'Weekly finance check-in',
              body: 'Take a moment to review your spending and update your transactions.',
            }, ...prev]);
            localStorage.setItem('last_weekly_reminder', String(Date.now()));
          }, 1000);
        }

        return true;
      }
      return false;
    }

    const current = await LocalNotifications.checkPermissions();
    const result = current.display === 'granted' ? current : await LocalNotifications.requestPermissions();
    setPermission(result.display);
    if (result.display !== 'granted') return false;

    await LocalNotifications.schedule({
      notifications: [{
        id: WEEKLY_REMINDER_ID,
        title: 'Weekly finance check-in',
        body: 'Take a moment to review your spending and update your transactions.',
        schedule: { on: { weekday: Weekday.Monday, hour: 9, minute: 0 } },
        isExactNotification: false,
      }],
    });
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
    setIsEnabled(true);
    return true;
  };

  const disableNotifications = async () => {
    if (isPluginAvailable) {
      await LocalNotifications.cancel({ notifications: [{ id: WEEKLY_REMINDER_ID }] });
    }
    localStorage.removeItem(NOTIFICATIONS_ENABLED_KEY);
    setIsEnabled(false);
  };

  const scheduleWebNotification = (id: number, title: string, body: string, delayMs: number) => {
    if (!webNotifAvailable || Notification.permission !== 'granted') return;

    const timer = window.setTimeout(() => {
      new Notification(title, { body });
      setNotifications((prev) => [{ id, title, body }, ...prev]);
    }, delayMs);

    return () => clearTimeout(timer);
  };

  const sendTestNotification = async () => {
    if (!isPluginAvailable && !webNotifAvailable) return false;

    if (webNotifAvailable && Notification.permission === 'granted') {
      const cleanup = scheduleWebNotification(
        TEST_NOTIF_ID,
        'Notifications are working',
        'Finances Tracker can send you finance reminders on this device.',
        2000
      );
      if (cleanup) {
        setTimeout(cleanup, 2500);
      }
      return true;
    }

    if (!isPluginAvailable || permission !== 'granted') return false;
    await LocalNotifications.schedule({
      notifications: [{
        id: Math.floor(Date.now() % 2_000_000_000),
        title: 'Notifications are working',
        body: 'Finances Tracker can send you finance reminders on this device.',
        schedule: { at: new Date(Date.now() + 2_000) },
        isExactNotification: false,
      }],
    });
    return true;
  };

  const markAllRead = async () => {
    if (isPluginAvailable) await LocalNotifications.removeAllDeliveredNotifications();
    setNotifications([]);
  };

  const value = useMemo(() => ({
    isNativeApp,
    isWebNotificationAvailable: webNotifAvailable,
    isEnabled,
    permission,
    notifications,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    markAllRead,
  }), [isNativeApp, webNotifAvailable, isEnabled, permission, notifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}
