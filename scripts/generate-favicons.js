const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function generateFavicons() {
  try {
    console.log('Generating favicon files...')
    
    // Read the SVG source
    const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/logo.svg'))
    
    // Generate favicon.ico (16x16)
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(__dirname, '../public/favicon.ico'))
    
    // Generate icon-192.png
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, '../public/icon-192.png'))
    
    // Generate icon-512.png
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '../public/icon-512.png'))
    
    // Generate apple-touch-icon.png
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))
    
    console.log('✅ Favicon files generated successfully!')
    console.log('Generated files:')
    console.log('- favicon.ico (16x16)')
    console.log('- icon-192.png (192x192)')
    console.log('- icon-512.png (512x512)')
    console.log('- apple-touch-icon.png (180x180)')
    
  } catch (error) {
    console.error('❌ Error generating favicon files:', error)
    process.exit(1)
  }
}

generateFavicons()
