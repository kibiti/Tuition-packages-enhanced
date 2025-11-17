class TuitionPackagesApp {
    constructor() {
        this.selectedPackage = 'comprehensive';
        this.subjects = [];
        this.hourlyRate = 600; // Default rate
        this.serviceFeeRate = 0.15; // 15% service fee
        
        this.initializeEventListeners();
        this.updateSummary();
    }

    initializeEventListeners() {
        // Package selection
        document.querySelectorAll('.package-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectPackage(e.currentTarget.dataset.package);
            });
        });

        // Rate override
        document.getElementById('hourlyRate').addEventListener('change', (e) => {
            this.hourlyRate = parseInt(e.target.value);
            this.updatePackageDisplay();
            this.updateSummary();
        });

        // Subject management
        document.getElementById('addSubject').addEventListener('click', () => {
            this.addSubject();
        });

        // Proposal generation
        document.getElementById('generatePDF').addEventListener('click', () => {
            this.generatePDF();
        });

        document.getElementById('printProposal').addEventListener('click', () => {
            this.printProposal();
        });

        document.getElementById('resetAll').addEventListener('click', () => {
            this.resetAll();
        });

        // Set default package
        this.selectPackage('comprehensive');
    }

    selectPackage(packageType) {
        this.selectedPackage = packageType;
        
        // Update UI
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-package="${packageType}"]`).classList.add('selected');

        // Set recommended rate based on package
        const packageRates = {
            'comprehensive': 600,
            'standard': 700,
            'compact': 800
        };

        this.hourlyRate = packageRates[packageType];
        document.getElementById('hourlyRate').value = this.hourlyRate;
        
        this.updatePackageDisplay();
        this.updateSummary();
    }

    updatePackageDisplay() {
        // Update package cards to show selected rate
        document.querySelectorAll('.package-card').forEach(card => {
            const rateElement = card.querySelector('.rate');
            if (rateElement) {
                rateElement.textContent = `Recommended: KES ${this.getPackageRate(card.dataset.package)}/hr`;
            }
        });
    }

    getPackageRate(packageType) {
        const rates = {
            'comprehensive': 600,
            'standard': 700,
            'compact': 800
        };
        return rates[packageType] || 600;
    }

    addSubject() {
        const subjectSelect = document.getElementById('subjectSelect');
        const daysSelect = document.getElementById('daysPerWeek');
        const durationSelect = document.getElementById('sessionDuration');

        const subjectName = subjectSelect.value;
        const daysPerWeek = parseInt(daysSelect.value);
        const sessionDuration = parseFloat(durationSelect.value);

        // Validate inputs
        if (!subjectName) {
            alert('Please select a subject');
            return;
        }

        // Check if subject already exists
        if (this.subjects.some(subj => subj.name === subjectName)) {
            alert('This subject has already been added');
            return;
        }

        // Add subject
        const subject = {
            name: subjectName,
            daysPerWeek: daysPerWeek,
            sessionDuration: sessionDuration
        };

        this.subjects.push(subject);
        this.renderSubject(subject);
        this.updateSummary();

        // Reset form to first subject
        subjectSelect.selectedIndex = 0;
    }

    renderSubject(subject) {
        const container = document.getElementById('subjectsContainer');
        const subjectElement = document.createElement('div');
        subjectElement.className = 'subject-item';
        subjectElement.innerHTML = `
            <div class="subject-info">
                <span class="subject-name">${subject.name}</span>
                <span class="subject-details">${subject.daysPerWeek} days/week × ${subject.sessionDuration} hrs</span>
            </div>
            <button class="btn-remove" data-subject="${subject.name}">×</button>
        `;

        // Add remove event listener
        subjectElement.querySelector('.btn-remove').addEventListener('click', (e) => {
            e.preventDefault();
            this.removeSubject(subject.name);
        });

        container.appendChild(subjectElement);
    }

    removeSubject(subjectName) {
        this.subjects = this.subjects.filter(subj => subj.name !== subjectName);
        
        // Remove from UI
        const container = document.getElementById('subjectsContainer');
        const subjectElement = container.querySelector(`[data-subject="${subjectName}"]`);
        if (subjectElement) {
            subjectElement.closest('.subject-item').remove();
        }

        this.updateSummary();
    }

    updateSummary() {
        if (this.subjects.length === 0) {
            this.displayEmptySummary();
            return;
        }

        const calculator = new PackageCalculator();
        const calculations = calculator.calculateCosts(this.subjects, this.hourlyRate, this.serviceFeeRate);

        this.displaySummary(calculations);
        this.displaySubjectBreakdown(calculations.subjectBreakdown);
    }

    displayEmptySummary() {
        document.getElementById('weeklyCost').textContent = 'KES 0';
        document.getElementById('firstWeekCost').textContent = 'KES 0';
        document.getElementById('serviceFee').textContent = 'KES 0';
        
        const breakdown = document.getElementById('subjectBreakdown');
        breakdown.innerHTML = '<p class="no-subjects">No subjects added yet</p>';
    }

    displaySummary(calculations) {
        document.getElementById('weeklyCost').textContent = `KES ${calculations.weeklyCost.toLocaleString()}`;
        document.getElementById('firstWeekCost').textContent = `KES ${calculations.firstWeekCost.toLocaleString()}`;
        document.getElementById('serviceFee').textContent = `KES ${calculations.serviceFee.toLocaleString()}`;
    }

    displaySubjectBreakdown(breakdown) {
        const container = document.getElementById('subjectBreakdown');
        container.innerHTML = '';

        breakdown.forEach(item => {
            const breakdownItem = document.createElement('div');
            breakdownItem.className = 'breakdown-item';
            breakdownItem.innerHTML = `
                <span class="breakdown-subject">${item.subject}</span>
                <span class="breakdown-cost">KES ${item.weeklyCost.toLocaleString()}/week</span>
                <div class="breakdown-details">
                    ${item.daysPerWeek} days × ${item.sessionDuration} hrs × KES ${item.hourlyRate}/hr
                </div>
            `;
            container.appendChild(breakdownItem);
        });
    }

    generatePDF() {
        if (this.subjects.length === 0) {
            alert('Please add at least one subject before generating a proposal');
            return;
        }

        const clientName = document.getElementById('clientName').value.trim() || 'Client';
        const clientEmail = document.getElementById('clientEmail').value.trim() || 'Not provided';
        const notes = document.getElementById('proposalNotes').value.trim();

        const calculator = new PackageCalculator();
        const calculations = calculator.calculateCosts(this.subjects, this.hourlyRate, this.serviceFeeRate);

        const exporter = new ProposalExporter();
        exporter.generatePDF({
            clientName: clientName,
            clientEmail: clientEmail,
            packageType: this.selectedPackage,
            hourlyRate: this.hourlyRate,
            subjects: this.subjects,
            calculations: calculations,
            notes: notes
        });
    }

    printProposal() {
        if (this.subjects.length === 0) {
            alert('Please add at least one subject before printing a proposal');
            return;
        }

        const clientName = document.getElementById('clientName').value.trim() || 'Client';
        const clientEmail = document.getElementById('clientEmail').value.trim() || 'Not provided';
        const notes = document.getElementById('proposalNotes').value.trim();

        const calculator = new PackageCalculator();
        const calculations = calculator.calculateCosts(this.subjects, this.hourlyRate, this.serviceFeeRate);

        const exporter = new ProposalExporter();
        exporter.printProposal({
            clientName: clientName,
            clientEmail: clientEmail,
            packageType: this.selectedPackage,
            hourlyRate: this.hourlyRate,
            subjects: this.subjects,
            calculations: calculations,
            notes: notes
        });
    }

    resetAll() {
        if (confirm('Are you sure you want to reset everything? This cannot be undone.')) {
            this.subjects = [];
            document.getElementById('subjectsContainer').innerHTML = '';
            document.getElementById('clientName').value = '';
            document.getElementById('clientEmail').value = '';
            document.getElementById('proposalNotes').value = '';
            
            this.selectPackage('comprehensive');
            this.updateSummary();
        }
    }

    validateForm() {
        const errors = [];

        if (this.subjects.length === 0) {
            errors.push('Please add at least one subject');
        }

        if (this.hourlyRate < 500 || this.hourlyRate > 1000) {
            errors.push('Hourly rate must be between 500 and 1000 KES');
        }

        // Validate each subject
        this.subjects.forEach(subject => {
            if (subject.daysPerWeek < 1 || subject.daysPerWeek > 7) {
                errors.push(`Subject "${subject.name}" must have between 1-7 days per week`);
            }
            if (subject.sessionDuration <= 0) {
                errors.push(`Subject "${subject.name}" must have a positive session duration`);
            }
        });

        return errors;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tuitionApp = new TuitionPackagesApp();
});

// Utility functions
const utils = {
    formatCurrency: (amount) => {
        return `KES ${amount.toLocaleString()}`;
    },

    capitalizeFirst: (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};
