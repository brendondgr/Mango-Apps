import fs from 'fs';
import path from 'path';

const distDir = 'dist';
const assetsDir = path.join(distDir, '_assets');
const indexHtml = path.join(distDir, 'index.html');

console.log('Starting post-build patches...');

// 1. Patch index.html
if (fs.existsSync(indexHtml)) {
    console.log(`Patching ${indexHtml}...`);
    let content = fs.readFileSync(indexHtml, 'utf8');

    // Fix JS/CSS loading paths: verify both ../_assets/ and /_assets/ usage
    // We want everything to be relative: ./_assets/
    let patched = content.replace(/\.\.\/_assets\//g, './_assets/');
    patched = patched.replace(/"\/_assets\//g, '"./_assets/');

    // Fix favicon
    patched = patched.replace(/"\/favicon\.svg"/g, '"./favicon.svg"');

    // Also fix any other ../ prefixes that might point to images or root
    patched = patched.replace(/"\.\.\/images\//g, '"./images/');

    fs.writeFileSync(indexHtml, patched);
    console.log('  -> Fixed relative paths in index.html');
} else {
    console.error(`  -> ERROR: ${indexHtml} not found!`);
}

// 2. Patch JS bundles for image paths and RENAME to bust cache
if (fs.existsSync(assetsDir)) {
    console.log(`Scanning ${assetsDir} for JS bundles...`);
    const files = fs.readdirSync(assetsDir);
    let jsFileName = null;
    let newJsFileName = null;

    for (const file of files) {
        if (file.endsWith('.js') && file.startsWith('Presentation.')) {
            jsFileName = file;
            const filePath = path.join(assetsDir, file);
            console.log(`Patching ${file}...`);

            let content = fs.readFileSync(filePath, 'utf8');

            // Fix absolute image paths: /images/ -> ./images/
            const patched = content.replace(/"\/images\//g, '"./images/');

            // Always write, even if not changed, because we are renaming
            fs.writeFileSync(filePath, patched);
            console.log('  -> Patched content');

            // Rename file to bust cache
            newJsFileName = file.replace('.js', '.patched.js');
            const newFilePath = path.join(assetsDir, newJsFileName);
            fs.renameSync(filePath, newFilePath);
            console.log(`  -> Renamed to ${newJsFileName} for cache busting`);
        }
    }

    // 3. Update index.html with new JS filename
    if (jsFileName && newJsFileName && fs.existsSync(indexHtml)) {
        console.log(`Updating index.html with new JS filename: ${newJsFileName}...`);
        let content = fs.readFileSync(indexHtml, 'utf8');

        // Replace old filename with new filename
        const patched = content.replace(new RegExp(jsFileName, 'g'), newJsFileName);

        fs.writeFileSync(indexHtml, patched);
        console.log('  -> Updated index.html references');
    }
} else {
    console.error(`  -> ERROR: ${assetsDir} not found!`);
}

console.log('Post-build patches complete.');
