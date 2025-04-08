import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, {useEffect, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../../constants/styles'
import { auth, db, signOut } from '../../firebaseconfig'
import { collection, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore'
import AuthField from '../components/authfield'
import CustButton from '../components/custbutton'
import { router } from 'expo-router'

//Creates a random 12 char long hex string to use as a link for the family
const generateHex = (length = 12) => {

  const chars = '0123456789ABCDEF';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;

};

const handleLogout = async () => {

  try {
    const user = auth.currentUser;

    //Removing pushtoken for user when logging out to prevent issue where multiple users have the same pushtokens 
    // as they all last logged in on the same device
    if (user) {
      const userDoc = doc(db, 'user', user.uid);
      await updateDoc(userDoc, {
        pushToken: null
      });
    }

    await signOut(auth);
    router.replace('/'); //Brings user back to onboarding screen
    
  } 
  catch (error) {
    Alert.alert('Logout Failed', error.message);
  }

};

const Profile = () => {

  const [userData, setUserData] = useState(null);
  //State for the generated hex link
  const [hexLink, setHexLink] = useState('');
  //State for secondary user to input the hex link into
  const [joinHexInput, setJoinHexInput] = useState('');

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

        let age = 'Unknown';
        //Calculates the users age from their DOB
        if(data.dob){
          const dob = new Date(data.dob)
          const today = new Date();
          age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();

          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())){
            age--;
          }
        }

        setUserData({...data, age});
        //if the users a primary user and they have a family ID, fetch the stored hex link
        if(data.primary && data.fid) {
          const familyDoc = await getDoc(doc(db, 'family', data.fid));
          if(familyDoc.exists()) {
            setHexLink(familyDoc.data().link);
          }
        }
        
      } 
      catch (error) {
        
        Alert.alert('Error', error.message);

      }

    };

    fetchUserData();

  }, []);

  //Takes the first letter of the users first and second name for creating their profile icon
  const getInitials = (first = '', last = '') => {
    const firstInitial = first?.charAt(0)?.toUpperCase() || ''
    const lastInitial = last?.charAt(0)?.toUpperCase() || ''
    return `${firstInitial}${lastInitial}`;
  }

  const handleGenerateHexLink = async () => {

    try {
      //Ensures the link can only be generated if the users a primary user, they're linked to a family, and they have some data
      if (!userData || !userData.primary || !userData.fid) {

        Alert.alert('Error', 'Only Primary users can generate a hex link.');
        return;
      }

      const newHex = generateHex(12); //Generate a 12-char long hex string
      await updateDoc(doc(db, 'family', userData.fid), {
        link: newHex
      });

      setHexLink(newHex);
      
      

    } 
    catch (error) {
      Alert.alert('Error', error.message);
    }

  };

  const handleSubmitHexLink = async () => {

    try {
      
      if (!joinHexInput.trim()) {
        Alert.alert('Invalid Entry', 'Please enter a valid hex link.');
        return;
      }

      //Searching for a family with the passed link
      const familyRef = collection(db, 'family');
      const familyQuery = query(familyRef, where('link', '==', joinHexInput.trim()));
      const querySnapshot = await getDocs(familyQuery);

      if (querySnapshot.empty) {
        Alert.alert('Invalid Hex Link', 'No family found with this link');
        return;
      }

      const familyDoc = querySnapshot.docs[0];
      const familyId = familyDoc.id;
      //Updates the users doc to now have that family id
      await updateDoc(doc(db, 'user', auth.currentUser.uid), {
        fid: familyId
      });

      setUserData((prev) => ({...prev, fid: familyId}));
      Alert.alert('Success', 'You have successfully linked to your family!');

    } 
    catch (error) {
      Alert.alert('Error', error.message);
    }

  };


  return (
    <SafeAreaView style={styles.defaultContainer}>
      <ScrollView>
        <View style={styles.profileContainer}>

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userData ? getInitials(userData.firstname, userData.surname) : ''}
              </Text>
            </View>

            <Text style={styles.profileName}>
              {userData?.firstname + ' ' + userData?.surname || ''}
            </Text>
          </View>

          <Text style={styles.header}>User Details</Text>

          <View style={styles.displayRow}>
            <Text style={styles.label}>Date of Birth: </Text>
            <Text style={styles.value}>{userData?.dob || 'N/A'}</Text>
          </View>

          <View style={styles.displayRow}>
            <Text style={styles.label}>Age: </Text>
            <Text style={styles.value}>{userData?.age || 'N/A'}</Text>
          </View>

          <View style={styles.displayRow}>
            <Text style={styles.label}>Primary User: </Text>
            <Text style={styles.value}>{userData?.primary ? 'Yes' : 'No'}</Text>
          </View>

          {/*If this is the primary user, show the link and give option to generate one */}
          {userData?.primary ? (
            <View>

              {hexLink ? (
                <View style={styles.displayRow}>
                  <Text style={styles.label}>Family Link: </Text>
                  <Text style={styles.value}>{hexLink}</Text>
                </View>
              ): null}

              <CustButton
                title='Generate Hex Link'
                handlePress={handleGenerateHexLink}
              />

            </View>
          ) : (
            <View>
              {/*Otherwise show field and button to submit a link */}
              <AuthField
                title="Family Link"
                placeholder="Enter Hex Link"
                handleTextChanged={setJoinHexInput}
              />

              <CustButton
                title='Submit Link'
                handlePress={handleSubmitHexLink}
              />

            </View>
          )}

          <CustButton
          title='Log Out'
          handlePress={handleLogout}
          otherStyles={'#f54242'}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile

