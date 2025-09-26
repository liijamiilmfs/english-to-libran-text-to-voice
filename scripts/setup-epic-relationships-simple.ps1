# Simple Epic Relationships Script (No Projects API)
# This script adds epic labels and comments to issues without using GitHub Projects

Write-Host "🚀 Setting up Epic Relationships (Simple Version)..." -ForegroundColor Green
Write-Host "📋 Debug: Starting script execution..." -ForegroundColor Gray
Write-Host "⚠️ Note: Skipping GitHub Projects due to token permissions" -ForegroundColor Yellow

# Function to add label safely
function Add-LabelSafely {
    param([int]$IssueNumber, [string]$Label, [string]$EpicName)
    
    Write-Host "🏷️ Debug: Adding label '$Label' to issue #$IssueNumber..." -ForegroundColor Gray
    
    $result = gh issue edit $IssueNumber --add-label $Label 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Added '$Label' to issue #$IssueNumber" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed to add '$Label' to issue #$IssueNumber" -ForegroundColor Red
        Write-Host "📝 Debug: Error: $result" -ForegroundColor Red
        return $false
    }
}

# Function to add comment safely
function Add-CommentSafely {
    param([int]$IssueNumber, [string]$Comment, [string]$EpicName)
    
    Write-Host "💬 Debug: Adding parent epic comment to issue #$IssueNumber..." -ForegroundColor Gray
    
    $result = gh issue comment $IssueNumber --body $Comment 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Added parent epic comment to issue #$IssueNumber" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed to add comment to issue #$IssueNumber" -ForegroundColor Red
        Write-Host "📝 Debug: Error: $result" -ForegroundColor Red
        return $false
    }
}

# Add epic labels to issues
Write-Host "🏷️ Adding epic labels to issues..." -ForegroundColor Yellow

$labelResults = @()

# Epic 1: Translation Quality Benchmarking Pipeline issues
Write-Host "📊 Processing Epic 1 issues..." -ForegroundColor Cyan
$epic1Issues = @(117, 120, 118, 148, 21, 22)
foreach ($issue in $epic1Issues) {
    $labelResults += Add-LabelSafely -IssueNumber $issue -Label "epic:translation-quality" -EpicName "Epic 1"
}

# Epic 2: TTS Reliability & Telemetry issues
Write-Host "📊 Processing Epic 2 issues..." -ForegroundColor Cyan
$epic2Issues = @(149, 132, 104, 140, 35, 23, 32, 26, 157)
foreach ($issue in $epic2Issues) {
    $labelResults += Add-LabelSafely -IssueNumber $issue -Label "epic:tts-reliability" -EpicName "Epic 2"
}

# Epic 3: Accessible Client Error & Voice UX issues  
Write-Host "📊 Processing Epic 3 issues..." -ForegroundColor Cyan
$epic3Issues = @(136, 137, 138, 139, 141, 142, 143, 144, 145, 58, 25, 24, 158)
foreach ($issue in $epic3Issues) {
    $labelResults += Add-LabelSafely -IssueNumber $issue -Label "epic:client-ux" -EpicName "Epic 3"
}

# Epic 4: Operational Command Center Foundations issues
Write-Host "📊 Processing Epic 4 issues..." -ForegroundColor Cyan
$epic4Issues = @(146, 77, 76, 75, 107, 31, 30, 29, 28, 36)
foreach ($issue in $epic4Issues) {
    $labelResults += Add-LabelSafely -IssueNumber $issue -Label "epic:operations" -EpicName "Epic 4"
}

$labelSuccessCount = ($labelResults | Where-Object { $_ -eq $true }).Count
Write-Host "📊 Label addition summary: $labelSuccessCount/$($labelResults.Count) labels added successfully" -ForegroundColor $(if ($labelSuccessCount -eq $labelResults.Count) { "Green" } else { "Yellow" })

# Add parent-child relationships via comments
Write-Host "🔗 Adding parent-child relationships..." -ForegroundColor Yellow

