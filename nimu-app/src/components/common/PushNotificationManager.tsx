import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../services/api';
import Constants from 'expo-constants';

// Expo Go mein push notifications SDK 53 se support nahi hote
const isExpoGo = Constants.appOwnership === 'expo';

export default function PushNotificationManager() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const responseListenerRef = useRef<any>(null);

  useEffect(() => {
    // Expo Go mein poora push notification system skip karo
    if (isExpoGo) {
      return;
    }

    // Dynamically import karo taaki Expo Go pe module load hi na ho
    const setupNotifications = async () => {
      const Notifications = await import('expo-notifications');
      const { registerForPushNotificationsAsync } = await import('../../utils/notifications');

      if (isAuthenticated) {
        const token = await registerForPushNotificationsAsync();
        if (token && api) {
          api.post('/user/push-token', { pushToken: token })
            .catch((err: any) => console.log('Error saving push token:', err));
        }
      }

      // Notification tap listener
      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        if (data && typeof data.url === 'string') {
          router.push(data.url as any);
        }
      });
    };

    setupNotifications();

    return () => {
      if (responseListenerRef.current) {
        import('expo-notifications').then(Notifications => {
          Notifications.removeNotificationSubscription(responseListenerRef.current);
        });
      }
    };
  }, [isAuthenticated, router]);

  return null;
}
