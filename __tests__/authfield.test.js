import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AuthField from '../app/components/authfield';
import icons from '../constants/icons';

jest.mock('../constants/icons', () => ({
    eye: 'eye-icon',
    eye_hidden: 'eye-hidden-icon',
    bin: 'bin-icon'
}));

describe('AuthField Component', () => {

    it('renders title and placeholder correctly', () => {
        const { getByText, getByPlaceholderText } = render(
            <AuthField
                title="Email"
                value=""
                placeholder="Enter email"
                handleTextChanged={() => {}}
            />
        );

        expect(getByText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Enter email')).toBeTruthy();

    });

    it('calls handleTextChanged on input', () => {
        const mockHandler = jest.fn();

        const { getByPlaceholderText } = render(
            <AuthField
                title="Email"
                value=""
                placeholder="Email"
                handleTextChanged={mockHandler}
            />
        );

        fireEvent.changeText(getByPlaceholderText('Email'), 'new@example.com');
        expect(mockHandler).toHaveBeenCalledWith('new@example.com');

    });

    it('toggles password visibility when eye icon is pressed', () => {
        const { getByPlaceholderText, getByTestId } = render(
            <AuthField
                title="Password"
                value="testpassword"
                placeholder="Enter password"
                handleTextChanged={() => {}}
            />
        );

        const input = getByPlaceholderText('Enter password');
        expect(input.props.secureTextEntry).toBe(true);

        fireEvent.press(getByTestId('toggle-password'));

        expect(getByPlaceholderText('Enter password').props.secureTextEntry).toBe(false);

    });

    it('shows delete button when medical condition field is generated', () => {
        const { getByTestId } = render(
            <AuthField
                title="Medical Condition"
                value=""
                placeholder="Asthma"
                handleTextChanged={() => {}}
            />
        );

        expect(getByTestId('delete-icon')).toBeTruthy();

    });

});