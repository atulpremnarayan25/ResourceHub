# Implementation Plan: Production Readiness, Security Hardening & Test Modernization

## Overview
This plan establishes production readiness for ResourceHub based on the findings from the comprehensive Code Review, Security Audit, and Test Engineering assessments. It resolves Critical database and client security vulnerabilities (permissive Supabase RLS, password hash exposure, unsandboxed iframes), fixes data flow and correctness edge cases (search race conditions, cross-origin file downloads, quota protection), upgrades dependencies, and establishes a comprehensive unit and integration testing suite.

---

## Architectural & Security Principles
1. **Defense-in-Depth Row-Level Security (RLS)**: Enforce strict role-based and ownership checks on PostgreSQL tables and storage buckets rather than unrestricted `USING (true)` policies.
2. **Credential Sanitization & Zero Plaintext/Hash Leaks**: Revoke public read access to `password_hash`, eliminate caching of credential hashes in browser `localStorage`, and environment-gate mock credentials.
3. **Execution Isolation for User Content**: Sandbox preview iframes to prevent Stored XSS and tighten Content Security Policy directives against arbitrary origins.
4. **Data Parity & Resilient State**: Protect offline `localStorage` fallback from quota crashes and blob URL revocation, while debouncing search queries to prevent race conditions.
5. **Deterministic Automated Testing**: Parameterize test endpoints (`process.env.BASE_URL`), establish unit tests for pure cryptographic and validation utilities, and verify RBAC guards across all user roles.

---

## Task List

### Phase 1: Critical Security & Database Authorization Hardening
- [x] **Task 1.1: Restrict Supabase Row-Level Security (RLS) Policies** (`supabase/schema.sql`, `supabase/complete_setup.sql`)
  - Replace unrestricted `USING (true)` and `WITH CHECK (true)` policies on `profiles`, `topics`, `resources`, `likes`, and `storage.objects` with role-aware and identity-aware checks (`auth.uid() = id`, admin role verification).
  - Enforce file extension allowlists (`pdf`, `pptx`, `ppt`, `docx`, `doc`) directly in the Supabase Storage SQL policies.
  - *Acceptance Criteria*: PostgREST anonymous curl requests cannot delete or mutate topics, profiles, resources, or storage objects.
  - *Verification*: Execute `curl -X DELETE` against test endpoints; confirm HTTP 401/403 or 0 rows affected.

- [x] **Task 1.2: Restrict Password Hash Selection & Column Grants** (`supabase/schema.sql`, `supabase/complete_setup.sql`, `src/services/authService.js`)
  - Revoke `SELECT (password_hash)` on `public.profiles` from `anon` and `authenticated` roles.
  - Create a secure PostgreSQL RPC or auth function for credential verification so password hashes are never exposed via `select('*')`.
  - Update `authService.js` to avoid requesting `password_hash` in client queries.
  - *Acceptance Criteria*: Querying `GET /rest/v1/profiles` does not return `password_hash` column.
  - *Verification*: Inspect network response of profile queries; confirm zero password hash exposure.

- [x] **Task 1.3: Document Preview Iframe Sandboxing & CSP Directive Hardening** (`src/components/resources/FilePreviewModal.jsx`, `vercel.json`)
  - Add `sandbox="allow-scripts"` (without `allow-same-origin`) to the preview iframe in `FilePreviewModal.jsx` to prevent framed files from executing scripts within the app origin.
  - Update `vercel.json` CSP header: restrict `frame-src` strictly to `'self' blob: https://docs.google.com https://*.supabase.co` (removing unrestricted `https:`).
  - *Acceptance Criteria*: Previews for valid PDFs and Office docs load cleanly; embedded scripts or spoofed HTML payloads cannot access `localStorage` or parent origin.
  - *Verification*: Load document preview modal in browser; verify iframe attributes and CSP response headers.

- [x] **Task 1.4: Eliminate Client-Side Credential Storage** (`src/services/authService.js`, `src/services/adminService.js`)
  - Remove all reads and writes to `localStorage.getItem('resourcehub_credential_hashes')` across facilitator provisioning, student registration, and password reset flows.
  - Ensure password verification relies solely on backend validation or session state.
  - *Acceptance Criteria*: Browser `localStorage` contains zero credential hashes under any key.
  - *Verification*: Sign up new student, provision facilitator, reset password; verify `localStorage.getItem('resourcehub_credential_hashes')` remains null.

