import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Login from './Login';
import Navbar from '../common/Navbar';

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

// Mock Navi component
jest.mock('../common/Navi', () => () => <div data-testid="navi-component">Navi Component</div>);

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
    GoogleLogin: () => <div data-testid="google-login">Google Login Button</div>,
    GoogleOAuthProvider: ({ children }) => <>{children}</>
}));

// Simple Home component for testing
const Home = () => <div data-testid="home-page">Home Page</div>;
const HowItWorks = () => <div data-testid="how-it-works-page">How It Works</div>;
const Predict = () => <div data-testid="predict-page">Predict</div>;
const Guide = () => <div data-testid="learning-hub-page">Learning Hub</div>;
const About = () => <div data-testid="about-page">About</div>;

describe('Auth and Navbar Integration Tests', () => {
    // Setup auth context with real state for integration testing
    const TestApp = ({ initialIsAuthenticated = false, initialUser = null }) => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(initialIsAuthenticated);
        const [user, setUser] = React.useState(initialUser);

        const login = (userData) => {
            setUser(userData);
            setIsAuthenticated(true);
        };

        const logout = () => {
            setUser(null);
            setIsAuthenticated(false);
        };

        return (
            <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/predict/image" element={<Predict />} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        fetch.mockClear();
        mockNavigate.mockClear();
    });

    // Integration test for login flow
    test('user can login and navbar updates accordingly', async () => {
        // Mock successful login API response
        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                username: 'testuser',
                email: 'test@example.com'
            }),
            headers: { entries: () => [] }
        });

        // Render the app at login page
        render(
            <MemoryRouter initialEntries={['/login']}>
                <TestApp />
            </MemoryRouter>
        );

        // Initially, navbar should show login button
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();

        // Find and fill login form
        const usernameInput = document.querySelector('input[name="username"]');
        const passwordInput = document.querySelector('input[name="password"]');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // Wait for the login process to complete
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ username: 'testuser', password: 'password123' })
                })
            );
        });

        // After successful login, navbar should show user info and logout button
        await waitFor(() => {
            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
            expect(screen.queryByText('Login')).not.toBeInTheDocument();
        });
    });

    // Integration test for logout flow
    test('authenticated user can logout and navbar updates accordingly', async () => {
        // Render the app with an authenticated user
        render(
            <MemoryRouter initialEntries={['/']}>
                <TestApp
                    initialIsAuthenticated={true}
                    initialUser={{ name: 'testuser', email: 'test@example.com' }}
                />
            </MemoryRouter>
        );

        // Initially, navbar should show user info and logout button
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();

        // Find and click logout button
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // After logout, navbar should show login button
        await waitFor(() => {
            expect(screen.queryByText('testuser')).not.toBeInTheDocument();
            expect(screen.queryByText('Logout')).not.toBeInTheDocument();
            expect(screen.getByText('Login')).toBeInTheDocument();
        });
    });

    // Test navigation through navbar links
    test('navigation links work correctly', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <TestApp />
            </MemoryRouter>
        );

        // Initial page should be home
        expect(screen.getByTestId('home-page')).toBeInTheDocument();

        // Navigate to How It Works
        const howItWorksLink = screen.getByText('How it Works');
        fireEvent.click(howItWorksLink);

        // Check if we navigate to the How It Works page
        await waitFor(() => {
            expect(screen.getByTestId('how-it-works-page')).toBeInTheDocument();
        });

        // Navigate to Predict - use link role selector to be more specific
        const predictLink = screen.getByRole('link', { name: 'Predict' });
        fireEvent.click(predictLink);

        // Check if we navigate to the Predict page
        await waitFor(() => {
            expect(screen.getByTestId('predict-page')).toBeInTheDocument();
        });

        // Navigate back to home via logo
        const logoLink = screen.getByText('IRIS', { exact: false });
        fireEvent.click(logoLink);

        // Check if we navigate back to the home page
        await waitFor(() => {
            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });
    });

    // Test navbar UI changes based on authentication state
    test('navbar UI updates correctly when authentication state changes', async () => {
        // Create a custom render function that allows state changes to propagate
        const TestAppWithState = () => {
            const [authState, setAuthState] = React.useState({
                isAuthenticated: false,
                user: null
            });

            // Function to update auth state for testing
            const setAuth = (isAuth, userData) => {
                setAuthState({
                    isAuthenticated: isAuth,
                    user: userData
                });
            };

            return (
                <>
                    <button
                        data-testid="login-user-btn"
                        onClick={() => setAuth(true, { name: 'testuser', email: 'test@example.com' })}
                    >
                        Login User
                    </button>
                    <button
                        data-testid="logout-user-btn"
                        onClick={() => setAuth(false, null)}
                    >
                        Logout User
                    </button>
                    <AuthContext.Provider
                        value={{
                            isAuthenticated: authState.isAuthenticated,
                            user: authState.user,
                            logout: mockNavigate
                        }}
                    >
                        <Navbar />
                    </AuthContext.Provider>
                </>
            );
        };

        render(
            <BrowserRouter>
                <TestAppWithState />
            </BrowserRouter>
        );

        // Initially should show login button
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();

        // Click the test button to login the user
        fireEvent.click(screen.getByTestId('login-user-btn'));

        // Now should show user info and logout button
        await waitFor(() => {
            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
            expect(screen.queryByText('Login')).not.toBeInTheDocument();
        });

        // Click the test button to logout the user
        fireEvent.click(screen.getByTestId('logout-user-btn'));

        // Should show login button again
        await waitFor(() => {
            expect(screen.getByText('Login')).toBeInTheDocument();
            expect(screen.queryByText('testuser')).not.toBeInTheDocument();
            expect(screen.queryByText('Logout')).not.toBeInTheDocument();
        });
    });
}); 