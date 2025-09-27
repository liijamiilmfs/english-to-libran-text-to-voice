#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Detect flaky tests by running them multiple times
 */
function detectFlakyTests() {
  console.log('🔍 Detecting flaky tests...\n');
  
  const testFiles = [
    'test/unit/tts-cache.test.ts',
    'test/unit/voice-filter.test.ts',
    'test/unit/rule-engine.test.ts',
    'test/unit/object-url-manager.test.ts',
    'test/unit/guardrails.test.ts',
    'test/integration/tts-route.test.ts',
    'test/integration/security-auth.test.ts',
    'test/integration/security-headers.test.ts',
    'test/integration/translator-pipeline.test.ts'
  ];
  
  const results = new Map();
  const runs = 5; // Number of times to run each test
  
  testFiles.forEach(testFile => {
    console.log(`Testing ${testFile}...`);
    const testResults = [];
    
    for (let i = 0; i < runs; i++) {
      try {
        const start = Date.now();
        execSync(`npx vitest run ${testFile} --reporter=verbose`, { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
        const duration = Date.now() - start;
        testResults.push({ success: true, duration });
        process.stdout.write('.');
      } catch (error) {
        testResults.push({ success: false, duration: 0 });
        process.stdout.write('F');
      }
    }
    
    console.log(''); // New line after dots
    
    const successCount = testResults.filter(r => r.success).length;
    const successRate = successCount / runs;
    const avgDuration = testResults.reduce((sum, r) => sum + r.duration, 0) / runs;
    
    results.set(testFile, {
      successRate,
      successCount,
      totalRuns: runs,
      avgDuration,
      isFlaky: successRate < 0.8
    });
  });
  
  // Report results
  console.log('\n📊 Flaky Test Detection Results:');
  console.log('='.repeat(60));
  
  let flakyCount = 0;
  results.forEach((result, testFile) => {
    const status = result.isFlaky ? '❌ FLAKY' : '✅ STABLE';
    const color = result.isFlaky ? '\x1b[31m' : '\x1b[32m';
    
    console.log(`\n${testFile}:`);
    console.log(`  Status: ${color}${status}${'\x1b[0m'}`);
    console.log(`  Success Rate: ${(result.successRate * 100).toFixed(1)}% (${result.successCount}/${result.totalRuns})`);
    console.log(`  Avg Duration: ${result.avgDuration.toFixed(0)}ms`);
    
    if (result.isFlaky) {
      flakyCount++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total Tests: ${results.size}`);
  console.log(`Flaky Tests: ${flakyCount}`);
  console.log(`Stable Tests: ${results.size - flakyCount}`);
  
  if (flakyCount > 0) {
    console.log('\n⚠️  Flaky tests detected! Consider:');
    console.log('  - Adding proper test isolation');
    console.log('  - Using deterministic test data');
    console.log('  - Adding retry mechanisms');
    console.log('  - Fixing race conditions');
    process.exit(1);
  } else {
    console.log('\n🎉 No flaky tests detected!');
  }
}

// Run detection
detectFlakyTests();
