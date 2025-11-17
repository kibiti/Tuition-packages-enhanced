/**
 * Unit Tests for ElimuHub Tuition Packages Calculator
 * Tests cover cost calculations, validation, and PDF formatting
 */

class TuitionPackageTests {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }

    runAllTests() {
        console.log('🧪 Running ElimuHub Calculator Tests...\n');
        
        this.testCalculatorInitialization();
        this.testMixedDaysCalculations();
        this.testRateOverrides();
        this.testServiceFeeCalculations();
        this.testSubjectValidation();
        this.testEdgeCases();
        this.testPackageSuggestions();
        this.testPDFGeneration();
        
        this.printResults();
        return this.getSummary();
    }

    testCalculatorInitialization() {
        this.section('Calculator Initialization');
        
        const calculator = new PackageCalculator();
        
        this.assert('Calculator instance created', calculator !== null);
        this.assert('Service fee rate defaults to 15%', calculator.serviceFeeRate === 0.15);
    }

    testMixedDaysCalculations() {
        this.section('Mixed Days Per Week Calculations');
        
        const calculator = new PackageCalculator();
        
        // Test case: Maths=5, English=4, History=3, French=1
        const subjects1 = [
            { name: 'Mathematics', daysPerWeek: 5, sessionDuration: 1 },
            { name: 'English', daysPerWeek: 4, sessionDuration: 1 },
            { name: 'History', daysPerWeek: 3, sessionDuration: 1 },
            { name: 'French', daysPerWeek: 1, sessionDuration: 1 }
        ];
        
        const result1 = calculator.calculateCosts(subjects1, 600);
        this.assert('Mixed days calculation - weekly cost', result1.weeklyCost === 7800);
        this.assert('Mixed days calculation - service fee', result1.serviceFee === 1170);
        this.assert('Mixed days calculation - first week', result1.firstWeekCost === 8970);
        this.assert('Mixed days calculation - total hours', result1.totalWeeklyHours === 13);
        this.assert('Mixed days calculation - subject count', result1.totalSubjects === 4);

        // Test case: Different session durations
        const subjects2 = [
            { name: 'Maths', daysPerWeek: 5, sessionDuration: 2 },
            { name: 'French', daysPerWeek: 2, sessionDuration: 1.5 }
        ];
        
        const result2 = calculator.calculateCosts(subjects2, 700);
        this.assert('Mixed durations calculation', result2.weeklyCost === 9100); // (5*2 + 2*1.5) * 700
    }

    testRateOverrides() {
        this.section('Rate Override Calculations');
        
        const calculator = new PackageCalculator();
        const subjects = [
            { name: 'Mathematics', daysPerWeek: 3, sessionDuration: 1 }
        ];

        // Test different rates
        const rates = [500, 600, 700, 800, 900, 1000];
        rates.forEach(rate => {
            const result = calculator.calculateCosts(subjects, rate);
            const expectedWeekly = 3 * rate; // 3 days × 1 hour × rate
            this.assert(`Rate ${rate} calculation`, result.weeklyCost === expectedWeekly);
        });
    }

    testServiceFeeCalculations() {
        this.section('Service Fee Calculations');
        
        const calculator = new PackageCalculator();
        const subjects = [
            { name: 'Mathematics', daysPerWeek: 5, sessionDuration: 2 }
        ];

        // Test default service fee (15%)
        const defaultResult = calculator.calculateCosts(subjects, 600);
        const expectedServiceFee = Math.round(6000 * 0.15); // 10 hours × 600 = 6000
        this.assert('Default service fee (15%)', defaultResult.serviceFee === expectedServiceFee);

        // Test custom service fee
        const customResult = calculator.calculateCosts(subjects, 600, 0.10);
        const expectedCustomFee = Math.round(6000 * 0.10);
        this.assert('Custom service fee (10%)', customResult.serviceFee === expectedCustomFee);
    }

    testSubjectValidation() {
        this.section('Subject Validation');
        
        const calculator = new PackageCalculator();

        // Test valid subjects
        const validSubjects = [
            { name: 'Mathematics', daysPerWeek: 5, sessionDuration: 1 },
            { name: 'English', daysPerWeek: 1, sessionDuration: 2 }
        ];
        const validResult = calculator.validateInputs(validSubjects, 600, 0.15);
        this.assert('Valid subjects pass validation', validResult.isValid === true);

        // Test invalid days per week
        const invalidDays = [
            { name: 'Mathematics', daysPerWeek: 0, sessionDuration: 1 } // 0 days - invalid
        ];
        const invalidDaysResult = calculator.validateInputs(invalidDays, 600, 0.15);
        this.assert('Invalid days per week caught', invalidDaysResult.isValid === false);

        // Test invalid session duration
        const invalidDuration = [
            { name: 'Mathematics', daysPerWeek: 3, sessionDuration: 0 } // 0 hours - invalid
        ];
        const invalidDurationResult = calculator.validateInputs(invalidDuration, 600, 0.15);
        this.assert('Invalid session duration caught', invalidDurationResult.isValid === false);

        // Test invalid hourly rate
        const invalidRateResult = calculator.validateInputs(validSubjects, 499, 0.15);
        this.assert('Invalid hourly rate caught', invalidRateResult.isValid === false);
    }

    testEdgeCases() {
        this.section('Edge Cases');
        
        const calculator = new PackageCalculator();

        // Test single subject with minimum values
        const minSubject = [
            { name: 'Music', daysPerWeek: 1, sessionDuration: 1 }
        ];
        const minResult = calculator.calculateCosts(minSubject, 500);
        this.assert('Minimum values calculation', minResult.weeklyCost === 500);

        // Test maximum days per week
        const maxDays = [
            { name: 'Intensive', daysPerWeek: 7, sessionDuration: 3 }
        ];
        const maxResult = calculator.calculateCosts(maxDays, 600);
        this.assert('Maximum days calculation', maxResult.weeklyCost === 12600);

        // Test empty subjects array
        const emptyResult = calculator.validateInputs([], 600, 0.15);
        this.assert('Empty subjects validation', emptyResult.isValid === false);

        // Test decimal session durations
        const decimalSubjects = [
            { name: 'Maths', daysPerWeek: 3, sessionDuration: 1.5 }
        ];
        const decimalResult = calculator.calculateCosts(decimalSubjects, 600);
        this.assert('Decimal durations calculation', decimalResult.weeklyCost === 2700); // 3 × 1.5 × 600
    }

    testPackageSuggestions() {
        this.section('Package Suggestions');
        
        const calculator = new PackageCalculator();

        // Test high intensity suggestion
        const highIntensity = [
            { name: 'Maths', daysPerWeek: 5, sessionDuration: 2 },
            { name: 'Science', daysPerWeek: 5, sessionDuration: 2 }
        ];
        const highSuggestion = calculator.suggestPackage(highIntensity);
        this.assert('High intensity suggests comprehensive', highSuggestion.package === 'comprehensive');

        // Test moderate intensity suggestion
        const moderateIntensity = [
            { name: 'Maths', daysPerWeek: 4, sessionDuration: 1.5 },
            { name: 'English', daysPerWeek: 3, sessionDuration: 1 }
        ];
        const moderateSuggestion = calculator.suggestPackage(moderateIntensity);
        this.assert('Moderate intensity suggests standard', moderateSuggestion.package === 'standard');

        // Test low intensity suggestion
        const lowIntensity = [
            { name: 'French', daysPerWeek: 2, sessionDuration: 1 }
        ];
        const lowSuggestion = calculator.suggestPackage(lowIntensity);
        this.assert('Low intensity suggests compact', lowSuggestion.package === 'compact');
    }

    testPDFGeneration() {
        this.section('PDF Generation');
        
        const exporter = new ProposalExporter();

        // Test package name formatting
        this.assert('Comprehensive package name', exporter.formatPackageName('comprehensive') === 'Comprehensive Package');
        this.assert('Standard package name', exporter.formatPackageName('standard') === 'Standard Package');
        this.assert('Compact package name', exporter.formatPackageName('compact') === 'Compact Package');

        // Test proposal ID generation
        const proposalId = exporter.generateProposalId();
        this.assert('Proposal ID format', /^EH-\d{6}-[A-Z0-9]{3}$/.test(proposalId));
    }

    // Test runner utilities
    section(name) {
        console.log(`\n📋 ${name}`);
    }

    assert(description, condition) {
        if (condition) {
            console.log(`  ✅ PASS: ${description}`);
            this.passed++;
            this.results.push({ description, passed: true });
        } else {
            console.log(`  ❌ FAIL: ${description}`);
            this.failed++;
            this.results.push({ description, passed: false });
        }
    }

    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('🎯 TEST RESULTS');
        console.log('='.repeat(50));
        
        this.results.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.description}`);
        });

        console.log('\n' + '='.repeat(50));
        console.log(`📊 Summary: ${this.passed} passed, ${this.failed} failed`);
        console.log('='.repeat(50));

        // Show in browser if available
        if (typeof document !== 'undefined') {
            this.showResultsInBrowser();
        }
    }

    showResultsInBrowser() {
        const resultsDiv = document.createElement('div');
        resultsDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid ${this.failed > 0 ? '#ef4444' : '#10b981'};
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            font-family: Arial, sans-serif;
        `;

        resultsDiv.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Test Results</h3>
            <div style="color: ${this.failed > 0 ? '#ef4444' : '#10b981'}; font-weight: bold; margin-bottom: 15px;">
                ${this.passed} passed, ${this.failed} failed
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${this.results.map(result => `
                    <div style="display: flex; align-items: center; margin-bottom: 5px; font-size: 14px;">
                        <span style="color: ${result.passed ? '#10b981' : '#ef4444'}; margin-right: 8px;">
                            ${result.passed ? '✓' : '✗'}
                        </span>
                        <span>${result.description}</span>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 15px;
                padding: 8px 16px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Close</button>
        `;

        document.body.appendChild(resultsDiv);
    }

    getSummary() {
        return {
            passed: this.passed,
            failed: this.failed,
            total: this.passed + this.failed,
            successRate: ((this.passed / (this.passed + this.failed)) * 100).toFixed(1)
        };
    }
}

