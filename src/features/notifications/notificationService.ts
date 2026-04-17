import type { NotificationItem } from '../../types';
import { logger } from '../../utils/logger';

const STORAGE_KEY = 'shopapp-notifications';

const safelyParseNotifications = (raw: string | null): NotificationItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as NotificationItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string') : [];
  } catch (error) {
    logger.warn('Failed to parse notifications', { error });
    return [];
  }
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export type NotificationInput = Pick<NotificationItem, 'title' | 'message' | 'type' | 'link'>;

const generateId = () =>
  typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const notificationService = {
  getNotifications(): NotificationItem[] {
    if (!canUseStorage()) return [];
    return safelyParseNotifications(window.localStorage.getItem(STORAGE_KEY));
  },

  saveNotifications(items: NotificationItem[]): void {
    if (!canUseStorage()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  clearNotifications(): void {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },

  createNotification(input: NotificationInput): NotificationItem {
    return {
      id: generateId(),
      title: input.title,
      message: input.message,
      type: input.type ?? 'system',
      link: input.link,
      createdAt: new Date().toISOString(),
      read: false,
    };
  },
};
