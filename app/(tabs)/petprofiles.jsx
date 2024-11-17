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
      medicalconditions: ['Cruciate Ligament Injury', 'Allergy to Wheat']
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
      medicalconditions: []
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

      <ScrollView >
        {selectedPetData && (
          <View style={styles.profileContainer}>
            <Text style={styles.header}>Basic Information</Text>
            <View style={styles.displayRow}>
              <Text style={styles.label}>Name: </Text>
              <Text style={styles.value}>{selectedPetData.name}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={styles.label}>Breed: </Text>
              <Text style={styles.value}>{selectedPetData.breed}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={styles.label}>Age: </Text>
              <Text style={styles.value}>{selectedPetData.age}</Text>
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
              <Text style={styles.label}>Chip Number: </Text>
              <Text style={styles.value}>{selectedPetData.chipnumber}</Text>
            </View>

          </View>

        )}

        {selectedPetData && selectedPetData.medicalconditions.length > 0 && (
          <>
            <View style={styles.profileContainer}>
              <Text style={styles.header}>Medical Conditions</Text>
              {selectedPetData.medicalconditions.map((condition, index) => (
                <View style={styles.displayRow}>
                  <Text style={styles.label}>Condition {index+1}</Text>
                  <Text style={styles.value}> { condition} </Text> 
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default PetProfiles
