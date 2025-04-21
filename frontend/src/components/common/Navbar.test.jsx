import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import Navbar from './Navbar';

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock the Navi component since we're only testing Navbar functionality
jest.mock('./Navi', () => () => <div data-testid="navi-component">Navi Component</div>);

describe('Navbar Component', () => {
    // Mock AuthContext values
    const mockLogout = jest.fn();

    // Helper function to render Navbar with different auth states
    const renderNavbar = (isAuthenticated = false, user = null) => {
        return render(
            <BrowserRouter>
                <AuthContext.Provider value={{ isAuthenticated, user, logout: mockLogout }}>
                    <Navbar />
                </AuthContext.Provider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        mockNavigate.mockClear();
        mockLogout.mockClear();
    });

    // Rendering tests based on auth state
    describe('Rendering based on authentication state', () => {
        test('should show login button when user is not authenticated', () => {
            renderNavbar(false);

            // Check if Login button is present
            const loginButton = screen.getByText('Login');
            expect(loginButton).toBeInTheDocument();

            // Check if Logout button is not present
            expect(screen.queryByText('Logout')).not.toBeInTheDocument();
        });

        test('should show user profile and logout button when user is authenticated', () => {
            // Render with authenticated user
            renderNavbar(true, { name: 'Test User', email: 'test@example.com' });

            // Check if user name is displayed
            expect(screen.getByText('Test User')).toBeInTheDocument();

            // Check if Logout button is present
            const logoutButton = screen.getByText('Logout');
            expect(logoutButton).toBeInTheDocument();

            // Check if Login button is not present
            expect(screen.queryByText('Login')).not.toBeInTheDocument();
        });

        test('should show first letter of name in profile avatar', () => {
            renderNavbar(true, { name: 'Test User', email: 'test@example.com' });

            // Check if first letter of name is in the avatar
            const avatarElement = screen.getByText('T');
            expect(avatarElement).toBeInTheDocument();
        });

        test('should use email when name is not available', () => {
            renderNavbar(true, { email: 'test@example.com' });

            // Check if email is displayed when name is not available
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });
    });

    // Navigation tests
    describe('Navigation functionality', () => {
        test('clicking on logo should navigate to home page', () => {
            // Using MemoryRouter to test Link navigation
            render(
                <MemoryRouter initialEntries={['/some-page']}>
                    <AuthContext.Provider value={{ isAuthenticated: false, logout: mockLogout }}>
                        <Navbar />
                    </AuthContext.Provider>
                </MemoryRouter>
            );

            // Find and click the logo/title
            const logo = screen.getByText('IRIS', { exact: false });
            fireEvent.click(logo);

            // Check if it would navigate to home
            expect(document.querySelector('a[href="/"]')).toBeInTheDocument();
        });

        test('navigation links should have correct hrefs', () => {
            renderNavbar();

            // Check if all navigation links have correct hrefs
            expect(document.querySelector('a[href="/how-it-works"]')).toBeInTheDocument();
            expect(document.querySelector('a[href="/predict/image"]')).toBeInTheDocument();
            expect(document.querySelector('a[href="/guide"]')).toBeInTheDocument();
            expect(document.querySelector('a[href="/about"]')).toBeInTheDocument();
        });

        test('clicking on Login button should navigate to login page', () => {
            renderNavbar(false);

            const loginLink = screen.getByText('Login');
            expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
        });
    });

    // Logout functionality
    describe('Logout functionality', () => {
        test('clicking logout button should call logout function and navigate to login page', () => {
            renderNavbar(true, { name: 'Test User' });

            // Find and click the logout button
            const logoutButton = screen.getByText('Logout');
            fireEvent.click(logoutButton);

            // Check if logout was called
            expect(mockLogout).toHaveBeenCalledTimes(1);

            // Check if navigate was called with '/login'
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    // Authentication state change
    describe('Authentication state changes', () => {
        test('navbar should update when user logs in', () => {
            const { rerender } = renderNavbar(false);

            // Initially should show login button
            expect(screen.getByText('Login')).toBeInTheDocument();

            // Rerender with authenticated user
            rerender(
                <BrowserRouter>
                    <AuthContext.Provider
                        value={{
                            isAuthenticated: true,
                            user: { name: 'Test User', email: 'test@example.com' },
                            logout: mockLogout
                        }}
                    >
                        <Navbar />
                    </AuthContext.Provider>
                </BrowserRouter>
            );

            // Now should show user name and logout button
            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });

        test('navbar should update when user logs out', () => {
            const { rerender } = renderNavbar(true, { name: 'Test User', email: 'test@example.com' });

            // Initially should show user name and logout button
            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();

            // Rerender with unauthenticated state
            rerender(
                <BrowserRouter>
                    <AuthContext.Provider
                        value={{
                            isAuthenticated: false,
                            user: null,
                            logout: mockLogout
                        }}
                    >
                        <Navbar />
                    </AuthContext.Provider>
                </BrowserRouter>
            );

            // Now should show login button
            expect(screen.getByText('Login')).toBeInTheDocument();
            expect(screen.queryByText('Test User')).not.toBeInTheDocument();
            expect(screen.queryByText('Logout')).not.toBeInTheDocument();
        });
    });
}); 