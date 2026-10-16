import { chromium } from 'playwright';
import assert from 'assert';

console.log('🚀 Starting Comprehensive Playwright E2E Test Suite');

const BASE_URL = 'http://localhost:5174';

async function runTests() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // Test 1: Navigation to Topics Page & Search Filter
    // -------------------------------------------------------------
    console.log('Test 1: Topics Page & Search Filtering...');
    await page.goto(`${BASE_URL}/topics`);
    await page.waitForSelector('h1:has-text("Course Topics & Resources")');
    await page.waitForSelector('.topics-grid .card');

    // Count topics before search
    const topicCards = await page.$$('.topics-grid .card');
    assert.strictEqual(topicCards.length, 5, 'Should display 5 curriculum topics initially');

    // Filter topics by "Data Structures"
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('Data Structures');
    await page.waitForTimeout(300);

    const filteredCards = await page.$$('.topics-grid .card');
    assert.strictEqual(filteredCards.length, 1, 'Search for "Data Structures" should filter down to 1 topic');
    const topicTitle = await page.locator('.topics-grid .card h3').textContent();
    assert(topicTitle.includes('Data Structures and Algorithms'), 'Card should match search query');
    console.log('✓ Test 1 passed: Topics page and search filter verified');

    // -------------------------------------------------------------
    // Test 2: Topic Details, Resource Format Filters & Liking
    // -------------------------------------------------------------
    console.log('Test 2: Topic Details, Resource Format Filters & Liking...');
    await page.click('text=Explore Resources');
    await page.waitForSelector('h1:has-text("Data Structures and Algorithms")');
    await page.waitForSelector('.resources-list .resource-card');

    // Check all format pills
    const allPill = page.locator('button:has-text("All Files")');
    const pdfPill = page.locator('button:has-text("PDF")');
    const pptxPill = page.locator('button:has-text("PPTX")');
    assert(await allPill.isVisible(), 'All Files filter should be visible');
    assert(await pdfPill.isVisible(), 'PDF filter should be visible');
    assert(await pptxPill.isVisible(), 'PPTX filter should be visible');

    // Check resources count
    const initialResources = await page.$$('.resource-card');
    assert.strictEqual(initialResources.length, 3, 'DSA topic should display 3 resources');

    // Filter by PPTX
    await pptxPill.click();
    await page.waitForTimeout(300);
    const pptxResources = await page.$$('.resource-card');
    assert.strictEqual(pptxResources.length, 1, 'Only 1 PPTX resource should display under DSA');

    // Filter back to All Files
    await allPill.click();
    await page.waitForTimeout(300);

    // Test Liking a Resource as Student Arun
    const firstLikeButton = page.locator('.resource-card').first().locator('.resource-actions button').first();
    const initialLabel = await firstLikeButton.getAttribute('aria-label');
    await firstLikeButton.click();
    await page.waitForTimeout(400);

    const updatedLabel = await firstLikeButton.getAttribute('aria-label');
    assert.notStrictEqual(initialLabel, updatedLabel, 'Like button aria-label should toggle state');
    console.log(`✓ Test 2 passed: Topic details, file filtering, and liking verified (${initialLabel} -> ${updatedLabel})`);

    // -------------------------------------------------------------
    // Test 3: Role Switch to Facilitator & Upload Form Access
    // -------------------------------------------------------------
    console.log('Test 3: Role Switching to Facilitator & Upload Navigation...');
    const roleSelect = page.locator('select[aria-label="Switch active demo role"]');
    await roleSelect.selectOption({ label: 'Role: Facilitator' });
    await page.waitForTimeout(400);

    // Verify Facilitator navigation links
    const myResourcesLink = page.locator('nav a:has-text("My Resources")');
    const uploadLink = page.locator('nav a:has-text("Upload Resource")');
    assert(await myResourcesLink.isVisible(), 'My Resources link should be visible for Facilitator');
    assert(await uploadLink.isVisible(), 'Upload Resource link should be visible for Facilitator');

    // Navigate to Upload Page
    await uploadLink.click();
    await page.waitForSelector('h1:has-text("Upload Academic Resource")');

    // Verify academic naming live preview
    const titleInput = page.locator('#resourceTitle');
    await titleInput.fill('Advanced Graph Theory');
    await page.waitForTimeout(200);

    const previewBlock = page.locator('form code').last();
    const previewText = await previewBlock.textContent();
    assert(previewText.includes('prof_sharma_'), 'Live preview should contain facilitator username');
    assert(previewText.includes('advanced-graph-theory'), 'Live preview should contain title slug');
    console.log(`✓ Test 3 passed: Facilitator role, navigation, and live filename preview verified ("${previewText}")`);

    // -------------------------------------------------------------
    // Test 4: Role Switch to Admin & Governance Controls
    // -------------------------------------------------------------
    console.log('Test 4: Role Switch to Admin & Governance Controls...');
    await roleSelect.selectOption({ label: 'Role: Admin' });
    await page.waitForTimeout(400);

    // Verify Admin navigation links
    const manageTopicsLink = page.locator('nav a:has-text("Manage Topics")');
    const manageFacilitatorsLink = page.locator('nav a:has-text("Manage Facilitators")');
    assert(await manageTopicsLink.isVisible(), 'Manage Topics link should be visible for Admin');
    assert(await manageFacilitatorsLink.isVisible(), 'Manage Facilitators link should be visible for Admin');

    // Navigate to Manage Facilitators
    await manageFacilitatorsLink.click();
    await page.waitForSelector('h1:has-text("Manage Course Facilitators")');
    await page.waitForSelector('table tbody tr');

    // Check facilitator table rows
    const rows = await page.$$('table tbody tr');
    assert(rows.length >= 3, 'Should list at least 3 facilitators');

    // Check Status toggle button on facilitator (Priya Nair)
    const priyaRow = page.locator('tr:has-text("Priya Nair")');
    const toggleBtn = priyaRow.locator('button:has-text("Enable"), button:has-text("Disable")').first();
    assert(await toggleBtn.isVisible(), 'Status toggle button should be present for facilitator');
    const beforeText = (await toggleBtn.textContent()).trim();
    await toggleBtn.click();
    await page.waitForTimeout(300);

    const afterBtn = priyaRow.locator('button:has-text("Enable"), button:has-text("Disable")').first();
    const afterText = (await afterBtn.textContent()).trim();
    assert.notStrictEqual(beforeText, afterText, `Button should toggle after click (${beforeText} -> ${afterText})`);
    console.log(`✓ Test 4 passed: Admin governance, tables, and facilitator status toggle verified (${beforeText} -> ${afterText})`);

    // -------------------------------------------------------------
    // Test 5: Authentication & Access Guard Boundary
    // -------------------------------------------------------------
    console.log('Test 5: Authentication and Protected Route Guards...');
    const signOutButton = page.locator('button:has-text("Sign Out")');
    await signOutButton.click();
    await page.waitForSelector('h1:has-text("Sign In to ResourceHub")');

    // Attempt direct access to protected admin route while logged out
    await page.goto(`${BASE_URL}/admin/topics`);
    await page.waitForTimeout(300);
    // Route guard should redirect to login
    assert(page.url().includes('/login'), 'Unauthenticated access to /admin/topics must redirect to /login');

    // Test Quick Login for student
    const studentQuickLogin = page.locator('button:has-text("Arun Patel")');
    await studentQuickLogin.click();
    await page.waitForTimeout(400);
    assert(page.url().includes('/topics'), 'Student login should redirect to /topics');
    console.log('✓ Test 5 passed: Auth sign-out, route guards, and quick-login verified');

    console.log('\n🎉 ALL 5 PLAYWRIGHT E2E TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Playwright Test Failure:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
