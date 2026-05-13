import { expect, test } from '@playwright/test';

test.describe('Chart MVP', () => {
  test('renders header and symbol switcher', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('TRADING APP')).toBeVisible();
    await expect(page.getByRole('button', { name: 'BTC/USDT' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ETH/USDT' })).toBeVisible();
  });

  test('renders timeframe selector', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '1m', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '1h', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '1d', exact: true })).toBeVisible();
  });

  test('renders layout switcher', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '1×1' })).toBeVisible();
    await expect(page.getByRole('button', { name: '1×2' })).toBeVisible();
    await expect(page.getByRole('button', { name: '2×2' })).toBeVisible();
  });

  test('switching to 1×2 shows two chart panels', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '1×2' }).click();
    const panels = page.locator('.h-full.w-full');
    await expect(panels).toHaveCount(2);
  });

  test('switching symbol updates header', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'ETH/USDT' }).click();
    await expect(page.getByText('ETH / USDT')).toBeVisible();
  });

  test('renders sidebar with watchlist', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('워치리스트')).toBeVisible();
    await expect(page.getByText('Binance Spot')).toBeVisible();
  });
});
