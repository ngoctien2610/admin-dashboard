import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export interface RealtimeNotification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:3002', { transports: ['websocket'] });
    socket.on('notification', (notification: RealtimeNotification) => {
      setNotifications((current) => [notification, ...current].slice(0, 20));
    });
    return () => { socket.disconnect(); };
  }, []);

  return { notifications, clearNotifications: () => setNotifications([]) };
}
