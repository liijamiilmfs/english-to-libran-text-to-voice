# Test Coverage Improvement Plan

## Current Snapshot
- The combined coverage report shows 85% statements/lines and 80% branches, with only the translator and metrics modules exceeding 90%.【F:coverage/coverage-summary.json†L10-L35】
- Existing unit tests focus on translator tokenization utilities but leave more complex translation flows untested.【F:test/unit/tokenizer.test.ts†L1-L47】
- Integration coverage exercises `/api/translate` happy path and basic validation, but other endpoints such as `/api/speak` are not covered today.【F:test/integration/translate-api.integration.test.ts†L1-L90】

## Highest-Risk Coverage Gaps

### 1. Text-to-Speech Pipeline & Caching (Target: +8-10% statements)
Key logic for OpenAI interaction, caching, and guardrails lives in the TTS route and cache singleton, yet there are no automated tests hitting it today.【F:app/api/speak/route.ts†L1-L309】【F:lib/tts-cache.ts†L1-L395】

Recommended additions:
- **Route integration tests** using a mocked OpenAI client to assert cache hits/misses, validation failures, quota error branches, and header shaping. This can mirror the custom module loader harness used for `/api/translate`.
- **Cache unit tests** that stub `fs` to verify initialization, hash generation with extra params, cleanup of expired/oversized entries, and resilience when files disappear mid-read.
- **Guardrail regression tests** ensuring `withGuardrails` actually enforces rate/budget options when wrapping the TTS handler.

### 2. Dynamic Voice Filters & Selection (Target: +5-6% statements)
Voice personalization logic parses prompts, normalizes characteristics, persists filters, and chooses best-fit voice profiles, all without coverage.【F:lib/dynamic-voice-filter.ts†L1-L347】【F:lib/voices.ts†L1-L358】

Recommended additions:
- Unit tests for `parseVoicePrompt` and `characteristicsToTTSParams`, including intensity modifiers, Librán keywords, and clamp logic.
- Browser-environment tests (Vitest + JSDOM) for `saveVoiceFilter`, `getSavedVoiceFilters`, and lifecycle helpers to guarantee graceful JSON failures.
- Focused tests for `selectVoiceForCharacteristics`, accent overrides, and scoring math to catch console-only debugging left in production.

### 3. Object URL Lifecycle Management (Target: +2% statements)
The `objectURLManager` overrides global `URL` methods, but there is no verification of resource tracking or restoration.【F:lib/object-url-manager.ts†L1-L65】

Recommended additions:
- JSDOM-based tests validating that create/revoke calls update `activeURLs`, emergency cleanup revokes pending URLs, and `restore()` rolls back monkey patches.
- Stress test to ensure concurrent creates/revokes leave no leaked references.

### 4. Translator Rule Engine Fallbacks (Target: +3-4% statements)
Complex suffix, compound-word, and context rules exist in the new rule engine but no tests assert those branches.【F:lib/translator/rule-engine.ts†L1-L146】

Recommended additions:
- Unit tests feeding crafted token arrays to trigger every fallback path (`-ing`, `-ed`, compounds, phrase context) and verify case preservation.
- Golden tests that compare full token arrays before/after rule application, confirming untranslated tokens stay intact.

### 5. Python Dictionary Importer (Target: +1-2% statements for tooling)
`test_fixed_importer.py` is a manual script rather than an automated assertion suite, so failures will only appear at runtime.【F:test/test_fixed_importer.py†L1-L48】

Recommended additions:
- Convert this script into Pytest cases (e.g., verify summary counts, sample output files, and error handling for missing JSON) and wire it into CI via `npm run test:all` or a dedicated Python workflow.

## Process & Tooling Enhancements
- Promote `npm run test:all:coverage` to CI, enforcing a 90% gate for statements/lines with module-level thresholds so gaps surface quickly.【F:coverage/coverage-summary.json†L10-L35】
- Parallelize Node + browser + Python suites via the existing `scripts/run-all-tests.js` harness to keep runtime manageable as coverage grows.
- Track coverage deltas per directory to ensure improvements persist (e.g., fail builds if `/lib` drops below 90% even if global coverage stays high).

## Suggested Milestones
1. **Sprint 1:** Add cache/voice filter unit tests and TTS route integration with mocks (should push overall coverage toward 90%).
2. **Sprint 2:** Cover translator rule engine and object URL manager, and convert Python importer script to automated tests.
3. **Sprint 3:** Introduce coverage gates and refine flaky areas identified after the first two sprints.

Executing the above plan should realistically raise coverage above 90% while hardening the most failure-prone logic.