// Browser-based test runner
class BrowserTestRunner {
    constructor() {
        this.tests = new TuitionPackageTests();
    }

    runTests() {
        try {
            const results = this.tests.runAllTests();
            this.showNotification(results);
            return results;
        } catch (error) {
            console.error('Test runner error:', error);
            this.showError(error);
        }
    }

    showNotification(results) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${results.failed === 0 ? '#10b981' : '#ef4444'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10001;
            font-family: Arial, sans-serif;
            font-weight: bold;
        `;

        notification.textContent = `Tests: ${results.passed} passed, ${results.failed} failed`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc2626;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10001;
            font-family: Arial, sans-serif;
            max-width: 500px;
        `;

        errorDiv.innerHTML = `
            <strong>Test Error</strong>
            <div style="margin-top: 8px; font-size: 14px;">${error.message}</div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 10px;
                padding: 5px 10px;
                background: white;
                color: #dc2626;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Close</button>
        `;

        document.body.appendChild(errorDiv);
    }
}

// Quick test function for console
function runQuickTests() {
    const tests = new TuitionPackageTests();
    return tests.runAllTests();
}

// Make test runner globally available
window.TuitionPackageTests = TuitionPackageTests;
window.BrowserTestRunner = BrowserTestRunner;
window.runQuickTests = runQuickTests;
