// Usage: start the dev server first (npm run dev), run `npx playwright install chromium` once,
// then `npm run a11y`. Writes a11y-report.json and a11y-report.md (both gitignored).
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

const waveSession = {
  task: 'Math homework', plannedDuration: 25, actualDuration: 300, status: 'running',
  startTime: Date.now() - 300000, pausedAt: null, totalPausedMs: 0, distractions: [],
  distractionPlan: ['Phone'], completionType: 'full',
};
const squadSession = {
  task: 'Math homework', plannedDuration: 25, actualDuration: 120, mode: 'ambient', sessionCode: null,
  status: 'running', startTime: Date.now() - 120000, distractions: [], checkinCompletion: null, checkinFeeling: null,
};

// path, optional flow (multi-step), optional seeded localStorage, optional note
const ROUTES = [
  { path: '/', cookie: true, label: '/ (cookie banner visible)' },
  { path: '/', label: '/ (returning user)', seed: { 'dose-academy-state': { xp: 140, streak: 3, sessionsCount: 5, badges: [], focusStreak: 2 } } },
  { path: '/auth' },
  { path: '/age-verify', note: 'redirects to /auth when logged out' },
  { path: '/signup-age-check' },
  { path: '/parent-consent/test-token' },
  { path: '/parent-dashboard/test-token' },
  { path: '/spark', flow: true },
  { path: '/spark/complete' },
  { path: '/wave/setup', flow: true },
  { path: '/wave/session', seed: { 'dose-wave-session': waveSession } },
  { path: '/wave/break' },
  { path: '/wave/complete' },
  { path: '/rsd' },
  { path: '/rsd/flow', flow: true },
  { path: '/rsd/breathe' },
  { path: '/rsd/complete' },
  { path: '/squad' },
  { path: '/squad/setup', flow: true },
  { path: '/squad/session', seed: { 'dose-squad-session': squadSession } },
  { path: '/squad/checkin' },
  { path: '/squad/complete' },
  { path: '/squad/invite/ABC123' },
  { path: '/badges' },
  { path: '/ignite', flow: true },
  { path: '/teacher-dashboard', note: 'redirects to /auth when logged out' },
  { path: '/privacy' },
  { path: '/does-not-exist', label: '/does-not-exist (404)' },
  { path: '/', label: '/ (desktop, bottom nav)', viewport: DESKTOP },
  { path: '/spark', label: '/spark (desktop, bottom nav)', viewport: DESKTOP },
];

const simplify = (r) => ({
  id: r.id, impact: r.impact, help: r.help, helpUrl: r.helpUrl,
  nodes: r.nodes.map((n) => ({
    target: n.target.join(' '),
    html: n.html.slice(0, 220),
    data: n.any?.[0]?.data ?? null,
  })),
});

async function scan(page, label) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000); // framer-motion (longest delay ~0.8s + 0.4s)
  const res = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return { label, url: page.url().replace(BASE, ''), violations: res.violations.map(simplify) };
}

