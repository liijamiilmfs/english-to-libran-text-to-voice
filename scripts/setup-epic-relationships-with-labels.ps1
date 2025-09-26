# Epic Relationships Script with Label Creation
# This script creates epic labels first, then applies them to issues

Write-Host "🚀 Setting up Epic Relationships with Label Creation..." -ForegroundColor Green
Write-Host "📋 Debug: Starting script execution..." -ForegroundColor Gray

# Function to create label safely
function New-LabelSafely {
    param([string]$Name, [string]$Color, [string]$Description)
    
    Write-Host "🏷️ Debug: Creating label '$Name'..." -ForegroundColor Gray
    
    $result = gh label create $Name --color $Color --description $Description 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Created label '$Name'" -ForegroundColor Green
        return $true
    } else {
        # Check if label already exists
        if ($result -like "*already exists*") {
            Write-Host "⏭️ Label '$Name' already exists" -ForegroundColor Yellow
            return $true
        } else {
            Write-Host "❌ Failed to create label '$Name'" -ForegroundColor Red
            Write-Host "📝 Debug: Error: $result" -ForegroundColor Red
            return $false
        }
    }
}

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

# Create epic labels first
Write-Host "🏷️ Creating epic labels..." -ForegroundColor Yellow

$labelCreationResults = @()

# Create epic labels
$labelCreationResults += New-LabelSafely -Name "epic:translation-quality" -Color "0e8a16" -Description "Epic 1: Translation Quality Benchmarking Pipeline"
$labelCreationResults += New-LabelSafely -Name "epic:tts-reliability" -Color "d73a49" -Description "Epic 2: TTS Reliability & Telemetry"
$labelCreationResults += New-LabelSafely -Name "epic:client-ux" -Color "7057ff" -Description "Epic 3: Accessible Client Error & Voice UX"
$labelCreationResults += New-LabelSafely -Name "epic:operations" -Color "f9d0c4" -Description "Epic 4: Operational Command Center Foundations"

$labelCreationSuccessCount = ($labelCreationResults | Where-Object { $_ -eq $true }).Count
Write-Host "📊 Label creation summary: $labelCreationSuccessCount/4 labels created successfully" -ForegroundColor $(if ($labelCreationSuccessCount -eq 4) { "Green" } else { "Yellow" })

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
Write-Host "  ✅ Label Creation: $labelCreationSuccessCount/4 labels created" -ForegroundColor $(if ($labelCreationSuccessCount -eq 4) { "Green" } else { "Yellow" })
Write-Host "  ✅ Labels Applied: $labelSuccessCount/$($labelResults.Count) labels added to issues" -ForegroundColor $(if ($labelSuccessCount -eq $labelResults.Count) { "Green" } else { "Yellow" })
Write-Host "  ✅ Comments: $commentSuccessCount/$($commentResults.Count) comments added" -ForegroundColor $(if ($commentSuccessCount -eq $commentResults.Count) { "Green" } else { "Yellow" })
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check issue labels are applied correctly" -ForegroundColor White
Write-Host "  2. Verify parent epic comments are added" -ForegroundColor White
Write-Host "  3. Start working on Epic 2 (TTS bugs) as highest priority" -ForegroundColor White
Write-Host "`n🔧 To add GitHub Projects later:" -ForegroundColor Yellow
Write-Host "  Run: gh auth refresh -s project,read:project" -ForegroundColor White
Write-Host "  Then run the full script with project creation" -ForegroundColor White
