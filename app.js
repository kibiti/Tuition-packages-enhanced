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
                const packageRate = this.getPackageRate(card.dataset.package);
                rateElement.textContent = `Recommended: KES ${packageRate}/hr`;
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
        
        // Remove "no subjects" message if it exists
        const noSubjects = container.querySelector('.no-subjects');
        if (noSubjects) {
            noSubjects.remove();
        }

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

        // Show "no subjects" message if empty
        if (this.subjects.length === 0) {
            container.innerHTML = '<div class="no-subjects">No subjects added yet</div>';
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
        breakdown.innerHTML = '<div class="no-subjects">No subjects added yet</div>';
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
                <div class="breakdown-subject">${item.subject}</div>
                <div class="breakdown-cost">KES ${item.weeklyCost.toLocaleString()}/week</div>
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
        const success = exporter.generatePDF({
            clientName: clientName,
            clientEmail: clientEmail,
            packageType: this.selectedPackage,
            hourlyRate: this.hourlyRate,
            subjects: this.subjects,
            calculations: calculations,
            notes: notes
        });

        if (success) {
            alert('PDF generated successfully!');
        }
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
            document.getElementById('subjectsContainer').innerHTML = '<div class="no-subjects">No subjects added yet</div>';
            document.getElementById('clientName').value = '';
            document.getElementById('clientEmail').value = '';
            document.getElementById('proposalNotes').value = '';
            
            this.selectPackage('comprehensive');
            this.updateSummary();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tuitionApp = new TuitionPackagesApp();
});
