#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate a comprehensive coverage report
 */
function generateCoverageReport() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.error('❌ Coverage summary not found. Run tests with coverage first.');
    process.exit(1);
  }
  
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  console.log('\n📊 Test Coverage Report');
  console.log('='.repeat(50));
  
  // Global coverage
  console.log('\n🌍 Global Coverage:');
  console.log(`  Statements: ${coverage.total.statements.pct}% (${coverage.total.statements.covered}/${coverage.total.statements.total})`);
  console.log(`  Branches:   ${coverage.total.branches.pct}% (${coverage.total.branches.covered}/${coverage.total.branches.total})`);
  console.log(`  Functions:  ${coverage.total.functions.pct}% (${coverage.total.functions.covered}/${coverage.total.functions.total})`);
  console.log(`  Lines:      ${coverage.total.lines.pct}% (${coverage.total.lines.covered}/${coverage.total.lines.total})`);
  
  // Check thresholds
  const thresholds = {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90
  };
  
  console.log('\n🎯 Threshold Check:');
  let allPassed = true;
  
  Object.entries(thresholds).forEach(([metric, threshold]) => {
    const value = coverage.total[metric].pct;
    const status = value >= threshold ? '✅' : '❌';
    const color = value >= threshold ? '\x1b[32m' : '\x1b[31m';
    console.log(`  ${metric.padEnd(11)}: ${color}${status} ${value}% (threshold: ${threshold}%)${'\x1b[0m'}`);
    
    if (value < threshold) {
      allPassed = false;
    }
  });
  
  // Module coverage
  console.log('\n📁 Module Coverage:');
  Object.entries(coverage).forEach(([module, data]) => {
    if (module === 'total') return;
    
    const moduleName = module.replace(process.cwd(), '').replace(/\\/g, '/');
    console.log(`\n  ${moduleName}:`);
    console.log(`    Statements: ${data.statements.pct}% (${data.statements.covered}/${data.statements.total})`);
    console.log(`    Branches:   ${data.branches.pct}% (${data.branches.covered}/${data.branches.total})`);
    console.log(`    Functions:  ${data.functions.pct}% (${data.functions.covered}/${data.functions.total})`);
    console.log(`    Lines:      ${data.lines.pct}% (${data.lines.covered}/${data.lines.total})`);
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All coverage thresholds passed!');
  } else {
    console.log('⚠️  Some coverage thresholds failed. Please improve test coverage.');
    process.exit(1);
  }
}

// Run the report
generateCoverageReport();
