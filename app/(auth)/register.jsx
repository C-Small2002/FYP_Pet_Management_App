import { View, Text, ScrollView, Image, Switch, Alert } from 'react-native'
import React, {use, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import styles from '../../constants/styles'
import images from '../../constants/images'
import AuthField from '../components/authfield'
import CustButton from '../components/custbutton'
import { auth, createUserWithEmailAndPassword, db } from '../../firebaseconfig'
import { collection } from 'firebase/firestore'
import { addDoc, doc, setDoc } from 'firebase/firestore'

const Register = () => {

  const [form, setForm] = useState({ 
    firstname: '', 
    surname: '', 
    dob: '', 
    email: '', 
    password: '', 
    confirmPassword: ''
  });
  
  const [isPrimaryUser, setIsPrimaryUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const toggleUserType = () =>  setIsPrimaryUser((prevState => !prevState));

  const handleRegister = async () => {

    if(!form.firstname || !form.surname || !form.dob || !form.email || !form.password || !form.confirmPassword){
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
   
    if(form.password !== form.confirmPassword){
      Alert.alert('Error', 'Passwords do not match.')
    }

    setSubmitting(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      if (isPrimaryUser){
        const family = await addDoc(collection(db,'family'), {
          link: '', //empty for now as it needs to be generated by primary user - will be used to link secondary users to family
          puid: user.uid, //id of the primary user for the family
          pets: [], //empty for now - will be used to keep track of all pets that belong to a family.
          timestamp: new Date().toISOString() // will be updated when link generated to auto delete link after a certain amount of time
        }); //addDoc creates a doc and generates an auto-id for the doc

        familyId = family.id //gets the id of the family to be assigned to the user that created it

      }
      
      await setDoc(doc(db, 'user', user.uid), { //setDoc creates or overwrites a doc with a specific id - uid is being used here to ensure that multiple docs cant be made for a user
        firstname: form.firstname,
        surname: form.surname,
        email: form.email,
        primary: isPrimaryUser,
        fid: familyId, 
        dob: form.dob
      });

      Alert.alert('Success', 'Registration Successful!');
      router.push('./login');
    } 
    catch (error) {
      Alert.alert('Registration Failed', error.message);
    }

  }

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView>
        <View style={styles.loginContainer}>

        <Image
          source={images.logo_text}
          style={styles.logoText}
          resizeMode='contain'
        />

        <Text style={styles.header3}>Sign-Up to Zoomies</Text>

        <AuthField
          title= "First Name"
          placeholder= "First Name"
          handleTextChanged = {(event) => setForm({...form, firstname: event})}
        />

        <AuthField
          title= "Surname"
          placeholder= "Surname"
          handleTextChanged = {(event) => setForm({...form, surname: event})}
        />

        <AuthField
          title= "Date of Birth"
          placeholder= "Date of Birth"
          handleTextChanged = {(event) => setForm({...form, dob: event})}
        />

        <AuthField
          title="Email"
          placeholder = "Email"
          handleTextChanged = {(event) => setForm({...form, email: event})}
          keyboardType='email-address'
          autoCapitalize='none'
        />

        <AuthField
          title="Password"
          placeholder = "Password"
          handleTextChanged = {(event) => setForm({...form, password: event})}
        />

        <AuthField
          title="Confirm Password"
          placeholder = "Confirm Password"
          handleTextChanged = {(event) => setForm({...form, confirmPassword: event})}
        />

        <View style={styles.switchContainer}>

          <Text style={styles.header2}>
            {isPrimaryUser ? "Register as Primary User" : "Register as Secondary User"}
          </Text>

          <Switch
            trackColor={{false : '#3066be', true : '#4287f5'}}
            thumbColor={isPrimaryUser ? '#3066be' : '#4287f5'}
            value={isPrimaryUser}
            onValueChange={toggleUserType}
          />
        </View>

        <CustButton
          title='Register'
          handlePress={handleRegister}
          isLoading={submitting}
        />

        <CustButton
          title='Log In'
          handlePress={() => router.push('./login')}
          isLoading={submitting}
        />

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Register