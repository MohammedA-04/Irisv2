import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import HowItWorks from './HowItWorks.jsx';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>
    }
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaImage: () => <div data-testid="image-icon" />,
    FaCode: () => <div data-testid="code-icon" />,
    FaRobot: () => <div data-testid="robot-icon" />,
    FaShieldAlt: () => <div data-testid="shield-icon" />,
    FaPlay: () => <div data-testid="play-icon" />,
    FaPause: () => <div data-testid="pause-icon" />,
    FaShare: () => <div data-testid="share-icon" />,
    FaQuestion: () => <div data-testid="question-icon" />
}));

jest.mock('react-icons/si', () => ({
    SiTarget: () => <div data-testid="target-icon" />
}));

// Mock image import
jest.mock('../assets/Robot Think.png', () => 'robot-think.png');

// Mock audio implementation
const mockPause = jest.fn();
const mockPlay = jest.fn();

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = { href: jest.fn() };

describe('HowItWorks Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock audio element
        Object.defineProperty(HTMLMediaElement.prototype, 'play', {
            configurable: true,
            value: mockPlay
        });
        Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
            configurable: true,
            value: mockPause
        });
    });

    afterAll(() => {
        window.location = originalLocation;
    });

    // Test basic rendering
    test('renders the page title and description', () => {
        render(
            <BrowserRouter>
                <HowItWorks />
            </BrowserRouter>
        );

        expect(screen.getByText('How IrisAI Works')).toBeInTheDocument();
        expect(
            screen.getByText(/Advanced AI technology that detects manipulated media/i)
        ).toBeInTheDocument();
    });

    // Test section rendering
    test('renders all sections with their titles', () => {
        render(
            <BrowserRouter>
                <HowItWorks />
            </BrowserRouter>
        );

        expect(screen.getByText('What is IRIS?')).toBeInTheDocument();
        expect(screen.getByText('Goals')).toBeInTheDocument();
        expect(screen.getByText('AI Detection Algorithms')).toBeInTheDocument();
        expect(screen.getByText('Continuous Learning')).toBeInTheDocument();
        expect(screen.getByText('User Protection')).toBeInTheDocument();
    });

    // Test section content
    test('renders section content correctly', () => {
        render(
            <BrowserRouter>
                <HowItWorks />
            </BrowserRouter>
        );

        // Check some specific content from different sections using more flexible matchers
        expect(screen.getByText(/IRIS is lifelong project inspired by TrueMedia/i)).toBeInTheDocument();
        expect(screen.getByText(/Teach people about deepfakes/i)).toBeInTheDocument();
        expect(screen.getByText(/Vision Transformer trained on/i)).toBeInTheDocument();

        // Use a partial match for the password warning text
        const passwordElement = screen.getByText(/IRIS WILL NEVER ASK FOR YOUR PASSWORD/i);
        expect(passwordElement).toBeInTheDocument();
    });

    // Test audio playback functionality
    test('toggles audio playback when listen button is clicked', () => {
        render(
            <BrowserRouter>
                <HowItWorks />
            </BrowserRouter>
        );

        // Find the button by its text content in a case-insensitive way
        const listenButton = screen.getByRole('button', { name: /listen to article/i });
        expect(listenButton).toBeInTheDocument();

        // Initially should be in play state
        expect(listenButton).toHaveTextContent(/listen to article/i);

        // Click to play
        fireEvent.click(listenButton);
        expect(mockPlay).toHaveBeenCalledTimes(1);

        // Should now be in pause state (text may change)
        expect(mockPause).toHaveBeenCalledTimes(0); // Initial state, no pause yet

        // Click to pause
        fireEvent.click(listenButton);
        expect(mockPause).toHaveBeenCalledTimes(1);
    });

    // Test navigation to prediction page
    test('navigates to prediction page when "Try in Prediction" button is clicked', () => {
        render(
            <BrowserRouter>
                <HowItWorks />
            </BrowserRouter>
        );

        const tryButton = screen.getByText(/Try in Prediction/i);
        fireEvent.click(tryButton);

        expect(window.location.href).toBe('/predict/image');
    });

    // Test date and categories rendering
    test('renders date and categories', () => {
        render(
            <BrowserRouter>
                <HowItWorks />
            </BrowserRouter>
        );

        expect(screen.getByText(/April 14, 2025/i)).toBeInTheDocument();
        expect(screen.getByText(/Product/i)).toBeInTheDocument();

        // Get the exact Research span element from the navigation header
        const categoryContainer = screen.getByText(/April 14, 2025/i).parentElement;
        const researchElement = Array.from(categoryContainer.querySelectorAll('span')).find(
            span => span.textContent.includes('Research')
        );
        expect(researchElement).toBeInTheDocument();

        expect(screen.getByText(/Publication/i)).toBeInTheDocument();
    });

    // Test image rendering
    test('renders the robot thinking image in What is IRIS section', () => {
        render(
            <BrowserRouter>
                <HowItWorks />
            </BrowserRouter>
        );

        const robotImage = screen.getByAltText(/IrisAI Robot thinking/i);
        expect(robotImage).toBeInTheDocument();
        // Just check that the src contains 'robot' and 'think' instead of exact match
        expect(robotImage.src.toLowerCase()).toContain('robot');
        expect(robotImage.src.toLowerCase()).toContain('think');
    });

    // Test Share button
    test('renders share button', () => {
        render(
            <BrowserRouter>
                <HowItWorks />
            </BrowserRouter>
        );

        // Look for the share button by both text and role
        const shareButtonByText = screen.getByText(/Share/i);
        expect(shareButtonByText).toBeInTheDocument();

        // Find the button that contains "Share" text
        const shareButton = screen.getByRole('button', { name: /share/i });
        expect(shareButton).toBeInTheDocument();
    });
}); 