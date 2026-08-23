module.exports = class BasePage {
    constructor() {
        this.title = 'Base Page';
    }

    async open(path) {
        // Appium doesn't usually use URLs, but for Capacitor/Webview it can be useful
        // If testing natively, this might not be needed.
        return true;
    }

    async waitAndClick(element) {
        await element.waitForDisplayed();
        await element.click();
    }

    async waitAndSetValue(element, value) {
        await element.waitForDisplayed();
        await element.setValue(value);
    }
};
