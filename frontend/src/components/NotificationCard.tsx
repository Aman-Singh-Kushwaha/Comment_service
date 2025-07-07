'use client';

import { Notification } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';

interface NotificationCardProps {
  notification: Notification;
}

export const NotificationCard = ({ notification }: NotificationCardProps) => {
  const { markAsRead } = useNotification();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-2 rounded-lg cursor-pointer ${
        notification.isRead ? 'bg-secondary' : 'bg-primary/10'
      }`}
    >
      <p className="text-sm">
        <span className="font-bold">{notification.sender.username}</span> replied to your comment:
        <span className="italic"> "{notification.comment.content.substring(0, 50)}..."</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {new Date(notification.createdAt).toLocaleString()}
      </p>
    </div>
  );
};