import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import React from 'react'

const RootLayout = () => {
  return (
    <Stack> //Creates a stack of screens allowing the user to navigate forward and backwards by pushing and popping screens on and off the stack
        <Stack.Screen name="index" options={{headerShown: false}}/> //
    </Stack>
  )
}

export default RootLayout
