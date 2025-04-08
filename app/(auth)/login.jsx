import { View, Text, ScrollView, TextInput, Image } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustButton from '../components/custbutton'
import styles from '../../constants/styles'
import icons from '../../constants/icons'
import images from '../../constants/images'
import AuthField from '../components/authfield'
import { router } from 'expo-router'
import { db, signInWithEmailAndPassword, auth } from '../../firebaseconfig'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { Alert } from 'react-native'

const Login = () => {

  //State for the user input
  const [form, setForm] = useState({ email: '', password: '' })
  //State to manage loading
  const [submitting , setSubmitting] = useState(false)
  
  //Function to handle logging in
  const handleLogin = async () => {

    setSubmitting(true);

    try {
      //Signs in using firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password)
      const user = userCredential.user;
      console.log('User id ', user.uid); 
      //Gettting the users doc from friebase
      const userRef = doc(db, "user", user.uid);
      const userDoc = await getDoc(userRef);

      if(userDoc.exists()) {
        const userData = userDoc.data();
        console.log('UserDatat:' ,userData);
        Alert.alert('Login Successful', `Welcome ${userData.firstname}!`);
        router.replace('../../petprofiles'); //Using replace prevents user from navigating back to th elog in screen.
      }
      else {
        Alert.alert('Login Successful', `Welcome!`);
        router.replace('../../petprofiles');
      }

    }

    catch (error) {
      Alert.alert('Login Failed', error.message);
      setSubmitting(false);
    }
    
  }


  return (
    <SafeAreaView style={styles.background}>
      <ScrollView>
        <View style={styles.loginContainer}>
        
          <Image
            source={images.logo_text}
            resizeMode='contain'
            style={styles.logoText}
          />

          <Text style={styles.header3}>
            Log in to Zoomies
          </Text>

          <AuthField
            title = "Email"
            value = {form.email}
            placeholder='Email'
            handleTextChanged = {(event) => setForm({...form, email: event})}
            keyboardType='email-address'
            autoCapitalize='none'
          />

          <AuthField
            title = 'Password'
            value = {form.password}
            placeholder = 'Password'
            handleTextChanged={(event) => setForm({...form, password: event})}
            autoCapitalize='none'
          />

          <CustButton
            title='Log In'
            handlePress={handleLogin}
            isLoading={submitting}
          />

          <CustButton
            title='Register'
            handlePress={() => router.push('./register')}
            isLoading={submitting}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Login