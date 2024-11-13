import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, {useState} from 'react'
import axios from 'axios'

const PocketVet = () => {

  const [messages, setMessages] = useState([
    {text: 'Hi, what seems to be the issue with your pet?', from: 'pocketvet'}
  ]);

  const [input, setInput] = useState('');

  const sendMessage = async() =>{
    if (!input.trim()) return; //stops any empty messages from being sent

    const usrMessage = {text: input, from: 'user'};
    setMessages((prevMessages =>[...prevMessages, usrMessage]));

    try{ 

      response = await axios.post('http://10.156.17.45:5000/chat', {message: input}); //sends the message to the flask hosting the LLM
      console.log('Response Data',response.data)

      const pocketvetMessage = {text: response.data.response, from: 'pocketvet'};
      setMessages((prevMessages) => [...prevMessages, pocketvetMessage]);

    }
    catch(error){
      console.error('Error', error)

      const errorMessage = {text:'Unable to reach server', from: 'pocketvet'}
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } 
    finally{
      setInput('') //clears input box allowing for new messages
    }
  }

  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}> 
        {messages.map((msg, index) => (
          <Text key={index} style={msg.from === 'user' ? styles.userText: styles.vetText}>
            {msg.text}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.inputView}>
        <TextInput 
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder='Type Something...'
        />

        <Button title="submit" onPress={sendMessage}/>
      </View>

    </View>
  )
}

export default PocketVet

const styles = StyleSheet.create({
  container:{
    flex:1,
  },

  scrollContainer:{
    flex:1,
    padding:10
  },

  scrollContent:{
    justifyContent:'flex-end'
  },

  userText:{
    textAlign:'right',
    padding: 10,
    marginVertical: 5,
    backgroundColor:'#3066be',
    alignSelf: 'flex-end',
    borderRadius: 10,
    maxWidth:'75%'
  },

  vetText: {
    textAlign: 'left',
    padding: 10,
    marginVertical: 5,
    backgroundColor:'#fbfff1',
    alignSelf: 'flex-start',
    borderRadius: 10,
    maxWidth:'75%'
  },

  inputView:{
    flexDirection:'row',
    alignItems:'center',
    padding:10,
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },

  input:{
    flex:1,
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10
  }
});