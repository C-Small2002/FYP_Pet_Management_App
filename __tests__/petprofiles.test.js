import React from 'react-native';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import PetProfiles  from '../app/(tabs)/petprofiles';
import { setUpNotificationListener } from '../notificationservice';

const renderWithNavigation = (ui) => {
    return render(<NavigationContainer>{ui}</NavigationContainer>);
};

jest.mock('expo-router', () => ({
    useFocusEffect: (cb) => cb(),
}));

jest.mock('../firebaseconfig', () => ({
    auth: {currentUser: {uid: 'user123'}},
    db: {}
}));

jest.mock('firebase/firestore', () => ({
    getDoc: jest.fn(() => 
        Promise.resolve({exists: () => true, data: () => ({fid: 'family123'})})
    ),
    doc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    addDoc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    onSnapshot: jest.fn((_, callback) => {
        setTimeout(() => {
            callback({
                forEach: (cb) =>
                    cb({
                        id: 'pet1',
                        data: () => ({
                            name: 'TestPet',
                            fid: 'famil123',
                            animal_type: 'Dog',
                            breed: 'Poodle',
                            dob: '2025-01-01',
                            sex: 'Female',
                            chipnum: '123456789876543',
                            height: '40',
                            weight: '10',
                            medicalconditions: ['Allergy'],
                            vaccines: ['Rabies'],
                        }),
                    }),
            });
        }, 0);
        return () => {}
    }),

}));

jest.mock('../notificationservice', () => ({
    registerForPushNotifications: jest.fn(() => Promise.resolve('token123')),
    setUpNotificationListener: jest.fn(),
}));

jest.mock('../app/components/petdropdown', () => {
    const React = require('react');
    const { View, Text, Pressable } = require('react-native');

    return ({ onSelect }) => (

        <View testID='dropdown'>

            <Pressable
                testID='mock-dropdown-option'
                onPress={() => {
                    console.log('Mock dropdown on select triggered');
                    onSelect('pet1');
                }}
            >
                <Text>Mock Pet Option</Text>
            </Pressable>

        </View>

    );

});

jest.mock('../app/components/floatingactionbutton', () => {
    const { Text } = require('react-native');
    return (props) => (
        <Text testID={props.position} onPress={props.onPress}>
            FAB
        </Text>
    );
});

jest.mock('../app/components/authfield', () => {
    const { TextInput } = require('react-native');
    return (props) => (
        <TextInput
            testID={`input-${props.title}`}
            value={props.value}
            onChangeText={props.handleTextChanged}
        />
    );
});

jest.mock('../app/components/custbutton', () => {
    const { Text } = require('react-native');
    return (props) => <Text onPress={props.handlePress}>{props.title}</Text>;
});

describe('PetProfiles Component Unit Tests', () => {

    it('calls handlePetSelect when a pet is selected', async () => {
        const spy = jest.spyOn(console, 'log');

        const { getByTestId } = renderWithNavigation(<PetProfiles/>);

        await waitFor(() => {
            expect(getByTestId('mock-dropdown-option')).toBeTruthy();
        });

        fireEvent.press(getByTestId('mock-dropdown-option'));

        await waitFor(() => {
            expect(getByTestId('mock-dropdown-option')).toBeTruthy();
        });

        fireEvent.press(getByTestId('mock-dropdown-option'));

        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith('handlePetSelect triggered for:', 'pet1');
        });

        spy.mockRestore();

    });

    it('opens add modal when add FAB is pressed', async () => {
        const { getByTestId, getByText } = renderWithNavigation(<PetProfiles/>);
        fireEvent.press(getByTestId('fabBottomRight'));

        await waitFor(() => {
            expect(getByText('Add New Pet')).toBeTruthy();
        });
    });

    it('opens edit modal when edit FAB is pressed after pet is selected', async () => {
        const { getByTestId } = renderWithNavigation(<PetProfiles/>);
        fireEvent.press(getByTestId('dropdown'));
        
        await waitFor(() => {
            fireEvent.press(getByTestId('fabBottomLeft'));
        });

    });

    it('presses save and cancel in modal', async () => {
        const { getByTestId, getByText } = renderWithNavigation(<PetProfiles/>);
        fireEvent.press(getByTestId('fabBottomRight'));

        await waitFor(() => {
            expect(getByText('Save')).toBeTruthy();
            fireEvent.press(getByText('Save'));
            fireEvent.press(getByText('Cancel'));
        });

    });

    it('calls setUpNotificationListner on mount', () => {
        renderWithNavigation(<PetProfiles/>);
        expect(setUpNotificationListener).toHaveBeenCalled();
    });

    it('adds new condition and vaccine inputs when buttons pressed in modal', async () => {
        const { getByTestId, getByText, getAllByDisplayValue } = renderWithNavigation(<PetProfiles/>);

        fireEvent.press(getByTestId('fabBottomRight'));

        await waitFor(() => {
            expect(getByText('Add New Pet')).toBeTruthy();
        });

        //Gets all intial input fields in add modal
        const initialInputs = getAllByDisplayValue('');
        console.log(initialInputs.length);

        //Adds a new condition dynamic input and vaccine dynamic input
        fireEvent.press(getByText('Add Condition'));
        fireEvent.press(getByText('Add Vaccine'));

        await waitFor(() => {
            const updatedInputs = getAllByDisplayValue('');
            console.log(updatedInputs.length)
            expect(updatedInputs.length).toBeGreaterThan(initialInputs.length);
        });

    });

});