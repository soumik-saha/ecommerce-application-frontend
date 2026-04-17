import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, markAsRead, markAllRead, clearAll } = useNotifications();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Bell size={64} className="mx-auto text-blue-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">No notifications yet</h1>
        <p className="mt-2 text-gray-500">Updates about orders, returns, and reviews will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay on top of your latest updates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Mark all as read
          </button>
          <button
            onClick={clearAll}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-xl border p-4 shadow-sm ${
              notification.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-900">{notification.title}</h2>
                  {!notification.read && (
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}
                {notification.link && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      markAsRead(notification.id);
                      navigate(notification.link ?? '/');
                    }}
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
