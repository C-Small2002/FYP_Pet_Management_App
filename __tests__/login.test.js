import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from '@react-navigation/native';
import Login from "../app/(auth)/login";
import { Alert } from 'react-native';

const renderWithNavigation = (ui) => {
    return render(<NavigationContainer>{ui}</NavigationContainer>);
};

jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn()
    }
}));

jest.mock('../firebaseconfig',() => ({
    auth: {},
    db: {},
    signInWithEmailAndPassword: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn()
}));

jest.mock('../app/components/authfield', () => {
    const React = require('react');
    const { TextInput, View, Text } = require('react-native');
    return ({ title, value, handleTextChanged, placeholder }) => {
        const [internalVal, setInternalVal] = React.useState(value || '');
        return (
            <View>
                <Text>{title}</Text>
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={(text) => {
                        setInternalVal(text);
                        handleTextChanged(text);
                    }}
                />
            </View>
        );
    };
});

jest.mock('../app/components/custbutton', () => {
    const { Text } = require('react-native');
    return ({ title, handlePress}) => (
        <Text onPress={handlePress}>{title}</Text>
    );
});

jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn()
}));

const { router } = require('expo-router');
const { signInWithEmailAndPassword } = require('../firebaseconfig');
const { getDoc } = require('firebase/firestore');

describe('Login Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders email and password fields and buttons', () => {
        const { getByPlaceholderText, getByText } = renderWithNavigation(<Login/>);
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByText('Log In')).toBeTruthy();
        expect(getByText('Register')).toBeTruthy();
    });

    it('updates form when typing', () => {
        const { getByPlaceholderText } = renderWithNavigation(<Login/>);
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'mypassword');

        expect(emailInput.props.value).toBe('test@example.com');
        expect(passwordInput.props.value).toBe('mypassword');
    });

    it('navigates to register screen when register button pressed', () => {
        const { getByText } = renderWithNavigation(<Login/>);

        fireEvent.press(getByText('Register'));
        expect(router.push).toHaveBeenCalledWith('./register');

    });

    it('logs in and navigates to petprofiles', async () => {
        const user = { uid: 'user123' };
        const userDoc = {
            exists: () => true,
            data: () => ({ firstname: 'Cathal' })
        };

        signInWithEmailAndPassword.mockResolvedValue({ user });
        getDoc.mockResolvedValue(userDoc);

        const { getByText, getByPlaceholderText } = renderWithNavigation(<Login/>);
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password');
        fireEvent.press(getByText('Log In'));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password');
            expect(getDoc).toHaveBeenCalled();
            expect(router.replace).toHaveBeenCalledWith('../../petprofiles');
            expect(Alert.alert).toHaveBeenCalledWith('Login Successful', 'Welcome Cathal!');
        });

    });

    it('shows alert and does not navigate on login failure', async () => {
        signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));

        const { getByText, getByPlaceholderText } = renderWithNavigation(<Login/>);

        fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'incorrect');
        fireEvent.press(getByText('Log In'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
            expect(router.replace).not.toHaveBeenCalled();
        })

    })

});
