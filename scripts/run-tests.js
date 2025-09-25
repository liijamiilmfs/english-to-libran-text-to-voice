#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  testDir: 'dist-test',
  timeout: 30000, // 30 seconds
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  coverage: process.argv.includes('--coverage') || process.argv.includes('-c')
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}${message}${colors.reset}`);
}

// Check if test directory exists
if (!fs.existsSync(config.testDir)) {
  logError(`Test directory '${config.testDir}' does not exist. Run 'npm run build:test' first.`);
  process.exit(1);
}

// Find all test files
function findTestFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findTestFiles(fullPath));
    } else if (item.name.endsWith('.test.js') || item.name.endsWith('.spec.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const testFiles = findTestFiles(config.testDir);

if (testFiles.length === 0) {
  logError('No test files found in dist-test directory');
  process.exit(1);
}

logInfo(`Found ${testFiles.length} test file(s)`);
if (config.verbose) {
  testFiles.forEach(file => log(`  - ${file}`, 'cyan'));
}

// Run tests using Vitest
async function runTests() {
  const testArgs = [
    'run',
    '--config', 'vitest.config.mjs',
    '--reporter', 'verbose'
  ];

  if (config.coverage) {
    testArgs.push('--coverage');
  }

  logInfo(`Running tests with: npx vitest ${testArgs.join(' ')}`);

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['vitest', ...testArgs], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        logSuccess('All tests passed!');
        resolve();
      } else {
        logError(`Tests failed with exit code ${code}`);
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      logError(`Failed to start test process: ${error.message}`);
      reject(error);
    });
  });
}

// Main execution
async function main() {
  try {
    logInfo('Starting test execution...');
    await runTests();
    process.exit(0);
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

main();