$commentResults = @()

# Epic 1 blocks its sub-issues
Write-Host "📊 Adding Epic 1 parent comments..." -ForegroundColor Cyan
$epic1SubIssues = @(117, 120, 118, 148, 21, 22)
foreach ($issue in $epic1SubIssues) {
    $comment = "🔗 **Parent Epic**: This issue is part of [Epic 1: Translation Quality Benchmarking Pipeline (#156)](https://github.com/liijamiilmfs/english-to-libran-text-to-voice/issues/156)"
    $commentResults += Add-CommentSafely -IssueNumber $issue -Comment $comment -EpicName "Epic 1"
}

# Epic 2 blocks its sub-issues
Write-Host "📊 Adding Epic 2 parent comments..." -ForegroundColor Cyan
$epic2SubIssues = @(149, 132, 104, 140, 35, 23, 32, 26, 157)
foreach ($issue in $epic2SubIssues) {
    $comment = "🔗 **Parent Epic**: This issue is part of [Epic 2: TTS Reliability & Telemetry (#153)](https://github.com/liijamiilmfs/english-to-libran-text-to-voice/issues/153)"
    $commentResults += Add-CommentSafely -IssueNumber $issue -Comment $comment -EpicName "Epic 2"
}

# Epic 3 blocks its sub-issues
Write-Host "📊 Adding Epic 3 parent comments..." -ForegroundColor Cyan
$epic3SubIssues = @(136, 137, 138, 139, 141, 142, 143, 144, 145, 58, 25, 24, 158)
foreach ($issue in $epic3SubIssues) {
    $comment = "🔗 **Parent Epic**: This issue is part of [Epic 3: Accessible Client Error & Voice UX (#154)](https://github.com/liijamiilmfs/english-to-libran-text-to-voice/issues/154)"
    $commentResults += Add-CommentSafely -IssueNumber $issue -Comment $comment -EpicName "Epic 3"
}

# Epic 4 blocks its sub-issues
Write-Host "📊 Adding Epic 4 parent comments..." -ForegroundColor Cyan
$epic4SubIssues = @(146, 77, 76, 75, 107, 31, 30, 29, 28, 36)
foreach ($issue in $epic4SubIssues) {
    $comment = "🔗 **Parent Epic**: This issue is part of [Epic 4: Operational Command Center Foundations (#155)](https://github.com/liijamiilmfs/english-to-libran-text-to-voice/issues/155)"
    $commentResults += Add-CommentSafely -IssueNumber $issue -Comment $comment -EpicName "Epic 4"
}

$commentSuccessCount = ($commentResults | Where-Object { $_ -eq $true }).Count
Write-Host "📊 Comment addition summary: $commentSuccessCount/$($commentResults.Count) comments added successfully" -ForegroundColor $(if ($commentSuccessCount -eq $commentResults.Count) { "Green" } else { "Yellow" })

# Final summary
Write-Host "`n🎉 Epic relationships setup complete!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Labels: $labelSuccessCount/$($labelResults.Count) added" -ForegroundColor $(if ($labelSuccessCount -eq $labelResults.Count) { "Green" } else { "Yellow" })
Write-Host "  ✅ Comments: $commentSuccessCount/$($commentResults.Count) added" -ForegroundColor $(if ($commentSuccessCount -eq $commentResults.Count) { "Green" } else { "Yellow" })
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check issue labels are applied correctly" -ForegroundColor White
Write-Host "  2. Verify parent epic comments are added" -ForegroundColor White
Write-Host "  3. Create GitHub projects manually in the UI if needed" -ForegroundColor White
Write-Host "  4. Start working on Epic 2 (TTS bugs) as highest priority" -ForegroundColor White
Write-Host "`n🔧 To fix GitHub Projects access:" -ForegroundColor Yellow
Write-Host "  Run: gh auth refresh --scopes project" -ForegroundColor White
Write-Host "  Or create a new token with 'project' scope" -ForegroundColor White