- [x] **Task 1.5: Environment-Gate Mock Credentials in Client Bundle** (`src/data/mockData.js`, `src/services/storage.js`)
  - Gate initial default admin accounts behind `import.meta.env.DEV` so static mock credentials are stripped from production builds.
  - Ensure production builds require explicit administrative provisioning.
  - *Acceptance Criteria*: Compiled production bundle (`dist/assets/index-*.js`) does not contain default plaintext passwords (`secureadminpassword123`).
  - *Verification*: Grep `dist/assets/*.js` for default passwords after `npm run build`.

### Checkpoint: Security Hardening
- [x] Database RLS blocks unauthorized mutations and credential dumping.
- [x] Client storage is sanitized of password hashes.
- [x] Iframe previews and CSP prevent Stored XSS and arbitrary frame embedding.
- [x] Build succeeds with zero mock credential leaks.

---

### Phase 2: Correctness, Data Flow & Reliability Improvements
- [x] **Task 2.1: Enforce Binary Magic-Byte Validation at Service Layer** (`src/services/resourceService.js`)
  - Move `validateFileHeader` directly into `resourceService.uploadResource` to ensure binary signatures (`%PDF-`, `PK\x03\x04`) are validated regardless of which component initiates upload.
  - Reject spoofed file extensions before sending payloads to storage or database.
  - *Acceptance Criteria*: Calling `uploadResource` with a renamed executable or HTML file throws validation error.
  - *Verification*: Upload test files with mismatched extensions; confirm immediate rejection.

- [x] **Task 2.2: Search Input Debouncing & Request Cancellation** (`src/pages/TopicsPage.jsx`, `src/pages/TopicDetailPage.jsx`, `src/pages/MyResourcesPage.jsx`)
  - Add 300ms debounce on search input changes to prevent API query spamming on every keystroke.
  - Introduce an `AbortController` in data fetching `useEffect` hooks to cancel superseded asynchronous requests.
  - *Acceptance Criteria*: Rapid typing generates a single debounced API request; out-of-order responses do not overwrite current state.
  - *Verification*: Type rapidly in search box; inspect network tab to confirm debounced requests and cancelled prior queries.

- [x] **Task 2.3: Cross-Origin File Download via Binary Blob** (`src/utils/security.js`)
  - Update `downloadResourceFile` to fetch cross-origin Supabase Storage URLs as `blob()`, creating a local object URL to trigger native browser file saving (bypassing browser cross-origin `download` attribute limitations).
  - *Acceptance Criteria*: Clicking "Download" on a Supabase-stored PDF or DOCX prompts a file save dialog rather than opening in-tab navigation.
  - *Verification*: Click download on a remote resource; confirm file is downloaded directly to local disk.

- [x] **Task 2.4: LocalStorage Quota Guarding & Blob URL Revocation Fix** (`src/services/storage.js`, `src/services/resourceService.js`)
  - Enforce a 1MB file size cap for local simulation mode to prevent `QuotaExceededError` in `localStorage`.
  - Replace ephemeral `URL.createObjectURL(file)` in local storage mode with persistent base64 data URLs or IndexedDB caching so previews persist across browser page reloads.
  - *Acceptance Criteria*: Large file uploads in local mode yield clean error warnings rather than unhandled quota crashes; uploaded resources remain accessible after reload.
  - *Verification*: Upload a document in offline mode; refresh the page; confirm resource thumbnail and preview persist.

### Checkpoint: Correctness & Data Integrity
- [x] File validation is enforced uniformly across service boundaries.
- [x] Search queries are debounced without race conditions.
- [x] Downloads function correctly across cross-origin storage domains.
- [x] Local storage state survives page reloads without quota exhaustion.

---

### Phase 3: Code Quality, Performance & Dependency Upgrades
- [x] **Task 3.1: Clean up Orphaned CSS** (`src/styles/components.css`)
  - Remove orphaned `.footer-actions` rules from `src/styles/components.css` left after removing the reset button.
  - *Acceptance Criteria*: No unused `.footer-actions` styles in stylesheet.
  - *Verification*: Search codebase for `.footer-actions`; confirm zero references.

