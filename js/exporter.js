class ProposalExporter {
    constructor() {
        this.brandColor = '#2563eb'; // ElimuHub brand blue
        this.accentColor = '#059669'; // Green accent
        this.logo = 'ElimuHub';
    }

    generatePDF(proposalData) {
        try {
            // Create new PDF instance
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            this.addHeader(doc, proposalData);
            this.addClientInfo(doc, proposalData);
            this.addPackageDetails(doc, proposalData);
            this.addSubjectBreakdown(doc, proposalData);
            this.addCostSummary(doc, proposalData);
            this.addPaymentTerms(doc, proposalData);
            this.addNotes(doc, proposalData);
            this.addFooter(doc, proposalData);

            // Generate filename
            const filename = `ElimuHub_Proposal_${proposalData.clientName.replace(/\s+/g, '_')}_${this.getCurrentDate()}.pdf`;
            
            // Save the PDF
            doc.save(filename);
            
            return true;
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again or use the print option.');
            return false;
        }
    }

    printProposal(proposalData) {
        // Create print-friendly HTML
        const printWindow = window.open('', '_blank');
        const printContent = this.generatePrintHTML(proposalData);
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for images to load before printing
        printWindow.onload = () => {
            printWindow.print();
            // printWindow.close(); // Optional: close after printing
        };
    }

    addHeader(doc, data) {
        // Brand header
        doc.setFillColor(37, 99, 235); // Brand blue
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(this.logo, 20, 20);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Education Consultants', 20, 27);
        
        // Proposal title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('TUITION PROPOSAL', 105, 45, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${this.getCurrentDate()}`, 105, 52, { align: 'center' });
    }

    addClientInfo(doc, data) {
        const startY = 65;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENT INFORMATION', 20, startY);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Client Name: ${data.clientName}`, 20, startY + 8);
        doc.text(`Email: ${data.clientEmail}`, 20, startY + 16);
        doc.text(`Proposal ID: ${this.generateProposalId()}`, 20, startY + 24);
    }

    addPackageDetails(doc, data) {
        const startY = 100;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PACKAGE DETAILS', 20, startY);
        
        const packageNames = {
            'comprehensive': 'Comprehensive Package',
            'standard': 'Standard Package', 
            'compact': 'Compact Package'
        };
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Selected Package: ${packageNames[data.packageType] || data.packageType}`, 20, startY + 8);
        doc.text(`Hourly Rate: KES ${data.hourlyRate.toLocaleString()}`, 20, startY + 16);
        doc.text(`Service Fee: 15%`, 20, startY + 24);
    }

    addSubjectBreakdown(doc, data) {
        const startY = 130;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SUBJECT BREAKDOWN', 20, startY);
        
        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(20, startY + 5, 170, 8, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text('Subject', 22, startY + 10);
        doc.text('Days/Week', 80, startY + 10);
        doc.text('Duration', 110, startY + 10);
        doc.text('Weekly Hours', 135, startY + 10);
        doc.text('Weekly Cost', 165, startY + 10);
        
        let currentY = startY + 20;
        
        data.subjects.forEach((subject, index) => {
            if (currentY > 270) {
                // Add new page if running out of space
                doc.addPage();
                currentY = 20;
            }
            
            const subjectCost = this.calculateSubjectCost(subject, data.hourlyRate);
            
            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, currentY - 4, 170, 8, 'F');
            }
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            // Subject name (truncate if too long)
            const subjectName = subject.name.length > 20 ? subject.name.substring(0, 20) + '...' : subject.name;
            doc.text(subjectName, 22, currentY);
            doc.text(subject.daysPerWeek.toString(), 80, currentY);
            doc.text(`${subject.sessionDuration} hrs`, 110, currentY);
            doc.text(subjectCost.weeklyHours.toString(), 135, currentY);
            doc.text(`KES ${subjectCost.weeklyCost.toLocaleString()}`, 165, currentY);
            
            currentY += 8;
        });
        
        return currentY;
    }

    addCostSummary(doc, data) {
        const startY = 200;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('COST SUMMARY', 20, startY);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const calculations = data.calculations;
        
        doc.text(`Weekly Tuition Cost: KES ${calculations.weeklyCost.toLocaleString()}`, 30, startY + 10);
        doc.text(`Service Fee (15%): KES ${calculations.serviceFee.toLocaleString()}`, 30, startY + 18);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105); // Accent green
        doc.text(`First Week Total: KES ${calculations.firstWeekCost.toLocaleString()}`, 30, startY + 28);
        
        // Reset color
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(`Subsequent Weeks: KES ${calculations.weeklyCost.toLocaleString()}/week`, 30, startY + 36);
        
        // Total hours
        doc.text(`Total Weekly Hours: ${calculations.totalWeeklyHours} hours`, 30, startY + 46);
        doc.text(`Total Subjects: ${calculations.totalSubjects}`, 30, startY + 54);
    }

    addPaymentTerms(doc, data) {
        const startY = 250;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT TERMS', 20, startY);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        const terms = [
            '• First payment due before commencement of tuition',
            '• Subsequent payments due weekly every Monday',
            '• Payment methods: M-Pesa, Bank Transfer, Cash',
            '• M-Pesa Paybill: 123456 • Account: Your Name',
            '• Late payments may result in suspension of services',
            '• 24-hour cancellation notice required for rescheduling'
        ];
        
        terms.forEach((term, index) => {
            doc.text(term, 25, startY + 8 + (index * 5));
        });
    }

    addNotes(doc, data) {
        if (!data.notes) return;
        
        const startY = 290;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('ADDITIONAL NOTES', 20, startY);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        // Split notes into lines that fit the page width
        const lines = doc.splitTextToSize(data.notes, 170);
        doc.text(lines, 20, startY + 8);
    }

    addFooter(doc, data) {
        const footerY = 270;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        
        doc.text('This proposal is valid for 30 days from generation date.', 105, footerY, { align: 'center' });
        doc.text('For any questions, contact ElimuHub at info@elimuhub.com or +254 700 000 000', 105, footerY + 5, { align: 'center' });
        doc.text('Thank you for choosing ElimuHub Education Consultants!', 105, footerY + 12, { align: 'center' });
        
        // Page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        }
    }

    generatePrintHTML(data) {
        const calculations = data.calculations;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>ElimuHub Proposal - ${data.clientName}</title>
    <style>
        @media print {
            @page { margin: 1cm; }
            body { font-family: Arial, sans-serif; color: #000; }
            .no-print { display: none; }
        }
        body { 
            font-family: Arial, sans-serif; 
            color: #000; 
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header { 
            background: #2563eb; 
            color: white; 
            padding: 20px; 
            text-align: center;
            margin-bottom: 30px;
        }
        .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-weight: bold; 
            font-size: 16px; 
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
        }
        th { 
            background: #f3f4f6; 
            text-align: left; 
            padding: 8px;
            border: 1px solid #d1d5db;
        }
        td { 
            padding: 8px; 
            border: 1px solid #d1d5db;
        }
        .total-row { 
            font-weight: bold; 
            background: #dcfce7;
        }
        .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280;
        }
        .cost-highlight {
            color: #059669;
            font-weight: bold;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>ElimuHub Education Consultants</h1>
        <h2>Tuition Proposal</h2>
        <p>Generated on: ${this.getCurrentDate()}</p>
    </div>

    <div class="section">
        <div class="section-title">Client Information</div>
        <p><strong>Client Name:</strong> ${data.clientName}</p>
        <p><strong>Email:</strong> ${data.clientEmail}</p>
        <p><strong>Proposal ID:</strong> ${this.generateProposalId()}</p>
    </div>

    <div class="section">
        <div class="section-title">Package Details</div>
        <p><strong>Selected Package:</strong> ${this.formatPackageName(data.packageType)}</p>
        <p><strong>Hourly Rate:</strong> KES ${data.hourlyRate.toLocaleString()}</p>
        <p><strong>Service Fee:</strong> 15%</p>
    </div>

    <div class="section">
        <div class="section-title">Subject Breakdown</div>
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Days/Week</th>
                    <th>Session Duration</th>
                    <th>Weekly Hours</th>
                    <th>Weekly Cost</th>
                </tr>
            </thead>
            <tbody>
                ${data.subjects.map(subject => {
                    const cost = this.calculateSubjectCost(subject, data.hourlyRate);
                    return `
                    <tr>
                        <td>${subject.name}</td>
                        <td>${subject.daysPerWeek}</td>
                        <td>${subject.sessionDuration} hrs</td>
                        <td>${cost.weeklyHours}</td>
                        <td>KES ${cost.weeklyCost.toLocaleString()}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Cost Summary</div>
        <p><strong>Weekly Tuition Cost:</strong> KES ${calculations.weeklyCost.toLocaleString()}</p>
        <p><strong>Service Fee (15%):</strong> KES ${calculations.serviceFee.toLocaleString()}</p>
        <p class="cost-highlight">First Week Total: KES ${calculations.firstWeekCost.toLocaleString()}</p>
        <p><strong>Subsequent Weeks:</strong> KES ${calculations.weeklyCost.toLocaleString()} per week</p>
        <p><strong>Total Weekly Hours:</strong> ${calculations.totalWeeklyHours} hours</p>
        <p><strong>Total Subjects:</strong> ${calculations.totalSubjects}</p>
    </div>

    <div class="section">
        <div class="section-title">Payment Terms</div>
        <ul>
            <li>First payment due before commencement of tuition</li>
            <li>Subsequent payments due weekly every Monday</li>
            <li>Payment methods: M-Pesa, Bank Transfer, Cash</li>
            <li>M-Pesa Paybill: 123456 • Account: Your Name</li>
            <li>Late payments may result in suspension of services</li>
            <li>24-hour cancellation notice required for rescheduling</li>
        </ul>
    </div>

    ${data.notes ? `
    <div class="section">
        <div class="section-title">Additional Notes</div>
        <p>${data.notes}</p>
    </div>
    ` : ''}

    <div class="footer">
        <p>This proposal is valid for 30 days from generation date.</p>
        <p>For any questions, contact ElimuHub at info@elimuhub.com or +254 700 000 000</p>
        <p><strong>Thank you for choosing ElimuHub Education Consultants!</strong></p>
    </div>

    <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()">Print Proposal</button>
        <button onclick="window.close()">Close Window</button>
    </div>
</body>
</html>`;
    }

    // Utility methods
    calculateSubjectCost(subject, hourlyRate) {
        const weeklyHours = subject.daysPerWeek * subject.sessionDuration;
        const weeklyCost = weeklyHours * hourlyRate;
        
        return {
            weeklyHours: weeklyHours,
            weeklyCost: weeklyCost
        };
    }

    formatPackageName(packageType) {
        const names = {
            'comprehensive': 'Comprehensive Package',
            'standard': 'Standard Package',
            'compact': 'Compact Package'
        };
        return names[packageType] || packageType;
    }

    getCurrentDate() {
        const now = new Date();
        return now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    generateProposalId() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `EH-${timestamp}-${random}`;
    }

    // Test method for PDF formatting
    static testPDFFormatting() {
        const testData = {
            clientName: 'Test Client',
            clientEmail: 'test@example.com',
            packageType: 'comprehensive',
            hourlyRate: 600,
            subjects: [
                { name: 'Mathematics', daysPerWeek: 5, sessionDuration: 1 },
                { name: 'English Language', daysPerWeek: 4, sessionDuration: 1 },
                { name: 'History', daysPerWeek: 3, sessionDuration: 1 },
                { name: 'French', daysPerWeek: 1, sessionDuration: 2 }
            ],
            calculations: {
                weeklyCost: 9000,
                serviceFee: 1350,
                firstWeekCost: 10350,
                totalSubjects: 4,
                totalWeeklyHours: 14
            },
            notes: 'This is a test proposal for demonstration purposes.'
        };

        const exporter = new ProposalExporter();
        return exporter.generatePDF(testData);
    }
}

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProposalExporter };
}
