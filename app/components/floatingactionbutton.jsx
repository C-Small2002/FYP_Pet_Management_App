import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import styles from '../../constants/styles'

const FloatingActionButton = ({onPress, icon, position, size}) => {
  return (
    <TouchableOpacity
        onPress={onPress}
        style={[
          styles.fab,
          styles[position],
          styles[size]
        ]}
    >
        <Image 
          source = {icon}
          style={styles.fabIcon}
        />
    </TouchableOpacity>
  )
}

export default FloatingActionButton