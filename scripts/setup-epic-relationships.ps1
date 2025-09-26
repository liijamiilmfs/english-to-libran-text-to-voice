# Setup Epic Relationships Script
# This script creates GitHub projects for each epic and adds related issues

Write-Host "🚀 Setting up Epic Relationships..." -ForegroundColor Green
Write-Host "📋 Debug: Starting script execution..." -ForegroundColor Gray

# Function to check if project exists
function Test-ProjectExists {
    param([string]$Title, [string]$Owner)
    
    Write-Host "🔍 Debug: Checking if project '$Title' exists..." -ForegroundColor Gray
    $projects = gh project list --owner $Owner --format json 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Debug: Failed to list projects, assuming none exist" -ForegroundColor Yellow
        return $false
    }
    
    $projectExists = $projects | ConvertFrom-Json | Where-Object { $_.title -eq $Title }
    if ($projectExists) {
        Write-Host "✅ Debug: Project '$Title' already exists" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Debug: Project '$Title' does not exist" -ForegroundColor Red
        return $false
    }
}

# Function to create project safely
function New-ProjectSafely {
    param([string]$Title, [string]$Owner, [string]$EpicNumber)
    
    Write-Host "🔍 Debug: Checking project '$Title'..." -ForegroundColor Gray
    
    if (Test-ProjectExists -Title $Title -Owner $Owner) {
        Write-Host "⏭️ Skipping '$Title' - already exists" -ForegroundColor Yellow
        return $true
    }
    
    Write-Host "📊 Creating Epic $EpicNumber project: '$Title'..." -ForegroundColor Cyan
    Write-Host "🔧 Debug: Running: gh project create --title '$Title' --owner $Owner" -ForegroundColor Gray
    
    $result = gh project create --title $Title --owner $Owner 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully created '$Title'" -ForegroundColor Green
        Write-Host "📝 Debug: Output: $result" -ForegroundColor Gray
        return $true
    } else {
        Write-Host "❌ Failed to create '$Title'" -ForegroundColor Red
        Write-Host "📝 Debug: Error: $result" -ForegroundColor Red
        return $false
    }
}

# Create GitHub projects for each epic
Write-Host "📊 Creating GitHub projects..." -ForegroundColor Yellow

$projectResults = @()

# Epic 1: Translation Quality Benchmarking Pipeline
$projectResults += New-ProjectSafely -Title "Epic 1: Translation Quality Benchmarking Pipeline" -Owner "liijamiilmfs" -EpicNumber "1"

# Epic 2: TTS Reliability & Telemetry
$projectResults += New-ProjectSafely -Title "Epic 2: TTS Reliability & Telemetry" -Owner "liijamiilmfs" -EpicNumber "2"

# Epic 3: Accessible Client Error & Voice UX  
$projectResults += New-ProjectSafely -Title "Epic 3: Accessible Client Error & Voice UX" -Owner "liijamiilmfs" -EpicNumber "3"

# Epic 4: Operational Command Center Foundations
$projectResults += New-ProjectSafely -Title "Epic 4: Operational Command Center Foundations" -Owner "liijamiilmfs" -EpicNumber "4"

$successCount = ($projectResults | Where-Object { $_ -eq $true }).Count
Write-Host "📊 Project creation summary: $successCount/4 projects created successfully" -ForegroundColor $(if ($successCount -eq 4) { "Green" } else { "Yellow" })

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

# Add "blocks" relationships to show parent-child
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

# Create milestones for each epic
Write-Host "🎯 Creating milestones..." -ForegroundColor Yellow

Write-Host "📝 Note: Milestone creation requires manual setup in GitHub UI" -ForegroundColor Yellow
Write-Host "🔗 Create these milestones manually:" -ForegroundColor Cyan
Write-Host "  - Epic 1: Translation Quality" -ForegroundColor White
Write-Host "  - Epic 2: TTS Reliability" -ForegroundColor White
Write-Host "  - Epic 3: Client UX" -ForegroundColor White
Write-Host "  - Epic 4: Operations" -ForegroundColor White

# Final summary
Write-Host "`n🎉 Epic relationships setup complete!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Projects: $successCount/4 created" -ForegroundColor $(if ($successCount -eq 4) { "Green" } else { "Yellow" })
Write-Host "  ✅ Labels: $labelSuccessCount/$($labelResults.Count) added" -ForegroundColor $(if ($labelSuccessCount -eq $labelResults.Count) { "Green" } else { "Yellow" })
Write-Host "  ✅ Comments: $commentSuccessCount/$($commentResults.Count) added" -ForegroundColor $(if ($commentSuccessCount -eq $commentResults.Count) { "Green" } else { "Yellow" })
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check GitHub projects for epic organization" -ForegroundColor White
Write-Host "  2. Verify issue labels are applied correctly" -ForegroundColor White
Write-Host "  3. Create milestones manually in GitHub UI" -ForegroundColor White
Write-Host "  4. Start working on Epic 2 (TTS bugs) as highest priority" -ForegroundColor White
