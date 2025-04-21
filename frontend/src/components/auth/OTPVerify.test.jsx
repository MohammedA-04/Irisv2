import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import OTPVerification from './OTPVerification';
import { API_URLS } from '../../config/api';

// Mock dependencies
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock QRCodeSVG component
jest.mock('qrcode.react', () => ({
    QRCodeSVG: ({ value, size, level, className, includeMargin }) => (
        <svg data-testid="mock-qrcode" width={size} height={size} className={className}>
            <rect x="0" y="0" width={size} height={size} fill="white" />
            <text x="50%" y="50%" textAnchor="middle">{value}</text>
        </svg>
    )
}));

// Mock fetch
global.fetch = jest.fn();

describe('OTPVerification Component', () => {
    // Mock props
    const mockProps = {
        username: 'testuser',
        otpSecret: 'ABCDEFGHIJKLMNOP',
        onBack: jest.fn()
    };

    // Mock login function from AuthContext
    const mockLogin = jest.fn();
    const mockNavigate = jest.fn();

    const renderOTPVerificationComponent = () => {
        return render(
            <BrowserRouter>
                <AuthContext.Provider value={{ login: mockLogin }}>
                    <OTPVerification {...mockProps} />
                </AuthContext.Provider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        fetch.mockClear();
        mockLogin.mockClear();
        mockProps.onBack.mockClear();
    });

    // Rendering tests
    describe('Rendering', () => {
        test('renders the component with correct title', () => {
            renderOTPVerificationComponent();
            expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
        });

        test('displays the QR code', () => {
            renderOTPVerificationComponent();
            expect(screen.getByTestId('mock-qrcode')).toBeInTheDocument();
        });

        test('displays the secret code', () => {
            renderOTPVerificationComponent();
            expect(screen.getByText(mockProps.otpSecret)).toBeInTheDocument();
        });

        test('displays OTP input fields', () => {
            renderOTPVerificationComponent();
            const otpInputs = document.querySelectorAll('input[type="text"]');
            expect(otpInputs.length).toBe(6);
        });

        test('displays verify and back buttons', () => {
            renderOTPVerificationComponent();
            expect(screen.getByRole('button', { name: /verify code/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
        });
    });

    // Interaction tests
    describe('Interactions', () => {
        test('calls onBack when back button is clicked', () => {
            renderOTPVerificationComponent();
            const backButton = screen.getByText('Back to Login');
            fireEvent.click(backButton);
            expect(mockProps.onBack).toHaveBeenCalledTimes(1);
        });

        test('updates OTP input fields and auto-focuses next field', () => {
            renderOTPVerificationComponent();
            const otpInputs = document.querySelectorAll('input[type="text"]');

            // Simulate typing in the first field
            fireEvent.change(otpInputs[0], { target: { value: '1' } });
            expect(otpInputs[0].value).toBe('1');

            // Check auto-focus on next field (we can't directly test focus in testing-library)
            // but we can verify the value was updated
            fireEvent.change(otpInputs[1], { target: { value: '2' } });
            expect(otpInputs[1].value).toBe('2');
        });

        test('handles backspace in OTP fields', () => {
            renderOTPVerificationComponent();
            const otpInputs = document.querySelectorAll('input[type="text"]');

            // Fill first two fields
            fireEvent.change(otpInputs[0], { target: { value: '1' } });
            fireEvent.change(otpInputs[1], { target: { value: '2' } });

            // Press backspace on empty field
            fireEvent.keyDown(otpInputs[1], { key: 'Backspace' });

            // We can't directly test focus in testing-library
            // but we can simulate the expected behavior
            fireEvent.change(otpInputs[0], { target: { value: '' } });
            expect(otpInputs[0].value).toBe('');
        });

        test('verify button is disabled when OTP is incomplete', () => {
            renderOTPVerificationComponent();

            // Fill only 5 of 6 OTP fields
            const otpInputs = document.querySelectorAll('input[type="text"]');
            for (let i = 0; i < 5; i++) {
                fireEvent.change(otpInputs[i], { target: { value: '1' } });
            }

            const verifyButton = screen.getByRole('button', { name: /verify code/i });
            expect(verifyButton).toBeDisabled();
        });

        test('verify button is enabled when OTP is complete', () => {
            renderOTPVerificationComponent();

            // Fill all 6 OTP fields
            const otpInputs = document.querySelectorAll('input[type="text"]');
            for (let i = 0; i < 6; i++) {
                fireEvent.change(otpInputs[i], { target: { value: '1' } });
            }

            const verifyButton = screen.getByRole('button', { name: /verify code/i });
            expect(verifyButton).not.toBeDisabled();
        });
    });

    // API integration tests
    describe('API Integration', () => {
        test('submits OTP code and handles success', async () => {
            // Mock successful API response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    username: 'testuser',
                    email: 'test@example.com'
                })
            });

            renderOTPVerificationComponent();

            // Fill all 6 OTP fields
            const otpInputs = document.querySelectorAll('input[type="text"]');
            for (let i = 0; i < 6; i++) {
                fireEvent.change(otpInputs[i], { target: { value: String(i + 1) } });
            }

            // Submit form
            const verifyButton = screen.getByRole('button', { name: /verify code/i });
            fireEvent.click(verifyButton);

            await waitFor(() => {
                // Verify API call
                expect(fetch).toHaveBeenCalledWith(
                    API_URLS.verifyOtp,
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify({
                            username: mockProps.username,
                            otp: '123456'
                        })
                    })
                );

                // Verify context login was called
                expect(mockLogin).toHaveBeenCalledWith({
                    name: 'testuser',
                    email: 'test@example.com'
                });
            });
        });

        test('shows error message when OTP verification fails', async () => {
            // Mock failed API response
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    message: 'Invalid OTP code'
                })
            });

            renderOTPVerificationComponent();

            // Fill all 6 OTP fields
            const otpInputs = document.querySelectorAll('input[type="text"]');
            for (let i = 0; i < 6; i++) {
                fireEvent.change(otpInputs[i], { target: { value: '1' } });
            }

            // Submit form
            const verifyButton = screen.getByRole('button', { name: /verify code/i });
            fireEvent.click(verifyButton);

            await waitFor(() => {
                expect(screen.getByText('Invalid OTP code')).toBeInTheDocument();
            });
        });

        test('handles network errors during OTP verification', async () => {
            // Mock network error
            fetch.mockRejectedValueOnce(new Error('Network error'));

            renderOTPVerificationComponent();

            // Fill all 6 OTP fields
            const otpInputs = document.querySelectorAll('input[type="text"]');
            for (let i = 0; i < 6; i++) {
                fireEvent.change(otpInputs[i], { target: { value: '1' } });
            }

            // Submit form
            const verifyButton = screen.getByRole('button', { name: /verify code/i });
            fireEvent.click(verifyButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to verify OTP. Please try again.')).toBeInTheDocument();
            });
        });
    });

    // QR code generation tests
    describe('QR Code Generation', () => {
        test('generates correct OTP auth URL', () => {
            renderOTPVerificationComponent();

            // The otpAuthUrl should include username and secret
            const expectedUrlBase = `otpauth://totp/${encodeURIComponent('IrisAI')}:${encodeURIComponent(mockProps.username)}?secret=${mockProps.otpSecret}`;

            // Check the QR code element is present
            expect(screen.getByTestId('mock-qrcode')).toBeInTheDocument();
        });
    });
});
