import { chromium } from 'playwright';

async function testCreateEvent() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.error('[Page Error]:', error.message);
    console.error(error.stack);
  });

  try {
    console.log('Navigating to create event page...');
    await page.goto('http://localhost:5174/events/create');

    console.log('Waiting for page to load...');
    await page.waitForTimeout(2000);

    // Check if there are any visible errors
    const errorElement = await page.locator('.bg-red-50, .text-red-500, .text-red-700').first();
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('[Visible Error on Page]:', errorText);
    }

    // Check if the form is visible
    const formVisible = await page.locator('form').isVisible();
    console.log('Form visible:', formVisible);

    // Try to fill in the first step
    console.log('\nTesting Step 1...');
    const titleInput = await page.locator('input[type="text"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Event');
      console.log('Title filled');
    }

    // Check for step navigation
    const nextButton = await page.locator('button:has-text("Next"), button:has-text("Weiter")');
    if (await nextButton.isVisible()) {
      console.log('Next button found');
    }

    console.log('\nWaiting 5 seconds for inspection...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('[Test Error]:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testCreateEvent().catch(console.error);
