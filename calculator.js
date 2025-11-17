class PackageCalculator {
    constructor() {
        this.serviceFeeRate = 0.15; // 15% service fee
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
            const weeklyHours = subject.daysPerWeek * subject.sessionDuration;
            const weeklyCost = weeklyHours * hourlyRate;
            totalWeeklyCost += weeklyCost;

            subjectBreakdown.push({
                subject: subject.name,
                daysPerWeek: subject.daysPerWeek,
                sessionDuration: subject.sessionDuration,
                weeklyHours: weeklyHours,
                hourlyRate: hourlyRate,
                weeklyCost: weeklyCost
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

    // Method to get package recommendations
    getPackageRates() {
        return {
            'comprehensive': 600,
            'standard': 700, 
            'compact': 800
        };
    }

    // Method to suggest optimal package based on subject mix
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
}
