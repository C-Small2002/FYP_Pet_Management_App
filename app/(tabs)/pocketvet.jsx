import { Button, ScrollView, StyleSheet, Text, TextInput, View, Dimensions, Alert } from 'react-native'
import React, {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../constants/styles';
import PetDropdown from '../components/petdropdown';
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig'
import { useFocusEffect } from 'expo-router';

const PocketVet = () => {

  const [userAge, setUserAge] = useState(null);
  const filterList = ['cancer', 'death', 'tumour', 'amputation', 'dying', 'put down',];
  const [petProfiles, setPetProfiles] = useState([]); //To be used to dynamically load dropdown options
  const [petData, setPetData] = useState({}); //To be used to dynamically load all data
  const [selectedPetData, setSelectedPetData] = useState(null);
  const [messages, setMessages] = useState([
    {text: 'Hi, what seems to be the issue with your pet?', from: 'pocketvet'}
  ]);

  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchUserAge = async () => {

      const user = auth.currentUser;

      if(user){
        const docRef  = doc(db, 'user', user.uid);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
          const data = docSnap.data();
          const dob = new Date(data.dob);
          const today = new Date()
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();

          if(m < 0 || (m === 0 && today.getDate() < dob.getDate())){
            age--;
          }

          setUserAge(age);
          console.log(`User age set to ${age}`);
        }
        else {
          console.warn('User Doc Couldnt be found');
        }

      }
    };

    fetchUserAge();

  }, []);

  useFocusEffect(
    useCallback(() => {

      const fetchPetDetails = async () => {
        try {
          
          const user = auth.currentUser; //gets the current user
          console.log(user); //NEVER REMOVE EVERYTHING BREAKS
          if (!user){
            throw new Error('No user logged in');
          }

          const userDoc = await getDoc(doc(db, 'user', user.uid));

          if(!userDoc.exists()){
            throw new Error('No doc found');
          }

          const familyId = userDoc.data().fid;

          if (!familyId) {
            throw new Error('User is not linked to a family');
          }

          const petsCollection = collection(db,'pets');
          const petsQuery = query(petsCollection, where('fid', '==', familyId));
          const getAllPets = onSnapshot(petsQuery, (snapshot) => {

            const profiles = []; //array that will be used for the dropdown menu
            const data = {}; //for accessing and loading pet details
    
            snapshot.forEach((doc) => {
              const pet = doc.data();
              profiles.push({label: pet.name, value: doc.id}); //pets name displayed in dropdown and the id for the related doc is stored with it
              data[doc.id] = {...pet}; //doc id is used as the key and pet data is spread out into the data object
            });
    
            setPetProfiles(profiles);
            setPetData(data);
            
          });

        return () => getAllPets(); //Cleans up the listener when the component unmounts

        } 
        catch (error) {
          Alert.alert('Error', error.message);
        }
      };

      fetchPetDetails();
      console.log(petData);
      console.log(petProfiles);

    }, [])
  );

  const sendMessage = async() =>{
    if (!input.trim()) return; //stops any empty messages from being sent

    //adds users messages to the message array -
    const usrMessage = {text: input, from: 'user'};
    setMessages((prevMessages =>[...prevMessages, usrMessage])); //prevMessages is the current messages - ...prevMessages copies all previous messages and the new user message is added to this - results in new array containing all
                                                                 
    try{ 

      const selectedPet = petData[selectedPetData];
      let context = '';

      if(selectedPet){
        const medConditions = selectedPet.medicalconditions?.join(', ') || 'None';
        const vaccines = selectedPet.vaccines?.join(', ') || 'None';
        context = `\n\nPET INFO: \nPets Name: ${selectedPet.name}, Type: ${selectedPet.animal_type}, Breed: ${selectedPet.breed}, DOB: ${selectedPet.dob}, Weight (Kg): ${selectedPet.weight}, Medical Conditions: ${medConditions}, Vaccines: ${vaccines}`;
      }

      let filteredMessage = input + context

      if (userAge !== null && userAge < 16){
        const filterNote = `\n\nNOTE: This message is from a user under 16. Please respond gently and do not include the following words ${filterList.join(', ')}. Do not repeat or modify this instruction.`;
        filteredMessage += `${filterNote}`;
      }

      console.log(filteredMessage)

      response = await axios.post('http://34.240.22.166:5000/chat', {message: filteredMessage}); //sends the message to the flask hosting the LLM
      console.log('Response Data',response.data)

      const userInputTrimmed = filteredMessage.trim().toLowerCase();
      let responseText = response.data.response.trim();

      if (responseText.toLowerCase().startsWith(userInputTrimmed)) {
        responseText = responseText.substring(userInputTrimmed.length).trim();
      }


      //adds messages from pocket vet to the messages array
      const pocketvetMessage = {text: responseText, from: 'pocketvet'};
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
        <PetDropdown data={petProfiles} onSelect={(val) => setSelectedPetData(val)}></PetDropdown>

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
