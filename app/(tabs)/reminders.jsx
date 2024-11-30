import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React, {useState} from 'react'
import styles from '../../constants/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '../../constants/icons'

const Reminders = () => {

  const[reminders,setReminders] =useState([
    {
      id:1,
      title:'Feed Tinky Winky',
      date: '2024/11/21',
      time: '08:00 AM'
    },
    {
      id:2,
      title:' Walk Darcy',
      date: '2024/11/21',
      time: '05:30 pM'
    },
    {
      id:3,
      title:'Bring Flopsie to the vet',
      date: '2024/11/27',
      time: '03:00 pM'
    }
  ]);
  
  const handleMarkComplete = (id) => {
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? {...item, done:true}: item))
    )
  };

  const handleDelete = (id) => {
    setReminders((prev) => prev.filter((item) => item.id !== id))
  }
  return (
    <SafeAreaView style={styles.defaultContainer}>
      <FlatList
        data={reminders}
        keyExtractor={(items) => {items.id}}
        renderItem={({item})=>( 
          <View style={styles.reminderItem}>

            <Text style={styles.reminderText}>{item.title}</Text>
            <Text style={styles.reminderTime}>{item.date} at {item.time}</Text>

            <View style={styles.iconView}>
              
              <TouchableOpacity onPress={() => handleMarkComplete(item.id)}>
                <Image 
                  source={icons.circle_check} 
                  style={[styles.icon, {tintColor: item.done ? 'green' : 'gray'}]} 
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Image
                  source={icons.bin}
                  style = {styles.icon}
                />
              </TouchableOpacity>

            </View>

          </View>
        )}
        ListEmptyComponent={<Text>No Reminders Yet!</Text>} 
      />
    </SafeAreaView>
  )
}

export default Reminders

