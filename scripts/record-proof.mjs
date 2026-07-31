import { mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const framesDir = 'capture-frames';
await rm(framesDir, { recursive:true, force:true });
await mkdir(framesDir, { recursive: true });
const server = await createServer({ configFile: './vite.config.js', server: { host: '127.0.0.1', port: 4178 } });
await server.listen();
const baseUrl = server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:4178/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await page.goto(new URL('proof.html', baseUrl).href, { waitUntil: 'networkidle' });
await page.waitForTimeout(1300);

await page.evaluate(() => {
  const cursor = document.createElement('div');
  cursor.id = 'recording-cursor';
  cursor.innerHTML = '<span></span>';
  const style = document.createElement('style');
  style.textContent = `#recording-cursor{position:fixed;left:0;top:0;width:27px;height:27px;border:3px solid #fff;border-radius:50%;background:rgba(17,24,39,.82);box-shadow:0 3px 12px rgba(15,23,42,.38),0 0 0 2px rgba(17,24,39,.25);transform:translate(-50%,-50%);z-index:999999;pointer-events:none}#recording-cursor span{position:absolute;inset:8px;border-radius:50%;background:#fff}#recording-cursor.is-dragging{width:31px;height:31px;background:rgba(79,70,229,.92)}`;
  document.head.appendChild(style);
  document.body.appendChild(cursor);
  window.moveRecordingCursor = (x, y, dragging = false) => {
    cursor.style.left = `${x}px`; cursor.style.top = `${y}px`; cursor.classList.toggle('is-dragging', dragging);
  };
});

let frame = 0;
const snap = async (count = 1) => {
  for (let i = 0; i < count; i += 1) await page.screenshot({ path: `${framesDir}/${String(frame++).padStart(4,'0')}.png` });
};
const move = async (from, to, steps, dragging = false) => {
  for (let index = 1; index <= steps; index += 1) {
    const ratio = index / steps;
    const eased = ratio < .5 ? 2 * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 2) / 2;
    const x = from.x + (to.x - from.x) * eased;
    const y = from.y + (to.y - from.y) * eased;
    await page.mouse.move(x, y);
    await page.evaluate(({ x, y, dragging }) => window.moveRecordingCursor(x, y, dragging), { x, y, dragging });
    await snap();
  }
};

try {
  let box = await page.locator('[data-proof-event-id="release"]').boundingBox();
  let eventPoint = { x:box.x + 20, y:box.y + box.height / 2 };
  let cursorPoint = { x:355, y:385 };
  await page.evaluate(({ x, y }) => window.moveRecordingCursor(x, y), cursorPoint);
  await snap(7);
  await move(cursorPoint, eventPoint, 7);
  await page.mouse.down();
  await page.evaluate(({ x, y }) => window.moveRecordingCursor(x, y, true), eventPoint);
  const acceptedPoint = { x:eventPoint.x, y:eventPoint.y + 86 };
  await move(eventPoint, acceptedPoint, 12, true);
  await page.mouse.up();
  await page.evaluate(({ x, y }) => window.moveRecordingCursor(x, y), acceptedPoint);
  await page.waitForTimeout(400);
  await snap(12);

  box = await page.locator('[data-proof-event-id="release"]').boundingBox();
  eventPoint = { x:box.x + 20, y:box.y + box.height / 2 };
  await move(acceptedPoint, eventPoint, 5);
  await page.mouse.down();
  await page.evaluate(({ x, y }) => window.moveRecordingCursor(x, y, true), eventPoint);
  const blockedPoint = { x:924, y:eventPoint.y };
  await move(eventPoint, blockedPoint, 20, true);
  await page.mouse.up();
  await page.evaluate(({ x, y }) => window.moveRecordingCursor(x, y), blockedPoint);
  await page.waitForTimeout(300);

  const release = await page.evaluate(() => window.proofGrid.eventSchedulerEvents.find(item => item.id === 'release'));
  if (release?.resourceId !== 'nina' || release?.startDateTime !== '2026-08-03T09:00:00.000Z') throw new Error(`Blocked drop changed event state: ${JSON.stringify(release)}`);
  await page.evaluate(() => window.proofStatus('rejected','Invalid drop rejected','Nina is blocked from 13:00–15:00. The event stayed in its valid slot.'));
  await snap(18);
} finally {
  await browser.close();
  await server.close();
}

runFfmpeg(['-y','-framerate','9','-i',`${framesDir}/%04d.png`,'-filter_complex','[0:v]crop=1472:630:64:188,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0','public/assets/event-scheduler-proof.gif']);
runFfmpeg(['-y','-framerate','9','-i',`${framesDir}/%04d.png`,'-vf','crop=1472:630:64:188,format=yuv420p','-c:v','libx264','-preset','medium','-crf','19','-r','18','-movflags','+faststart','-an','public/assets/event-scheduler-proof.mp4']);
console.log(`Recorded ${frame} verified frames and generated GIF + MP4.`);

function runFfmpeg(args) {
  const result = spawnSync('ffmpeg', args, { stdio:'inherit' });
  if (result.status !== 0) throw new Error('ffmpeg failed');
}
