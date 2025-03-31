import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, PixelRatio, Image } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '../constants/images';
import { useEffect } from 'react';
import { registerForPushNotifications, setUpNotificationListener } from '../notificationservice';
import { auth, db } from '../firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';
import styles from '../constants/styles';
import CustButton from './components/custbutton';

export default function App() {

  useEffect(() => {
    const checkLoggedIn = onAuthStateChanged(auth, (user) => {
      if (user){
        router.replace('/petprofiles');
      }
    });

    return () => checkLoggedIn(); 

  }, []);

  return (
    <SafeAreaView style={styles.onboardContainer}>
      <ScrollView contentContainerStyle={styles.onboardScroll}>

        <View style={styles.onboardContent}>

          <Image source={images.logo_text} style={styles.logo} resizeMode='contain'/>

          <Text style={styles.onboardHeader}>Welcome to Zoomies</Text>
          <Text style={styles.onboardSubtitle}>The All-In-one Pet Management App</Text>

          <CustButton
            title='Log In'
            handlePress={() => router.push('./login')}
          />

          <CustButton
            title='Register'
            handlePress={() => router.push('./register')}
            
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

