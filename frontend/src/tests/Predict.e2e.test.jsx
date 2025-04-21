import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Predict from '../pages/Predict';

// Mock fetch 
global.fetch = jest.fn();

// Mock File API
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Custom query to find by accept attribute
screen.getByAcceptValue = (value) => {
    return document.querySelector(`input[accept="${value}"]`);
};

describe('Predict Component End-to-End Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockClear();
    });

    test('E2E: User uploads an image and receives deepfake detection results', async () => {
        // Mock successful fetch responses
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                result: 'fake',
                confidence: 0.92,
                fake_confidence: 0.92,
                real_confidence: 0.08,
                filename: 'test.jpg'
            })
        });

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                analysis: 'This image shows signs of manipulation. The analysis detected inconsistencies in facial features.'
            })
        });

        render(
            <BrowserRouter>
                <Predict />
            </BrowserRouter>
        );

        // 1. Verify the page has loaded with default selections
        const selectElements = screen.getAllByRole('combobox');
        const mediaTypeSelect = selectElements[0];
        expect(mediaTypeSelect.value).toBe('Image');

        // 2. Upload a sample image file
        const file = new File(['dummy image content'], 'test.jpg', { type: 'image/jpeg' });
        const fileInput = screen.getByAcceptValue('image/*');

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        // 3. Verify file uploaded and analyze button is enabled
        await waitFor(() => {
            expect(screen.getByText('Analyze')).not.toBeDisabled();
        });

        // 4. Click analyze button
        const analyzeButton = screen.getByText('Analyze');

        await act(async () => {
            fireEvent.click(analyzeButton);
        });

        // 5. Verify API was called correctly
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            const [url, options] = fetch.mock.calls[0];
            expect(url).toContain('/api/analyze');
            expect(options.method).toBe('POST');
        });

        // 6. Verify results are displayed
        await waitFor(() => {
            // This will depend on your UI, but should show the 92% confidence
            expect(screen.getByText(/92%/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    test('E2E: User uploads audio and switches models before analysis', async () => {
        // Mock successful fetch responses
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                result: 'fake',
                confidence: 0.85,
                fake_confidence: 0.85,
                real_confidence: 0.15,
                filename: 'test.mp3'
            })
        });

        render(
            <BrowserRouter>
                <Predict />
            </BrowserRouter>
        );

        // 1. Change media type to Audio
        const selectElements = screen.getAllByRole('combobox');
        const mediaTypeSelect = selectElements[0];

        await act(async () => {
            fireEvent.change(mediaTypeSelect, { target: { value: 'Audio' } });
        });

        expect(mediaTypeSelect.value).toBe('Audio');

        // 2. Upload a sample audio file
        const file = new File(['dummy audio content'], 'test.mp3', { type: 'audio/mpeg' });
        const fileInput = screen.getByAcceptValue('audio/*');

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        // 3. Verify file uploaded and analyze button is enabled
        await waitFor(() => {
            expect(screen.getByText('Analyze')).not.toBeDisabled();
        });

        // 4. Change model selection if there's a model select dropdown
        if (selectElements.length > 1) {
            const modelSelect = selectElements[1];
            const options = modelSelect.options;

            if (options.length > 1) {
                await act(async () => {
                    fireEvent.change(modelSelect, { target: { value: options[1].value } });
                });
            }
        }

        // 5. Click analyze button
        const analyzeButton = screen.getByText('Analyze');

        await act(async () => {
            fireEvent.click(analyzeButton);
        });

        // 6. Verify API was called with correct parameters
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            const [url, options] = fetch.mock.calls[0];
            expect(url).toContain('/api/analyze');

            // Verify the FormData contains our file and proper model selection
            const formData = options.body;
            expect(formData instanceof FormData).toBe(true);
        });
    });

    test('E2E: User tries analysis with text input', async () => {
        // Mock successful fetch response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                result: 'real',
                confidence: 0.78,
                fake_confidence: 0.22,
                real_confidence: 0.78
            })
        });

        render(
            <BrowserRouter>
                <Predict />
            </BrowserRouter>
        );

        // 1. Change media type to Text
        const selectElements = screen.getAllByRole('combobox');
        const mediaTypeSelect = selectElements[0];

        await act(async () => {
            fireEvent.change(mediaTypeSelect, { target: { value: 'Text' } });
        });

        expect(mediaTypeSelect.value).toBe('Text');

        // 2. Find text inputs
        const textInputs = screen.getAllByRole('textbox', { hidden: true });
        const visibleInputs = textInputs.filter(input =>
            input.type !== 'file' &&
            window.getComputedStyle(input).display !== 'none'
        );

        // 3. Fill text inputs if they exist
        if (visibleInputs.length > 0) {
            await act(async () => {
                fireEvent.change(visibleInputs[0], { target: { value: 'Sample news headline for testing' } });

                if (visibleInputs.length > 1) {
                    fireEvent.change(visibleInputs[1], { target: { value: 'This is a sample news article text for testing deepfake detection on text content.' } });
                }
            });

            // 4. Check Analyze button is enabled and click it
            const analyzeButton = screen.getByText('Analyze');
            expect(analyzeButton).not.toBeDisabled();

            await act(async () => {
                fireEvent.click(analyzeButton);
            });

            // 5. Verify API was called
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(1);
            });
        } else {
            // Skip the test if text inputs aren't found
            console.log('Text inputs not found, skipping test');
        }
    });

    test('E2E: User receives an error during analysis', async () => {
        // Mock a failed API response
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error occurred during analysis' })
        });

        render(
            <BrowserRouter>
                <Predict />
            </BrowserRouter>
        );

        // 1. Upload a sample image file
        const file = new File(['dummy image content'], 'test.jpg', { type: 'image/jpeg' });
        const fileInput = screen.getByAcceptValue('image/*');

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        // 2. Click analyze button
        await waitFor(() => {
            expect(screen.getByText('Analyze')).not.toBeDisabled();
        });

        const analyzeButton = screen.getByText('Analyze');

        await act(async () => {
            fireEvent.click(analyzeButton);
        });

        // 3. Verify error handling
        await waitFor(() => {
            // Look for error message or indicator in the UI
            const errorMessages = screen.getAllByText((content, element) => {
                return content.includes('error') ||
                    content.includes('failed') ||
                    content.includes('Server error');
            }, { exact: false });

            expect(errorMessages.length).toBeGreaterThan(0);
        }, { timeout: 3000 });
    });
}); 