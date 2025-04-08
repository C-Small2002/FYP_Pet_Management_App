import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import styles from '../../constants/styles'

const CustButton = ({title, handlePress, isLoading}) => {

  const isLogout = title === 'Log Out';
  const isDelete = title === 'Delete Pet';

  return (
    <TouchableOpacity 
      testID='cust-button'
      style={[isLogout || isDelete ? styles.buttonStyleLogout : styles.buttonStyle]}
      onPress={handlePress}
    >
      <Text style={styles.buttonText}>{title}</Text>

      {isLoading && (
        <ActivityIndicator
          testID="activity-indicator"
          animating = {isLoading}
          size="small"
        />
      )}
    </TouchableOpacity>
  )
}

export default CustButton