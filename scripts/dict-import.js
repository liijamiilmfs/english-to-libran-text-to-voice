#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  
  let ancientFile = null;
  let modernFile = null;
  let outputDir = null;
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ancient' && i + 1 < args.length) {
      ancientFile = args[i + 1];
      i++;
    } else if (args[i] === '--modern' && i + 1 < args.length) {
      modernFile = args[i + 1];
      i++;
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputDir = args[i + 1];
      i++;
    }
  }
  
  if (!ancientFile || !modernFile || !outputDir) {
    console.error('Usage: node dict-import.js --ancient <ancient.json> --modern <modern.json> --output <output_dir>');
    process.exit(1);
  }
  
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Read input files
    const ancientData = JSON.parse(fs.readFileSync(ancientFile, 'utf8'));
    const modernData = JSON.parse(fs.readFileSync(modernFile, 'utf8'));
    
    // Create output dictionaries with proper structure
    const outputAncient = {
      version: '1.0.0',
      language: 'ancient-libran',
      metadata: {
        description: 'Ancient Librán dictionary',
        lastUpdated: new Date().toISOString(),
        wordCount: Object.keys(ancientData).length
      },
      entries: ancientData,
      rules: {}
    };
    
    const outputModern = {
      version: '1.0.0',
      language: 'modern-libran',
      metadata: {
        description: 'Modern Librán dictionary',
        lastUpdated: new Date().toISOString(),
        wordCount: Object.keys(modernData).length
      },
      entries: modernData,
      rules: {}
    };
    
    // Write output files
    const ancientOutputPath = path.join(outputDir, 'ancient.json');
    const modernOutputPath = path.join(outputDir, 'modern.json');
    
    fs.writeFileSync(ancientOutputPath, JSON.stringify(outputAncient, null, 2));
    fs.writeFileSync(modernOutputPath, JSON.stringify(outputModern, null, 2));
    
    console.log(`Successfully imported dictionaries to ${outputDir}`);
    console.log(`- Ancient: ${Object.keys(ancientData).length} entries`);
    console.log(`- Modern: ${Object.keys(modernData).length} entries`);
    
  } catch (error) {
    console.error('Error importing dictionaries:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