const ACTION = /^[^\w]*(next|continue|start|let'?s|submit|ignite|done|finish|show|get)/i;

async function stepThrough(page, theme, out, base) {
  const clicked = new Set();
  const seen = new Set();
  let n = 1;
  for (let i = 0; i < 16; i++) {
    for (const el of await page.locator('input[type=text], input:not([type]), textarea').all()) {
      if (await el.isVisible().catch(() => false) && !(await el.inputValue().catch(() => 'x'))) {
        await el.fill('Test task').catch(() => {});
      }
    }
    const names = [];
    for (const b of await page.locator('button:not([disabled])').all()) {
      names.push([(await b.innerText().catch(() => '')).trim(), b]);
    }
    const option = names.find(([t]) => t && !clicked.has(page.url() + t) && !ACTION.test(t) && !/^(back|skip|home|menu)/i.test(t) && t.length < 60);
    if (option) { clicked.add(page.url() + option[0]); await option[1].click().catch(() => {}); await page.waitForTimeout(200); }
    const nextBtn = page.locator('button:not([disabled])').filter({ hasText: ACTION }).first();
    if (await nextBtn.count()) {
      const before = page.url();
      await nextBtn.click().catch(() => {});
      await page.waitForTimeout(900);
      const sig = before + '>' + page.url() + '|' + (await page.locator('body').innerText().catch(() => '')).slice(0, 120);
      if (!seen.has(sig)) {
        seen.add(sig);
        out.push({ ...(await scan(page, base + ' -> step ' + ++n)), theme });
      }
    } else if (!option) break;
    if (!page.url().startsWith(BASE + base.split(' ')[0])) break;
  }
}

const browser = await chromium.launch();
const results = [];
for (const theme of ['light', 'dark']) {
  for (const r of ROUTES) {
    const ctx = await browser.newContext({ viewport: r.viewport || MOBILE, colorScheme: theme });
    const page = await ctx.newPage();
    await page.addInitScript(([t, seed, cookie]) => {
      localStorage.setItem('dose-theme', t);
      if (!cookie) localStorage.setItem('dose_cookie_consent', JSON.stringify({ necessary: true, analytics: false, marketing: false }));
      for (const [k, v] of Object.entries(seed || {})) localStorage.setItem(k, JSON.stringify(v));
    }, [theme, r.seed, !!r.cookie]);
    const label = r.label || r.path;
    try {
      await page.goto(BASE + r.path, { waitUntil: 'domcontentloaded' });
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      if (isDark !== (theme === 'dark')) console.warn(`theme mismatch on ${label} (${theme})`);
      const res = await scan(page, label);
      results.push({ ...res, theme, note: r.note });
      if (r.flow) await stepThrough(page, theme, results, label);
      console.log(`${theme.padEnd(5)} ${label} -> ${res.url} (${res.violations.reduce((n, v) => n + v.nodes.length, 0)} nodes)`);
    } catch (e) {
      results.push({ label, theme, url: r.path, error: String(e).slice(0, 200), violations: [] });
      console.warn('FAILED', label, theme, String(e).slice(0, 120));
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync('a11y-report.json', JSON.stringify(results, null, 2));

// ---- markdown ----
const isContrast = (v) => v.id === 'color-contrast';
const count = (rs, f) => rs.reduce((n, r) => n + r.violations.filter(f).reduce((m, v) => m + v.nodes.length, 0), 0);
const labels = [...new Set(results.map((r) => r.label))];
let md = '# Accessibility audit (axe-core, WCAG 2.1 A/AA)\n\nMobile 390x844 unless noted. Counts are failing elements (nodes).\n\n## Summary\n\n| Page | light contrast | dark contrast | light other | dark other |\n|---|---|---|---|---|\n';
for (const l of labels) {
  const c = (t, f) => count(results.filter((r) => r.label === l && r.theme === t), f);
  md += `| ${l} | ${c('light', isContrast)} | ${c('dark', isContrast)} | ${c('light', (v) => !isContrast(v))} | ${c('dark', (v) => !isContrast(v))} |\n`;
}
md += '\n## Details by page\n';
for (const l of labels) {
  md += `\n### ${l}\n`;
  const rs = results.filter((r) => r.label === l);
  if (rs[0].note) md += `_${rs[0].note}; scanned URL: ${rs[0].url}_\n`;
  if (rs[0].error) md += `_Error: ${rs[0].error}_\n`;
  const byKey = new Map();
  for (const r of rs) for (const v of r.violations) for (const n of v.nodes) {
    const k = `${v.id}|${n.target}`;
    const e = byKey.get(k) || { v, n, themes: new Set(), ratios: new Set() };
    e.themes.add(r.theme);
    if (n.data?.contrastRatio) e.ratios.add(`${r.theme}: ${n.data.contrastRatio} (${n.data.fgColor} on ${n.data.bgColor}, ${n.data.fontSize})`);
    byKey.set(k, e);
  }
  const all = [...byKey.values()];
  for (const [title, f] of [['Contrast', (e) => isContrast(e.v)], ['Other', (e) => !isContrast(e.v)]]) {
    const items = all.filter(f);
    if (!items.length) continue;
    md += `\n**${title}**\n\n`;
    for (const e of items) {
      md += `- \`${e.v.id}\` (${e.v.impact}) [${[...e.themes].join('+')}] \`${e.n.target}\``;
      md += e.ratios.size ? ` - ${[...e.ratios].join('; ')}\n` : ` - ${e.v.help}\n`;
    }
  }
  if (!all.length) md += '\nNo violations.\n';
}
fs.writeFileSync('a11y-report.md', md);
console.log('wrote a11y-report.json / a11y-report.md');
