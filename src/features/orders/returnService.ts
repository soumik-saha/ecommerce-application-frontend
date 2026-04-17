import type { ReturnRequest } from '../../types';
import { logger } from '../../utils/logger';

const STORAGE_KEY = 'shopapp-return-requests';

type ReturnStore = Record<string, ReturnRequest>;

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safelyParseReturns = (raw: string | null): ReturnStore => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ReturnStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    logger.warn('Failed to parse return requests', { error });
    return {};
  }
};

const saveStore = (store: ReturnStore) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const returnService = {
  getReturnRequests(): ReturnStore {
    if (!canUseStorage()) return {};
    return safelyParseReturns(window.localStorage.getItem(STORAGE_KEY));
  },

  getReturnRequest(orderId: number): ReturnRequest | undefined {
    if (!canUseStorage()) return undefined;
    const store = safelyParseReturns(window.localStorage.getItem(STORAGE_KEY));
    return store[orderId];
  },

  saveReturnRequest(orderId: number, data: Omit<ReturnRequest, 'orderId'>): ReturnRequest {
    const store = this.getReturnRequests();
    const nextRequest: ReturnRequest = {
      orderId,
      ...data,
    };
    store[orderId] = nextRequest;
    saveStore(store);
    return nextRequest;
  },
};
