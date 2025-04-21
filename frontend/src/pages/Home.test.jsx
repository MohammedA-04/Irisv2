import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
}));

// Mock the scrollIntoView function
Element.prototype.scrollIntoView = jest.fn();

describe('Home Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        window.scrollTo = jest.fn();
    });

    // Test basic rendering
    test('renders main title and subtitle', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Introducing')).toBeInTheDocument();
        expect(screen.getByText('IrisAI.')).toBeInTheDocument();
        expect(screen.getByText(/Advanced deepfake detection powered by AI/i)).toBeInTheDocument();
    });

    // Test action buttons rendering
    test('renders action buttons', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Try IrisAI →')).toBeInTheDocument();
        expect(screen.getByText('Learn about IrisAI')).toBeInTheDocument();
        expect(screen.getByText('How It Works')).toBeInTheDocument();
    });

    // Test Dima section rendering
    test('renders Dima section', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Introducing Dima')).toBeInTheDocument();
        expect(screen.getByAltText('Dima AI Visualization')).toBeInTheDocument();
        expect(screen.getByText('Learn more')).toBeInTheDocument();
    });

    // Test Research section rendering
    test('renders Research section', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('Pushing the frontier of cost-effective reasoning')).toBeInTheDocument();
        expect(
            screen.getByText(/Advanced research and development in AI technology/i)
        ).toBeInTheDocument();
    });

    // Test navigation to Predict page
    test('navigates to predict page when Try IrisAI button is clicked', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const tryButton = screen.getByText('Try IrisAI →');
        fireEvent.click(tryButton);

        expect(mockNavigate).toHaveBeenCalledWith('/predict/image');
    });

    // Test navigation to Guide page
    test('navigates to guide page when Learn about IrisAI button is clicked', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const learnButton = screen.getByText('Learn about IrisAI');
        fireEvent.click(learnButton);

        expect(mockNavigate).toHaveBeenCalledWith('/guide');
    });

    // Test navigation to How It Works page
    test('navigates to how-it-works page and scrolls to top', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const howItWorksButton = screen.getByText('How It Works');
        fireEvent.click(howItWorksButton);

        expect(mockNavigate).toHaveBeenCalledWith('/how-it-works');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    // Test navigation to IntroduceDima page
    test('navigates to introducedima page when Learn more button is clicked', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const learnMoreButton = screen.getByText('Learn more');
        fireEvent.click(learnMoreButton);

        expect(mockNavigate).toHaveBeenCalledWith('/introducedima');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    // Test scroll functionality
    test('scrolls to dima section when arrow button is clicked', () => {
        // Create a mock element to be returned by getElementById
        const mockElement = document.createElement('div');
        document.getElementById = jest.fn().mockReturnValue(mockElement);

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const newsButton = screen.getByText('News');
        fireEvent.click(newsButton);

        expect(document.getElementById).toHaveBeenCalledWith('dima-section');
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
}); 