import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import styles from '../../constants/styles'

const CustButton = ({title, handlePress, isLoading}) => {

  const isLogout = title === 'Log Out';

  return (
    <TouchableOpacity 
      style={[isLogout ? styles.buttonStyleLogout : styles.buttonStyle]}
      onPress={handlePress}
    >
      <Text style={styles.buttonText}>{title}</Text>

      {isLoading && (
        <ActivityIndicator
          animating = {isLoading}
          size="small"
        />
      )}
    </TouchableOpacity>
  )
}

export default CustButton