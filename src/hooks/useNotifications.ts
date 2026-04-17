import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { notificationService } from '../features/notifications/notificationService';
import { clearNotifications, setNotifications } from '../features/notifications/notificationSlice';
import type { NotificationItem } from '../types';

const MAX_NOTIFICATIONS = 50;

const syncNotifications = (dispatch: ReturnType<typeof useAppDispatch>, items: NotificationItem[]) => {
  notificationService.saveNotifications(items);
  dispatch(setNotifications(items));
};

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.notifications.items);

  const addNotification = useCallback(
    (input: Pick<NotificationItem, 'title' | 'message' | 'type' | 'link'>) => {
      const nextNotification = notificationService.createNotification(input);
      const nextItems = [nextNotification, ...items].slice(0, MAX_NOTIFICATIONS);
      syncNotifications(dispatch, nextItems);
      return nextNotification;
    },
    [dispatch, items]
  );

  const markAsRead = useCallback(
    (id: string) => {
      const nextItems = items.map((item) => (item.id === id ? { ...item, read: true } : item));
      syncNotifications(dispatch, nextItems);
    },
    [dispatch, items]
  );

  const markAllRead = useCallback(() => {
    const nextItems = items.map((item) => ({ ...item, read: true }));
    syncNotifications(dispatch, nextItems);
  }, [dispatch, items]);

  const clearAll = useCallback(() => {
    notificationService.clearNotifications();
    dispatch(clearNotifications());
  }, [dispatch]);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  return {
    items,
    addNotification,
    markAsRead,
    markAllRead,
    clearAll,
    unreadCount,
  };
};
