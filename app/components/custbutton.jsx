import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import styles from '../../constants/styles'

const CustButton = ({title, handlePress, isLoading, otherStyles}) => {
  return (
    <TouchableOpacity 
      style={[styles.buttonStyle, otherStyles]}
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