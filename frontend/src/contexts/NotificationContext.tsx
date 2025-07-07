'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { getNotifications, markNotificationAsRead } from '@/lib/api';
import { Notification } from '@/types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    const fetchedNotifications = await getNotifications(token);
    setNotifications(fetchedNotifications);
  }, [token]);

  const markAsRead = async (notificationId: string) => {
    if (!token) return;
    await markNotificationAsRead(notificationId, token);
    setNotifications(notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const value = {
    notifications,
    fetchNotifications,
    markAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
