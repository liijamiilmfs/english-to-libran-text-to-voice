#!/usr/bin/env node

/**
 * Security Audit Script
 * 
 * This script performs a comprehensive security audit of the Librán Voice Forge application.
 * It checks for common security vulnerabilities and validates our security implementations.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Security audit configuration
const AUDIT_CONFIG = {
  // URLs to test (will be populated based on environment)
  urls: [],
  
  // Security headers to check
  requiredHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': /max-age=\d+; includeSubDomains; preload/,
    'Content-Security-Policy': /.+/,
    'Permissions-Policy': /.+/
  },
  
  // API endpoints to test
  apiEndpoints: [
    '/api/translate',
    '/api/speak',
    '/api/metrics',
    '/api/tts-cache',
    '/api/unknown-tokens'
  ],
  
  // Admin endpoints to test
  adminEndpoints: [
    '/admin/tts-cache',
    '/api/admin/dictionary',
    '/api/admin/dictionary/bulk'
  ]
};

// Audit results
const auditResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[type] || 'ℹ️';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function addIssue(severity, category, message, details = {}) {
  auditResults.issues.push({
    severity,
    category,
    message,
    details,
    timestamp: new Date().toISOString()
  });
  
  if (severity === 'error') {
    auditResults.failed++;
  } else if (severity === 'warning') {
    auditResults.warnings++;
  } else {
    auditResults.passed++;
  }
}

function checkFileSecurity(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi
    ];
    
    secretPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        addIssue('error', 'secrets', `Potential hardcoded secret found in ${relativePath}`, {
          matches: matches.slice(0, 3) // Show first 3 matches
        });
      }
    });
    
    // Check for console.log statements in production code
    if (relativePath.includes('/app/') && content.includes('console.log')) {
      addIssue('warning', 'logging', `Console.log found in production code: ${relativePath}`);
    }
    
    // Check for eval usage
    if (content.includes('eval(')) {
      addIssue('error', 'security', `eval() usage found in ${relativePath}`);
    }
    
    // Check for innerHTML usage
    if (content.includes('.innerHTML')) {
      addIssue('warning', 'xss', `innerHTML usage found in ${relativePath} - consider using textContent`);
    }
    
  } catch (error) {
    addIssue('error', 'file-access', `Failed to read file ${relativePath}: ${error.message}`);
  }
}

function checkPackageJson() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for known vulnerable packages
    const vulnerablePackages = [
      'lodash@4.17.0',
      'moment@2.19.0'
    ];
    
    Object.entries(packageJson.dependencies || {}).forEach(([name, version]) => {
      if (vulnerablePackages.includes(`${name}@${version}`)) {
        addIssue('error', 'dependencies', `Potentially vulnerable package: ${name}@${version}`);
      }
    });
    
    // Check for missing security-related packages
    const securityPackages = ['helmet', 'express-rate-limit', 'cors'];
    securityPackages.forEach(pkg => {
      if (!packageJson.dependencies[pkg] && !packageJson.devDependencies[pkg]) {
        addIssue('warning', 'dependencies', `Consider adding security package: ${pkg}`);
      }
    });
    
  } catch (error) {
    addIssue('error', 'package-json', `Failed to read package.json: ${error.message}`);
  }
}

function checkEnvironmentVariables() {
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  const envPath = path.join(__dirname, '..', '.env');
  
  // Check if .env.example exists and has required variables
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    const requiredVars = ['OPENAI_API_KEY', 'ADMIN_SECRET', 'API_SECRET'];
    
    requiredVars.forEach(varName => {
      if (!envExample.includes(varName)) {
        addIssue('warning', 'environment', `Missing required environment variable in .env.example: ${varName}`);
      }
    });
  } else {
    addIssue('warning', 'environment', '.env.example file not found');
  }
  
  // Check if .env exists (should not be committed)
  if (fs.existsSync(envPath)) {
    addIssue('warning', 'environment', '.env file found in repository - ensure it\'s in .gitignore');
  }
}

function checkNextConfig() {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
  
  try {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check for security headers configuration
    if (!nextConfig.includes('X-Frame-Options')) {
      addIssue('error', 'headers', 'X-Frame-Options header not configured');
    }
    
    if (!nextConfig.includes('Content-Security-Policy')) {
      addIssue('error', 'headers', 'Content-Security-Policy header not configured');
    }
    
    if (!nextConfig.includes('Strict-Transport-Security')) {
      addIssue('error', 'headers', 'Strict-Transport-Security header not configured');
    }
    
    // Check for HTTPS redirects
    if (!nextConfig.includes('redirects')) {
      addIssue('warning', 'https', 'HTTP to HTTPS redirects not configured');
    }
    
  } catch (error) {
    addIssue('error', 'config', `Failed to read next.config.mjs: ${error.message}`);
  }
}

function checkMiddleware() {
  const middlewarePath = path.join(__dirname, '..', 'middleware.ts');
  
  if (fs.existsSync(middlewarePath)) {
    const middleware = fs.readFileSync(middlewarePath, 'utf8');
    
    // Check for security middleware usage
    if (!middleware.includes('universal-security')) {
      addIssue('warning', 'middleware', 'Universal security middleware not used');
    }
    
    // Check for rate limiting
    if (!middleware.includes('rate') && !middleware.includes('limit')) {
      addIssue('warning', 'middleware', 'Rate limiting not implemented in middleware');
    }
    
  } else {
    addIssue('warning', 'middleware', 'Middleware file not found');
  }
}

function checkApiSecurity() {
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    addIssue('error', 'api', 'API directory not found');
    return;
  }
  
  // Check each API route for security implementations
  const apiRoutes = fs.readdirSync(apiDir, { recursive: true })
    .filter(file => file.endsWith('route.ts'))
    .map(file => path.join(apiDir, file));
  
  apiRoutes.forEach(routePath => {
    const content = fs.readFileSync(routePath, 'utf8');
    const relativePath = path.relative(process.cwd(), routePath);
    
    // Check for authentication
    if (routePath.includes('/admin/') && !content.includes('withAdminAuth')) {
      addIssue('error', 'api', `Admin route missing authentication: ${relativePath}`);
    }
    
    if (routePath.includes('/api/') && !routePath.includes('/admin/') && !content.includes('withUniversalSecurity')) {
      addIssue('warning', 'api', `API route missing universal security: ${relativePath}`);
    }
    
    // Check for input validation
    if (!content.includes('validation') && !content.includes('validate')) {
      addIssue('warning', 'api', `API route missing input validation: ${relativePath}`);
    }
    
    // Check for error handling
    if (!content.includes('try') || !content.includes('catch')) {
      addIssue('warning', 'api', `API route missing error handling: ${relativePath}`);
    }
  });
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🔒 SECURITY AUDIT REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Passed: ${auditResults.passed}`);
  console.log(`   ⚠️  Warnings: ${auditResults.warnings}`);
  console.log(`   ❌ Failed: ${auditResults.failed}`);
  
  if (auditResults.issues.length > 0) {
    console.log(`\n📋 Issues Found:`);
    
    const issuesBySeverity = {
      error: auditResults.issues.filter(i => i.severity === 'error'),
      warning: auditResults.issues.filter(i => i.severity === 'warning'),
      info: auditResults.issues.filter(i => i.severity === 'info')
    };
    
    Object.entries(issuesBySeverity).forEach(([severity, issues]) => {
      if (issues.length > 0) {
        console.log(`\n${severity.toUpperCase()}:`);
        issues.forEach(issue => {
          console.log(`   • ${issue.category}: ${issue.message}`);
          if (issue.details && Object.keys(issue.details).length > 0) {
            console.log(`     Details: ${JSON.stringify(issue.details, null, 2)}`);
          }
        });
      }
    });
  }
  
  console.log(`\n🎯 Recommendations:`);
  console.log(`   1. Fix all ERROR level issues immediately`);
  console.log(`   2. Address WARNING level issues for better security`);
  console.log(`   3. Run this audit regularly during development`);
  console.log(`   4. Consider using automated security scanning tools`);
  console.log(`   5. Implement security testing in CI/CD pipeline`);
  
  console.log('\n' + '='.repeat(80));
  
  // Exit with error code if there are critical issues
  if (auditResults.failed > 0) {
    process.exit(1);
  }
}

// Main audit function
async function runSecurityAudit() {
  log('Starting security audit...', 'info');
  
  // File-based security checks
  log('Checking file security...', 'info');
  const sourceDir = path.join(__dirname, '..', 'app');
  if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir, { recursive: true })
      .filter(file => file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))
      .map(file => path.join(sourceDir, file));
    
    files.forEach(filePath => {
      const relativePath = path.relative(process.cwd(), filePath);
      checkFileSecurity(filePath, relativePath);
    });
  }
  
  // Configuration checks
  log('Checking configuration...', 'info');
  checkPackageJson();
  checkEnvironmentVariables();
  checkNextConfig();
  checkMiddleware();
  checkApiSecurity();
  
  // Generate report
  generateReport();
}

// Run the audit
if (require.main === module) {
  runSecurityAudit().catch(error => {
    log(`Audit failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runSecurityAudit, addIssue, auditResults };
