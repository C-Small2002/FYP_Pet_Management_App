import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, Modal, Switch, Pressable, Platform, TextInput, Alert } from 'react-native'
import React, {useEffect, useRef, useState} from 'react'
import styles from '../../constants/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '../../constants/icons'
import FloatingActionButton from '../components/floatingactionbutton'
import CustButton from '../components/custbutton'
import AuthField from '../components/authfield'
import { auth, db } from '../../firebaseconfig'
import { addDoc, collection, deleteDoc, onSnapshot, query, where , doc, getDoc, updateDoc, foreach, Timestamp} from 'firebase/firestore'
import { RadioGroup } from 'react-native-radio-buttons-group'
import RNDateTimePicker from '@react-native-community/datetimepicker'
import { scheduleReminder } from '../../notificationservice'


const Reminders = () => {

  const[reminders,setReminders] =useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', recurrence: ''});
  const [recurring, setRecurring] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [radioButtons, setRadioButtons] = useState([
    {id: 'Daily', label: 'Daily', value: 'Daily', color: '#3066be'},
    {id: 'Weekly', label: 'Weekly', value: 'Weekly', color: '#3066be'},
    {id: 'Monthly', label: 'Monthly', value: 'Monthly', color: '#3066be'},
    {id: 'Yearly', label: 'Yearly', value: 'Yearly', color: '#3066be'},
  ])

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const toggleTimePicker = () => {
    setShowTimePicker(!showTimePicker)
  }

  const onDatePickerChange = (event, selectedDate) => {
    
    const currentDate = selectedDate || date; //if no date is selected will default back to currently stored date
    setDate(currentDate);
    setForm((prev) => ({...prev, date: currentDate.toDateString()}));
    toggleDatePicker();
    
  };

  const onTimePickerChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setTime(currentTime);
    setForm((prev) => ({...prev, time: currentTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}));
    toggleTimePicker();
  }

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        
        const user = auth.currentUser;
  
        if(!user){
          throw new Error('No User Logged in');
        }
  
        const userDoc = await getDoc(doc(db, 'user', user.uid));
  
          if(!userDoc.exists()){
            throw new Error('No doc found');
          }
  
          const familyId = userDoc.data().fid;
  
          if (!familyId) {
            throw new Error('User is not linked to a family');
          }
  
          const remindersCollection = collection(db,'reminders');
          const remindersQuery = query(remindersCollection,where('fid','==',familyId));7
          const getAllReminders = onSnapshot(remindersQuery, (snapshot) =>{
            const remindersList = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
            setReminders(remindersList);
            console.log(remindersList);

            //Schedule local notification - will work for when app is open - need to set up cloud function for when app is killed
            remindersList.forEach((reminder) =>{
              if (!reminder.done) {
                const reminderDateTime = reminder.reminderDateTime.toDate();
                console.log(reminderDateTime);
                if (reminderDateTime > new Date()){
                  scheduleReminder(reminder.title, `Reminder set for ${reminder.time}`, reminderDateTime);
                }
              }
            });

          });


          return () => getAllReminders();
      } 
      catch (error) {
        throw new Error('Error fetching reminders', error.message);
      }
    };
    fetchReminders();
  }, []);
  
  
  const handleMarkComplete = async (id) => {

    try {
      const user = auth.currentUser;

      if(!user){
        throw new Error("No user is logged in");
      }

      const reminder = doc(db, 'reminders', id);
      await updateDoc(reminder, {
        done : true,
        completedBy : user.uid
      });
      setReminders((prev) =>
        prev.map((item) => (item.id === id ? {...item, done:true, completedBy:user.uid}: item))
      );

    } 
    catch (error) {
      console.error('Error Marking complete: ',error);
    }

  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'reminders',id));
    } 
    catch (error) {
      throw new Error('Unable to delete Reminder', error.message);
    }
  }

  const handleAddReminders = async () => {

    try {

      if (form.title && form.date && form.time){

        const user = auth.currentUser;
        if (!user) {
          throw new Error("No user logged in");
        }
        
        const userDoc = await getDoc(doc(db, 'user', user.uid));
        
        if(!userDoc.exists()){
          throw new Error('No doc found');
        }
        
        const familyId = userDoc.data().fid;
        
        if (!familyId) {                  
          throw new Error('User is not linked to a family');
        }

        //selectedDate, selectedTime and reminderDateTime intend to solve issue where date being passed into schedule was NaN value
        //These allow it to be formatted in the way expected by expo notifications
        const selectedDate = new Date(date);
        const selectedTime = new Date(time);

        //Formats into ISO time with the 0,0 being the seconds
        const reminderDateTime = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          0,
          0
        );

        if(reminderDateTime <= new Date()){
          Alert.alert("Cancelling Reminder", "Reminder Time Must Be In The Future");
          return;
        }


      
        await addDoc(collection(db,'reminders'), {
          fid: familyId,
          title: form.title,
          date: form.date, //For UI display purposes
          time: form.time, //For UI display purposes
          reminderDateTime: Timestamp.fromDate(reminderDateTime), //For scheduling
          recurring: recurring,
          recurrence: recurring ?  form.recurrence : null,
          done: false,
          notified: false,
        });
  
        setForm({title: '', date: '', time: '', recurrence: ''});
        setIsModalVisible(false);
  
      }  
    } catch (error) {
      throw new Error('Error adding reminder', error.message);
    }
  
  }

  const toggleRecurring = () => {
    setRecurring((prevState => !prevState));
    if(!recurring){
      setForm((prev) => ({...prev, recurrence: 'Daily'})); //Defaults to daily when enabled
    }
    else{
      setForm((prev) => ({...prev, recurrence: ''})); //Clear when disabled
    }
  }

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.defaultContainer}>
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={({item})=>( 
            <View style={styles.reminderItem}>

              <View style={styles.reminderTextContainer}>
                <Text style={styles.reminderText}>{item.title}</Text>
                <Text style={styles.reminderTime}>{item.date} at {item.time}</Text>
                <Text style={styles.reminderTime}>{item.recurring ? `Recurs:  ${item.recurrence}`: "Recurs: One-Time Use"}</Text>
              </View>
              

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
          ListEmptyComponent={<View style={styles.tempStyle}><Text>No Reminders Yet!</Text></View>} 
        />

        <FloatingActionButton
          icon={icons.plus}
          onPress={() => setIsModalVisible(true)}
          position='fabBottomRight'
          size='fabMedium'
        />

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType='fade'
          onRequestClose={() => setIsModalVisible(false)}
        >

          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.header}>Add Reminder</Text>

              <AuthField
                title='Title'
                placeholder='Title'
                value={form.title}
                handleTextChanged={(value) => setForm((prev) => ({...prev, title:value}))}
              />

              {!showDatePicker && (
                <Pressable
                  onPress={toggleDatePicker}
                  style={styles.authFieldSpacing}
                >
                  <Text style={styles.header2}>Date</Text>
                  <View style={styles.formContainer}>
                    <TextInput
                      style={styles.formInput}
                      placeholder='Date'
                      value={form.date}
                      editable={false}
                      onPressIn={toggleDatePicker}
                    />
                  </View>
                </Pressable>
              )}

              {!showTimePicker && (
                <Pressable
                  onPress={toggleTimePicker}
                  style={styles.authFieldSpacing}
                >
                  <Text style={styles.header2}>Time</Text>
                  <View style={styles.formContainer}>
                    <TextInput
                      style={styles.formInput}
                      placeholder='Time'
                      value={form.time}
                      editable={false}
                      onPressIn={toggleTimePicker}
                    />
                  </View>
                </Pressable>
              )}
              

              {showDatePicker && (
                <RNDateTimePicker
                  mode='date'
                  display='spinner'
                  value={date}
                  onChange={onDatePickerChange}
                />
              )}

              {showTimePicker && (
                <RNDateTimePicker
                  mode='time'
                  display='spinner'
                  value={time}
                  onChange={onTimePickerChange}
                />
              )}

              <View style={styles.switchContainer}>
              
                <Text style={styles.header2}>
                  {recurring ? "Set Reccuring" : "Set One time"}
                </Text>
              
                <Switch
                  trackColor={{false : '#3066be', true : '#4287f5'}}
                  thumbColor={recurring ? '#3066be' : '#4287f5'}
                  value={recurring}
                  onValueChange={toggleRecurring}
                />
              </View>

              {recurring && (
                <RadioGroup
                  radioButtons={radioButtons}
                  onPress={(selectedId) => setForm((prev) => ({...prev, recurrence: selectedId}))}
                  selectedId={form.recurrence}
                  containerStyle={styles.radioGroupContainer}
                  labelStyle={styles.radioLabel}
                />
              )}

              <CustButton
                title='Add'
                handlePress={handleAddReminders}
              />
              
              <CustButton
                title='Cancel'
                handlePress={() => setIsModalVisible(false)}
              />

            </View>
          </View>

        </Modal>
        <View style={styles.fabBuffer}/>
      </View>
    </SafeAreaView>
  )
}

export default Reminders

