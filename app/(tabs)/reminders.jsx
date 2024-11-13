import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Reminders = () => {
  return (
    <View style={styles.container}>
      <Text>Reminders</Text>
    </View>
  )
}

export default Reminders

const styles = StyleSheet.create({
	container:{
    flex:1,
    justifyContent: 'center',
	  alignItems: 'center',    
  }
})