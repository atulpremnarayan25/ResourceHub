# Todo List: Facilitator Password Hardening & Student Signup/Login

## Phase 1: Foundation (Security & Data Schemas)
- [x] Task 1.1: Implement Centralized Password Hashing Utility (`src/utils/security.js`)
- [x] Task 1.2: Database Schema & Migration Update (`supabase/schema.sql`, `supabase/complete_setup.sql`, `supabase/seed.sql`)
- [x] Task 1.3: Update LocalStorage Mock Baseline (`src/data/mockData.js`)

## Checkpoint: Foundation
- [x] Backend verification passes (`npm run verify:backend`)
- [x] Build succeeds with zero errors (`npm run build`)

## Phase 2: Facilitator Password Hardening
- [x] Task 2.1: Enforce Password in Admin Facilitator Provisioning (`src/services/adminService.js`)
- [x] Task 2.2: Add Password Input to Facilitator Modal in Admin UI (`src/pages/AdminFacilitatorsPage.jsx`)
- [x] Task 2.3: Enforce Strict Password Checking in `authService.login` (`src/services/authService.js`)

## Checkpoint: Facilitator Hardening
- [x] Facilitator cannot log in with arbitrary password
- [x] Facilitator successfully logs in with provisioned password
- [x] Disabled facilitator is blocked from logging in

## Phase 3: Student Registration & Authentication Flow
- [x] Task 3.1: Implement Student Signup Service in `authService` (`src/services/authService.js`)
- [x] Task 3.2: Create Student Signup Page (`src/pages/SignupPage.jsx`)
- [x] Task 3.3: Register Route and Connect Login/Signup Links (`src/App.jsx`, `src/pages/LoginPage.jsx`)

## Checkpoint: Student Registration
- [x] New student registers at `/signup` with matching passwords
- [x] Duplicate username is rejected with clean user feedback
- [x] Registered student can log in via `/login` with valid credentials
- [x] Invalid password during student login is rejected

## Phase 4: UI Navigation & Resource Interaction
- [x] Task 4.1: Update Header Navigation for Unauthenticated & Student Roles (`src/components/layout/Header.jsx`)
- [x] Task 4.2: Verify Student Resource Liking Integration (`src/components/resources/ResourceCard.jsx`)

## Checkpoint: End-to-End User Experience
- [x] Facilitator provisioning and strict login verified end-to-end
- [x] Student signup, login, header role presentation, and resource liking verified

## Phase 5: Verification & Automated E2E Test Suite
- [x] Task 5.1: Extend Automated Test Suites (`tests/e2e.test.mjs`, `tests/production-e2e.test.mjs`)

## Checkpoint: Final Acceptance
- [x] `npm test` passes 100%
- [x] `npm run verify:backend` passes 100%
- [x] `npm run build` succeeds cleanly
