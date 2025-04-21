import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import IntroduceDima from './IntroduceDima.jsx';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
}));

// Mock icons
jest.mock('react-icons/fa', () => ({
    FaQuestion: () => <div data-testid="question-icon" />,
    FaCode: () => <div data-testid="code-icon" />,
    FaPlay: () => <div data-testid="play-icon" />,
    FaPause: () => <div data-testid="pause-icon" />,
    FaShare: () => <div data-testid="share-icon" />,
}));

jest.mock('react-icons/si', () => ({
    SiTarget: () => <div data-testid="target-icon" />,
    SiFuturelearn: () => <div data-testid="learn-icon" />,
}));

jest.mock('react-icons/tb', () => ({
    TbBowFilled: () => <div data-testid="bow-icon" />,
}));

// Mock image imports
jest.mock('../assets/Classification Report Dima.png', () => 'classification-report.png');
jest.mock('../assets/conf matrix dima.png', () => 'confusion-matrix.png');
jest.mock('../assets/0 (4).jpg', () => 'fake1.jpg');
jest.mock('../assets/F2.jpg', () => 'fake2.jpg');
jest.mock('../assets/R1.jpg', () => 'real1.jpg');
jest.mock('../assets/R2.jpg', () => 'real2.jpg');
jest.mock('../assets/Dima Thumbnail.png', () => 'dima-thumbnail.png');

// Mock audio implementation
const mockPause = jest.fn();
const mockPlay = jest.fn();

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = { href: jest.fn() };

describe('IntroduceDima Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Set up audio element mock
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
                <IntroduceDima />
            </BrowserRouter>
        );

        expect(screen.getByText('Introducing Dima Model')).toBeInTheDocument();
        expect(
            screen.getByText(/Latest Image Classifier capable of detecting 'fake' media/i)
        ).toBeInTheDocument();
    });

    // Test section rendering
    test('renders all sections with their titles', () => {
        render(
            <BrowserRouter>
                <IntroduceDima />
            </BrowserRouter>
        );

        expect(screen.getByText('What is Dima?')).toBeInTheDocument();
        expect(screen.getByText('HuggingFace Enabled')).toBeInTheDocument();
        expect(screen.getByText('ViT Transfromer')).toBeInTheDocument();
        expect(screen.getByText('Trained On')).toBeInTheDocument();
        expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });

    // Test developer information rendering
    test('renders developer information', () => {
        render(
            <BrowserRouter>
                <IntroduceDima />
            </BrowserRouter>
        );

        expect(screen.getByText('Developed by Dmytro Iakubovskyi')).toBeInTheDocument();
        expect(screen.getByText('See Dmytro:')).toBeInTheDocument();

        const developerLink = screen.getByText('huggingface.co/dima806');
        expect(developerLink).toBeInTheDocument();
        expect(developerLink).toHaveAttribute('href', 'https://huggingface.co/dima806');
    });

    // Test image rendering in the Accuracy section
    test('renders images in the Accuracy section', () => {
        render(
            <BrowserRouter>
                <IntroduceDima />
            </BrowserRouter>
        );

        // Check for classification report image
        const classificationReportImg = screen.getByAltText('Classification Report');
        expect(classificationReportImg).toBeInTheDocument();
        expect(classificationReportImg).toHaveAttribute('src', 'classification-report.png');

        // Check for confusion matrix image
        const confusionMatrixImg = screen.getByAltText('Confusion Matrix');
        expect(confusionMatrixImg).toBeInTheDocument();
        expect(confusionMatrixImg).toHaveAttribute('src', 'confusion-matrix.png');
    });

    // Test image grid rendering in the Trained On section
    test('renders image grid in the Trained On section', () => {
        render(
            <BrowserRouter>
                <IntroduceDima />
            </BrowserRouter>
        );

        // Check for all example images
        const fakeImage1 = screen.getByAltText('Fake Image 1');
        const fakeImage2 = screen.getByAltText('Fake Image 2');
        const realImage1 = screen.getByAltText('Real Image 1');
        const realImage2 = screen.getByAltText('Real Image 2');

        expect(fakeImage1).toBeInTheDocument();
        expect(fakeImage2).toBeInTheDocument();
        expect(realImage1).toBeInTheDocument();
        expect(realImage2).toBeInTheDocument();

        expect(fakeImage1).toHaveAttribute('src', 'fake1.jpg');
        expect(fakeImage2).toHaveAttribute('src', 'fake2.jpg');
        expect(realImage1).toHaveAttribute('src', 'real1.jpg');
        expect(realImage2).toHaveAttribute('src', 'real2.jpg');
    });

    // Test audio playback functionality
    test('toggles audio playback when listen button is clicked', () => {
        render(
            <BrowserRouter>
                <IntroduceDima />
            </BrowserRouter>
        );

        const listenButton = screen.getByText(/Listen to article/i).closest('button');

        // Initially should be in play state
        expect(listenButton).toBeInTheDocument();

        // Click to play
        fireEvent.click(listenButton);
        expect(mockPlay).toHaveBeenCalledTimes(1);

        // Click to pause
        fireEvent.click(listenButton);
        expect(mockPause).toHaveBeenCalledTimes(1);
    });

    // Test warning message
    test('renders warning message about password security', () => {
        render(
            <BrowserRouter>
                <IntroduceDima />
            </BrowserRouter>
        );

        // Use a more flexible approach to find the text regardless of how it's nested
        const passwordTextElement = screen.getByText(/IRIS WILL NEVER ASK FOR YOUR PASSWORD/i);
        expect(passwordTextElement).toBeInTheDocument();
    });

    // Test date and categories rendering
    test('renders date and categories', () => {
        render(
            <BrowserRouter>
                <IntroduceDima />
            </BrowserRouter>
        );

        expect(screen.getByText('April 18, 2025')).toBeInTheDocument();
        expect(screen.getByText('Product')).toBeInTheDocument();
        expect(screen.getByText('Research')).toBeInTheDocument();
        expect(screen.getByText('Hugging Face')).toBeInTheDocument();
    });
}); 