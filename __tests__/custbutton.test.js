import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustButton from '../app/components/custbutton';
import { ActivityIndicator } from 'react-native';

jest.mock('../constants/styles', () => ({
    buttonStyle: { backgroundColor: 'blue' },
    buttonStyleLogout: { backgroundColor: 'red' },
}));

describe('CustButton Compnent', () => {
    it('renders the button title', () => {
        const { getByText } =  render(
            <CustButton title='Submit' handlePress={() => {}}/>
        );

        expect(getByText('Submit')).toBeTruthy();

    });

    it('calls handlePress when pressed', () => {
        const mockPress = jest.fn();

        const { getByText } = render(
            <CustButton title='Save' handlePress={mockPress}/>
        );

        fireEvent.press(getByText('Save'));
        expect(mockPress).toHaveBeenCalled();

    });

    it('shows ActivityIndicator when isloading is true', () => {
        const { getByTestId } = render(
            <CustButton title='Loading' handlePress={() => {}} isLoading={true}/>
        );

        expect(getByTestId('activity-indicator')).toBeTruthy();

    });

    it('doesnt show ActivityIndicator when is loading is false', () => {
        const { queryByTestId } = render(
            <CustButton title='Loading' handlePress={() => {}} isLoading={false}/>
        );

        expect(queryByTestId('activity-indicator')).toBeNull;

    });

    it('uses logout styling when title is logout', () => {
        const { getByTestId } = render(
            <CustButton title="Log Out" handlePress={() => {}}/>
        );

        const button = getByTestId('cust-button');
        expect(button.props.style).toEqual({ 
            backgroundColor: 'red', 
            opacity: 1 
        });

    });

});
