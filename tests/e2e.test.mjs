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
    // Test 1: Topics Page Shows Clean Empty State
    // -------------------------------------------------------------
    console.log('Test 1: Topics Page Clean State...');
    await page.goto(`${BASE_URL}/topics`);
    await page.waitForSelector('h1:has-text("Course Topics & Resources")');
    await page.waitForSelector('.state-box');

    const emptyTitle = await page.locator('.state-title').textContent();
    assert.strictEqual(emptyTitle.trim(), 'No topics found', 'Should display clean empty state when no topics exist');
    console.log('✓ Test 1 passed: Clean empty state verified on Topics page');

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

    await page.locator('#newTopicName').fill('Web Engineering and React');
    await page.locator('#newTopicCode').fill('CS303');
    await page.locator('#newTopicDesc').fill('Modern frontend engineering and state management.');
    await page.click('.modal-footer button[type="submit"]');
    await page.waitForTimeout(500);

    // Verify topic now exists in table
    const topicRow = page.locator('table tr:has-text("Web Engineering and React")');
    assert(await topicRow.isVisible(), 'Created topic should appear in Admin topic list');
    console.log('✓ Test 3 passed: Admin topic creation verified');

    // -------------------------------------------------------------
    // Test 4: Admin Facilitator Provisioning
    // -------------------------------------------------------------
    console.log('Test 4: Admin Facilitator Provisioning...');
    await page.goto(`${BASE_URL}/admin/facilitators`);
    await page.waitForSelector('h1:has-text("Manage Course Facilitators")');

    // Open Add Facilitator Modal
    await page.click('button:has-text("Add Facilitator")');
    await page.waitForSelector('.modal-dialog');

    await page.locator('#facFullName').fill('Prof. Rahul Sharma');
    await page.locator('#facUsername').fill('prof_sharma');
    await page.click('.modal-footer button[type="submit"]');
    await page.waitForTimeout(500);

    // Verify facilitator row exists
    const facRow = page.locator('table tr:has-text("Prof. Rahul Sharma")');
    assert(await facRow.isVisible(), 'Provisioned facilitator should appear in table');
    console.log('✓ Test 4 passed: Facilitator provisioning verified');

    // -------------------------------------------------------------
    // Test 5: Sign Out & Route Guard Protection
    // -------------------------------------------------------------
    console.log('Test 5: Sign Out & Protected Route Guards...');
    const signOutBtn = page.locator('button:has-text("Sign Out")');
    await signOutBtn.click();
    await page.waitForURL(`${BASE_URL}/login`);

    // Attempt direct access to protected admin route while logged out
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForTimeout(300);
    assert(page.url().includes('/login'), 'Unauthenticated access to /admin/topics must redirect to /login');

    // Test 1-click admin sign-in on login page
    const oneClickAdmin = page.locator('button:has-text("1-Click Sign In as Administrator")');
    await oneClickAdmin.click();
    await page.waitForURL(url => url.pathname.includes('/admin'));
    assert(await page.locator('.header-actions .badge-role:has-text("ADMIN")').isVisible(), '1-Click admin sign in should log in as Admin');
    console.log('✓ Test 5 passed: Sign out, route guards, and 1-click admin login verified');

    console.log('\n🎉 ALL 5 PLAYWRIGHT E2E TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Playwright Test Failure:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
