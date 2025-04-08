import React from "react";
import { render, fireEvent } from '@testing-library/react-native';
import PetDropdown from "../app/components/petdropdown";

jest.mock('react-native-dropdown-picker', () => {
    return (props) => {
        const React = require('react');
        const { TouchableOpacity, Text } = require('react-native');

        const {
            open,
            value,
            items,
            setOpen,
            onChangeValue,
            placeholder,
            testID
        } = props;

        return (
            <TouchableOpacity
                onPress={() => {
                    setOpen?.(!open);
                    onChangeValue?.(items?.[0]?.value);
                }}
                testID={testID || 'dropdown-mock'}
            >
                <Text>{value || placeholder}</Text>
            </TouchableOpacity>
        );

    };
});

jest.mock('react-native-safe-area-context', () => {
    return {
        SafeAreaView: ({ children }) => <>{children}</>
    };
});

describe('PetDropdown Component', () => {
    const mockData = [
        { label: 'Daisy', value: 'daisy'},
        { label: 'Darcy', value: 'darcy' }
    ];

    it('renders with placeholder text', () => {
        const { getByText } = render(<PetDropdown data={mockData}/>);
        expect(getByText('Select a pet...')).toBeTruthy();
    });

    it('calls onSelect when an item is selected', () => {
        const mockSelected = jest.fn();
        const { getByTestId } = render(
            <PetDropdown data={mockData} onSelect={mockSelected} />
        );

        fireEvent.press(getByTestId('dropdown-mock'));
        expect(mockSelected).toHaveBeenCalledWith('daisy');

    });

    it('updates dropdown items when data changes', () => {
        const mockSelected = jest.fn();
        const { getByTestId, rerender } = render(
            <PetDropdown data={mockData} onSelect={mockSelected} />
        );

        fireEvent.press(getByTestId('dropdown-mock'));
        expect(mockSelected).toHaveBeenCalledWith('daisy');

        const newData = [
            { label: 'Max', value: 'max' },
            { label: 'Lola', value: 'lola'}
        ];

        rerender(<PetDropdown data={newData} onSelect={mockSelected}/>);

        fireEvent.press(getByTestId('dropdown-mock'));

        expect(mockSelected).toHaveBeenCalledWith('max');

    });

});