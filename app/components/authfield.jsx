import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import React, {useState} from 'react'
import styles from '../../constants/styles'
import icons from '../../constants/icons'

//Custom Input Field for login and register pages to ensure consistency across iOS and Android
//...props covers any other values passed into AuthField
const AuthField = ({title, value, placeholder, handleTextChanged, otherstyles, ...props}) => {

  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={[styles.authFieldSpacing, otherstyles]}>

      <Text style={styles.header2}>{title}</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.formInput}
          value={value}
          placeholder={placeholder}
          onChangeText={handleTextChanged}
          secureTextEntry={(title === "Password" || title === "Confirm Password")&& !showPassword}
          {...props}
          editable={title === "Date" ? false : true}
        />

        {(title === "Password" || title === "Confirm Password") && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} testID="toggle-password">
            <Image
              source={!showPassword ? icons.eye : icons.eye_hidden}
              style={styles.formIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        {(title === "Medical Condition" || title === "Vaccine") && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} testID='delete-icon'>
            <Image
              source={icons.bin}
              style={styles.formIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

      </View>

     

    </View>
  )
}

export default AuthField