import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, {useEffect, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../../constants/styles'
import { auth, db } from '../../firebaseconfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

const generateHex = (length = 12) => {

  const chars = '0123456789ABCDEF';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;

};

const Profile = () => {

  const [userData, setUserData] = useState(null);
  const [generatedLink, setGenerateLink] = useState('');

  useEffect( () =>{
    const fetchUserData = async () => {

      try {

        const user = auth.currentUser;

        if(!user){
          throw new Error('No User Logged In');
        }

        const userDoc = await getDoc(doc(db, 'user', user.uid));

        if(!userDoc.exists()){
          throw new Error('No doc found');
        }

        const data = userDoc.data();

        const dob = data.dob ? new Date(data.dob) : null;
        const age = dob ? new Date().getFullYear() - dob.getFullYear() : 'Unknown';

        setUserData({...data, age});
        
      } 
      catch (error) {
        
        Alert.alert('Error', error.message);

      }

    };

    fetchUserData();

  }, []);


  return (
    <View style={styles.tempStyle}>
      <Text>Profile</Text>
    </View>
  )
}

export default Profile

