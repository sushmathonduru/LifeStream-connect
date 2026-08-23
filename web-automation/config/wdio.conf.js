const path = require('path');

exports.config = {
    runner: 'local',
    specs: [
        '../tests/**/*.js'
    ],
    exclude: [],
    maxInstances: 10,
    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome',
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
        }
    }],
    logLevel: 'error',
    bail: 0,
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [],
    framework: 'mocha',
    reporters: ['spec', ['allure', {
        outputDir: 'reports/allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            const screenshotPath = path.join(__dirname, '../screenshots');
            const fs = require('fs');
            if (!fs.existsSync(screenshotPath)){
                fs.mkdirSync(screenshotPath, { recursive: true });
            }
            await browser.saveScreenshot(path.join(screenshotPath, `failed_${test.title.replace(/\s+/g, '_')}.png`));
        }
    },
};
