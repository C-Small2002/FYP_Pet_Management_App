import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FloatingActionButton from '../app/components/floatingactionbutton';

jest.mock('../constants/styles', () => ({

    fab: { position: 'absolute'},
    fabIcon: { width: 24,height: 24},
    bottomRight: { bottom: 20, right:20 },
    large: {width: 64, height: 64}

}));

describe('FloatingActionButton Component', () => {

    const mockIcon = { uri: 'mock-icon-uri' };

    it('renders the icon with correct source', () => {
        const { getByTestId } = render(
            <FloatingActionButton
                onPress={() => {}}
                icon={mockIcon}
                position="bottomRight"
                size="large"
            />
        );

        const image = getByTestId('fab-icon-test');
        expect(image.props.source).toEqual(mockIcon);
    });

    it('applies correct styles based on position and size', () => {
        const { getByTestId } = render(
            <FloatingActionButton
                onPress={() => {}}
                icon={mockIcon}
                position="bottomRight"
                size="large"
            />
        );

        const button = getByTestId('fab-test');
        expect(button.props.style).toEqual(
            expect.objectContaining({
                position: 'absolute',
                bottom: 20,
                right: 20,
                height: 64,
                width: 64
            })
        );

    });

    it('calls onPress when pressed', () => {
        const mockPress = jest.fn();

        const { getByTestId } = render(
            <FloatingActionButton
                onPress={mockPress}
                icon={mockIcon}
                position="bottomRight"
                size="large"
            />
        );

        fireEvent.press(getByTestId('fab-test'));
        expect(mockPress).toHaveBeenCalled();

    });

});