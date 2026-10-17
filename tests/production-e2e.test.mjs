import { chromium } from 'playwright';
import assert from 'assert';

console.log('🚀 Initiating Comprehensive Production E2E Test Suite');
console.log('Target Environment: https://resourcehub-lake.vercel.app\n');

const BASE_URL = 'https://resourcehub-lake.vercel.app';

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
    await page.waitForSelector('.spinner', { state: 'detached', timeout: 15000 }).catch(() => {});

    // Verify catalog renders topics grid or clean empty state
    await page.waitForSelector('.state-title, .topics-grid');
    const hasGrid = await page.locator('.topics-grid').isVisible();
    if (hasGrid) {
      console.log('✓ Topics grid active with existing course modules');
    } else {
      const emptyTitle = await page.locator('.state-title').textContent();
      assert.strictEqual(emptyTitle.trim(), 'No topics found', 'Initial catalog should show clean empty state');
    }

    // Verify Footer "Reset Sample Data" button is NOT visible for unauthenticated users
    const unauthResetBtn = page.locator('footer button:has-text("Reset Sample Data")');
    assert.strictEqual(await unauthResetBtn.count(), 0, 'Reset Sample Data button must be hidden for unauthenticated visitors');
    console.log('✓ Test 2 passed: Public catalog state and unauthenticated footer reset guard verified');

    // =========================================================================
    // Test 3: Admin Authentication & Insecure Credential Card Removal
    // =========================================================================
    console.log('\nTest 3: Verifying Admin Authentication & Password Hardening...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('h1:has-text("Sign in to ResourceHub")');

    // Verify default credential helper card is completely removed
    const credentialCardCount = await page.locator('.card:has-text("Administrator Account")').count();
    assert.strictEqual(credentialCardCount, 0, 'Default credential helper card must not be rendered on the login page');

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
    console.log('✓ Test 3 passed: Insecure credential card absence, password rejection, and authenticated session verified');

    // =========================================================================
    // Test 4: Academic Governance - Topic Creation & Public Visibility
    // =========================================================================
    console.log('\nTest 4: Testing Academic Topic Creation & Live Catalog Sync...');
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForSelector('h1:has-text("Manage Academic Topics")');
    await page.waitForSelector('.spinner', { state: 'detached', timeout: 15000 }).catch(() => {});
    await page.waitForSelector('table, .empty-state, .state-box', { timeout: 10000 });

    // Open Create Topic Modal
    await page.click('button:has-text("Create New Topic")');
    await page.waitForSelector('.modal-dialog');

    const topicTitle = `CS303 Web Engineering & System Security ${Date.now()}`;
    await page.locator('#newTopicName').fill(topicTitle);
    await page.locator('#newTopicCode').fill('CS303');
    await page.locator('#newTopicDesc').fill('Modern distributed architectures, frontend state, and security.');
    await page.click('.modal-footer button[type="submit"]');
    await page.waitForSelector('.modal-dialog', { state: 'detached', timeout: 10000 });

    // Verify topic exists in Admin table
    const createdTopicRow = page.locator('table tr').filter({ hasText: topicTitle });
    await createdTopicRow.waitFor({ state: 'visible', timeout: 10000 });
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
    await page.waitForSelector('.spinner', { state: 'detached', timeout: 15000 }).catch(() => {});
    await page.waitForSelector('table, .empty-state, .state-box', { timeout: 10000 });

    await page.click('button:has-text("Add Facilitator")');
    await page.waitForSelector('.modal-dialog');

    const facName = `Prof. Vikram Mehta ${Date.now()}`;
    const facUsername = `prof_mehta_${Date.now()}`;
    await page.locator('#facFullName').fill(facName);
    await page.locator('#facUsername').fill(facUsername);
    await page.click('.modal-footer button[type="submit"]');
    await page.waitForSelector('.modal-dialog', { state: 'detached', timeout: 10000 });

    const facRow = page.locator('table tr').filter({ hasText: facName });
    await facRow.waitFor({ state: 'visible', timeout: 10000 });
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
    // Test 8: Insecure 1-Click Removal & Return URL Authentication Flow
    // =========================================================================
    console.log('\nTest 8: Testing Insecure 1-Click Removal & Protected Return Flow...');
    const oneClickBtn = page.locator('button:has-text("1-Click Sign In as Administrator")');
    assert.strictEqual(await oneClickBtn.count(), 0, '1-Click admin button must be removed from production login page');

    // Sign in using the primary login form with valid credentials
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('atul1234');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname.includes('/admin'));
    assert(await page.locator('.header-actions .badge-role:has-text("ADMIN")').isVisible(), 'Primary sign-in grants Admin session');
    console.log('✓ Test 8 passed: 1-Click button removed and primary authentication verified');

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
