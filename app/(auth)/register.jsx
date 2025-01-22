import { View, Text, ScrollView, Image, Switch } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../../constants/styles'
import images from '../../constants/images'
import AuthField from '../components/authfield'
import CustButton from '../components/custbutton'

const Register = () => {

  const [isPrimaryUser, setIsPrimaryUser] = useState(true);

  const toggleUserType = () =>  setIsPrimaryUser((prevState => !prevState));

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
          title= "Name"
          placeholder= "Name"
        />

        <AuthField
          title="Email"
          placeholder = "Email"
        />

        <AuthField
          title="Password"
          placeholder = "Password"
        />

        <AuthField
          title="Confirm Password"
          placeholder = "Confirm Password"
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
        />

        <CustButton
          title='Log In'
        />

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Register