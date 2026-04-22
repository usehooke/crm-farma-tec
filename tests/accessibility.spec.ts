import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Acessibilidade Elite CRM', () => {
  test('Página de Login deve ser acessível', async ({ page }) => {
    // Navegar para a base (Auth page por padrão se não logado)
    await page.goto('/');
    
    // Injetar Axe
    await injectAxe(page);
    
    // Verificar acessibilidade
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });
});
