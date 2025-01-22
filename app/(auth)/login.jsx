import { View, Text, ScrollView, TextInput, Image } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustButton from '../components/custbutton'
import styles from '../../constants/styles'
import icons from '../../constants/icons'
import images from '../../constants/images'
import AuthField from '../components/authfield'

const Login = () => {

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

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
          />

          <CustButton
            title='Register'
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Login