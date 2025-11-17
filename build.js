/**
 * Simple Build Script for ElimuHub Tuition Packages
 * Run with: node build.js
 */

const fs = require('fs');
const path = require('path');

class SimpleBuilder {
    constructor() {
        this.sourceDir = '.';
        this.distDir = 'dist';
    }

    build() {
        console.log('🚀 Building ElimuHub Tuition Packages...\n');
        
        // Create dist directory
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir);
        }
        
        // Copy main files
        this.copyFile('index.html');
        this.copyFile('styles.css');
        this.copyFile('app.js');
        this.copyFile('calculator.js');
        this.copyFile('exporter.js');
        
        console.log('\n✅ Build complete!');
        console.log('📁 Production files are in the "dist" folder');
        console.log('🌐 Upload the "dist" folder to your web server');
    }
    
    copyFile(filename) {
        const sourcePath = path.join(this.sourceDir, filename);
        const distPath = path.join(this.distDir, filename);
        
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, distPath);
            console.log(`✅ Copied: ${filename}`);
        } else {
            console.log(`⚠️  Missing: ${filename}`);
        }
    }
}

// Run build if called directly
if (require.main === module) {
    const builder = new SimpleBuilder();
    builder.build();
}

module.exports = SimpleBuilder;
