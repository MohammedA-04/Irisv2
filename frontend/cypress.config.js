const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        // Remove baseUrl completely
        baseUrl: null,
        setupNodeEvents(on, config) {
            // Implement special handling for no-server environment
            on('before:browser:launch', (browser, launchOptions) => {
                return launchOptions;
            });
        },
    },
    component: {
        devServer: {
            framework: 'react',
            bundler: 'webpack',
        },
    },
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    // Disable web security to allow local file testing without server
    chromeWebSecurity: false,
    // Tell Cypress not to verify that the server is running - use proper format
    experimentalModifyObstructiveThirdPartyCode: true
}); 