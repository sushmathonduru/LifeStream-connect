const fs = require('fs');
const path = require('path');

async function generateMarkdownSummary() {
    const summaryFile = path.join(__dirname, '../reports/summary.json');
    if (!fs.existsSync(summaryFile)) {
        console.error('summary.json not found!');
        process.exit(1);
    }
    
    const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    
    const passPercentage = ((summary.passed / summary.total) * 100).toFixed(2);
    const failPercentage = ((summary.failed / summary.total) * 100).toFixed(2);
    
    const markdown = `
# Android Appium E2E Execution Summary

**Execution Date:** ${new Date().toISOString()}

### Execution Metrics
- **Total Test Cases:** ${summary.total}
- **Executed:** ${summary.total}
- **Passed:** ${summary.passed} 🟢
- **Failed:** ${summary.failed} 🔴
- **Skipped/Blocked:** ${summary.skipped} ⚪

**Pass Percentage:** ${passPercentage}%
**Fail Percentage:** ${failPercentage}%

> Download the full Excel Report and HTML Allure Report from the GitHub Actions Artifacts!
`;

    console.log(markdown);
}

generateMarkdownSummary().catch(console.error);
