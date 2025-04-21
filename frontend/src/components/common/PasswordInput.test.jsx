import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordInput from './PasswordInput';

describe('PasswordInput Component', () => {
    // Test rendering
    test('renders input field with password type by default', () => {
        render(<PasswordInput value="" onChange={() => { }} />);


        const inputElement = document.querySelector('input[type="password"]');
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute('type', 'password');
    });

    // Test value prop
    test('displays the value provided by props', () => {
        render(<PasswordInput value="testpassword" onChange={() => { }} />);

        const inputElement = document.querySelector('input[type="password"]')
        expect(inputElement).toHaveValue('testpassword');
    });

    // Test password visibility toggle
    test('toggles password visibility when button is clicked', () => {
        render(<PasswordInput value="testpassword" onChange={() => { }} />);

        const inputElement = document.querySelector('input[type="password"]')
        const toggleButton = screen.getByRole('button');

        // Initially password should be hidden
        expect(inputElement).toHaveAttribute('type', 'password');

        // Click the toggle button
        fireEvent.click(toggleButton);
        expect(inputElement).toHaveAttribute('type', 'text');

        // Click again to hide
        fireEvent.click(toggleButton);
        expect(inputElement).toHaveAttribute('type', 'password');
    });

    // Test onChange callback
    test('calls onChange with correct name and value when typing', () => {
        const handleChange = jest.fn();
        render(<PasswordInput value="" onChange={handleChange} name="testPassword" />);

        const inputElement = document.querySelector('input[type="password"]');

        // Type in the input field
        fireEvent.change(inputElement, { target: { value: 'newpassword' } });

        // Check if onChange was called with the correct arguments
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange.mock.calls[0][0].target.name).toBe('testPassword');
        expect(handleChange.mock.calls[0][0].target.value).toBe('newpassword');
    });

    // Test default name attribute
    test('uses "password" as default name attribute', () => {
        render(<PasswordInput value="" onChange={() => { }} />);

        const inputElement = document.querySelector('input[type="password"]');
        expect(inputElement).toHaveAttribute('name', 'password');
    });

    // Test custom name attribute
    test('uses custom name attribute when provided', () => {
        render(<PasswordInput value="" onChange={() => { }} name="customPassword" />);

        const inputElement = document.querySelector('input[type="password"]');
        expect(inputElement).toHaveAttribute('name', 'customPassword');
    });

    // Test required attribute
    test('has required attribute', () => {
        render(<PasswordInput value="" onChange={() => { }} />);

        const inputElement = document.querySelector('input[type="password"]');
        expect(inputElement).toBeRequired();
    });

    // Test svg icon presence
    test('eye icon is present for toggling password visibility', () => {
        render(<PasswordInput value="" onChange={() => { }} />);

        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toContainElement(document.querySelector('svg'));
    });
});
