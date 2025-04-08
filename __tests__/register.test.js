import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from '@react-navigation/native';
import Register from "../app/(auth)/register";
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
    createUserWithEmailAndPassword: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn()
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

jest.mock('@react-native-community/datetimepicker', () => 'RNDateTimePicker');

jest.spyOn(Alert, 'alert');

const { router } = require('expo-router');
const { createUserWithEmailAndPassword } = require('../firebaseconfig');
const { addDoc, setDoc } = require('firebase/firestore');

describe('Register Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all form fields and buttons', () => {
        const { getByText, getByPlaceholderText } = renderWithNavigation(<Register/>);
        expect(getByText('First Name')).toBeTruthy();
        expect(getByText('Surname')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
        expect(getByText('Register')).toBeTruthy();
        expect(getByText('Log In')).toBeTruthy();
    });

    it('shows alert if required fields are missing', () => {
        const { getByText } = renderWithNavigation(<Register/>);
        fireEvent.press(getByText('Register'));
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields.');
    });

    it('shows alert if passwords do not match', () => {
        const { getByText, getByPlaceholderText, getByTestId } = renderWithNavigation(<Register/>);
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Surname'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
        fireEvent.press(getByPlaceholderText('Date of Birth'));
        fireEvent(getByTestId('dob-picker'), 'onChange', {
            nativeEvent: { timestamp: new Date('2002-06-06').getTime()}
        });
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'wrongpassword123');

        fireEvent.press(getByText('Register'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match.');

    });

    it('creates user and navigates on successful rgesitration', async () => {
        createUserWithEmailAndPassword.mockResolvedValue({
            user: { uid: 'user123' }
        });

        addDoc.mockResolvedValue({ id: 'family123' });

        const { getByText, getByPlaceholderText, getByTestId } = renderWithNavigation(<Register/>);
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Surname'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
        fireEvent.press(getByPlaceholderText('Date of Birth'));
        fireEvent(getByTestId('dob-picker'), 'onChange', {
            nativeEvent: { timestamp: new Date('2002-06-06').getTime()}
        });
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        fireEvent.press(getByText('Register'));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'john@example.com', 'password123');
            expect(setDoc).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Registration Successful!');
            expect(router.replace).toHaveBeenCalledWith('/login');
        });

    });

    it('shows alert on registration failure', async () => {
        createUserWithEmailAndPassword.mockRejectedValue(new Error('Firebase error'));

        const { getByText, getByPlaceholderText, getByTestId } = renderWithNavigation(<Register/>);
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Surname'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
        fireEvent.press(getByPlaceholderText('Date of Birth'));
        fireEvent(getByTestId('dob-picker'), 'onChange', {
            nativeEvent: { timestamp: new Date('2002-06-06').getTime()}
        });
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        fireEvent.press(getByText('Register'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Registration Failed', 'Firebase error');
        });

    });

    it('navigates to login when log in pressed', () => {
        const { getByText } = renderWithNavigation(<Register/>);
        fireEvent.press(getByText('Log In'));
        expect(router.push).toHaveBeenCalledWith('./login');
    });

});