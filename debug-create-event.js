const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console
  page.on('console', msg => console.log('Browser:', msg.text()));

  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('→ Request:', request.method(), request.url());
      console.log('  Headers:', JSON.stringify(request.headers(), null, 2));
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log('← Response:', response.status(), response.url());
      try {
        const body = await response.text();
        console.log('  Body:', body.substring(0, 200));
      } catch (e) {}
    }
  });

  console.log('\n=== Step 1: Navigate to home page ===');
  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');

  console.log('\n=== Step 2: Check authentication state ===');
  const authState = await page.evaluate(() => {
    return {
      cookies: document.cookie,
      localStorage: {
        authToken: localStorage.getItem('authToken'),
        authUser: localStorage.getItem('authUser')
      }
    };
  });
  console.log('Auth state:', JSON.stringify(authState, null, 2));

  console.log('\n=== Step 3: Navigate to create event page ===');
  await page.goto('http://localhost:5174/events/create');
  await page.waitForTimeout(2000);

  console.log('\n=== Step 4: Check if redirected (not authenticated) ===');
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  if (currentUrl.includes('/events/create')) {
    console.log('\n✅ Still on create page - user is authenticated');

    // Try to fill and submit the form
    console.log('\n=== Step 5: Fill form ===');
    await page.fill('input[type="text"]', 'Test Event');
    console.log('Title filled');

    // Wait to see the form
    await page.waitForTimeout(3000);
  } else {
    console.log('\n❌ Redirected away - user is NOT authenticated');
    console.log('Need to login first');
  }

  console.log('\n=== Keeping browser open for 10 seconds ===');
  await page.waitForTimeout(10000);

  await browser.close();
})();
