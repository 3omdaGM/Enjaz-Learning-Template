import { defineConfig } from '@playwright/test';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (process.platform === 'linux' ? '/usr/bin/chromium' : undefined);
export default defineConfig({ testDir: './tests', testMatch: process.env.TEMPLATE_PRODUCTION ? 'production.spec.ts' : 'template.spec.ts', workers: 2, timeout: 120000, reporter: [['list'], ['json', { outputFile: process.env.TEMPLATE_PRODUCTION ? 'review/production-results.json' : 'review/browser-results.json' }]], outputDir: 'review/test-artifacts',
 use: { baseURL: 'http://127.0.0.1:4210', viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce', launchOptions: { ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox'] } },
 webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4210', url: 'http://127.0.0.1:4210', reuseExistingServer: false } });
