import { Capacitor, type PermissionState } from '@capacitor/core';
import { LocalNotifications, Weekday, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const WEEKLY_REMINDER_ID = 1001;

export type AppNotification = Pick<LocalNotificationSchema, 'id' | 'title' | 'body'>;

type NotificationContextType = {
  isNativeApp: boolean;
  isEnabled: boolean;
  permission: PermissionState | 'unavailable';
  notifications: AppNotification[];
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<boolean>;
  markAllRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const isNativeApp = Capacitor.isNativePlatform();
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'true');
  const [permission, setPermission] = useState<PermissionState | 'unavailable'>(isNativeApp ? 'prompt' : 'unavailable');
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

  const enableNotifications = async () => {
    if (!isPluginAvailable) return false;
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

  const sendTestNotification = async () => {
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
    isEnabled,
    permission,
    notifications,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    markAllRead,
  }), [isNativeApp, isEnabled, permission, notifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}
