import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const VetLocator = () => {
  return (
    <View style={styles.container}>
      <Text>VetLocator</Text>
    </View>
  )
}

export default VetLocator

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',    
	}
})