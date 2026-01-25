import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  read: boolean;
  action_url: string | null;
  created_at: string;
}

interface NotificationPreferences {
  id: string;
  user_id: string;
  critical_alerts: boolean;
  capacity_warnings: boolean;
  transfer_requests: boolean;
  patient_updates: boolean;
  email_digest: 'none' | 'daily' | 'weekly';
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
}

const mapNotification = (row: Record<string, unknown>): Notification => ({
  id: row.id as string,
  user_id: row.user_id as string,
  title: row.title as string,
  message: row.message as string,
  type: row.type as Notification['type'],
  read: row.read as boolean,
  action_url: row.action_url as string | null,
  created_at: row.created_at as string
});

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []).map(row => mapNotification(row as Record<string, unknown>)));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setPreferences(data as unknown as NotificationPreferences);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();

    if (!user) return;

    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [mapNotification(payload.new as Record<string, unknown>), ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, fetchPreferences]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [user]);

  const clearAll = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        ...prefs
      })
      .select()
      .single();

    if (!error && data) {
      setPreferences(data as unknown as NotificationPreferences);
    }
  }, [user, preferences]);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    updatePreferences,
    requestPushPermission
  };
}
