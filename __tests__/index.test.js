import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../app/index';
import { NavigationContainer } from '@react-navigation/native';

const renderWithNavigation = (ui) => {
    return render(<NavigationContainer>{ui}</NavigationContainer>);
};

jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn()
    }
}));

jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
}));

jest.mock('../firebaseconfig', () => ({
    auth: {currentUser: {uid : null }},
    db: {}
}));

jest.mock('../app/components/custbutton', () => {
    const { Text } = require('react-native');
    return (props) => <Text onPress={props.handlePress}>{props.title}</Text>;
});

jest.mock('../notificationservice', () => ({
    registerForPushNotifications: jest.fn(),
    setUpNotificationListener: jest.fn(),
}));

describe('Onboarding Component', () => {

    it('renders logo, headers and buttons', () => {
        const { getByText } = renderWithNavigation(<App/>);
        expect(getByText('Welcome to Zoomies')).toBeTruthy();
        expect(getByText('The All-In-one Pet Management App')).toBeTruthy();
        expect(getByText('Log In')).toBeTruthy();
        expect(getByText('Register')).toBeTruthy();
    });

    it('navigates to login when Log In is pressed', () => {
        const { getByText } = renderWithNavigation(<App/>);

        fireEvent.press(getByText('Log In'));
        expect(require('expo-router').router.replace).toHaveBeenCalledWith('./login');

    });

    it('navigates to register when Register is pressed', () => {
        const { getByText } = renderWithNavigation(<App/>);

        fireEvent.press(getByText('Register'));
        expect(require('expo-router').router.replace).toHaveBeenCalledWith('./register');

    });

    it('redirects to petprofiles if user has login session on the device', async () => {
        const { onAuthStateChanged } = require('firebase/auth');
        const { router } = require('expo-router');

        const mockUser = { uid: 'user123' };
        onAuthStateChanged.mockImplementation((auth, callback) => {
            callback(mockUser);
            return () => {};
        });

        renderWithNavigation(<App/>);

        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledWith('/petprofiles');
        });

    }) ;

});