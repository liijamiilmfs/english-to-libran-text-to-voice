# Add Epic Issues to Librán Voice Forge Project
# This script adds all epic issues to the existing project

Write-Host "🚀 Adding Epic Issues to Librán Voice Forge Project..." -ForegroundColor Green
Write-Host "📋 Debug: Starting script execution..." -ForegroundColor Gray

# Project number for Librán Voice Forge (from gh project list output)
$projectNumber = 1

# Function to add issue to project safely
function Add-IssueToProjectSafely {
    param([int]$IssueNumber, [string]$EpicName)
    
    Write-Host "📋 Debug: Adding issue #$IssueNumber to project..." -ForegroundColor Gray
    
    $result = gh project item-add $projectNumber --owner liijamiilmfs --url "https://github.com/liijamiilmfs/english-to-libran-text-to-voice/issues/$IssueNumber" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Added issue #$IssueNumber to project" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed to add issue #$IssueNumber to project" -ForegroundColor Red
        Write-Host "📝 Debug: Error: $result" -ForegroundColor Red
        return $false
    }
}

$projectResults = @()

# Epic 1: Translation Quality Benchmarking Pipeline issues
Write-Host "📊 Adding Epic 1 issues to project..." -ForegroundColor Cyan
$epic1Issues = @(117, 120, 118, 148, 21, 22, 156)  # Including the epic issue itself
foreach ($issue in $epic1Issues) {
    $projectResults += Add-IssueToProjectSafely -IssueNumber $issue -EpicName "Epic 1"
}

# Epic 2: TTS Reliability & Telemetry issues
Write-Host "📊 Adding Epic 2 issues to project..." -ForegroundColor Cyan
$epic2Issues = @(149, 132, 104, 140, 35, 23, 32, 26, 157, 153)  # Including the epic issue itself
foreach ($issue in $epic2Issues) {
    $projectResults += Add-IssueToProjectSafely -IssueNumber $issue -EpicName "Epic 2"
}

# Epic 3: Accessible Client Error & Voice UX issues  
Write-Host "📊 Adding Epic 3 issues to project..." -ForegroundColor Cyan
$epic3Issues = @(136, 137, 138, 139, 141, 142, 143, 144, 145, 58, 25, 24, 158, 154)  # Including the epic issue itself
foreach ($issue in $epic3Issues) {
    $projectResults += Add-IssueToProjectSafely -IssueNumber $issue -EpicName "Epic 3"
}

# Epic 4: Operational Command Center Foundations issues
Write-Host "📊 Adding Epic 4 issues to project..." -ForegroundColor Cyan
$epic4Issues = @(146, 77, 76, 75, 107, 31, 30, 29, 28, 36, 155)  # Including the epic issue itself
foreach ($issue in $epic4Issues) {
    $projectResults += Add-IssueToProjectSafely -IssueNumber $issue -EpicName "Epic 4"
}

$projectSuccessCount = ($projectResults | Where-Object { $_ -eq $true }).Count
Write-Host "📊 Project addition summary: $projectSuccessCount/$($projectResults.Count) issues added successfully" -ForegroundColor $(if ($projectSuccessCount -eq $projectResults.Count) { "Green" } else { "Yellow" })

# Final summary
Write-Host "`n🎉 Epic issues added to Librán Voice Forge Project!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Issues Added: $projectSuccessCount/$($projectResults.Count) issues added to project" -ForegroundColor $(if ($projectSuccessCount -eq $projectResults.Count) { "Green" } else { "Yellow" })
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check your GitHub project board" -ForegroundColor White
Write-Host "  2. Organize issues by epic columns if desired" -ForegroundColor White
Write-Host "  3. Start working on Epic 2 (TTS bugs) as highest priority" -ForegroundColor White
Write-Host "`n🔗 Project URL: https://github.com/users/liijamiilmfs/projects/1" -ForegroundColor Yellow
