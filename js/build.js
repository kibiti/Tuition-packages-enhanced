/**
 * Build Script for ElimuHub Tuition Packages Generator
 * Minifies and optimizes files for production deployment
 */

const fs = require('fs');
const path = require('path');

class BuildOptimizer {
    constructor() {
        this.sourceDir = '.';
        this.distDir = 'dist';
        this.filesToProcess = [
            'index.html',
            'styles.css',
            'app.js',
            'calculator.js',
            'exporter.js'
        ];
    }

    init() {
        console.log('🚀 Starting ElimuHub build process...\n');
        
        // Create dist directory if it doesn't exist
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir);
            console.log('✅ Created dist/ directory');
        }
        
        this.cleanDistDirectory();
        this.processFiles();
        this.createProductionIndex();
        this.copyAssets();
        this.generateBuildReport();
    }

    cleanDistDirectory() {
        const files = fs.readdirSync(this.distDir);
        for (const file of files) {
            fs.unlinkSync(path.join(this.distDir, file));
        }
        console.log('✅ Cleaned dist/ directory');
    }

    processFiles() {
        this.filesToProcess.forEach(file => {
            const sourcePath = path.join(this.sourceDir, file);
            const distPath = path.join(this.distDir, this.getMinifiedName(file));
            
            if (fs.existsSync(sourcePath)) {
                const content = fs.readFileSync(sourcePath, 'utf8');
                const processed = this.processFile(content, file);
                fs.writeFileSync(distPath, processed);
                console.log(`✅ Processed: ${file} → ${this.getMinifiedName(file)}`);
            }
        });
    }

    processFile(content, filename) {
        let processed = content;
        
        // Remove comments and minify based on file type
        if (filename.endsWith('.js')) {
            processed = this.minifyJS(processed);
        } else if (filename.endsWith('.css')) {
            processed = this.minifyCSS(processed);
        } else if (filename.endsWith('.html')) {
            processed = this.minifyHTML(processed);
        }
        
        return processed;
    }

    minifyJS(code) {
        return code
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            .replace(/\s*([=+\-*\/<>&|?:{},;])\s*/g, '$1')
            // Remove unnecessary semicolons
            .replace(/;\s*;/g, ';')
            .trim();
    }

    minifyCSS(code) {
        return code
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            .replace(/\s*([{};:,])\s*/g, '$1')
            .replace(/;}/g, '}')
            .trim();
    }

    minifyHTML(code) {
        return code
            // Remove HTML comments but keep conditional comments
            .replace(/<!--(?!\[if\s|\<!\[endif\]).*?-->/gs, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    }

    createProductionIndex() {
        const originalHtml = fs.readFileSync(path.join(this.sourceDir, 'index.html'), 'utf8');
        
        const productionHtml = originalHtml
            .replace('styles.css', 'styles.min.css')
            .replace('calculator.js', 'calculator.min.js')
            .replace('exporter.js', 'exporter.min.js')
            .replace('app.js', 'app.min.js')
            // Add cache-busting query parameters
            .replace(/(src|href)="([^"]+)"/g, (match, attr, url) => {
                if (url.includes('.min.')) {
                    const timestamp = new Date().getTime();
                    return `${attr}="${url}?v=${timestamp}"`;
                }
                return match;
            })
            // Add production meta tags
            .replace('</head>', `
    <!-- Production Build -->
    <meta name="version" content="${new Date().toISOString().split('T')[0]}">
    <meta name="generator" content="ElimuHub Tuition Packages">
</head>`);

        fs.writeFileSync(path.join(this.distDir, 'index.html'), productionHtml);
        console.log('✅ Created production index.html');
    }

    copyAssets() {
        // Copy any additional assets (images, fonts, etc.)
        const assets = ['favicon.ico', 'logo.png', 'manifest.json'];
        
        assets.forEach(asset => {
            const sourcePath = path.join(this.sourceDir, asset);
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, path.join(this.distDir, asset));
                console.log(`✅ Copied: ${asset}`);
            }
        });
    }

    generateBuildReport() {
        const buildInfo = {
            buildDate: new Date().toISOString(),
            files: [],
            totalSize: 0
        };

        const files = fs.readdirSync(this.distDir);
        files.forEach(file => {
            const stats = fs.statSync(path.join(this.distDir, file));
            buildInfo.files.push({
                name: file,
                size: this.formatFileSize(stats.size),
                bytes: stats.size
            });
            buildInfo.totalSize += stats.size;
        });

        buildInfo.totalSizeFormatted = this.formatFileSize(buildInfo.totalSize);

        const report = `
🏗️ ELIMUHUB BUILD REPORT
────────────────────────────────────────
Build Date: ${new Date().toLocaleString()}
Total Size: ${buildInfo.totalSizeFormatted}
Files: ${buildInfo.files.length}

📁 BUILD OUTPUT:
${buildInfo.files.map(file => `  ${file.name.padEnd(25)} ${file.size}`).join('\n')}

✅ Build completed successfully!
────────────────────────────────────────
        `.trim();

        console.log('\n' + report);
        
        // Write build info to file
        fs.writeFileSync(
            path.join(this.distDir, 'build-info.json'),
            JSON.stringify(buildInfo, null, 2)
        );
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    getMinifiedName(filename) {
        const ext = path.extname(filename);
        const name = path.basename(filename, ext);
        return `${name}.min${ext}`;
    }
}

// Run build if called directly
if (require.main === module) {
    const optimizer = new BuildOptimizer();
    optimizer.init();
}

module.exports = BuildOptimizer;
