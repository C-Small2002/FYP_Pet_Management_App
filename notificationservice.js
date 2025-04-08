import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false
    })
});

export const registerForPushNotifications = async () => {
    let token;

    if(Platform.OS === 'android'){
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default Channel',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0,250,250,250],
            lightColor: '#FF231F7C'
        });
    }

    const {status: existingStatus} = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if(existingStatus !== 'granted'){
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status
    }

    if(finalStatus !== 'granted'){
        Alert.alert('Push Notifications are disabled. Please enable them in your settings.');
        return null;
    }

    try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);
    } 
    catch (error) {
        console.error('Error getting push token', error);
    }

    return token;

};

export const scheduleReminder = async (title, message, reminderDate) => {
    
    try {

        const triggerTime = new Date(reminderDate);

        if(triggerTime <= new Date()){
            console.warn('Attempted to schedule a reminder in the past. Skipping.');
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: message,
                sound: true
            },
            trigger: {date: triggerTime},
        });

        console.log('Scheduled Reminder:', title, 'at', triggerTime);

    } 
    catch (error) {
        console.error('Error Scheduling Reminder:',error);
    }
    
};

export const setUpNotificationListener = () => {
    Notifications.addNotificationReceivedListener(notification => {
        console.log("Received ", notification);
    });

    Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Interacted with Notification", response);
    });

};


