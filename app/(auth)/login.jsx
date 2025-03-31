import { View, Text, ScrollView, TextInput, Image } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustButton from '../components/custbutton'
import styles from '../../constants/styles'
import icons from '../../constants/icons'
import images from '../../constants/images'
import AuthField from '../components/authfield'
import { Link, router } from 'expo-router'
import { db, signInWithEmailAndPassword, auth } from '../../firebaseconfig'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { Alert } from 'react-native'

const Login = () => {

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting , setSubmitting] = useState(false)
  
  const handleLogin = async () => {

    setSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password)
      const user = userCredential.user;
      console.log('User id ', user.uid); //for some reason this allows it to read to uid properly ?????
      const userRef = doc(db, "user", user.uid);
      const userDoc = await getDoc(userRef);

      if(userDoc.exists()) {
        const userData = userDoc.data();
        console.log('UserDatat:' ,userData);
        Alert.alert('Login Successful', `Welcome ${userData.firstname}!`);
        router.replace('../../petprofiles');
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