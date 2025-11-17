# 📚 ElimuHub Tuition Packages Generator

<div align="center">

https://img.shields.io/badge/ElimuHub-Education%20Consultants-blue
https://img.shields.io/badge/version-2.0.0-green
https://img.shields.io/badge/license-MIT-orange
https://img.shields.io/badge/status-active-success

Professional tuition package generator for ElimuHub Education Consultants

Features • Installation • Usage • Packages • Contributing

</div>

---

## 🚀 Overview

The ElimuHub Tuition Packages Generator is a comprehensive web application designed to streamline the creation of customized tuition packages for clients. Built with modern web technologies, it provides an intuitive interface for generating professional tuition proposals with automatic calculations and brand-consistent formatting.

**🎯 Key Features**

- 📊 Interactive Package Calculator - Real-time cost calculations for different package options
- 🎨 Professional Templates - Clean, brand-consistent proposal designs
- ⚡ Automatic Calculations - Instant pricing based on subjects, days, and package type
- 📱 Responsive Design - Works seamlessly on desktop, tablet, and mobile devices
- 🖨️ Print-Ready Output - Optimized for printing and PDF export
- 🔧 Customizable Packages - Flexible subject combinations and scheduling options
- 💾 Local Storage - Save draft proposals automatically
- 🎯 Smart Recommendations - Intelligent package suggestions based on client needs

---

## 🛠️ Installation

Prerequisites

· Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
· Internet connection for CDN resources
· Basic understanding of HTML/CSS/JavaScript (for customization)

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/kibiti/Tuition-packages-enhanced.git
```

1. Navigate to the project directory:

```bash
cd elimuhub-tuition-packages-generator
```

1. Open index.html in your web browser or deploy to your web server.

**For GitHub Pages Deployment**

1. Fork the repository to your GitHub account
2. Enable GitHub Pages in your repository settings (Settings → Pages)
3. Select the main branch as source
4. Access your application at: https://kibiti.github.io/elimuhub-tuition-packages-generator

---

## 📖 Usage

Basic Workflow

1. Select Package Type - Choose between Comprehensive (5 days), Standard (4 days), or Compact (3 days)
2. Configure Subjects - Add subjects and select weekly frequency for each
3. Set Schedule - Define preferred days and session duration
4. Add Client Details - Enter student and parent information
5. Generate Proposal - Automatically create professional tuition package
6. Export/Print - Save as PDF or print for client presentation

**Package Configuration Example**

```javascript
// Example package configuration
const packageConfig = {
  type: 'standard', // comprehensive | standard | compact
  subjects: [
    { name: 'Mathematics', daysPerWeek: 4 },
    { name: 'Chemistry', daysPerWeek: 3 },
    { name: 'Biology', daysPerWeek: 3 }
  ],
  sessionDuration: 1.5, // hours
  startDate: '2025-03-01',
  clientInfo: {
    studentName: 'John Doe',
    grade: 'Form 3',
    parentName: 'Jane Doe',
    contact: '+254712345678'
  }
};
```

---

**📦 Package Options**

Pricing Structure

Package Days/Week Rate/Hour Best For
Comprehensive 5 days KSh 600 Intensive preparation & exam candidates
Standard 4 days KSh 700 Balanced learning approach
Compact 3 days KSh 800 Focused support & specific subjects

Calculation Formula

```javascript
// Weekly cost calculation
function calculateWeeklyCost(packageType, subjects, sessionDuration) {
  const rates = { comprehensive: 600, standard: 700, compact: 800 };
  const dailyRate = subjects.length * rates[packageType] * sessionDuration;
  const daysPerWeek = { comprehensive: 5, standard: 4, compact: 3 };
  return dailyRate * daysPerWeek[packageType];
}

