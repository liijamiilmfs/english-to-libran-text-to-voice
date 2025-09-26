# Issue Organization Plan

## Overview
This document outlines how to organize the existing 57+ open issues into our 4 new epic categories, plus identify issues that should be closed, consolidated, or moved to different phases.

## Epic Mapping Strategy

### 🏆 Epic 1: Translation Quality Benchmarking Pipeline (#156)
**Focus**: Quality assurance, testing, and linguistic accuracy

#### Issues to Move Here:
- **#117** - Enhanced Translation Pipeline (area:translator)
- **#103** - Enhanced Translation Pipeline (area:translator) - *duplicate of #117*
- **#120** - Update Dictionary Import System (area:translator)
- **#118** - Dictionary Management Dashboard (area:importer)
- **#105** - Dictionary Management Dashboard (area:importer) - *duplicate of #118*
- **#148** - Dictionary Dashboard Management (area:translator)
- **#21** - Integration — unknown token logger (area:translator)
- **#22** - Integration — budget guardrails (area:translator)

#### Sub-issues to Create:
1. **Quality Benchmarking Infrastructure** - Set up automated testing framework
2. **Dictionary Quality Assurance** - Implement dictionary validation and testing
3. **Translation Accuracy Metrics** - Build BLEU-style scoring system
4. **Regression Testing Pipeline** - Automated quality gates in CI/CD

---

### 🔧 Epic 2: TTS Reliability & Telemetry (#153)
**Focus**: Audio system reliability, monitoring, and performance

#### Issues to Move Here:
- **#149** - Custom Voice Filtering System Bugs (area:tts, priority:p1) - *Critical*
- **#132** - Voice Filter Functionality Not Working (area:tts) - *Related to #149*
- **#104** - Advanced TTS Features (area:tts)
- **#140** - Advanced Voice & Audio Features (area:tts) - *UI-58.5*
- **#35** - Audio normalization (area:tts, priority:p3)
- **#23** - TTS caching — content hash (area:tts, priority:p1)
- **#32** - Batch renderer — scripts (area:tts, priority:p3)
- **#26** - UI — voice preview & quick (area:tts, area:ui)

#### Sub-issues to Create:
1. **Fix Voice Filter Integration** - Resolve critical bugs in voice filtering
2. **TTS Performance Monitoring** - Add structured logging and metrics
3. **Audio Quality Enhancement** - Implement normalization and advanced features
4. **Cache Optimization** - Improve TTS caching and performance

---

### 🎨 Epic 3: Accessible Client Error & Voice UX (#154)
**Focus**: User experience, accessibility, and client-side improvements

#### Issues to Move Here:
- **#136** - Cultural Integration & Branding (UI-58.1)
- **#137** - Typography & Language Display (UI-58.2)
- **#138** - Framer Motion Micro-interactions (UI-58.3)
- **#139** - Information Architecture Redesign (UI-58.4)
- **#141** - Premium Component Library (UI-58.6)
- **#142** - Performance & Accessibility Optimization (UI-58.7)
- **#143** - Cultural Content Integration (UI-58.8)
- **#144** - Advanced Animation System (UI-58.9)
- **#145** - Mobile & Responsive Polish (UI-58.10)
- **#58** - Polish UI - Ultra Modern Look
- **#25** - UI — clipboard copy & file (area:ui, priority:p2)
- **#24** - Error taxonomy & user-faci (area:infra, priority:p2)

#### Sub-issues to Create:
1. **Accessibility & Error Handling** - Replace alerts with accessible components
2. **Cultural UI Integration** - Implement Libra world theming and branding
3. **Animation & Micro-interactions** - Add Framer Motion and smooth transitions
4. **Mobile & Responsive Design** - Ensure flawless mobile experience

---

### 📊 Epic 4: Operational Command Center Foundations (#155)
**Focus**: Infrastructure, monitoring, security, and operational excellence

#### Issues to Move Here:
- **#146** - Add Semantic Versioning (enhancement) - *Assigned to liijamiilmfs*
- **#77** - HTTPS (enhancement, codex)
- **#76** - OAuth (enhancement, codex)
- **#75** - Login And Authentication (enhancement, codex)
- **#107** - API Documentation and (enhancement, help wanted)
- **#31** - CI — lint/typecheck gates (area:infra, priority:p1)
- **#30** - CI — importer tests + tran (area:infra, area:qa)
- **#29** - Docs — Operating guide (area:docs, priority:p2)
- **#28** - Docs — Importer design (area:docs, priority:p2)
- **#36** - Observability — request me (area:infra, priority:p3)

#### Sub-issues to Create:
1. **Security & Authentication** - Implement HTTPS, OAuth, and login system
2. **CI/CD & Release Management** - Set up semantic versioning and automated releases
3. **Documentation & API** - Complete API documentation and operational guides
4. **Monitoring & Observability** - Implement comprehensive monitoring and alerting

---

## Issues to Close/Consolidate

### Duplicates to Close:
- **#103** - Close as duplicate of #117 (Enhanced Translation Pipeline)
- **#105** - Close as duplicate of #118 (Dictionary Management Dashboard)

### Phase-based Issues to Archive:
The following issues appear to be from an older phase-based organization and should be closed or moved to a "Future Phases" milestone:
- **#95-116** - Various phase-based issues (Phase 1-6, Model Architecture, etc.)
- **#100-116** - Duplicate phase issues

### Low Priority Issues to Move to Future:
- **#35** - Audio normalization (priority:p3) - Move to future enhancement
- **#32** - Batch renderer (priority:p3) - Move to future enhancement
- **#36** - Observability (priority:p3) - Move to future enhancement

---

## Implementation Plan

### Phase 1: Immediate Organization (This Week)
1. **Close duplicates** (#103, #105)
2. **Move critical TTS bugs** to Epic 2 (#149, #132)
3. **Move UI issues** to Epic 3 (UI-58.x series)
4. **Move infrastructure issues** to Epic 4 (#146, #77, #76, #75)

### Phase 2: Epic Sub-issue Creation (Next Week)
1. **Create sub-issues** for each epic based on the mapping above
2. **Link related issues** to their parent epics
3. **Set up project boards** for each epic
4. **Assign priorities** within each epic

### Phase 3: Cleanup and Future Planning (Following Week)
1. **Archive phase-based issues** to "Future Phases" milestone
2. **Create "Future Enhancements"** milestone for low-priority items
3. **Update issue templates** to include epic selection
4. **Document the new organization** in CONTRIBUTING.md

---

## Benefits of This Organization

1. **Clear Focus**: Each epic has a specific, measurable goal
2. **Reduced Duplication**: Eliminates duplicate issues and consolidates related work
3. **Better Prioritization**: Critical bugs get immediate attention
4. **Progress Tracking**: Easy to see progress within each epic
5. **Team Alignment**: Clear ownership and responsibility areas
6. **Roadmap Clarity**: Aligns with the PROJECT_STATE_ANALYSIS.md roadmap

---

## Next Steps

1. **Review this plan** with the team
2. **Execute Phase 1** organization immediately
3. **Create sub-issues** for each epic
4. **Update project boards** and labels
5. **Communicate changes** to all contributors
