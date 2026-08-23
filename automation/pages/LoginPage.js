const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    get inputUsername() { return $('~username'); }
    get inputPassword() { return $('~password'); }
    get btnSubmit() { return $('~login-button'); }

    async login(username, password) {
        await this.waitAndSetValue(this.inputUsername, username);
        await this.waitAndSetValue(this.inputPassword, password);
        await this.waitAndClick(this.btnSubmit);
    }
}

module.exports = new LoginPage();