- [x] **Task 3.2: Remove Stale Instructional Copy** (`src/pages/AccessDeniedPage.jsx`)
  - Update copy on `/access-denied` to remove references to the deleted top-right header role switcher.
  - Guide users to sign in with an authorized account instead.
  - *Acceptance Criteria*: Access denied screen displays professional, accurate guidance.
  - *Verification*: Navigate to `/access-denied` and inspect UI text.

- [x] **Task 3.3: Upgrade Vulnerable Dependencies** (`package.json`, `package-lock.json`)
  - Update `vite` and `react-router-dom` to latest secure releases to resolve the 4 vulnerabilities flagged by `npm audit`.
  - *Acceptance Criteria*: `npm audit` reports 0 vulnerabilities.
  - *Verification*: Run `npm audit` and confirm zero critical, high, or moderate advisories.

- [x] **Task 3.4: Route-Level Code Splitting via `React.lazy`** (`src/App.jsx`)
  - Wrap administrative (`AdminTopicsPage`, `AdminFacilitatorsPage`) and facilitator routes in `React.lazy()` and `<Suspense>`.
  - *Acceptance Criteria*: Initial bundle size for unauthenticated visitors and students decreases by ~30%.
  - *Verification*: Run `npm run build`; observe split chunks in Vite build output.

### Checkpoint: Quality & Performance
- [x] `npm audit` is clean with 0 vulnerabilities.
- [x] Stylesheet and access-denied pages contain no dead code or obsolete copy.
- [x] Build output utilizes code splitting with clean bundle budgets.

---

### Phase 4: Automated Testing & Production Verification
- [x] **Task 4.1: Environment-Aware E2E Test Configuration** (`tests/e2e.test.mjs`, `tests/login-auth.test.mjs`, `package.json`)
  - Update hardcoded `BASE_URL = 'http://localhost:5174'` to `process.env.BASE_URL || 'http://localhost:5173'`.
  - Add npm script `test:ci` that runs a preview build server automatically before running Playwright tests.
  - *Acceptance Criteria*: Tests run cleanly regardless of whether Vite starts on port 5173 or 5174.
  - *Verification*: Run tests with `BASE_URL=http://localhost:5173 npm test`.

- [x] **Task 4.2: Unit Test Suite for Security & Naming Utilities** (`tests/unit/security.test.mjs`, `tests/unit/naming-convention.test.mjs`)
  - Create native Node/Playwright unit tests asserting `isSafeUrl`, `sanitizeFilename`, `validateFileHeader`, `hashPassword`, and `generateStoredFilename`.
  - *Acceptance Criteria*: 100% unit test coverage for pure security and formatting functions.
  - *Verification*: Run `node tests/unit/security.test.mjs && node tests/unit/naming-convention.test.mjs`.

- [x] **Task 4.3: Automated Role-Based Access Control (RBAC) E2E Tests** (`tests/e2e/role-guards.test.mjs`)
  - Add explicit test asserting that `STUDENT` and `FACILITATOR` roles cannot access `/admin/*` and are redirected to `/access-denied`.
  - Verify that unauthenticated visitors are redirected to `/login`.
  - *Acceptance Criteria*: All protected route guards verified across every role permutation.
  - *Verification*: Execute role-guard test; confirm all assertions pass.

- [x] **Task 4.4: Deploy to Vercel & Validate Production Smoke Suite** (`tests/production-e2e.test.mjs`)
  - Configure production E2E suite with environment fallback support (`BASE_URL = process.env.BASE_URL || 'https://resourcehub-lake.vercel.app'`).
  - Validate production test runner across local and live targets; verify all 11 test suites pass with HTTP 200, strict security headers, and complete removal of the sample data reset button.
  - *Acceptance Criteria*: All 11 production checks pass with HTTP 200, strict security headers, and clean admin verification.
  - *Verification*: `npm run test:prod` and local validation exit with code 0.

### Checkpoint: Final Production Acceptance
- [x] Unit tests pass 100%.
- [x] Local E2E and RBAC test suites pass 100%.
- [x] Production smoke suite (`test:prod`) verified with all 11 suites.
- [x] Codebase clean, hardened, and ready for production sign-off.
