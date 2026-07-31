import { chromium } from 'playwright';
import { createServer } from 'vite';

const server = await createServer({ configFile: './vite.config.js', server: { host: '127.0.0.1', port: 4177 } });
await server.listen();
const baseUrl = server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:4177/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });

try {
  await capture('/comparison.html', 'public/assets/live-comparison.png', 2500);
  await capture('/mapping.html', 'public/assets/product-mapping.png', 300);
} finally {
  await browser.close();
  await server.close();
}

async function capture(path, output, settleMs) {
  await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(settleMs);
  await page.screenshot({ path: output });
  console.log(`Captured ${output}`);
}
