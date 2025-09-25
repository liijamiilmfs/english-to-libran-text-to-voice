# Batch GitHub Setup Script for Libra World Project
# This script can be run in smaller batches to avoid issues
# Prerequisites: GitHub CLI (gh) must be installed and authenticated

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoOwner,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName,
    
    [ValidateSet("milestones", "tranche1", "tranche2", "voiceforge", "all")]
    [string]$Batch = "all",
    
    [switch]$DryRun = $false
)

# Color coding for output
function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

# Function to execute gh command or simulate if dry run
function Invoke-GitHubCommand($Command, $Description) {
    if ($DryRun) {
        Write-ColorOutput Yellow "[DRY RUN] Would execute: $Description"
        Write-ColorOutput Gray "    Command: $Command"
        return $true
    } else {
        Write-ColorOutput Green "Executing: $Description"
        try {
            Invoke-Expression $Command
            return $true
        } catch {
            Write-ColorOutput Red "Error: $_"
            return $false
        }
    }
}

# Function to create GitHub issues with proper escaping
function New-GitHubIssue($Title, $Body, $Labels, $Milestone, $Repository) {
    $labelsParam = if ($Labels) { "--label `"$($Labels -join ',')`"" } else { "" }
    $milestoneParam = if ($Milestone) { "--milestone `"$Milestone`"" } else { "" }
    
    # Use a temporary file for the body to avoid command line length issues
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $Body -Encoding UTF8
    
    $command = "gh issue create --title `"$Title`" --body-file `"$tempFile`" $labelsParam $milestoneParam --repo $Repository"
    
    $result = Invoke-GitHubCommand $command "Creating issue: $Title"
    
    # Clean up temp file
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    
    return $result
}

# Set repository context
$repo = "$RepoOwner/$RepoName"
Write-ColorOutput Cyan "Setting up GitHub repository: $repo"
Write-ColorOutput Cyan "Running batch: $Batch"

if (-not $DryRun) {
    # Verify we can access the repository
    try {
        gh repo view $repo | Out-Null
        Write-ColorOutput Green "✓ Repository access confirmed"
    } catch {
        Write-ColorOutput Red "Error: Cannot access repository $repo. Please check your GitHub CLI authentication and repository permissions."
        exit 1
    }
}

# Define milestones
$milestones = @(
    @{ title = "Tranche 1 - Librán LLM"; description = "Top priority: rule-faithful Librán generator and toolchain." },
    @{ title = "Tranche 2 — Worldbuilding LLM"; description = "Canon-grounded worldbuilding assistant (backlog)." },
    @{ title = "Phase 2 – Polish"; description = "Adding enchanced features to improve overall UX and UI" },
    @{ title = "Phase 3 - Enhancement"; description = "Adding enchanced features to improve overall UX and UI" },
    @{ title = "Phase 4 – Stretch"; description = "Stretch feature goals that should be tackled once base functionality and polish features are complete" }
)

# BATCH: MILESTONES
if ($Batch -eq "milestones" -or $Batch -eq "all") {
    Write-ColorOutput Magenta "`n=== Creating Milestones ==="
    foreach ($milestone in $milestones) {
        $command = "gh api repos/$repo/milestones -X POST --field title='$($milestone.title)' --field description='$($milestone.description)'"
        Invoke-GitHubCommand $command "Creating milestone: $($milestone.title)"
    }
}

# BATCH: TRANCHE 1 ISSUES
if ($Batch -eq "tranche1" -or $Batch -eq "all") {
    Write-ColorOutput Magenta "`n=== Creating Tranche 1 Issues ==="
    
    $tranche1Issues = @(
        @{
            title = "Phase 1: Infrastructure Setup"
            body = @"
## Infrastructure Setup (2-3 weeks)

### 1.1 ML Framework Integration
- [ ] Add ML dependencies (transformers, torch, datasets, accelerate, evaluate)
- [ ] Set up package.json with required ML libraries
- [ ] Configure development environment

### 1.2 Training Environment Setup
- [ ] Set up GPU infrastructure with CUDA support
- [ ] Configure distributed training capabilities
- [ ] Connect to Hugging Face Hub for model storage
- [ ] Create automated training workflows

### 1.3 Data Infrastructure
- [ ] Create TrainingDataset interface
- [ ] Implement data pipeline architecture
- [ ] Set up training data management system

### Acceptance Criteria
- [ ] All ML frameworks properly installed and configured
- [ ] GPU environment functional
- [ ] Data pipeline ready for training data input
- [ ] Hugging Face integration working

### Estimated Timeline: 2-3 weeks
"@
            labels = @("tranche:libran", "type:infra", "priority:p1", "prio:urgent")
            milestone = "Tranche 1 - Librán LLM"
        },
        @{
            title = "Phase 2: Model Architecture Design"
            body = @"
## Model Architecture Design (1-2 weeks)

### 2.1 Custom Tokenizer Development
- [ ] Create LibránTokenizer class
- [ ] Add special tokens support ([UNK], [CLS], [SEP], [PAD])
- [ ] Handle Librán-specific characters (áéíóúëñçüÁÉÍÓÚËÑÇÜ)
- [ ] Implement BPE tokenizer training on Librán corpus

### 2.2 Model Architecture
- [ ] Configure base model (DistilBERT recommended)
- [ ] Expand tokenizer with Librán-specific vocabulary
- [ ] Design multi-task learning setup (translation + vocabulary generation)
- [ ] Plan progressive fine-tuning strategy

### Acceptance Criteria
- [ ] Custom tokenizer handles Librán characters correctly
- [ ] Base model architecture defined and tested
- [ ] Multi-task learning framework in place
- [ ] Fine-tuning strategy documented

### Estimated Timeline: 1-2 weeks
"@
            labels = @("tranche:libran", "type:model", "priority:p1")
            milestone = "Tranche 1 - Librán LLM"
        },
        @{
            title = "Hardware and Infrastructure Requirements"
            body = @"
## Hardware and Infrastructure Needs

### Hardware Requirements
- [ ] **GPU**: NVIDIA RTX 4090 or A100 (16GB+ VRAM) - $3,000-8,000
- [ ] **RAM**: 32GB+ system memory
- [ ] **Storage**: 500GB+ SSD for training data and model checkpoints
- [ ] **Compute**: Multi-GPU setup for distributed training capability

### Cloud Computing Options
- [ ] Evaluate cloud training costs: $500-2,000/month during training
- [ ] Set up cloud GPU instances for training
- [ ] Configure data transfer and storage
- [ ] Plan training schedules to minimize costs

### Acceptance Criteria
- [ ] Hardware/cloud infrastructure operational
- [ ] Development environment configured
- [ ] Cost tracking in place
- [ ] Training capability verified
"@
            labels = @("tranche:libran", "type:infra", "priority:p2", "help wanted")
            milestone = "Tranche 1 - Librán LLM"
        }
    )
    
    foreach ($issue in $tranche1Issues) {
        New-GitHubIssue -Title $issue.title -Body $issue.body -Labels $issue.labels -Milestone $issue.milestone -Repository $repo
    }
}

# BATCH: TRANCHE 2 ISSUES
if ($Batch -eq "tranche2" -or $Batch -eq "all") {
    Write-ColorOutput Magenta "`n=== Creating Tranche 2 Issues ==="
    
    $tranche2Issues = @(
        @{
            title = "Worldbuilding LLM Requirements Analysis"
            body = @"
## Canon-Grounded Worldbuilding Assistant (Backlog)

### Core Requirements
- [ ] Analyze current worldbuilding documentation
- [ ] Define worldbuilding assistant capabilities
- [ ] Map tribal knowledge and Comoară relics system
- [ ] Plan integration with Aleșii Federation politics

This is a **backlog item** - detailed implementation planning will begin after Tranche 1 completion.

### Success Metrics
- [ ] Generates canon-consistent worldbuilding content
- [ ] Maintains tribal cultural distinctiveness
- [ ] Creates compelling political scenarios
- [ ] Supports multi-scale storytelling (micro and macro conflicts)
"@
            labels = @("tranche:worldbuilding", "epic", "priority:p3")
            milestone = "Tranche 2 — Worldbuilding LLM"
        }
    )
    
    foreach ($issue in $tranche2Issues) {
        New-GitHubIssue -Title $issue.title -Body $issue.body -Labels $issue.labels -Milestone $issue.milestone -Repository $repo
    }
}

# BATCH: VOICE FORGE ISSUES
if ($Batch -eq "voiceforge" -or $Batch -eq "all") {
    Write-ColorOutput Magenta "`n=== Creating Voice Forge Issues ==="
    
    $voiceForgeIssues = @(
        @{
            title = "Enhanced Translation Pipeline"
            body = @"
## Translation System Improvements

### Current State
- Rule-based translation with 927+ dictionary entries
- Ancient and Modern Librán variants supported
- Basic TTS integration with OpenAI

### Enhancement Goals
- [ ] Improve translation accuracy and fluency
- [ ] Add context-aware translation options
- [ ] Implement translation confidence scoring
- [ ] Add batch translation capabilities
"@
            labels = @("area:translator", "enhancement", "priority:p2")
            milestone = "Phase 3 - Enhancement"
        },
        @{
            title = "Dictionary Management Dashboard"
            body = @"
## Advanced Dictionary Management Interface

### Current Dictionary System
- Python-based importer with conflict resolution
- 927+ entries with dual language support
- Basic import/export functionality

### Dashboard Features
- [ ] **Visual Dictionary Browser**: Search, filter, sort entries
- [ ] **Bulk Edit Operations**: Mass updates and corrections
- [ ] **Etymology Tracking**: Visual etymology trees and connections
- [ ] **Usage Analytics**: Most translated words, trending terms
"@
            labels = @("area:importer", "area:ui", "enhancement", "priority:p2")
            milestone = "Phase 2 – Polish"
        }
    )
    
    foreach ($issue in $voiceForgeIssues) {
        New-GitHubIssue -Title $issue.title -Body $issue.body -Labels $issue.labels -Milestone $issue.milestone -Repository $repo
    }
}

# Summary
Write-ColorOutput Cyan "`n=== Batch Complete ==="
Write-ColorOutput Green "Batch '$Batch' completed successfully!"

if ($Batch -eq "all") {
    Write-ColorOutput White "All milestones and issues created."
} else {
    Write-ColorOutput White "To run other batches:"
    Write-ColorOutput Gray ".\batch-script.ps1 -RepoOwner '$RepoOwner' -RepoName '$RepoName' -Batch milestones"
    Write-ColorOutput Gray ".\batch-script.ps1 -RepoOwner '$RepoOwner' -RepoName '$RepoName' -Batch tranche1"
    Write-ColorOutput Gray ".\batch-script.ps1 -RepoOwner '$RepoOwner' -RepoName '$RepoName' -Batch tranche2"
    Write-ColorOutput Gray ".\batch-script.ps1 -RepoOwner '$RepoOwner' -RepoName '$RepoName' -Batch voiceforge"
}

Write-ColorOutput White "View your repository at: https://github.com/$repo"