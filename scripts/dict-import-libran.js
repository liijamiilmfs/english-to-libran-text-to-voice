#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  
  let jsonFile = null;
  let outputDir = null;
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json' && i + 1 < args.length) {
      jsonFile = args[i + 1];
      i++;
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputDir = args[i + 1];
      i++;
    }
  }
  
  if (!jsonFile || !outputDir) {
    console.error('Usage: node dict-import-libran.js --json <libran.json> --output <output_dir>');
    process.exit(1);
  }
  
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Read input file
    const libranData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    
    // Extract ancient and modern entries from clusters
    const ancientEntries = {};
    const modernEntries = {};
    
    if (libranData.clusters) {
      for (const [clusterName, cluster] of Object.entries(libranData.clusters)) {
        if (cluster.ancient) {
          for (const entry of cluster.ancient) {
            if (entry.english && entry.ancient) {
              ancientEntries[entry.english.toLowerCase()] = entry.ancient;
            }
          }
        }
        if (cluster.modern) {
          for (const entry of cluster.modern) {
            if (entry.english && entry.modern) {
              modernEntries[entry.english.toLowerCase()] = entry.modern;
            }
          }
        }
      }
    }
    
    // Create output dictionaries with proper structure
    const outputAncient = {
      version: '1.0.0',
      language: 'ancient-libran',
      metadata: {
        description: 'Ancient Librán dictionary',
        lastUpdated: new Date().toISOString(),
        wordCount: Object.keys(ancientEntries).length
      },
      entries: ancientEntries,
      rules: {}
    };
    
    const outputModern = {
      version: '1.0.0',
      language: 'modern-libran',
      metadata: {
        description: 'Modern Librán dictionary',
        lastUpdated: new Date().toISOString(),
        wordCount: Object.keys(modernEntries).length
      },
      entries: modernEntries,
      rules: {}
    };
    
    // Write output files
    const ancientOutputPath = path.join(outputDir, 'ancient.json');
    const modernOutputPath = path.join(outputDir, 'modern.json');
    const reportPath = path.join(outputDir, 'IMPORT_REPORT.md');
    
    fs.writeFileSync(ancientOutputPath, JSON.stringify(outputAncient, null, 2));
    fs.writeFileSync(modernOutputPath, JSON.stringify(outputModern, null, 2));
    
    // Create import report
    const report = `# Dictionary Import Report

Generated: ${new Date().toISOString()}

## Summary
- Ancient entries: ${Object.keys(ancientEntries).length}
- Modern entries: ${Object.keys(modernEntries).length}

## Files Created
- ancient.json
- modern.json

## Source
- Input file: ${jsonFile}
- Output directory: ${outputDir}
`;
    
    fs.writeFileSync(reportPath, report);
    
    console.log(`Successfully imported Librán dictionary to ${outputDir}`);
    console.log(`- Ancient: ${Object.keys(ancientEntries).length} entries`);
    console.log(`- Modern: ${Object.keys(modernEntries).length} entries`);
    console.log(`- Report: IMPORT_REPORT.md`);
    
  } catch (error) {
    console.error('Error importing Librán dictionary:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
