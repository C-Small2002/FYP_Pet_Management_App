import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from '@react-navigation/native';
import VetLocator from "../app/(tabs)/vetlocator";
import { Alert, Text } from "react-native";

const renderWithNavigation = (ui) => {
    return render(<NavigationContainer>{ui}</NavigationContainer>);
};

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

//Mocking global fetch for Places API
global.fetch = jest.fn();

jest.mock('react-native-maps', () => {
    const { View } = require('react-native');
    const MockMapView = props => <View {...props}>{props.children}</View>;
    const MockMarker = props => <View {...props}>{props.children}</View>;

    return{
        __esModule: true,
        default: MockMapView,
        Marker: MockMarker
    };

});

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('VetLocator Component', () => {

    it('shows laoding message initially', () => {

        const Location = require('expo-location');
        Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
        Location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 0, longitude: 0 }});

        const { getByText } = renderWithNavigation(<VetLocator/>);
        expect(getByText('Finding Nearby Open Vets...')).toBeTruthy();
    });

    it('alerts if location permission is denied', async () => {
        const AlertSpy = jest.spyOn(Alert, 'alert');
        const Location = require('expo-location');

        Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

        renderWithNavigation(<VetLocator/>);

        await waitFor(() => {
            expect(AlertSpy).toHaveBeenCalledWith(
                'Location Permission Denied. To Enable Location Permissions, Please Go to Your Settings'
            );
        });

    });

    it('displays vet markers if API and location succeed', async () => {
        const Location = require('expo-location');

        Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
        Location.getCurrentPositionAsync.mockResolvedValue({
            coords: { latitude: 40.7128, longitude: -74.006 }
        });

        fetch.mockResolvedValue({
            json: async () => ({
                results: [
                    {
                        place_id: '1',
                        name: 'Happy Vet Clinic',
                        geometry: { location: { lat: 40.7138, lng: -74.007 }},
                        opening_hours: { open_now: true }
                    },
                ],
            }),
        });

        const { findByTestId } = renderWithNavigation(<VetLocator/>);
        const marker = await findByTestId('marker-1');

        expect(marker.props.title).toBe('Happy Vet Clinic');
        expect(marker.props.coordinate).toEqual({
            latitude: 40.7138,
            longitude: -74.007 
        });

    });

    it('logs error if fetch fails',  async () => {
        const Location = require('expo-location');

        Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
        Location.getCurrentPositionAsync.mockResolvedValue({
            coords: { latitude: 40.7128, longitude: -74.006 }
        });

        const error = new Error('API down')
        fetch.mockRejectedValue(error);

        renderWithNavigation(<VetLocator/>);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Google Places API error: ', error);
        });

    });

})
