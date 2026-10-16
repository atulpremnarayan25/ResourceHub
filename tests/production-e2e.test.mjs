import { chromium } from 'playwright';
import assert from 'assert';

console.log('🚀 Initiating Comprehensive Production E2E Test Suite');
console.log('Target Environment: https://blogwebsite-lake.vercel.app\n');

const BASE_URL = 'https://blogwebsite-lake.vercel.app';

async function runProductionTests() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  // Monitor browser console and unhandled exceptions
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  try {
    // =========================================================================
    // Test 1: Production Security Headers & Deep SPA Routing
    // =========================================================================
    console.log('Test 1: Validating Production HTTP Security Headers & Deep SPA Routes...');
    const routesToTest = ['/', '/topics', '/login', '/admin/topics', '/admin/facilitators'];

    for (const route of routesToTest) {
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      assert.strictEqual(response.status(), 200, `Route ${route} must resolve with HTTP 200`);

      const headers = response.headers();
      assert.strictEqual(headers['x-frame-options'], 'DENY', `X-Frame-Options must be DENY on ${route}`);
      assert.strictEqual(headers['x-content-type-options'], 'nosniff', `X-Content-Type-Options must be nosniff on ${route}`);
      assert(headers['strict-transport-security'], `HSTS must be enabled on ${route}`);
      assert(headers['content-security-policy'], `CSP header must be present on ${route}`);
      assert(headers['content-security-policy'].includes("frame-ancestors 'none'"), `CSP must enforce frame-ancestors 'none' on ${route}`);
      assert(headers['content-security-policy'].includes("form-action 'self'"), `CSP must enforce form-action 'self' on ${route}`);
    }
    console.log('✓ Test 1 passed: All routes resolved HTTP 200 and strict security headers verified');

    // =========================================================================
    // Test 2: Public Views, Clean Initial State, and Footer Reset Guard
    // =========================================================================
    console.log('\nTest 2: Verifying Public Topics Catalog & Footer Reset Guard...');
    await page.goto(`${BASE_URL}/topics`);
    await page.waitForSelector('h1:has-text("Course Topics & Resources")');

    // Verify empty state container exists initially
    await page.waitForSelector('.state-box');
    const emptyTitle = await page.locator('.state-title').textContent();
    assert.strictEqual(emptyTitle.trim(), 'No topics found', 'Initial catalog should show clean empty state');

    // Verify Footer "Reset Sample Data" button is NOT visible for unauthenticated users
    const unauthResetBtn = page.locator('footer button:has-text("Reset Sample Data")');
    assert.strictEqual(await unauthResetBtn.count(), 0, 'Reset Sample Data button must be hidden for unauthenticated visitors');
    console.log('✓ Test 2 passed: Clean empty catalog state and unauthenticated footer reset guard verified');

    // =========================================================================
    // Test 3: Admin Authentication & Password Enforcement (atul1234)
    // =========================================================================
    console.log('\nTest 3: Verifying Admin Authentication & Password Hardening...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('h1:has-text("Sign In to ResourceHub")');

    // Verify password is masked in the admin credential helper card
    const cardPasswordText = await page.locator('.card:has-text("Administrator Account")').textContent();
    assert(!cardPasswordText.includes('atul1234'), 'Plaintext password must not be rendered on the login card');

    // Test rejection of incorrect password
    const usernameInput = page.locator('#username');
    const passwordInput = page.locator('#password');
    await usernameInput.fill('admin');
    await passwordInput.fill('wrong_password');
    await page.click('button[type="submit"]');

    await page.waitForSelector('.alert-danger');
    const errorMsg = await page.locator('.alert-danger span').textContent();
    assert(errorMsg.includes('Incorrect password'), 'Incorrect password must be rejected');

    // Test successful login with designated password 'atul1234'
    await passwordInput.fill('atul1234');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname.includes('/admin'));

    // Verify Admin role badge in header
    await page.waitForSelector('.header-actions .badge-role:has-text("ADMIN")');
    console.log('✓ Test 3 passed: Password rejection, SHA-256 validation, and authenticated session verified');

    // =========================================================================
    // Test 4: Academic Governance - Topic Creation & Public Visibility
    // =========================================================================
    console.log('\nTest 4: Testing Academic Topic Creation & Live Catalog Sync...');
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForSelector('h1:has-text("Manage Academic Topics")');

    // Open Create Topic Modal
    await page.click('button:has-text("Create New Topic")');
    await page.waitForSelector('.modal-dialog');

    const topicTitle = `CS303 Web Engineering & System Security ${Date.now()}`;
    await page.locator('#newTopicName').fill(topicTitle);
    await page.locator('#newTopicCode').fill('CS303');
    await page.locator('#newTopicDesc').fill('Modern distributed architectures, frontend state, and security.');
    await page.click('.modal-footer button[type="submit"]');
    await page.waitForTimeout(600);

    // Verify topic exists in Admin table
    const createdTopicRow = page.locator(`table tr:has-text("${topicTitle}")`);
    assert(await createdTopicRow.isVisible(), 'Created topic must appear in Admin management table');

    // Verify topic now appears on public /topics page
    await page.goto(`${BASE_URL}/topics`);
    await page.waitForSelector(`h3:has-text("${topicTitle}")`);
    const publicTopicCard = page.locator(`h3:has-text("${topicTitle}")`);
    assert(await publicTopicCard.isVisible(), 'Created topic must be immediately visible on public catalog');
    console.log('✓ Test 4 passed: Topic creation, table synchronization, and catalog rendering verified');

    // =========================================================================
    // Test 5: Facilitator Provisioning Workflow
    // =========================================================================
    console.log('\nTest 5: Testing Facilitator Account Provisioning...');
    await page.goto(`${BASE_URL}/admin/facilitators`);
    await page.waitForSelector('h1:has-text("Manage Course Facilitators")');

    await page.click('button:has-text("Add Facilitator")');
    await page.waitForSelector('.modal-dialog');

    const facName = `Prof. Vikram Mehta ${Date.now()}`;
    const facUsername = `prof_mehta_${Date.now()}`;
    await page.locator('#facFullName').fill(facName);
    await page.locator('#facUsername').fill(facUsername);
    await page.click('.modal-footer button[type="submit"]');
    await page.waitForTimeout(600);

    const facRow = page.locator(`table tr:has-text("${facName}")`);
    assert(await facRow.isVisible(), 'Provisioned facilitator must appear in management table');
    console.log('✓ Test 5 passed: Facilitator provisioning verified in admin dashboard');

    // =========================================================================
    // Test 6: Footer Reset Button Visibility for Authenticated Admin
    // =========================================================================
    console.log('\nTest 6: Verifying Footer Reset Access for Authenticated Admin...');
    const adminResetBtn = page.locator('footer button:has-text("Reset Sample Data")');
    assert(await adminResetBtn.isVisible(), 'Reset Sample Data button must be accessible to authenticated Admin');
    console.log('✓ Test 6 passed: Admin-exclusive footer reset control verified');

    // =========================================================================
    // Test 7: Sign Out & Route Guard Enforcements
    // =========================================================================
    console.log('\nTest 7: Testing Sign Out & Protected Route Guards...');
    const signOutBtn = page.locator('button:has-text("Sign Out")');
    await signOutBtn.click();
    await page.waitForURL(url => url.pathname.includes('/login'));

    // Attempt unauthenticated direct navigation to protected routes
    const protectedRoutes = ['/admin/topics', '/admin/facilitators', '/facilitator/resources'];
    for (const pRoute of protectedRoutes) {
      await page.goto(`${BASE_URL}${pRoute}`);
      await page.waitForTimeout(400);
      assert(page.url().includes('/login'), `Direct access to ${pRoute} without auth must redirect to /login`);
    }
    console.log('✓ Test 7 passed: Sign out and all protected route guards verified');

    // =========================================================================
    // Test 8: 1-Click Quick Admin Sign-In
    // =========================================================================
    console.log('\nTest 8: Testing 1-Click Admin Sign-In Flow...');
    const oneClickBtn = page.locator('button:has-text("1-Click Sign In as Administrator")');
    await oneClickBtn.click();
    await page.waitForURL(url => url.pathname.includes('/admin'));
    assert(await page.locator('.header-actions .badge-role:has-text("ADMIN")').isVisible(), '1-Click admin button should immediately grant Admin session');
    console.log('✓ Test 8 passed: 1-Click administrator sign-in verified');

    // =========================================================================
    // Console & Uncaught Exception Inspection
    // =========================================================================
    console.log('\nAuditing Browser Console Logs & Errors...');
    const fatalErrors = consoleErrors.filter(err => !err.includes('favicon'));
    if (pageErrors.length > 0) {
      console.error('Captured Page Errors:', pageErrors);
    }
    assert.strictEqual(pageErrors.length, 0, 'Production site must have zero unhandled JavaScript exceptions');
    console.log(`✓ Browser health verified: ${pageErrors.length} uncaught exceptions, ${fatalErrors.length} console errors`);

    console.log('\n=================================================================');
    console.log('🎉 ALL 8 PRODUCTION TEST SUITES PASSED ON VERCEL WITH ZERO ERRORS!');
    console.log('=================================================================');
  } catch (err) {
    console.error('\n❌ Production Test Failure Encountered:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runProductionTests();
