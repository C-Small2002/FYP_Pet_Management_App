import React, {useState} from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import styles from '../../constants/styles'
import { SafeAreaView } from 'react-native-safe-area-context'

const PetDropdown = ({data, onSelect}) => {

    const [open, setOpen] = useState(false); //determines wheter dropdown is open or not - default is closed
    const [selectedValue, setSelectedValue] = useState(null) //determines the currently selected value - default is null. ie nothing is selected
    const [items, setItems] = useState(data) //determines the items in the dropdown - always set to the data passed to the dropdown

    const handleValueChange = (value) => {
        setSelectedValue(value);
        if (onSelect){
            onSelect(value) //calls callback when pet is selected
        }
    };


  return (
    <SafeAreaView style={[styles.dropdownContainer, open && {zIndex:1000}]}>
      <DropDownPicker
        open={open}
        value={selectedValue}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedValue}
        setitems={setItems}
        onChangeValue={handleValueChange}
        placeholder='Select a pet...'
        style={styles.dropdownSelector}
        dropDownContainerStyle={[styles.dropdownMenu, open && {zIndex: 1000}]}
      />
    </SafeAreaView>
  )
}

export default PetDropdown
