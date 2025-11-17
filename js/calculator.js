class PackageCalculator {
    constructor() {
        this.serviceFeeRate = 0.15; // 15% service fee
        this.validCurricula = ['cbc', '8-4-4', 'igcse'];
    }

    calculateCosts(subjects, hourlyRate, serviceFeeRate = null) {
        // Use provided service fee rate or default
        const effectiveServiceFeeRate = serviceFeeRate !== null ? serviceFeeRate : this.serviceFeeRate;

        // Validate inputs
        const validation = this.validateInputs(subjects, hourlyRate, effectiveServiceFeeRate);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        let totalWeeklyCost = 0;
        const subjectBreakdown = [];

        // Calculate costs for each subject
        subjects.forEach(subject => {
            const subjectCost = this.calculateSubjectCost(subject, hourlyRate);
            totalWeeklyCost += subjectCost.weeklyCost;

            subjectBreakdown.push({
                subject: subject.name,
                daysPerWeek: subject.daysPerWeek,
                sessionDuration: subject.sessionDuration,
                weeklyHours: subjectCost.weeklyHours,
                hourlyRate: hourlyRate,
                weeklyCost: subjectCost.weeklyCost
            });
        });

        // Calculate service fee and first week cost
        const serviceFee = totalWeeklyCost * effectiveServiceFeeRate;
        const firstWeekCost = totalWeeklyCost + serviceFee;

        return {
            weeklyCost: Math.round(totalWeeklyCost),
            serviceFee: Math.round(serviceFee),
            firstWeekCost: Math.round(firstWeekCost),
            subjectBreakdown: subjectBreakdown,
            hourlyRate: hourlyRate,
            totalSubjects: subjects.length,
            totalWeeklyHours: subjectBreakdown.reduce((sum, item) => sum + item.weeklyHours, 0)
        };
    }

    calculateSubjectCost(subject, hourlyRate) {
        const weeklyHours = subject.daysPerWeek * subject.sessionDuration;
        const weeklyCost = weeklyHours * hourlyRate;

        return {
            weeklyHours: weeklyHours,
            weeklyCost: weeklyCost,
            dailyCost: subject.sessionDuration * hourlyRate
        };
    }

    validateInputs(subjects, hourlyRate, serviceFeeRate) {
        const errors = [];

        // Validate subjects array
        if (!Array.isArray(subjects)) {
            errors.push('Subjects must be an array');
            return { isValid: false, errors };
        }

        if (subjects.length === 0) {
            errors.push('At least one subject is required');
        }

        // Validate each subject
        subjects.forEach((subject, index) => {
            if (!subject.name || typeof subject.name !== 'string') {
                errors.push(`Subject ${index + 1}: Name is required and must be a string`);
            }

            if (!Number.isInteger(subject.daysPerWeek) || subject.daysPerWeek < 1 || subject.daysPerWeek > 7) {
                errors.push(`Subject "${subject.name}": Days per week must be an integer between 1 and 7`);
            }

            if (typeof subject.sessionDuration !== 'number' || subject.sessionDuration <= 0) {
                errors.push(`Subject "${subject.name}": Session duration must be a positive number`);
            }
        });

        // Validate rates
        if (!Number.isInteger(hourlyRate) || hourlyRate < 500 || hourlyRate > 1000) {
            errors.push('Hourly rate must be an integer between 500 and 1000 KES');
        }

        if (typeof serviceFeeRate !== 'number' || serviceFeeRate < 0 || serviceFeeRate > 1) {
            errors.push('Service fee rate must be a number between 0 and 1');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Method to get package recommendations (for display purposes)
    getPackageRates() {
        return {
            'comprehensive': 600,
            'standard': 700, 
            'compact': 800
        };
    }

    // Method to calculate cost for specific scenarios
    calculateScenario(scenario) {
        const { subjects, hourlyRate, weeks = 1, includeServiceFee = true } = scenario;
        
        const weeklyCalculation = this.calculateCosts(subjects, hourlyRate);
        
        let totalCost = weeklyCalculation.weeklyCost * weeks;
        if (includeServiceFee && weeks >= 1) {
            totalCost += weeklyCalculation.serviceFee;
        }

        return {
            ...weeklyCalculation,
            totalCost: Math.round(totalCost),
            numberOfWeeks: weeks,
            costPerWeek: weeklyCalculation.weeklyCost
        };
    }

    // Utility method to suggest optimal package based on subject mix
    suggestPackage(subjects) {
        const totalWeeklyHours = subjects.reduce((total, subject) => {
            return total + (subject.daysPerWeek * subject.sessionDuration);
        }, 0);

        if (totalWeeklyHours >= 15) {
            return { package: 'comprehensive', rate: 600, reason: 'High intensity program' };
        } else if (totalWeeklyHours >= 10) {
            return { package: 'standard', rate: 700, reason: 'Moderate intensity program' };
        } else {
            return { package: 'compact', rate: 800, reason: 'Focused tutoring program' };
        }
    }

    // Method to validate subject combinations
    validateSubjectCombination(subjects, curriculum) {
        const warnings = [];

        if (!this.validCurricula.includes(curriculum)) {
            warnings.push(`Unknown curriculum: ${curriculum}`);
            return { isValid: true, warnings }; // Don't block, just warn
        }

        // Check for duplicate subjects
        const subjectNames = subjects.map(s => s.name);
        const duplicates = subjectNames.filter((name, index) => subjectNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            warnings.push(`Duplicate subjects found: ${duplicates.join(', ')}`);
        }

        // Check for reasonable weekly hours
        const totalWeeklyHours = subjects.reduce((total, subject) => {
            return total + (subject.daysPerWeek * subject.sessionDuration);
        }, 0);

        if (totalWeeklyHours > 30) {
            warnings.push('Total weekly hours exceed recommended maximum of 30 hours');
        }

        if (totalWeeklyHours < 2) {
            warnings.push('Very low weekly hours - consider increasing session duration or days');
        }

        return {
            isValid: warnings.length === 0,
            warnings: warnings
        };
    }
}

// Unit tests for the calculator
class CalculatorTests {
    static runTests() {
        const calculator = new PackageCalculator();
        const tests = [
            {
                name: 'Single subject with 5 days',
                subjects: [{ name: 'Mathematics', daysPerWeek: 5, sessionDuration: 1 }],
                hourlyRate: 600,
                expectedWeekly: 3000
            },
            {
                name: 'Mixed days per week',
                subjects: [
                    { name: 'Maths', daysPerWeek: 5, sessionDuration: 1 },
                    { name: 'English', daysPerWeek: 4, sessionDuration: 1 },
                    { name: 'History', daysPerWeek: 3, sessionDuration: 1 },
                    { name: 'French', daysPerWeek: 1, sessionDuration: 1 }
                ],
                hourlyRate: 600,
                expectedWeekly: 7800 // (5+4+3+1) * 600
            },
            {
                name: 'Different session durations',
                subjects: [
                    { name: 'Maths', daysPerWeek: 5, sessionDuration: 2 },
                    { name: 'French', daysPerWeek: 2, sessionDuration: 1.5 }
                ],
                hourlyRate: 700,
                expectedWeekly: 9100 // (5*2*700 + 2*1.5*700) = 7000 + 2100
            },
            {
                name: 'Lowest rate with single day',
                subjects: [{ name: 'Music', daysPerWeek: 1, sessionDuration: 1 }],
                hourlyRate: 500,
                expectedWeekly: 500
            }
        ];

        console.log('Running Calculator Tests...');
        let passed = 0;
        let failed = 0;

        tests.forEach(test => {
            try {
                const result = calculator.calculateCosts(test.subjects, test.hourlyRate);
                if (Math.abs(result.weeklyCost - test.expectedWeekly) < 1) {
                    console.log(`✅ PASS: ${test.name}`);
                    passed++;
                } else {
                    console.log(`❌ FAIL: ${test.name} - Expected ${test.expectedWeekly}, got ${result.weeklyCost}`);
                    failed++;
                }
            } catch (error) {
                console.log(`❌ ERROR: ${test.name} - ${error.message}`);
                failed++;
            }
        });

        console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
        return { passed, failed };
    }
}

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PackageCalculator, CalculatorTests };
}
