import { ScrollView, StyleSheet, Text, View, Image, FlatList, Modal, Alert, TouchableOpacity, TextInput } from 'react-native'
import React, {useCallback, useEffect, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../../constants/styles'
import PetDropdown from '../components/petdropdown'
import { useStoreRootState } from 'expo-router/build/global-state/router-store'
import images from '../../constants/images'
import FloatingActionButton from '../components/floatingactionbutton'
import icons from '../../constants/icons'
import AuthField from '../components/authfield'
import CustButton from '../components/custbutton'
import { auth, db } from '../../firebaseconfig'
import { addDoc, collection, doc, getDoc, getDocs, setDoc, onSnapshot, query, updateDoc, where, deleteDoc } from 'firebase/firestore'
import { setUpNotificationListener, registerForPushNotifications } from '../../notificationservice'
import { useFocusEffect } from 'expo-router'


const PetProfiles = () => {

  const [selectedPetData, setSelectedPetData] = useState(null); //Loads data for the specific pet selected from the dropdown
  const [isModalVisible, setIsModalVisible] = useState(null); //Controls modal visibility
  const [petProfiles, setPetProfiles] = useState([]); //To be used to dynamically load dropdown options
  const [petData, setPetData] = useState({}); //To be used to dynamically load all data
  const [isEditMode, setIsEditMode] = useState(false); //Used for dynamic rendering in modal 
  const [notificationsSet, setNotificationsSet] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    dob: '',
    animaltype: '',
    breed: '',
    sex: '',
    chipnum: '',
    height: '',
    weight: '',
    medicalconditions: [],
    vaccines: [],
  })
  //Seperate handlers needed as issues arose when using one
  const [editForm, setEditForm] = useState({
    name: '',
    dob: '',
    animaltype: '',
    breed: '',
    sex: '',
    chipnum: '',
    height: '',
    weight: '',
    medicalconditions: [],
    vaccines: [],
  })
  const [editFormBackup, setEditFormBackup] = useState(null); //Stores the original state of the data so that if user cancels their edit, original stae will be restored if they go back into the edit modal

  //This is being called on this page as it is the page a user is redirected to after first logining in
  useEffect (() =>{

      const setupNotifications = async () => {

        try {
          //Shows a prompt asking user if they want to allow push notifications
          //If they press yes, the device will be registered and a push token created that then gets added to the users firebase profile
          const token = await registerForPushNotifications();

          const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (token && user){
              console.log("Saving pushtoken for user", user.uid);
              await setDoc(doc(db, 'user', auth.currentUser.uid), {pushToken: token}, {merge: true});
              setNotificationsSet(true); //This will ensure that the fetchpetdetials useeffect wont run at the same time which causes an issue where firebase is updating the doc while the app is trying the fetch the familyID, preventing details from being fetched
              unsubscribe();
            }
          });

        } catch (error) {
          Alert.alert("Notifications not working", error.message);      
        }
        
      };
  
      setupNotifications();
      setUpNotificationListener();
  
    }, []);

  //Works the same as useEffect but allows for it to be rerun when the screen comes back into focus
  //This solves issue with pet details not being loaded after a secondary user links to the primary
  useFocusEffect(
    //Ensures that the whole function isnt recreated every time the screen comes into focus. Only is created when notifications permissions are set
    useCallback(() => {

      const fetchPetDetails = async () => {
        try {
          
          if(!notificationsSet) return; //See setUpNotifications for reason
          //console.log("Entered useEffect for fetch");
          const user = auth.currentUser; //gets the current user
          
          if (!user){
            throw new Error('No user logged in');
          }

          //Gets the users doc from firebase
          const userDoc = await getDoc(doc(db, 'user', user.uid));

          if(!userDoc.exists()){
            throw new Error('No doc found');
          }

          const familyId = userDoc.data().fid;

          if (!familyId) {
            throw new Error('User is not linked to a family');
          }
          //Getting the pets collection and then filtering for only pets belonging to this family
          const petsCollection = collection(db,'pets');
          const petsQuery = query(petsCollection, where('fid', '==', familyId));
          //onSnapshot listesns for updates in the specified document and will trigger the callback when there are any updates, keeping data in the UI up to date
          const getAllPets = onSnapshot(petsQuery, (snapshot) => {

            const profiles = []; //array that will be used for the dropdown menu
            const data = {}; //for accessing and loading pet details
            
            //Loops through every pet doc found
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
      //console.log(petData);
      //console.log(petProfiles);

    }, [notificationsSet]) //[] controls when the useEffect runs - runs on mount and when notificationsSet is true - this prevents issue descirbed above
  );

  //Handler for the dropdown
  const handlePetSelect = (selectedPet) => {
    console.log('handlePetSelect triggered for:', selectedPet);
    if (selectedPet && petData[selectedPet]){
      setSelectedPetData(petData[selectedPet]);
      setEditForm({...petData[selectedPet], id:selectedPet});//When the modal is opened in edit mode, details will already be loaded which prevents stuttering
      //console.log(editForm.id)
    }
    else{
      setSelectedPetData(null)
    }
  };
  //Adds a new empty string to the array in the specified field( medicalconditions)
  //This allows for a new form to then be displayed on the page which the user can type into
  const addDyField = (field) => {
    if(isEditMode){
      setEditForm((prevForm) => ({
        ...prevForm, [field]: [...prevForm[field], '']
      }));
    }
    else {
      setAddForm((prevForm) => ({
        ...prevForm, [field]: [...prevForm[field], '']
      }));
    }
  };

  //Removes a specific entry in the field passed
  //Field specifies which array it belongs to and the index is for what specific entry of that array
  const removeDyField = (field, index) => {
    const updateEditField = editForm[field].filter((_, i) => i !== index); //Fltering the field to keep everything but that specific index
    const updateAddField = addForm[field].filter((_, i) => i !== index);
    if (isEditMode){
      setEditForm((prevForm) => ({...prevForm, [field]: updateEditField}));
    }
    else{
      setAddForm((prevForm) => ({...prevForm, [field]: updateAddField}));
    }
    
  };

  //Updates a specific entry in the array with a new value
  const updateDyField = (field, index, value) => {
    if (isEditMode){
      setEditForm((prevForm) => ({...prevForm, [field]: prevForm[field].map((item, i) => (i ===index ? value :item))})); //Goes through the whole form and if i equals the passed index, updates that
    }
    else {
      setAddForm((prevForm) => ({...prevForm, [field]: prevForm[field].map((item, i) => (i ===index ? value :item))}));
    }
  };

  //Saves the pet details from the add or edit form to firebase - this will trigger an update that
  const handleSavePet = async (isEditMode, editForm, addForm, setIsModalVisible, setIsEditMode) => {
    try {
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

        if(isEditMode){

          if (!editForm.id) {
            throw new Error('No pet selected')
          }

          const petDoc = doc(db, 'pets', editForm.id);

          await updateDoc(petDoc, {
            name: editForm.name,
            dob: editForm.dob,
            animal_type: editForm.animal_type,
            breed: editForm.breed,
            sex: editForm.sex,
            chipnum: editForm.chipnum,
            height: editForm.height,
            weight:editForm.weight,
            medicalconditions: editForm.medicalconditions,
            vaccines: editForm.vaccines
          });

        }
        else {
          const petsCollection = collection(db,'pets');
          await addDoc(petsCollection, {
            name: addForm.name,
            dob: addForm.dob,
            animal_type: addForm.animal_type,
            breed: addForm.breed,
            sex: addForm.sex,
            chipnum: addForm.chipnum,
            height: addForm.height,
            weight:addForm.weight,
            medicalconditions: addForm.medicalconditions,
            vaccines: addForm.vaccines,
            fid: familyId
          });
        }
        setIsModalVisible(false);
        setIsEditMode(false);
    }
    catch (error) {
      Alert.alert("Error", error.message);
      console.error(error)
    }
  }

  //Deletes the selected pet
  const handleDeletePet = async() => {

    try {

      if(!editForm.id){
        throw new Error('No Pet Selected');
      }

      //Sends an alert to the user with two options - waits for the user to answer before continuing
      const confirm = await new Promise((resolve) => {

        Alert.alert(
          'Confrim Delete',
          'Are you sure you want to delete this pet?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ]
        );

      });

      //If user presses cancel, confrim will be false and the delete won't go through,  otherwise it will proceed
      if(!confirm){
        return;
      };

      const petRef = doc(db, 'pets', editForm.id);
      await deleteDoc(petRef);
      setIsModalVisible(false);
      setIsEditMode(false);

    }
    catch(error){

      Alert.alert('Error deleting pet', error.message);

    };

  }

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.defaultContainer}>
        <PetDropdown data={petProfiles} onSelect={handlePetSelect}/>

        <ScrollView>
          
          {/*Uses conditional rendering to make sure that nothing is displayed if theres no pet selected in the dropdown*/}
          {selectedPetData && (

            <View style={styles.profileContainer}>
              <Text style={styles.header}>Basic Information</Text>
              <View style={styles.displayRow}>
                <Text style={styles.label}>Name: </Text>
                <Text style={styles.value}>{selectedPetData.name}</Text>
              </View>
              <View style={styles.displayRow}>
                <Text style={styles.label}>Animal Type: </Text>
                <Text style={styles.value}>{selectedPetData.animal_type}</Text>
              </View>
              <View style={styles.displayRow}>
                <Text style={styles.label}>Breed: </Text>
                <Text style={styles.value}>{selectedPetData.breed}</Text>
              </View>
              <View style={styles.displayRow}>
                <Text style={styles.label}>Date Of Birth</Text>
                <Text style={styles.value}>{selectedPetData.dob}</Text>
              </View>
              <View style={styles.displayRow}>
                <Text style={styles.label}>Sex: </Text>
                <Text style={styles.value}>{selectedPetData.sex}</Text>
              </View>
              <View style={styles.displayRow}>
                <Text style={styles.label}>Height: </Text>
                <Text style={styles.value}>{selectedPetData.height}cm</Text>
              </View>
              <View style={styles.displayRow}>
                <Text style={styles.label}>Weight: </Text>
                <Text style={styles.value}>{selectedPetData.weight}kg</Text>
              </View>
              <View style={styles.displayRow}>
                <Text style={styles.label}>Chip Number: </Text>
                <Text style={styles.value}>{selectedPetData.chipnum}</Text>
              </View>

            </View>

          )}

          {/* Checks if there is a pet selected and if there are any stored medical conditions */}
          {selectedPetData && selectedPetData.medicalconditions.length > 0 && (
            
            <View style={styles.profileContainer}>
              <Text style={styles.header}>Medical Conditions</Text>
              {selectedPetData.medicalconditions.map((condition, index) => (
                <View style={styles.displayRow}>
                  <Text style={styles.label}>Condition {index+1}</Text>
                  <Text style={styles.value}> {condition} </Text> 
                </View>
              ))}
            </View>
            
          )}

          {selectedPetData && selectedPetData.vaccines.length > 0 && (
            
            <View style={styles.profileContainer}>
              <Text style={styles.header}>Vaccines</Text>
              {selectedPetData.vaccines.map((condition, index) => (
                <View style={styles.displayRow}>
                  <Text style={styles.label}>Vaccine {index+1}</Text>
                  <Text style={styles.value}> {condition} </Text> 
                </View>
              ))}
            </View>
            
          )}
          <View style={styles.fabBuffer}/>
        </ScrollView>

        <FloatingActionButton
            icon={icons.plus}
            position='fabBottomRight'
            size='fabMedium'
            onPress={() => setIsModalVisible(true)}
        />
        <FloatingActionButton
          icon={icons.edit}
          position='fabBottomLeft'
          size='fabMedium'
          onPress={() => {if(selectedPetData){
            setIsEditMode(true);
            setIsModalVisible(true);
          }
          else{
            Alert.alert('No Selected Pet Data', 'Please select a pet to edit.');
          }
        }}
        />
        
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType='fade'
          key={isEditMode ? 'editMode' : 'addMode'}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <ScrollView>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.header}>{ isEditMode ? 'Edit Pet Details' : 'Add New Pet' }</Text>

                <AuthField
                  title='Name'
                  placeholder='Name'
                  value={!isEditMode ? addForm.name : editForm.name}
                  handleTextChanged={!isEditMode ?(val) => setAddForm({...addForm, name: val}) : (val) => setEditForm({...editForm, name: val})}
                />

                <AuthField
                  title='Animal Type'
                  placeholder='Animal Type'
                  value={!isEditMode ? addForm.animal_type : editForm.animal_type}
                  handleTextChanged={!isEditMode ? (val) => setAddForm({...addForm, animal_type: val}) : (val) => setEditForm({...editForm, animal_type: val})}
                />

                <AuthField
                  title='Breed'
                  placeholder='Breed'
                  value={!isEditMode ? addForm.breed : editForm.breed}
                  handleTextChanged={!isEditMode ? (val) => setAddForm({...addForm, breed: val}) : (val) => setEditForm({...editForm, breed: val})}
                />

                <AuthField
                  title='Sex'
                  placeholder='Male/Female'
                  value={!isEditMode ? addForm.sex : editForm.sex}
                  handleTextChanged={!isEditMode ?(val) => setAddForm({...addForm, sex: val}) : (val) => setEditForm({...editForm, sex: val})}
                />

                <AuthField
                  title='Date of Birth'
                  placeholder='YYYY-MM-DD'
                  value={!isEditMode ? addForm.dob : editForm.dob}
                  handleTextChanged={!isEditMode ? (val) => setAddForm({...addForm, dob: val}) :  (val) => setEditForm({...editForm, dob: val})}
                />

                <AuthField
                  title='Height (Centimetres)'
                  placeholder='E.g 50'
                  value={!isEditMode ? addForm.height : editForm.height}
                  handleTextChanged={!isEditMode ? (val) => setAddForm({...addForm, height: val}) : (val) => setEditForm({...editForm, height: val})}
                />

                <AuthField
                  title='Weight (Kilograms)'
                  placeholder='E.g 21.1'
                  value={!isEditMode ? addForm.weight : editForm.weight}
                  handleTextChanged={!isEditMode ? (val) => setAddForm({...addForm, weight: val}) : (val) => setEditForm({...editForm, weight: val})}
                />

                <AuthField
                  title='Chip Number'
                  placeholder='Chip Number'
                  value={!isEditMode ? addForm.chipnum : editForm.chipnum}
                  handleTextChanged={!isEditMode ? (val) => setAddForm({...addForm, chipnum: val}) : (val) => setEditForm({...editForm, chipnum: val})}
                />

                <Text style={styles.header}>Medical Conditions</Text>

                {(isEditMode ? editForm.medicalconditions : addForm.medicalconditions).map((condition, index) => (
                  <View key={index} style={styles.modalSubContainer}>
                    <View style={styles.modalSubContents}>
                      <TextInput 
                        title='Medical Condtion'
                        value={condition} 
                        style={styles.formInput}
                        onChangeText={(val) => updateDyField('medicalconditions', index, val)}
                      />
                      <TouchableOpacity 
                        onPress={() => removeDyField('medicalconditions', index)}
                      >
                        <Image
                          source={icons.bin}
                          style={styles.formIcon}
                          resizeMode='contain'
                        />

                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <Text style={styles.header}>Vaccines</Text>
                {(isEditMode ? editForm.vaccines : addForm.vaccines).map((condition, index) => (
                  <View key={index} style={styles.modalSubContainer}>
                    <View style={styles.modalSubContents}>
                      <TextInput 
                        title='Vaccines'
                        value={condition} 
                        style={styles.formInput}
                        onChangeText={(val) => updateDyField('vaccines', index, val)}
                      />
                      <TouchableOpacity 
                        onPress={() => removeDyField('vaccines', index)}
                      >
                        <Image
                          source={icons.bin}
                          style={styles.formIcon}
                          resizeMode='contain'
                        />

                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <CustButton title='Add Condition'
                  handlePress={() => addDyField('medicalconditions')}
                />

                <CustButton title='Add Vaccine'
                  handlePress={() => addDyField('vaccines')}
                />


                <CustButton
                  title='Save'
                  handlePress={() => handleSavePet(isEditMode,editForm,addForm,setIsModalVisible,setIsEditMode)}
                />
                
                <CustButton
                  title='Cancel'
                  handlePress={() => {
                    setIsModalVisible(false);
                    if(isEditMode){
                      setIsEditMode(false);
                    }
                  }}
                />
                {isEditMode && (
                  <CustButton
                    title='Delete Pet'
                    handlePress={handleDeletePet}
                  />
                )}
                

              </View>
            </View> 
          </ScrollView>
        </Modal>
        
      </View>
    </SafeAreaView>
  )
}

export default PetProfiles
