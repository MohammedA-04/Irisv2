import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Login from './Login';
import { API_URLS } from '../../config/api';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock dependencies
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
    GoogleLogin: () => <div data-testid="google-login">Google Login Button</div>,
    useGoogleLogin: () => jest.fn(),
    GoogleOAuthProvider: ({ children }) => <>{children}</>
}));

describe('0_Render Login Component', () => {
    // Set up mocks and helpers
    const mockLogin = jest.fn();
    const mockNavigate = jest.fn();

    const renderLoginComponent = (authContextValue = { login: mockLogin }) => {
        return render(
            <GoogleOAuthProvider clientId="mock-client-id">
                <BrowserRouter>
                    <AuthContext.Provider value={authContextValue}>
                        <Login />
                    </AuthContext.Provider>
                </BrowserRouter>
            </GoogleOAuthProvider>
        );
    };

    beforeEach(() => {
        fetch.mockClear();
        mockLogin.mockClear();
    });

    // Rendering tests
    describe('1_Rendering Login JSX', () => {
        test('Login.JSX: Elements', () => {
            renderLoginComponent();

            // Use getByText instead of getByLabelText for content that's not a label
            // Check for username field
            expect(screen.getByText(/username/i)).toBeInTheDocument();
            // Check for password field
            expect(screen.getByText(/password/i)).toBeInTheDocument();
            // Check for sign in button
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
            // Check for "or continue with" text
            expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
            // Check for Google login button
            expect(screen.getByTestId('google-login')).toBeInTheDocument();
        });

        test('Toggle password visibility', () => {
            renderLoginComponent();

            // Use querySelector directly - this is more reliable for this test
            const passwordInput = document.querySelector('input[name="password"]');
            const showPasswordButton = document.querySelector('.absolute.inset-y-0.right-0');

            // Check initial state
            expect(passwordInput).toHaveAttribute('type', 'password');

            // Toggle visibility
            fireEvent.click(showPasswordButton);
            expect(passwordInput).toHaveAttribute('type', 'text');

            // Toggle back
            fireEvent.click(showPasswordButton);
            expect(passwordInput).toHaveAttribute('type', 'password');
        });
    });

    // Form interaction tests
    describe('Form Interactions', () => {
        test('should update form values when user types', () => {
            renderLoginComponent();

            // Use querySelectors instead of getByLabelText
            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            expect(usernameInput.value).toBe('testuser');
            expect(passwordInput.value).toBe('password123');
        });

        test('should handle form submission', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ message: 'Success' }),
                headers: { entries: () => [] }
            });

            renderLoginComponent();

            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            const submitButton = screen.getByRole('button', { name: /sign in/i });

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    API_URLS.login,
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify({ username: 'testuser', password: 'password123' })
                    })
                );
            });
        });
    });

    // API integration tests
    describe('API Integration', () => {
        test('should show error message on login failure', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ message: 'Invalid credentials' }),
                headers: { entries: () => [] }
            });

            renderLoginComponent();

            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            const submitButton = screen.getByRole('button', { name: /sign in/i });

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
            });
        });
    });

    // Context integration tests
    describe('Authentication Context', () => {
        test('should call context login method on successful login', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    username: 'testuser',
                    email: 'test@example.com'
                }),
                headers: { entries: () => [] }
            });

            renderLoginComponent();

            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            const submitButton = screen.getByRole('button', { name: /sign in/i });

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    name: 'testuser',
                    email: 'test@example.com'
                });
            });
        });
    });
}); 