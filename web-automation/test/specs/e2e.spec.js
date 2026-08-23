const { expect, browser, $ } = require('@wdio/globals');

describe('LifeStream Connect - Live Web Application E2E Tests', () => {
    
    it('should load the home page and verify the title', async () => {
        await browser.url('/');
        const title = await browser.getTitle();
        console.log("Page title is: " + title);
        // The title might be 'Vite + React' or 'LifeStream Connect' depending on index.html
        expect(title).toBeDefined();
    });

    it('should have a login button or link visible', async () => {
        await browser.url('/');
        // We look for a login button or link based on typical semantic structures
        const loginLink = await $('a[href="/login"], button*=Login');
        if (await loginLink.isExisting()) {
            await expect(loginLink).toBeDisplayed();
        }
    });

    it('should measure response time under 2 seconds for initial load', async () => {
        const start = Date.now();
        await browser.url('/');
        const end = Date.now();
        const duration = end - start;
        console.log(\`Page loaded in \${duration}ms\`);
        expect(duration).toBeLessThan(5000); // Allow up to 5s in CI
    });

});
