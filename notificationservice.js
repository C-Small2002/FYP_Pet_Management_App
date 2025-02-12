import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false
    })
});

export const registerForPushNotifications = async () => {
    const {status} = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('You need to enable push notifications in your settings');
        return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
};

export const scheduleReminder = async (title, message, reminderDate) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: message,
            sound: true
        }
    })
};
