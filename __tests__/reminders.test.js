import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from '@react-navigation/native';
import Reminders from "../app/(tabs)/reminders";

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
            data: () => ({fid: 'family123'})
        })
    ),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    addDoc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    onSnapshot: jest.fn((_q, callback) => {
        callback:({
            docs: []
        });
        return () => {};
    }),
    Timestamp: {
        fromDate: jest.fn(() => 'timestamp-mock')
    }
}));

jest.mock('../notificationservice', () => ({
    setUpNotificationListener: jest.fn(),
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn()
}));

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

describe('Reminders Component', () => {

    it('opens modal when FAB is pressed', async () => {
        const { getByTestId, getByText } = renderWithNavigation(<Reminders/>);

        fireEvent.press(getByTestId('fabBottomRight'));

        await waitFor(() => {
            expect(getByText('Add Reminder')).toBeTruthy();
        });

    });

    it('updates title input correctly', async () => {
        const { getByPlaceholderText, getByTestId } = renderWithNavigation(<Reminders/>);

        fireEvent.press(getByTestId('fabBottomRight'));

        const titleInput = getByPlaceholderText('Title');
        fireEvent.changeText(titleInput, 'Vet Checkup');

        expect(titleInput.props.value).toBe('Vet Checkup');

    });

    it('toggles recurring switch and shows recurrence options', async () => {
        const { getByText, getByTestId, getByRole } = renderWithNavigation(<Reminders/>);

        fireEvent.press(getByTestId('fabBottomRight'));

        const switch1 = getByRole('switch');
        fireEvent(switch1, 'valueChange', true);

        await waitFor(() => {
            expect(getByText('Daily')).toBeTruthy();
        });

    });

    it('prevents adding reminder if fields are incomplete', async () => {
        const Alert = require('react-native/Libraries/Alert/Alert');
        const { getByTestId, getByText } = renderWithNavigation(<Reminders/>);

        fireEvent.press(getByTestId('fabBottomRight'));

        fireEvent.press(getByText('Add'));

        await waitFor(() => {
            expect(Alert.alert).not.toHaveBeenCalled();
        });

    });

    it('toggles date picker when date input is pressed', async () => {
        const { getByTestId, getByPlaceholderText, getByText } = renderWithNavigation(<Reminders/>);
        fireEvent.press(getByTestId('fabBottomRight'));

        const dateInput = getByPlaceholderText('Date');
        fireEvent.press(dateInput);

        await waitFor(() => {
            expect(getByTestId('dateTimePicker')).toBeTruthy();
        });

    });

    it('reminder form fields are empty initially', async () => {
        const { getByTestId, getByPlaceholderText } = renderWithNavigation(<Reminders/>);

        fireEvent.press(getByTestId('fabBottomRight'));
        
        expect(getByPlaceholderText('Title').props.value).toBe('');
        expect(getByPlaceholderText('Date').props.value).toBe('');
        expect(getByPlaceholderText('Time').props.value).toBe('');

    });

})