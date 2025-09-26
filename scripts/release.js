#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

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
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function execCommand(command, description) {
  log(`\n${colors.cyan}→ ${description}${colors.reset}`)
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' })
    return output
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red')
    process.exit(1)
  }
}

function checkWorkingDirectory() {
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ Not in a valid Node.js project directory', 'red')
    process.exit(1)
  }
}

function checkGitStatus() {
  try {
    execSync('git diff --quiet HEAD', { stdio: 'ignore' })
  } catch (error) {
    log('❌ Working directory has uncommitted changes. Please commit or stash them first.', 'red')
    process.exit(1)
  }
}

function checkBranch() {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
  if (branch !== 'dev' && branch !== 'main') {
    log(`⚠️  Warning: You're on branch '${branch}'. Consider switching to 'dev' or 'main' for releases.`, 'yellow')
  }
  return branch
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return packageJson.version
}

function main() {
  const args = process.argv.slice(2)
  const releaseType = args[0] || 'patch'
  
  if (!['patch', 'minor', 'major', 'prerelease'].includes(releaseType)) {
    log('❌ Invalid release type. Use: patch, minor, major, or prerelease', 'red')
    process.exit(1)
  }

  log(`${colors.bright}🚀 Librán Voice Forge Release Process${colors.reset}`)
  log(`${colors.blue}Release Type: ${releaseType}${colors.reset}`)

  // Pre-flight checks
  checkWorkingDirectory()
  checkGitStatus()
  const currentBranch = checkBranch()
  const currentVersion = getCurrentVersion()

  log(`\n📋 Pre-release Checklist:`)
  log(`   • Working directory: ${process.cwd()}`)
  log(`   • Current branch: ${currentBranch}`)
  log(`   • Current version: ${currentVersion}`)
  log(`   • Git status: Clean`)

  // Run tests
  execCommand('npm run test:all', 'Running all tests...')
  
  // Run type check
  execCommand('npm run type-check', 'Running TypeScript type check...')
  
  // Run linting
  execCommand('npm run lint', 'Running ESLint...')

  // Build the project
  execCommand('npm run build', 'Building project...')

  // Create release
  const releaseCommand = releaseType === 'prerelease' 
    ? 'npm run release:dry-run' 
    : `npm run release:${releaseType}`
  
  execCommand(releaseCommand, `Creating ${releaseType} release...`)

  // Get new version
  const newVersion = getCurrentVersion()
  
  log(`\n✅ Release ${newVersion} created successfully!`, 'green')
  log(`\n📝 Next steps:`)
  log(`   1. Review the changes: git log --oneline`)
  log(`   2. Push the release: git push --follow-tags origin ${currentBranch}`)
  log(`   3. Create a GitHub release if needed`)
  log(`   4. Deploy to production`)
}

if (require.main === module) {
  main()
}

module.exports = { main }
