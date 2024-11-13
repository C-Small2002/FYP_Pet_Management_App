import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from '../../constants/styles'
import PetDropdown from '../components/petdropdown'
import { useStoreRootState } from 'expo-router/build/global-state/router-store'


const PetProfiles = () => {

  const [selectedPetData, setSelectedPetData] = useState(null);

  const petProfiles =[
    {label:'Darcy', value:'dog'},
    {label:'Tinky Winky', value:'cat'},
    {label:'Flopsie', value:'rabbit'}
  ];

  const petData = {
    dog: {
      name: 'Darcy',
      breed: 'Boxer',
      age: '9',
      dob: '01/06/2015',
      sex: 'Female',
      weight: '',
      height:'',
      chipnumber: '123456789',
      medicalconditions: {
        injury1: 'Cruciate Ligament Injury'
      }
    },
    cat: {
      name: 'Tinky Winky',
      breed: 'Short Hair',
      age: '2',
      dob: '05/04/2022',
      sex: 'Female',
      weight: '12 lbs',
      height:'1 meter',
      chipnumber: '123456789',
      medicalconditions: {
        
      }
    }
  };

  const handlePetSelect = (selectedPet) => {
    console.log(selectedPetData)
    if (selectedPet && petData[selectedPet]){
      setSelectedPetData(petData[selectedPet])
    }
    else{
      setSelectedPetData(null)
    }
  };

  return (
    <SafeAreaView style={styles.defaultContainer}>

      <PetDropdown data={petProfiles} onSelect={handlePetSelect}/>

      <ScrollView style={styles.ScrollView}>
        {selectedPetData && (
          <View>
            <Text>Name: {selectedPetData.name}</Text>
            <Text>Breed: {selectedPetData.breed}</Text>
            <Text>Age: {selectedPetData.age}</Text>
            <Text>DOB: {selectedPetData.dob}</Text>
            <Text>Sex: {selectedPetData.sex}</Text>
            <Text>Chip Number: {selectedPetData.chipnumber}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default PetProfiles