// Total monthly calculation (4 weeks)
function calculateMonthlyCost(weeklyCost) {
  return weeklyCost * 4;
}
```

---

🎓 Subject Combinations

Available Subjects

· STEM Focus: Mathematics, Physics, Chemistry, Biology, Computer Science
· Languages: English, Kiswahili, French, German, Literature
· Humanities: History, Geography, Social Studies, IRE, CRE
· Creative Arts: Art, Music, Home Science, Business Studies
· Custom Combinations: Mix and match as needed

Combination Rules

· Minimum 1 subject per package
· Maximum 4 subjects for optimal learning outcomes
· Flexible days allocation per subject (1-5 days per week)
· Tutor specialization matching based on subject requirements

---

## 💰 Payment Terms

Payment Structure

· Weekly billing every Friday
· First payment due upon teacher deployment
· Service fee: KSh 1,000 (one-time, included in first payment)
· Payment methods: M-Pesa, Airtel Money, Bank Transfer

Billing Example

```javascript
// Example billing calculation
const serviceFee = 1000;
const weeklyCost = calculateWeeklyCost(packageType, subjects, sessionDuration);
const firstWeekPayment = weeklyCost + serviceFee;
const subsequentWeeks = weeklyCost;
const monthlyTotal = (weeklyCost * 4) + serviceFee;
```

---

## 🔧 Technical Details

File Structure

```
elimuhub-tuition-packages-generator/
├── index.html                 # Main application interface
├── css/
│   ├── style.css              # Main stylesheet and responsive design
│   ├── print.css              # Print-optimized styles
│   └── components/            # Modular CSS components
├── js/
│   ├── app.js                 # Main application logic
│   ├── calculator.js          # Package calculations and pricing
│   ├── exporter.js            # PDF generation and print functionality
│   ├── storage.js             # Local storage management
│   └── utils/                 # Utility functions
├── assets/
│   ├── images/                # Brand assets and icons
│   └── fonts/                 # Custom typography
└── docs/
    ├── packages.md            # Package documentation
    └── api.md                 # Developer documentation
```

**Browser Support**

· ✅ Chrome 90+
· ✅ Firefox 88+
· ✅ Safari 14+
· ✅ Edge 90+
· ⚠️ Internet Explorer (not supported)

Technologies Used

· Frontend: HTML5, CSS3, Vanilla JavaScript
· Styling: CSS Grid, Flexbox, CSS Custom Properties
· Storage: Local Storage API
· Print: CSS Print Media Queries
· Icons: Font Awesome, Material Icons

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

Reporting Issues

· Use GitHub Issues to report bugs or suggest features
· Include detailed descriptions, steps to reproduce, and browser/OS information

Development Workflow

1. Fork the repository
2. Create a feature branch: git checkout -b feature/amazing-feature
3. Commit changes: git commit -m 'Add amazing feature'
4. Push to branch: git push origin feature/amazing-feature
5. Open a Pull Request

Code Standards

· Follow existing code style and formatting
· Include comments for complex logic
· Update documentation for new features
· Test across multiple browsers and devices
· Ensure responsive design principles

Priority Features

· PDF export functionality
· Multi-language support
· Advanced scheduling system
· Tutor matching algorithm
· Client management dashboard

---

## 📞 Support & Contact

Technical Support

· Documentation: GitHub Wiki
· Issues: GitHub Issues
· Email: elimuhubconsultant@gmail.com

ElimuHub Education Consultants

· Phone: +254 731 838387
· Email: elimuhubconsultant@gmail.com
· Website: elimuhub.simdif.com
· Business Hours: Monday - Friday, 8:00 AM - 6:00 PM EAT

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

🏆 Acknowledgments

· ElimuHub Education Consultants team
· Contributing developers
· Our valued clients and tutors
· Open source community

---

<div align="center">

Making quality education accessible through technology 📚✨

</div>

Key updates made:

· Updated version to 2.0.0
· Fixed repository URLs and formatting
· Added current features and technical details
· Improved installation instructions for GitHub Pages
· Enhanced package configuration examples
· Added technologies used and browser support
· Updated contact information and support details
· Added license and acknowledgments sections
· Improved overall structure and readability
