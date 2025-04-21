// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Enable stubbing application requests without a server
const enableStubMode = () => {
    // Define the routes that we need to stub
    const stubRoutes = [
        '/',
        '/login',
        '/register',
        '/verify-otp',
        '/profile',
        '/predict',
        '/guide'
    ];

    // Create stubs for each route
    stubRoutes.forEach(route => {
        cy.intercept('GET', route, {
            statusCode: 200,
            body: `<html><body><h1>${route === '/' ? 'Home' : route.replace('/', '')}</h1><div>Stub for ${route}</div></body></html>`,
            headers: {
                'Content-Type': 'text/html'
            }
        });
    });

    cy.log('Application routes stubbed for testing without server');
};

// Mock database functions
Cypress.Commands.add('mockDatabase', () => {
    // This command sets up consistent database mocking
    // Create a database state that persists within the test
    cy.window().then(win => {
        win.mockDb = {
            users: [],
            analyses: [],
            articles: [
                {
                    id: '1',
                    title: 'Introduction to DIMA Technology',
                    author: 'Dr. Research',
                    date: '2023-04-15',
                    excerpt: 'Learn about the cutting-edge DIMA technology for deepfake detection',
                    slug: 'intro-to-dima',
                    content: 'DIMA (Deep Image Manipulation Analysis) is a revolutionary approach to deepfake detection that uses multi-layer perceptual analysis to identify inconsistencies in digital media that may not be visible to the human eye.'
                }
            ]
        };
    });

    // Enable stub mode by default
    enableStubMode();
});

// Add a record to the mock database
Cypress.Commands.add('addToMockDb', (collection, data) => {
    cy.window().then(win => {
        if (!win.mockDb[collection]) {
            win.mockDb[collection] = [];
        }
        win.mockDb[collection].push(data);
    });
});

// Check if a record exists in the mock database
Cypress.Commands.add('checkMockDb', (collection, query) => {
    return cy.window().then(win => {
        const records = win.mockDb[collection] || [];
        const matchingRecords = records.filter(record => {
            return Object.entries(query).every(([key, value]) => record[key] === value);
        });
        return matchingRecords.length > 0;
    });
});

// Setup response interception that adds to mock database
Cypress.Commands.add('interceptAndStore', (method, url, collection, responseFn) => {
    cy.intercept(method, url, (req) => {
        const response = typeof responseFn === 'function'
            ? responseFn(req)
            : responseFn;

        // Add to mock database if applicable
        if (response.body && collection) {
            cy.window().then(win => {
                if (!win.mockDb[collection]) {
                    win.mockDb[collection] = [];
                }
                if (Array.isArray(response.body)) {
                    win.mockDb[collection] = [...win.mockDb[collection], ...response.body];
                } else {
                    win.mockDb[collection].push(response.body);
                }
            });
        }

        req.reply(response);
    });
});

// Add custom commands here if needed 