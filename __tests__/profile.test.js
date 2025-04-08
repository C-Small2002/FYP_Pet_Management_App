import React from 'react';
import { render, fireEvent, waitFor } from'@testing-library/react-native';
import Profile from '../app/(tabs)/profile';
import { NavigationContainer } from '@react-navigation/native';

const renderWithNavigation = (ui) => {
    return render(<NavigationContainer>{ui}</NavigationContainer>);
};

jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn()
    },
    useRouter: () => ({
        replace: jest.fn()
    })
}));

jest.mock('../firebaseconfig', () => ({
    auth: {currentUser: {uid : 'user123'}},
    db: {},
    signOut: jest.fn(() => Promise.resolve())
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(() => Promise.resolve({
        exists: () => true,
        data: () => ({
            firstname: 'John',
            surname: 'Doe',
            dob: '2000-01-01',
            primary: true,
            fid: 'family123'
        })
    })),
    updateDoc: jest.fn(() => Promise.resolve()),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({empty: false, docs: [{id: 'family123'}]})),
}));

jest.mock('../app/components/authfield', () => {
    const { TextInput } = require('react-native');
    return (props) => (
        <TextInput
            testID={`${props.title}`}
            placeholder={props.placeholder}
            value={props.value}
            onChangeText={props.handleTextChanged}
        />
    );
});

jest.mock('../app/components/custbutton', () => {
    const { Text } = require('react-native');
    return (props) => <Text onPress={props.handlePress}>{props.title}</Text>;
});

describe('Profile Component', () => {

    it('renders user initials and name', async () => {
        const { getByText } = renderWithNavigation(<Profile/>);

        await waitFor(() => {
            expect(getByText('JD')).toBeTruthy();
            expect(getByText('John Doe')).toBeTruthy();
        });

    });

    it('displays DOB and age', async () => {
        const { getByText } = renderWithNavigation(<Profile/>);

        await waitFor(() => {
            expect(getByText('2000-01-01')).toBeTruthy();
            expect(getByText((new Date().getFullYear() - 2000).toString())).toBeTruthy();
        });

    })

    it('calls generatHexLink for primary user', async () => {
        const { getByText } = renderWithNavigation(<Profile/>);

        await waitFor(() => {
            const generate = getByText('Generate Hex Link');
            expect(generate).toBeTruthy();
            fireEvent.press(generate);
        });

    });

    it('calls submitHexLink for non-primary user', async () => {
        const { getDoc } = require('firebase/firestore');
        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({
                firstname: 'Jane',
                surname: 'Smith',
                dob: '2005-03-03',
                primary: false,
                fid: null
            }),
        });

        const { getByPlaceholderText, getByText } = renderWithNavigation(<Profile/>);

        await waitFor(() => {
            const input = getByPlaceholderText('Enter Hex Link');
            fireEvent.changeText(input, 'ABC123');

            const submit = getByText('Submit Link');
            fireEvent.press(submit);

        });

    });

    it('calls logout and redirects', async () => {
        const { getByText } = renderWithNavigation(<Profile/>);
        const { signOut } = require('../firebaseconfig');
        const { router } = require ('expo-router');

        await waitFor(() => {
            const logout = getByText('Log Out');
            fireEvent.press(logout);
        });

        expect(signOut).toHaveBeenCalled();
        expect(router.replace).toHaveBeenCalledWith('/');

    });

});