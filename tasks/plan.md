# Implementation Plan: Facilitator Password Hardening and Student Registration/Authentication

## Overview
This plan resolves a critical security vulnerability where facilitator accounts in ResourceHub accept arbitrary passwords during login, and introduces full self-service student registration and authentication. The architecture preserves dual-engine data persistence (Supabase PostgreSQL backend with transparent LocalStorage mock fallback), enforces Web Crypto SHA-256 cryptographic hashing without plaintext leaks, and connects student sessions directly to role-gated resource interactions (such as liking study materials).

## Architecture Decisions
- Centralized Cryptographic Password Hashing via Web Crypto API in `src/utils/security.js`.
- Dual-Engine Data Parity (Supabase PostgreSQL + LocalStorage Fallback) storing `password_hash` in `public.profiles` and `storage.js`.
- Session Security & Sanitization: strictly excluding `password_hash` from `currentUser` and `localStorage` session state.
- UI/UX Consistency & Accessibility Standards: reusing `.auth-page` styling with full WCAG 2.1 AA semantics.

## Task List

### Phase 1: Foundation (Security & Data Schemas)
- [ ] Task 1.1: Implement Centralized Password Hashing Utility (`src/utils/security.js`)
- [ ] Task 1.2: Database Schema & Migration Update (`supabase/schema.sql`, `complete_setup.sql`, `seed.sql`)
- [ ] Task 1.3: Update LocalStorage Mock Baseline (`src/data/mockData.js`)

### Checkpoint: Foundation
- [ ] Backend verification passes (`npm run verify:backend`)
- [ ] Build succeeds with zero errors (`npm run build`)

### Phase 2: Facilitator Password Hardening
- [ ] Task 2.1: Enforce Password in Admin Facilitator Provisioning (`src/services/adminService.js`)
- [ ] Task 2.2: Add Password Input to Facilitator Modal in Admin UI (`src/pages/AdminFacilitatorsPage.jsx`)
- [ ] Task 2.3: Enforce Strict Password Checking in `authService.login` (`src/services/authService.js`)

### Checkpoint: Facilitator Hardening
- [ ] Facilitator cannot log in with arbitrary password
- [ ] Facilitator successfully logs in with provisioned password
- [ ] Disabled facilitator is blocked from logging in

### Phase 3: Student Registration & Authentication Flow
- [ ] Task 3.1: Implement Student Signup Service in `authService` (`src/services/authService.js`)
- [ ] Task 3.2: Create Student Signup Page (`src/pages/SignupPage.jsx`)
- [ ] Task 3.3: Register Route and Connect Login/Signup Links (`src/App.jsx`, `src/pages/LoginPage.jsx`)

### Checkpoint: Student Registration
- [ ] New student registers at `/signup` with matching passwords
- [ ] Duplicate username is rejected with clean user feedback
- [ ] Registered student can log in via `/login` with valid credentials
- [ ] Invalid password during student login is rejected

### Phase 4: UI Navigation & Resource Interaction
- [ ] Task 4.1: Update Header Navigation for Unauthenticated & Student Roles (`src/components/layout/Header.jsx`)
- [ ] Task 4.2: Verify Student Resource Liking Integration (`src/components/resources/ResourceCard.jsx`)

### Checkpoint: End-to-End User Experience
- [ ] Facilitator provisioning and strict login verified end-to-end
- [ ] Student signup, login, header role presentation, and resource liking verified

### Phase 5: Verification & Automated E2E Test Suite
- [ ] Task 5.1: Extend Automated Test Suites (`tests/e2e.test.mjs`)

### Checkpoint: Complete Verification
- [ ] `npm test` passes 100%
- [ ] `npm run verify:backend` passes 100%
- [ ] `npm run build` succeeds
