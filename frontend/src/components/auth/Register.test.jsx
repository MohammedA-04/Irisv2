import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { API_URLS } from '../../config/api';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock dependencies
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock OTPSetup component
jest.mock('./OTPSetup', () => ({
    __esModule: true,
    default: ({ username, otpSecret, onBack, onAccept }) => (
        <div data-testid="otp-setup">
            <div>OTP Setup Component</div>
            <div data-testid="username">{username}</div>
            <div data-testid="otpSecret">{otpSecret}</div>
            <button onClick={onBack} data-testid="back-button">Go Back</button>
            <button onClick={onAccept} data-testid="accept-button">Accept</button>
        </div>
    )
}));

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
    GoogleLogin: () => <div data-testid="google-login">Google Login Button</div>,
    GoogleOAuthProvider: ({ children }) => <>{children}</>
}));

describe('Register Component', () => {
    // Mock props
    const mockProps = {
        onSwitchToLogin: jest.fn()
    };

    const renderRegisterComponent = () => {
        return render(
            <GoogleOAuthProvider clientId="mock-client-id">
                <BrowserRouter>
                    <Register {...mockProps} />
                </BrowserRouter>
            </GoogleOAuthProvider>
        );
    };

    beforeEach(() => {
        fetch.mockClear();
        mockProps.onSwitchToLogin.mockClear();
    });

    // Rendering tests
    describe('Rendering', () => {
        test('renders the registration form', () => {
            renderRegisterComponent();

            // Check for form fields by their name attribute instead of label
            expect(screen.getByText(/username/i)).toBeInTheDocument();
            expect(screen.getByText(/email address/i)).toBeInTheDocument();
            expect(screen.getByText(/password/i)).toBeInTheDocument();

            // Check for submit button
            expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();

            // Check for "or continue with" text
            expect(screen.getByText(/or continue with/i)).toBeInTheDocument();

            // Check for Google login button
            expect(screen.getByTestId('google-login')).toBeInTheDocument();
        });
    });

    // Form interaction tests
    describe('Form Interactions', () => {
        test('updates form values when user types', () => {
            renderRegisterComponent();

            // Get the inputs by name attribute
            const usernameInput = document.querySelector('input[name="username"]');
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            expect(usernameInput.value).toBe('testuser');
            expect(emailInput.value).toBe('test@example.com');
            expect(passwordInput.value).toBe('password123');
        });
    });

    // Password strength meter tests
    describe('Password Strength Meter', () => {
        test('shows password strength indicator when typing password', () => {
            renderRegisterComponent();

            const passwordInput = document.querySelector('input[name="password"]');

            // Test weak password
            fireEvent.change(passwordInput, { target: { value: 'weak' } });
            expect(screen.getByText(/weak/i)).toBeInTheDocument();

            // Test stronger password
            fireEvent.change(passwordInput, { target: { value: 'StrongerP@ss123' } });
            expect(screen.getByText(/strong|very strong/i)).toBeInTheDocument();
        });
    });

    // Registration form submission tests
    describe('Form Submission', () => {
        test('handles successful registration and shows OTP setup', async () => {
            // Mock successful registration response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    otpSecret: 'ABCDEFGHIJKLMNOP'
                })
            });

            renderRegisterComponent();

            // Fill form
            const usernameInput = document.querySelector('input[name="username"]');
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /sign up/i });
            fireEvent.click(submitButton);

            // Wait for API call to complete
            await waitFor(() => {
                // Verify API call
                expect(fetch).toHaveBeenCalledWith(
                    API_URLS.register,
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify({
                            username: 'testuser',
                            email: 'test@example.com',
                            password: 'Password123!',
                            confirmPassword: ''
                        })
                    })
                );

                // Check that OTP setup is shown
                expect(screen.getByTestId('otp-setup')).toBeInTheDocument();
                expect(screen.getByTestId('otpSecret')).toHaveTextContent('ABCDEFGHIJKLMNOP');
            });
        });

        test('handles registration failure and shows error message', async () => {
            // Mock failed registration response
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    message: 'Username already exists'
                })
            });

            renderRegisterComponent();

            // Fill form
            const usernameInput = document.querySelector('input[name="username"]');
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');

            fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /sign up/i });
            fireEvent.click(submitButton);

            // Wait for API call to complete
            await waitFor(() => {
                expect(screen.getByText('Username already exists')).toBeInTheDocument();
            });
        });

        test('handles network errors during registration', async () => {
            // Mock network error
            fetch.mockRejectedValueOnce(new Error('Network error'));

            renderRegisterComponent();

            // Fill form
            const usernameInput = document.querySelector('input[name="username"]');
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /sign up/i });
            fireEvent.click(submitButton);

            // Wait for API call to complete
            await waitFor(() => {
                expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
            });
        });
    });

    // OTP setup interaction tests
    describe('OTP Setup Interactions', () => {
        test('switches to login after OTP setup is accepted', async () => {
            // Mock successful registration response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    otpSecret: 'ABCDEFGHIJKLMNOP'
                })
            });

            renderRegisterComponent();

            // Fill form
            const usernameInput = document.querySelector('input[name="username"]');
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /sign up/i });
            fireEvent.click(submitButton);

            // Wait for OTP setup to appear
            await waitFor(() => {
                expect(screen.getByTestId('otp-setup')).toBeInTheDocument();
            });

            // Click accept button on OTP setup
            const acceptButton = screen.getByTestId('accept-button');
            fireEvent.click(acceptButton);

            // Verify switch to login was called
            expect(mockProps.onSwitchToLogin).toHaveBeenCalledTimes(1);
        });

        test('closes OTP setup when back button is clicked', async () => {
            // Mock successful registration response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    otpSecret: 'ABCDEFGHIJKLMNOP'
                })
            });

            renderRegisterComponent();

            // Fill form
            const usernameInput = document.querySelector('input[name="username"]');
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /sign up/i });
            fireEvent.click(submitButton);

            // Wait for OTP setup to appear
            await waitFor(() => {
                expect(screen.getByTestId('otp-setup')).toBeInTheDocument();
            });

            // Click back button on OTP setup
            const backButton = screen.getByTestId('back-button');
            fireEvent.click(backButton);

            // Verify OTP setup is closed
            await waitFor(() => {
                expect(screen.queryByTestId('otp-setup')).not.toBeInTheDocument();
            });
        });
    });

    // Button state tests
    describe('Button States', () => {
        test('disables submit button while submitting', async () => {
            // Mock slow API response
            fetch.mockImplementationOnce(() => new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        ok: true,
                        json: async () => ({ otpSecret: 'ABCDEFGHIJKLMNOP' })
                    });
                }, 100);
            }));

            renderRegisterComponent();

            // Fill form
            const usernameInput = document.querySelector('input[name="username"]');
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.querySelector('input[name="password"]');

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /sign up/i });
            fireEvent.click(submitButton);

            // Check button is disabled immediately after click
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveTextContent(/signing up/i);

            // Wait for API call to complete
            await waitFor(() => {
                expect(screen.getByTestId('otp-setup')).toBeInTheDocument();
            });
        });
    });
});
