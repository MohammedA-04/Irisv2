// ***********************************************
// Custom commands for the Iris deepfake detection app
// ***********************************************

// Register a new user
Cypress.Commands.add('register', (username, email, password) => {
    cy.intercept('POST', '**/api/register').as('registerRequest');

    cy.visit('/register');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.get('button[type="submit"]').click();

    return cy.wait('@registerRequest');
});

// Login with username and password
Cypress.Commands.add('login', (username, password) => {
    cy.intercept('POST', '**/api/login').as('loginRequest');

    cy.visit('/login');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    return cy.wait('@loginRequest');
});

// Verify OTP
Cypress.Commands.add('verifyOTP', (otp) => {
    cy.intercept('POST', '**/api/verify-otp').as('otpVerifyRequest');

    cy.get('input[name="otp"]').type(otp);
    cy.get('button[type="submit"]').click();

    return cy.wait('@otpVerifyRequest');
});

// Upload a file and analyze
Cypress.Commands.add('uploadAndAnalyze', (fileType, fileName, fileContents) => {
    cy.intercept('POST', '**/api/analyze').as('analyzeRequest');

    cy.visit('/predict');
    cy.get('select').first().select(fileType);

    const mimeType = fileType === 'Image' ? 'image/jpeg' :
        fileType === 'Audio' ? 'audio/mpeg' :
            fileType === 'Video' ? 'video/mp4' : 'text/plain';

    const acceptPattern = fileType === 'Image' ? 'image/*' :
        fileType === 'Audio' ? 'audio/*' :
            fileType === 'Video' ? 'video/*' : null;

    if (fileType !== 'Text') {
        cy.get(`input[type="file"][accept="${acceptPattern}"]`).selectFile({
            contents: Cypress.Buffer.from(fileContents || 'mock file contents'),
            fileName: fileName,
            mimeType: mimeType,
        }, { force: true });
    } else {
        // Handle text input type
        cy.get('textarea').first().type(fileContents || 'Sample text for analysis');
    }

    cy.contains('Analyze').click();

    return cy.wait('@analyzeRequest');
});

// Check database for analysis record
Cypress.Commands.add('checkDbForAnalysis', (filename, expectedResult) => {
    cy.intercept('GET', '**/api/user/history').as('userHistoryRequest');

    cy.visit('/profile');
    cy.wait('@userHistoryRequest');

    cy.contains(filename).should('be.visible');
    if (expectedResult) {
        cy.contains(expectedResult).should('be.visible');
    }
});

// Read an article
Cypress.Commands.add('readArticle', (articleTitle) => {
    cy.intercept('GET', '**/api/articles').as('articlesRequest');
    cy.intercept('GET', '**/api/articles/**').as('articleRequest');

    cy.visit('/guide');
    cy.wait('@articlesRequest');

    cy.contains(articleTitle).click();
    return cy.wait('@articleRequest');
});

// Logout
Cypress.Commands.add('logout', () => {
    cy.intercept('POST', '**/api/logout').as('logoutRequest');

    cy.contains('Logout').click();
    return cy.wait('@logoutRequest');
}); 