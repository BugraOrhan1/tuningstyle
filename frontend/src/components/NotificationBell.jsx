import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check } from 'lucide-react';
import { notificationsApi } from '../api/client';
import {
  Popover, PopoverContent, PopoverTrigger,
} from './ui/popover';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const { notifications, refreshNotifications, user } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    await notificationsApi.readAll();
    await refreshNotifications();
  };

  const handleClick = (n) => {
    setOpen(false);
    if (n.fileId) {
      navigate(user?.is_admin ? `/admin/files/${n.fileId}` : `/files/${n.fileId}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded hover:bg-gray-100">
          <Bell className="w-5 h-5 text-fct-dark" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-fct-orange text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-fct-orange hover:underline flex items-center gap-1">
              <Check className="w-3 h-3" />Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <div className="p-6 text-center text-sm text-fct-muted">No notifications</div>
          )}
          {notifications.map(n => (
            <button key={n.id} onClick={() => handleClick(n)} className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!n.read ? 'bg-orange-50/40' : ''}`}>
              <div className="flex items-start gap-2">
                {!n.read && <div className="w-2 h-2 rounded-full bg-fct-orange mt-1.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-fct-dark">{n.title}</div>
                  {n.body && <div className="text-xs text-fct-muted truncate">{n.body}</div>}
                  <div className="text-[10px] text-fct-muted mt-0.5">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
