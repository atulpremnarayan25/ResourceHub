import { chromium } from 'playwright';
import assert from 'assert';

console.log('🚀 Starting Automated Role-Based Access Control (RBAC) E2E Test Suite\n');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

async function runRbacTests() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // Test 1: Unauthenticated Guest Route Protection
    // -------------------------------------------------------------
    console.log('Test 1: Guest Route Protection & Redirection...');
    // Clear any existing active user session
    await page.goto(`${BASE_URL}/topics`);
    await page.evaluate(() => localStorage.removeItem('resourcehub_active_user'));

    // Guest accessing /topics is permitted
    await page.goto(`${BASE_URL}/topics`);
    await page.waitForSelector('h1:has-text("Course Topics & Resources")');
    assert(page.url().includes('/topics'), 'Guest should be permitted on /topics');
    console.log('  ✓ Guest permitted on public /topics catalog');

    // Guest accessing /facilitator redirects to /login
    await page.goto(`${BASE_URL}/facilitator`);
    await page.waitForURL((url) => url.pathname.includes('/login'));
    assert(page.url().includes('/login'), 'Guest accessing /facilitator must redirect to /login');
    console.log('  ✓ Guest accessing /facilitator redirected to /login');

    // Guest accessing /admin/topics redirects to /login
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForURL((url) => url.pathname.includes('/login'));
    assert(page.url().includes('/login'), 'Guest accessing /admin/topics must redirect to /login');
    console.log('  ✓ Guest accessing /admin/topics redirected to /login');

    // Guest accessing /admin/facilitators redirects to /login
    await page.goto(`${BASE_URL}/admin/facilitators`);
    await page.waitForURL((url) => url.pathname.includes('/login'));
    assert(page.url().includes('/login'), 'Guest accessing /admin/facilitators must redirect to /login');
    console.log('  ✓ Guest accessing /admin/facilitators redirected to /login');
    console.log('✓ Test 1 passed: Guest RBAC guards verified\n');

    // -------------------------------------------------------------
    // Test 2: Student Role Route Protection
    // -------------------------------------------------------------
    console.log('Test 2: Student Role Route Isolation...');
    await page.evaluate(() => {
      localStorage.setItem('resourcehub_active_user', JSON.stringify({
        id: 'usr_test_student',
        username: 'test_student',
        name: 'Test Student',
        role: 'STUDENT',
        status: 'ACTIVE'
      }));
    });

    // Student on public topics
    await page.goto(`${BASE_URL}/topics`);
    await page.waitForSelector('.badge-role:has-text("STUDENT")');
    assert(page.url().includes('/topics'), 'Student permitted on /topics');

    // Student attempting /facilitator gets redirected to /access-denied
    await page.goto(`${BASE_URL}/facilitator`);
    await page.waitForURL((url) => url.pathname.includes('/access-denied'));
    assert(page.url().includes('/access-denied'), 'Student accessing /facilitator must redirect to /access-denied');
    console.log('  ✓ Student blocked from /facilitator (redirected to /access-denied)');

    // Student attempting /admin/topics gets redirected to /access-denied
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForURL((url) => url.pathname.includes('/access-denied'));
    assert(page.url().includes('/access-denied'), 'Student accessing /admin/topics must redirect to /access-denied');
    console.log('  ✓ Student blocked from /admin/topics (redirected to /access-denied)');

    // Student attempting /admin/facilitators gets redirected to /access-denied
    await page.goto(`${BASE_URL}/admin/facilitators`);
    await page.waitForURL((url) => url.pathname.includes('/access-denied'));
    assert(page.url().includes('/access-denied'), 'Student accessing /admin/facilitators must redirect to /access-denied');
    console.log('  ✓ Student blocked from /admin/facilitators (redirected to /access-denied)');
    console.log('✓ Test 2 passed: Student RBAC isolation verified\n');

    // -------------------------------------------------------------
    // Test 3: Facilitator Role Route Protection
    // -------------------------------------------------------------
    console.log('Test 3: Facilitator Role Route Permissions...');
    await page.evaluate(() => {
      localStorage.setItem('resourcehub_active_user', JSON.stringify({
        id: 'usr_test_facilitator',
        username: 'test_facilitator',
        name: 'Dr. Test Facilitator',
        role: 'FACILITATOR',
        status: 'ACTIVE'
      }));
    });

    // Facilitator on /facilitator dashboard
    await page.goto(`${BASE_URL}/facilitator`);
    await page.waitForSelector('.badge-role:has-text("FACILITATOR")');
    assert(page.url().includes('/facilitator'), 'Facilitator permitted on /facilitator');
    console.log('  ✓ Facilitator permitted on /facilitator dashboard');

    // Facilitator on /facilitator/resources
    await page.goto(`${BASE_URL}/facilitator/resources`);
    await page.waitForSelector('h1:has-text("My Uploaded Resources")');
    assert(page.url().includes('/facilitator/resources'), 'Facilitator permitted on /facilitator/resources');
    console.log('  ✓ Facilitator permitted on /facilitator/resources');

    // Facilitator attempting /admin/topics gets redirected to /access-denied
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForURL((url) => url.pathname.includes('/access-denied'));
    assert(page.url().includes('/access-denied'), 'Facilitator accessing /admin/topics must redirect to /access-denied');
    console.log('  ✓ Facilitator blocked from /admin/topics (redirected to /access-denied)');

    // Facilitator attempting /admin/facilitators gets redirected to /access-denied
    await page.goto(`${BASE_URL}/admin/facilitators`);
    await page.waitForURL((url) => url.pathname.includes('/access-denied'));
    assert(page.url().includes('/access-denied'), 'Facilitator accessing /admin/facilitators must redirect to /access-denied');
    console.log('  ✓ Facilitator blocked from /admin/facilitators (redirected to /access-denied)');
    console.log('✓ Test 3 passed: Facilitator RBAC permissions verified\n');

    // -------------------------------------------------------------
    // Test 4: Administrator Role Omnipotent Access
    // -------------------------------------------------------------
    console.log('Test 4: Administrator Role Comprehensive Access...');
    await page.evaluate(() => {
      localStorage.setItem('resourcehub_active_user', JSON.stringify({
        id: 'usr_adm_1',
        username: 'admin',
        name: 'System Administrator',
        role: 'ADMIN',
        status: 'ACTIVE'
      }));
    });

    // Admin on /admin/topics
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForSelector('.badge-role:has-text("ADMIN")');
    assert(page.url().includes('/admin/topics'), 'Admin permitted on /admin/topics');
    console.log('  ✓ Admin permitted on /admin/topics');

    // Admin on /admin/facilitators
    await page.goto(`${BASE_URL}/admin/facilitators`);
    await page.waitForSelector('h1:has-text("Manage Course Facilitators")');
    assert(page.url().includes('/admin/facilitators'), 'Admin permitted on /admin/facilitators');
    console.log('  ✓ Admin permitted on /admin/facilitators');

    // Admin on /facilitator section
    await page.goto(`${BASE_URL}/facilitator`);
    assert(page.url().includes('/facilitator'), 'Admin permitted on /facilitator');
    console.log('  ✓ Admin permitted on /facilitator section');

    // Admin on /topics
    await page.goto(`${BASE_URL}/topics`);
    assert(page.url().includes('/topics'), 'Admin permitted on /topics');
    console.log('  ✓ Admin permitted on public catalog');
    console.log('✓ Test 4 passed: Administrator comprehensive access verified\n');

    console.log('🎉 ALL RBAC ROLE GUARD TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ RBAC Test Failure:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runRbacTests();
