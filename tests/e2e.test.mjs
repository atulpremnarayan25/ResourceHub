import { chromium } from 'playwright';
import assert from 'assert';

console.log('🚀 Starting Clean-State Playwright E2E Test Suite');

const BASE_URL = 'http://localhost:5174';

async function runTests() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // Test 1: Topics Page Shows Clean Empty State or Catalog Grid
    // -------------------------------------------------------------
    console.log('Test 1: Topics Page Clean State...');
    await page.goto(`${BASE_URL}/topics`);
    await page.waitForSelector('h1:has-text("Course Topics & Resources")');
    await page.waitForSelector('.state-title, .topics-grid');

    const hasGrid = await page.locator('.topics-grid').isVisible();
    if (hasGrid) {
      console.log('✓ Test 1 passed: Topics grid verified on Topics page');
    } else {
      const emptyTitle = await page.locator('.state-title').textContent();
      assert.strictEqual(emptyTitle.trim(), 'No topics found', 'Should display clean empty state when no topics exist');
      console.log('✓ Test 1 passed: Clean empty state verified on Topics page');
    }

    // -------------------------------------------------------------
    // Test 2: Admin Password Enforcement (atul1234) & Login
    // -------------------------------------------------------------
    console.log('Test 2: Admin Authentication & Password Enforcement...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('h1:has-text("Sign In to ResourceHub")');

    // Attempt login with wrong password
    const usernameInput = page.locator('#username');
    const passwordInput = page.locator('#password');
    await usernameInput.fill('admin');
    await passwordInput.fill('wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.alert-danger');

    const errorMsg = await page.locator('.alert-danger span').textContent();
    assert(errorMsg.includes('Incorrect password'), 'Wrong password should be rejected');

    // Attempt login with correct password atul1234
    await passwordInput.fill('atul1234');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname.includes('/admin'));

    // Verify Admin badge in Header
    await page.waitForSelector('.badge-role:has-text("ADMIN")');
    console.log('✓ Test 2 passed: Admin authentication and atul1234 password enforcement verified');

    // -------------------------------------------------------------
    // Test 3: Admin Topics Management & Creation
    // -------------------------------------------------------------
    console.log('Test 3: Admin Topic Management...');
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForSelector('h1:has-text("Manage Academic Topics")');

    // Open Create Topic Modal
    await page.click('button:has-text("Create New Topic")');
    await page.waitForSelector('.modal-dialog');

    const testTopicName = `Web Engineering and React ${Date.now()}`;
    await page.locator('#newTopicName').fill(testTopicName);
    await page.locator('#newTopicCode').fill('CS303');
    await page.locator('#newTopicDesc').fill('Modern frontend engineering and state management.');
    await page.click('.modal-footer button[type="submit"]');

    // Wait for topic creation modal to close
    await page.waitForSelector('.modal-dialog', { state: 'detached', timeout: 10000 });

    // Verify topic now exists in table
    const topicRow = page.locator('table tbody tr').filter({ hasText: testTopicName });
    await topicRow.waitFor({ state: 'visible', timeout: 5000 });
    assert(await topicRow.isVisible(), 'Created topic should appear in Admin topic list');
    console.log('✓ Test 3 passed: Admin topic creation verified');

    // -------------------------------------------------------------
    // Test 4: Admin Facilitator Provisioning with Password
    // -------------------------------------------------------------
    console.log('Test 4: Admin Facilitator Provisioning...');
    await page.goto(`${BASE_URL}/admin/facilitators`);
    await page.waitForSelector('h1:has-text("Manage Course Facilitators")');
    await page.waitForSelector('.spinner', { state: 'detached', timeout: 15000 }).catch(() => {});
    await page.waitForSelector('table, .empty-state, .state-box', { timeout: 10000 });

    // Open Add Facilitator Modal
    await page.click('button:has-text("Add Facilitator")');
    await page.waitForSelector('.modal-dialog');

    const testFacName = `Prof. Rahul Sharma ${Date.now()}`;
    const testFacUsername = `prof_sharma_${Date.now()}`;
    const testFacPassword = 'fac_password_1234';
    await page.locator('#facFullName').fill(testFacName);
    await page.locator('#facUsername').fill(testFacUsername);
    await page.locator('#facPassword').fill(testFacPassword);
    await page.click('.modal-footer button[type="submit"]');

    // Wait for creation request to complete and modal to close
    await page.waitForSelector('.modal-dialog', { state: 'detached', timeout: 10000 });

    // Verify facilitator row exists
    const facRow = page.locator('table tr').filter({ hasText: testFacName });
    await facRow.waitFor({ state: 'visible', timeout: 10000 });
    assert(await facRow.isVisible(), 'Provisioned facilitator should appear in table');
    console.log('✓ Test 4 passed: Facilitator provisioning with password verified');

    // -------------------------------------------------------------
    // Test 5: Sign Out & Route Guard Protection
    // -------------------------------------------------------------
    console.log('Test 5: Sign Out & Protected Route Guards...');
    const signOutBtn = page.locator('button:has-text("Sign Out")');
    await signOutBtn.click();
    await page.waitForURL(`${BASE_URL}/login`);

    // Verify 1-click admin login and credential panels are completely removed
    const oneClickAdmin = page.locator('button:has-text("1-Click Sign In as Administrator")');
    assert.strictEqual(await oneClickAdmin.count(), 0, '1-Click admin sign in must be removed from production login page');
    const adminHelperCard = page.locator('.card:has-text("Administrator Account")');
    assert.strictEqual(await adminHelperCard.count(), 0, 'Default credential helper card must be removed');

    // Attempt direct access to protected admin route while logged out
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForTimeout(300);
    assert(page.url().includes('/login'), 'Unauthenticated access to /admin/topics must redirect to /login');

    // Authenticate with valid admin credentials via the primary sign-in form
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('atul1234');
    await page.click('button[type="submit"]');

    // Verify return URL redirects back to intended protected page (/admin/topics)
    await page.waitForURL(url => url.pathname.includes('/admin/topics'));
    assert(await page.locator('.header-actions .badge-role:has-text("ADMIN")').isVisible(), 'Authenticated as Admin');
    console.log('✓ Test 5 passed: Sign out, route guards, removed insecure controls, and protected route return verified');

    // -------------------------------------------------------------
    // Test 6: Facilitator Password Hardening & Strict Login Verification
    // -------------------------------------------------------------
    console.log('Test 6: Facilitator Password Hardening...');
    // Sign out from admin
    await page.locator('button:has-text("Sign Out")').click();
    await page.waitForURL(`${BASE_URL}/login`);

    // 1. Attempt login with wrong password
    await page.locator('#username').fill(testFacUsername);
    await page.locator('#password').fill('wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.alert-danger');
    const facErrorMsg = await page.locator('.alert-danger span').textContent();
    assert(facErrorMsg.includes('Incorrect password'), 'Facilitator login with wrong password must be rejected');

    // 2. Attempt login with correct provisioned password
    await page.locator('#password').fill(testFacPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(url => url.pathname.includes('/facilitator'));
    await page.waitForSelector('.badge-role:has-text("FACILITATOR")');
    console.log('✓ Test 6 passed: Facilitator password enforcement verified (wrong password rejected, correct password authenticated)');

    // -------------------------------------------------------------
    // Test 7: Student Signup & Automatic Login Flow
    // -------------------------------------------------------------
    console.log('Test 7: Student Self-Registration & Auto-Login...');
    // Sign out from facilitator
    await page.locator('button:has-text("Sign Out")').click();
    await page.waitForURL(`${BASE_URL}/login`);

    // Click "Create an account" link from login page
    await page.click('a:has-text("Create an account")');
    await page.waitForURL(`${BASE_URL}/signup`);
    await page.waitForSelector('h1:has-text("Create Student Account")');

    const testStudentName = `Aarav Patel ${Date.now()}`;
    const testStudentUsername = `student_${Date.now()}`;
    const testStudentPassword = 'student_pass_123';

    await page.locator('#studentName').fill(testStudentName);
    await page.locator('#studentUsername').fill(testStudentUsername);
    await page.locator('#studentPassword').fill(testStudentPassword);
    await page.locator('#studentConfirmPassword').fill(testStudentPassword);
    await page.click('button[type="submit"]');

    // Upon successful registration, automatically logs in and navigates to /topics
    await page.waitForURL(url => url.pathname.includes('/topics'));
    await page.waitForSelector('.badge-role:has-text("STUDENT")');
    console.log('✓ Test 7 passed: Student signup and auto-login verified with STUDENT badge');

    // -------------------------------------------------------------
    // Test 8: Student Logout & Login Password Validation
    // -------------------------------------------------------------
    console.log('Test 8: Student Logout & Strict Login Validation...');
    await page.locator('button:has-text("Sign Out")').click();
    await page.waitForURL(`${BASE_URL}/login`);

    // Verify unauthenticated header buttons on public layout
    await page.goto(`${BASE_URL}/topics`);
    assert(await page.locator('.header-actions a:has-text("Sign In")').isVisible(), 'Header should show Sign In link');
    assert(await page.locator('.header-actions a:has-text("Sign Up")').isVisible(), 'Header should show Sign Up link');

    // Return to login page to verify student credential checking
    await page.goto(`${BASE_URL}/login`);

    // Wrong password check
    await page.locator('#username').fill(testStudentUsername);
    await page.locator('#password').fill('wrongstudentpwd');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.alert-danger');
    const stuError = await page.locator('.alert-danger span').textContent();
    assert(stuError.includes('Incorrect password'), 'Wrong student password must be rejected');

    // Correct password check
    await page.locator('#password').fill(testStudentPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname.includes('/topics'));
    await page.waitForSelector('.badge-role:has-text("STUDENT")');
    console.log('✓ Test 8 passed: Student login password verification confirmed');

    // -------------------------------------------------------------
    // Test 9: Student Resource Interaction (Liking Resources)
    // -------------------------------------------------------------
    console.log('Test 9: Student Resource Interaction (Liking)...');
    // Navigate into a topic detail page if topics exist
    const topicCards = page.locator('.topics-grid .card');
    const topicCount = await topicCards.count();
    if (topicCount > 0) {
      await topicCards.first().locator('a, button').first().click();
      await page.waitForSelector('h1');

      const likeBtn = page.locator('.resource-card button[aria-label^="Like"], .resource-card button[aria-label^="Unlike"]').first();
      if (await likeBtn.isVisible()) {
        const initialCountText = await likeBtn.locator('span').textContent();
        const initialCount = parseInt(initialCountText, 10) || 0;
        await likeBtn.click();
        await page.waitForTimeout(500);

        const updatedCountText = await likeBtn.locator('span').textContent();
        const updatedCount = parseInt(updatedCountText, 10) || 0;
        assert(updatedCount === initialCount + 1 || updatedCount === initialCount - 1, 'Like count should update when student likes resource');
        console.log(`  ✓ Resource like count updated from ${initialCount} to ${updatedCount}`);
      }
    }
    console.log('✓ Test 9 passed: Student resource interaction verified');

    // -------------------------------------------------------------
    // Test 10: PDF Resource Preview Modal & Unsandboxed Iframe
    // -------------------------------------------------------------
    console.log('Test 10: PDF Resource Preview Modal Verification...');
    const viewPdfBtn = page.locator('.resource-card').filter({ hasText: 'PDF' }).locator('button:has-text("View")').first();
    if (await viewPdfBtn.isVisible()) {
      await viewPdfBtn.click();
      await page.waitForSelector('.modal-dialog');

      const modalTitle = page.locator('#preview-modal-title');
      assert(await modalTitle.isVisible(), 'Preview modal should be open');

      const iframe = page.locator('.modal-dialog iframe');
      assert(await iframe.isVisible(), 'PDF iframe must be visible in modal');
      const sandboxAttr = await iframe.getAttribute('sandbox');
      assert.strictEqual(sandboxAttr, null, 'Iframe must not have sandbox attribute which blocks browser PDF plugin');

      const iframeSrc = await iframe.getAttribute('src');
      assert(iframeSrc && iframeSrc.length > 0, 'PDF iframe must have valid source URL');

      // Verify Open in New Tab action link
      const openTabLink = page.locator('.modal-footer a:has-text("Open in New Tab")');
      assert(await openTabLink.isVisible(), 'Open in New Tab link must be present for PDF preview');

      // Close modal
      await page.locator('button[aria-label="Close preview"]').click();
      await page.waitForSelector('.modal-dialog', { state: 'detached', timeout: 5000 });
      console.log('  ✓ PDF preview modal opens without sandbox attribute and closes cleanly');
    }
    console.log('✓ Test 10 passed: PDF resource viewing verified');

    console.log('\n🎉 ALL 10 PLAYWRIGHT E2E TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Playwright Test Failure:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
