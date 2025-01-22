import { Button, ScrollView, StyleSheet, Text, TextInput, View, Dimensions } from 'react-native'
import React, {useState} from 'react'
import axios from 'axios'
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../constants/styles';
import PetDropdown from '../components/petdropdown';

const PocketVet = () => {

  const petProfiles =[
    {label:'Darcy', value:'dog'},
    {label:'Tinky Winky', value:'cat'},
    {label:'Flopsie', value:'rabbit'}
  ];

  const [messages, setMessages] = useState([
    {text: 'Hi, what seems to be the issue with your pet?', from: 'pocketvet'}
  ]);

  const [input, setInput] = useState('');

  const sendMessage = async() =>{
    if (!input.trim()) return; //stops any empty messages from being sent

    //adds users messages to the message array -
    const usrMessage = {text: input, from: 'user'};
    setMessages((prevMessages =>[...prevMessages, usrMessage])); //prevMessages is the current messages - ...prevMessages copies all previous messages and the new user message is added to this - results in new array containing all
                                                                 
    try{ 

      response = await axios.post('http://10.10.21.29:5000/chat', {message: input}); //sends the message to the flask hosting the LLM
      console.log('Response Data',response.data)
      //adds messages from pocket vet to the messages array
      const pocketvetMessage = {text: response.data.response, from: 'pocketvet'};
      setMessages((prevMessages) => [...prevMessages, pocketvetMessage]);

    }
    catch(error){
      console.error('Error', error)

      //error message displayed in the event flask cant be reached
      const errorMessage = {text:'Unable to reach server', from: 'pocketvet'}
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } 
    finally{
      setInput('') //clears input box allowing for new messages
    }
  }

  
  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.defaultContainer}>
        <PetDropdown data={petProfiles} ></PetDropdown>

        <ScrollView style={styles.vetContainer} contentContainerStyle={styles.scrollContent}> 
          {messages.map((msg, index) => (
            <Text key={index} style={msg.from === 'user' ? styles.userText: styles.vetText}>
              {msg.text}
            </Text>
          ))}
        </ScrollView>

        
      </View>
      <View style={styles.inputView}>
          <TextInput 
            style={styles.input}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage} //submits when enter is pressed
            placeholder='Type Something...'
          />

        </View>
      </SafeAreaView>
  )
}

export default PocketVet
