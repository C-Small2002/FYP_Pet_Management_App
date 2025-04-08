import React from 'react-native';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import PocketVet from '../app/(tabs)/pocketvet';
import { query } from 'firebase/firestore';

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
        Promise.resolve({
            exists: () => true,
            data: () => ({fid: 'family123', dob: '2000-01-01'})
        })
    ),
    doc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    onSnapshot: jest.fn((_, cb) => {
        cb({
            forEach: (cb) =>
                cb({
                    id: 'pet1',
                    data: () => ({
                        name: 'Darcy',
                        animal_type: 'Dog',
                        breed: 'Boxer',
                        dob: '2020-06-01',
                        weight: '30',
                        medicalconditions: ['Arthritis'],
                        vaccines: ['Rabies'],
                    }),
                }),
        });
        return () => {};
    }),
}));

jest.mock('axios', () => ({
    post: jest.fn(() =>
        Promise.resolve({data: {response: 'This is a mock response from PocketVet' }})
    ),
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

describe('PocketVet Component', () => {

    it('renders the initial message from PocketVet', () => {
        const { getByText } = renderWithNavigation(<PocketVet/>);
        expect(getByText('Hi, what seems to be the issue with your pet?')).toBeTruthy();
    });

    it('updates input as user types', () => {
        const { getByPlaceholderText } = renderWithNavigation(<PocketVet/>);
        const input = getByPlaceholderText('Type Something...');
        fireEvent.changeText(input, 'My dog is limping');
        expect(input.props.value).toBe('My dog is limping');
    });

    it('sends a message and displays response', async () => {
        const{ getByPlaceholderText, getByText } = renderWithNavigation(<PocketVet/>);
        const input = getByPlaceholderText('Type Something...');
        fireEvent.changeText(input, 'My dog is limping');
        fireEvent(input, 'submitEditing');

        await waitFor(() => {
            expect(getByText('My dog is limping')).toBeTruthy();
            expect(getByText('This is a mock response from PocketVet')).toBeTruthy();
        });

    });

    it('selects a pet from dropdown', async () => {
        const { getByText } = renderWithNavigation(<PocketVet/>);
        fireEvent.press(getByText('Mock Pet Option'));

        await waitFor(() => {
            expect(getByText('Mock Pet Option')).toBeTruthy();
        });

    });

    it('does not send empty message', () => {
        const { getByPlaceholderText, queryByText } = renderWithNavigation(<PocketVet/>);
        const input = getByPlaceholderText('Type Something...');

        fireEvent.changeText(input, ' ');
        fireEvent(input, 'submitEditing');

        expect(queryByText(' ')).toBeNull();

    });

    it('clears input after sending a message', async () => {
        const { getByPlaceholderText } = renderWithNavigation(<PocketVet/>);
        const input = getByPlaceholderText('Type Something...');

        fireEvent.changeText(input, 'My dog has fleas');
        fireEvent(input, 'submitEditing');

        await waitFor(() => {
            expect(input.props.value).toBe('');
        });

    });

    

})