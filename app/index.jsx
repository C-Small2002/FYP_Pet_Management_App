import { ScrollView, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '../constants/images';
import { useEffect } from 'react';
import { auth, db } from '../firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';
import styles from '../constants/styles';
import CustButton from './components/custbutton';

export default function App() {

  //Runs when page loads
  useEffect(() => {
    //Checking if user has a saved login session on the device
    const checkLoggedIn = onAuthStateChanged(auth, (user) => {
      //If they do bring them straight to the petprofiles page
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
            handlePress={() => router.replace('./login')}
          />

          <CustButton
            title='Register'
            handlePress={() => router.replace('./register')}
            
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

