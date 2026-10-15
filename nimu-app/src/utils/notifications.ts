import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo';

/**
 * Registers the device for push notifications and returns the Expo push token.
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  // Expo Go pe yeh kaam nahi karta, skip karo
  if (isExpoGo) return undefined;

  // Configure foreground notification handling
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }


  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
      if (!projectId) {
        console.warn('Project ID not found. Ensure app.json has an eas.projectId');
      }
      
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
    } catch (e) {
      token = `${e}`;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
