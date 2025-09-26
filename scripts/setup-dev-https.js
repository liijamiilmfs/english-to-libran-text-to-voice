#!/usr/bin/env node

/**
 * Development HTTPS Setup Script
 * 
 * This script sets up HTTPS for local development using self-signed certificates.
 * This is essential for testing OAuth flows and other HTTPS-dependent features.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CERT_DIR = path.join(__dirname, '..', 'certs');
const KEY_FILE = path.join(CERT_DIR, 'localhost-key.pem');
const CERT_FILE = path.join(CERT_DIR, 'localhost.pem');

function createCertDirectory() {
  if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true });
    console.log('✅ Created certificates directory');
  }
}

function generateSelfSignedCert() {
  if (fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
    console.log('✅ Self-signed certificates already exist');
    return;
  }

  console.log('🔐 Generating self-signed certificates for localhost...');
  
  try {
    // Generate private key
    execSync(`openssl genrsa -out "${KEY_FILE}" 2048`, { stdio: 'inherit' });
    
    // Generate certificate
    execSync(`openssl req -new -x509 -key "${KEY_FILE}" -out "${CERT_FILE}" -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
    
    console.log('✅ Self-signed certificates generated successfully');
    console.log(`   Key: ${KEY_FILE}`);
    console.log(`   Cert: ${CERT_FILE}`);
  } catch (error) {
    console.error('❌ Failed to generate certificates:', error.message);
    console.log('\n📝 Manual setup required:');
    console.log('1. Install OpenSSL if not already installed');
    console.log('2. Run the following commands:');
    console.log(`   mkdir -p "${CERT_DIR}"`);
    console.log(`   openssl genrsa -out "${KEY_FILE}" 2048`);
    console.log(`   openssl req -new -x509 -key "${KEY_FILE}" -out "${CERT_FILE}" -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`);
    process.exit(1);
  }
}

function updatePackageJson() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add HTTPS development script
  if (!packageJson.scripts['dev:https']) {
    packageJson.scripts['dev:https'] = 'next dev --experimental-https --experimental-https-key ./certs/localhost-key.pem --experimental-https-cert ./certs/localhost.pem';
    console.log('✅ Added dev:https script to package.json');
  }
  
  // Add HTTPS port script
  if (!packageJson.scripts['dev:https:port']) {
    packageJson.scripts['dev:https:port'] = 'next dev --experimental-https --experimental-https-key ./certs/localhost-key.pem --experimental-https-cert ./certs/localhost.pem -p 3001';
    console.log('✅ Added dev:https:port script to package.json');
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function createHttpsConfig() {
  const configPath = path.join(__dirname, '..', 'https.config.js');
  
  if (fs.existsSync(configPath)) {
    console.log('✅ HTTPS config already exists');
    return;
  }
  
  const config = `/**
 * HTTPS Configuration for Development
 * 
 * This file provides HTTPS configuration for local development.
 * It's used by the Next.js development server when running with HTTPS.
 */

const path = require('path');

module.exports = {
  // SSL certificate paths
  key: path.join(__dirname, 'certs', 'localhost-key.pem'),
  cert: path.join(__dirname, 'certs', 'localhost.pem'),
  
  // Development server options
  port: 3000,
  hostname: 'localhost',
  
  // Security options
  secureProtocol: 'TLSv1_2_method',
  
  // CORS options for development
  cors: {
    origin: ['https://localhost:3000', 'https://localhost:3001'],
    credentials: true
  }
};
`;

  fs.writeFileSync(configPath, config);
  console.log('✅ Created HTTPS configuration file');
}

function createGitignoreEntry() {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  let gitignore = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignore = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  if (!gitignore.includes('certs/')) {
    gitignore += '\n# Development certificates\ncerts/\n';
    fs.writeFileSync(gitignorePath, gitignore);
    console.log('✅ Added certs/ to .gitignore');
  }
}

function displayInstructions() {
  console.log('\n🎉 HTTPS Development Setup Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start HTTPS development server:');
  console.log('   npm run dev:https');
  console.log('\n2. Or start on a different port:');
  console.log('   npm run dev:https:port');
  console.log('\n3. Access your app at:');
  console.log('   https://localhost:3000');
  console.log('\n4. Accept the self-signed certificate warning in your browser');
  console.log('\n5. For OAuth testing, update your OAuth provider settings:');
  console.log('   - Redirect URI: https://localhost:3000/api/auth/callback');
  console.log('   - Webhook URL: https://localhost:3000/api/webhooks');
  console.log('\n⚠️  Note: Self-signed certificates will show security warnings in browsers.');
  console.log('   This is normal for development. Click "Advanced" → "Proceed to localhost"');
}

// Main execution
function main() {
  console.log('🚀 Setting up HTTPS for development...\n');
  
  try {
    createCertDirectory();
    generateSelfSignedCert();
    updatePackageJson();
    createHttpsConfig();
    createGitignoreEntry();
    displayInstructions();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
