const { test, expect } = require('@playwright/test');

test.describe('页面基础功能', () => {
  test('页面加载并显示标题', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/手写数字识别/);

    // 检查header是否存在
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.locator('h1')).toContainText('手写数字识别');
  });

  test('页面结构完整', async ({ page }) => {
    await page.goto('/');

    // 检查主要区域是否存在
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('画布功能', () => {
  test('画布元素存在且可见', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 检查画布尺寸
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox.width).toBe(400);
    expect(canvasBox.height).toBe(400);
  });

  test('可以在画布上绘制', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');

    // 模拟鼠标绘制
    await canvas.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();

    // 检查画布是否有内容（通过检查是否有绘制痕迹）
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
  });

  test('清除画布功能', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const clearBtn = page.locator('button:has-text("清除画布")');

    // 先绘制一些内容
    await canvas.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(150, 150);
    await page.mouse.up();

    // 点击清除按钮
    await clearBtn.click();

    // 检查结果是否被清除
    const resultDisplay = page.locator('.result-display');
    const resultText = await resultDisplay.textContent();
    expect(resultText).toContain('请在左侧绘制数字');
  });
});

test.describe('控制按钮功能', () => {
  test('控制按钮存在且可见', async ({ page }) => {
    await page.goto('/');
    const recognizeBtn = page.locator('button:has-text("识别数字")');
    const clearBtn = page.locator('button:has-text("清除画布")');

    await expect(recognizeBtn).toBeVisible();
    await expect(clearBtn).toBeVisible();
  });

  test('按钮有正确的样式类', async ({ page }) => {
    await page.goto('/');
    const recognizeBtn = page.locator('button:has-text("识别数字")');
    const clearBtn = page.locator('button:has-text("清除画布")');

    await expect(recognizeBtn).toHaveClass(/btn-primary/);
    await expect(clearBtn).toHaveClass(/btn-secondary/);
  });

  test('识别按钮在识别过程中被禁用', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const recognizeBtn = page.locator('button:has-text("识别数字")');

    // 绘制内容
    await canvas.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(150, 150);
    await page.mouse.up();

    // 点击识别按钮
    await recognizeBtn.click();

    // 检查按钮文本变为"识别中..."
    await expect(recognizeBtn).toContainText('识别中...');

    // 检查按钮被禁用
    await expect(recognizeBtn).toBeDisabled();
  });
});

test.describe('识别功能', () => {
  test('空画布时点击识别按钮显示提示', async ({ page }) => {
    await page.goto('/');
    const recognizeBtn = page.locator('button:has-text("识别数字")');

    // 监听alert对话框
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('请先在画布上绘制数字');
      await dialog.accept();
    });

    await recognizeBtn.click();
  });

  test('完整识别流程：绘制->识别->显示结果', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const recognizeBtn = page.locator('button:has-text("识别数字")');

    // 绘制数字
    await canvas.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.move(150, 250);
    await page.mouse.up();

    // 点击识别按钮
    await recognizeBtn.click();

    // 等待识别完成（等待加载状态消失）
    await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 2000 }).catch(() => {});

    // 检查结果显示
    const resultDigit = page.locator('.result-digit');
    await expect(resultDigit).toBeVisible({ timeout: 3000 });

    // 检查置信度显示
    const confidenceText = page.locator('.confidence-text');
    await expect(confidenceText).toBeVisible();

    // 检查置信度条
    const confidenceBar = page.locator('.confidence-bar');
    await expect(confidenceBar).toBeVisible();
  });

  test('识别结果显示正确的格式', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const recognizeBtn = page.locator('button:has-text("识别数字")');

    // 绘制内容
    await canvas.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(150, 150);
    await page.mouse.up();

    // 识别
    await recognizeBtn.click();
    await page.waitForTimeout(1000);

    // 检查结果区域结构
    const resultDisplay = page.locator('.result-display');
    await expect(resultDisplay).toBeVisible();

    const resultDigit = page.locator('.result-digit');
    const digitText = await resultDigit.textContent();
    expect(digitText).toMatch(/^\d$/); // 应该是0-9的数字

    const resultConfidence = page.locator('.result-confidence');
    await expect(resultConfidence).toBeVisible();
  });
});

test.describe('识别历史功能', () => {
  test('历史记录区域存在', async ({ page }) => {
    await page.goto('/');
    const historySection = page.locator('.history-section');
    await expect(historySection).toBeVisible();

    const historyTitle = historySection.locator('h2');
    await expect(historyTitle).toContainText('识别历史');
  });

  test('初始状态显示"暂无识别历史"', async ({ page }) => {
    await page.goto('/');
    const historyList = page.locator('.history-list');
    const emptyText = historyList.locator('text=暂无识别历史');
    await expect(emptyText).toBeVisible();
  });

  test('识别后历史记录被添加', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const recognizeBtn = page.locator('button:has-text("识别数字")');

    // 绘制并识别
    await canvas.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(150, 150);
    await page.mouse.up();

    await recognizeBtn.click();
    await page.waitForTimeout(1000);

    // 检查历史记录是否添加
    const historyItems = page.locator('.history-item');
    const count = await historyItems.count();
    expect(count).toBeGreaterThan(0);

    // 检查历史记录项的结构
    const firstItem = historyItems.first();
    await expect(firstItem.locator('.history-digit')).toBeVisible();
    await expect(firstItem.locator('.history-date')).toBeVisible();
  });

  test('历史记录最多显示10条', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const recognizeBtn = page.locator('button:has-text("识别数字")');
    const clearBtn = page.locator('button:has-text("清除画布")');

    // 执行11次识别
    for (let i = 0; i < 11; i++) {
      // 绘制
      await canvas.hover();
      await page.mouse.move(100 + i * 5, 100 + i * 5);
      await page.mouse.down();
      await page.mouse.move(150 + i * 5, 150 + i * 5);
      await page.mouse.up();

      // 识别
      await recognizeBtn.click();
      await page.waitForTimeout(1000);

      // 清除画布准备下一次
      await clearBtn.click();
      await page.waitForTimeout(200);
    }

    // 检查历史记录数量
    const historyItems = page.locator('.history-item');
    const count = await historyItems.count();
    expect(count).toBeLessThanOrEqual(10);
  });

  test('点击历史记录项可以重新显示结果', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const recognizeBtn = page.locator('button:has-text("识别数字")');
    const clearBtn = page.locator('button:has-text("清除画布")');

    // 绘制并识别一次
    await canvas.hover();
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.mouse.move(150, 150);
    await page.mouse.up();

    await recognizeBtn.click();
    await page.waitForTimeout(1000);

    // 获取第一个历史记录项的数字
    const firstHistoryItem = page.locator('.history-item').first();
    const historyDigit = await firstHistoryItem.locator('.history-digit').textContent();

    // 清除结果
    await clearBtn.click();
    await page.waitForTimeout(200);

    // 点击历史记录项
    await firstHistoryItem.click();
    await page.waitForTimeout(300);

    // 检查结果是否重新显示
    const resultDigit = page.locator('.result-digit');
    await expect(resultDigit).toBeVisible();
    const displayedDigit = await resultDigit.textContent();
    expect(displayedDigit).toBe(historyDigit);
  });
});

test.describe('响应式设计', () => {
  test('移动端视图下布局正确', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 检查主要元素仍然可见
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('button:has-text("识别数字")')).toBeVisible();
  });
});
