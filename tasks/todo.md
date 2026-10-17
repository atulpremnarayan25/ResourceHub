# Todo List: Production Readiness, Security Hardening & Test Modernization

## Phase 1: Critical Security & Database Authorization Hardening
- [x] Task 1.1: Restrict Supabase Row-Level Security (RLS) Policies (`supabase/schema.sql`, `supabase/complete_setup.sql`)
- [x] Task 1.2: Restrict Password Hash Selection & Column Grants (`supabase/schema.sql`, `supabase/complete_setup.sql`, `src/services/authService.js`)
- [x] Task 1.3: Document Preview Iframe Sandboxing & CSP Directive Hardening (`src/components/resources/FilePreviewModal.jsx`, `vercel.json`)
- [x] Task 1.4: Eliminate Client-Side Credential Storage (`src/services/authService.js`, `src/services/adminService.js`)
- [x] Task 1.5: Environment-Gate Mock Credentials in Client Bundle (`src/data/mockData.js`, `src/services/storage.js`)

## Checkpoint: Security Hardening
- [x] Database RLS blocks unauthorized mutations and credential dumping
- [x] Client storage is sanitized of password hashes
- [x] Iframe previews and CSP prevent Stored XSS and arbitrary frame embedding
- [x] Build succeeds with zero mock credential leaks

## Phase 2: Correctness, Data Flow & Reliability Improvements
- [x] Task 2.1: Enforce Binary Magic-Byte Validation at Service Layer (`src/services/resourceService.js`)
- [x] Task 2.2: Search Input Debouncing & Request Cancellation (`src/pages/TopicsPage.jsx`, `src/pages/TopicDetailPage.jsx`, `src/pages/MyResourcesPage.jsx`)
- [x] Task 2.3: Cross-Origin File Download via Binary Blob (`src/utils/security.js`)
- [x] Task 2.4: LocalStorage Quota Guarding & Blob URL Revocation Fix (`src/services/storage.js`, `src/services/resourceService.js`)

## Checkpoint: Correctness & Data Integrity
- [x] File validation is enforced uniformly across service boundaries
- [x] Search queries are debounced without race conditions
- [x] Downloads function correctly across cross-origin storage domains
- [x] Local storage state survives page reloads without quota exhaustion

## Phase 3: Code Quality, Performance & Dependency Upgrades
- [x] Task 3.1: Clean up Orphaned CSS (`src/styles/components.css`)
- [x] Task 3.2: Remove Stale Instructional Copy (`src/pages/AccessDeniedPage.jsx`)
- [x] Task 3.3: Upgrade Vulnerable Dependencies (`package.json`, `package-lock.json`)
- [x] Task 3.4: Route-Level Code Splitting via `React.lazy` (`src/App.jsx`)

## Checkpoint: Quality & Performance
- [x] `npm audit` is clean with 0 vulnerabilities
- [x] Stylesheet and access-denied pages contain no dead code or obsolete copy
- [x] Build output utilizes code splitting with clean bundle budgets

## Phase 4: Automated Testing & Production Verification
- [x] Task 4.1: Environment-Aware E2E Test Configuration (`tests/e2e.test.mjs`, `tests/login-auth.test.mjs`, `package.json`)
- [x] Task 4.2: Unit Test Suite for Security & Naming Utilities (`tests/unit/security.test.mjs`, `tests/unit/naming-convention.test.mjs`)
- [x] Task 4.3: Automated Role-Based Access Control (RBAC) E2E Tests (`tests/e2e/role-guards.test.mjs`)
- [x] Task 4.4: Deploy to Vercel & Validate Production Smoke Suite (`tests/production-e2e.test.mjs`)

## Checkpoint: Final Production Acceptance
- [x] Unit tests pass 100%
- [x] Local E2E and RBAC test suites pass 100%
- [x] Production smoke suite (`test:prod`) passes 100% against live Vercel deployment
- [x] Codebase clean, hardened, and ready for production sign-off
