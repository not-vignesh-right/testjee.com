const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src', 'assets', 'logo_test_jee.png');
const outputPath = path.join(__dirname, 'src', 'assets', 'logo_test_jee_optimized.png');
const backupPath = path.join(__dirname, 'src', 'assets', 'logo_test_jee_original.png');

async function optimizeLogo() {
    try {
        console.log('Reading original logo...');
        const stats = fs.statSync(inputPath);
        console.log(`Original size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        // Backup original file
        console.log('Creating backup...');
        fs.copyFileSync(inputPath, backupPath);

        // Optimize the image
        console.log('Optimizing image...');
        await sharp(inputPath)
            .resize(512, 512, { // Resize to reasonable dimensions for a logo
                fit: 'inside',
                withoutEnlargement: true
            })
            .png({
                quality: 90,
                compressionLevel: 9,
                palette: true // Use palette-based PNG for smaller size
            })
            .toFile(outputPath);

        const optimizedStats = fs.statSync(outputPath);
        console.log(`Optimized size: ${(optimizedStats.size / 1024).toFixed(2)} KB`);
        console.log(`Reduction: ${((1 - optimizedStats.size / stats.size) * 100).toFixed(1)}%`);

        // Replace original with optimized
        console.log('Replacing original with optimized version...');
        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath, inputPath);

        console.log('✅ Logo optimization complete!');
        console.log(`Original backed up to: ${backupPath}`);
    } catch (error) {
        console.error('Error optimizing logo:', error);
        process.exit(1);
    }
}

optimizeLogo();
