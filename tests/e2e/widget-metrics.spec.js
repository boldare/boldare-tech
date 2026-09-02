const { test, expect } = require("@playwright/test");

// Full-page screenshot diffing does not catch small chrome. The action-bar
// buttons shipped at 43x43 instead of 48x48 -- every icon on the site -- and
// still came in under the pixel-ratio threshold, because four small buttons are
// a rounding error on a full-page image. These assert the numbers directly.
//
// Every expected value here is what production (MUI v3) renders, measured
// against https://www.boldare.com/tech-blog/. MUI 9 changed each of them:
// IconButton padding 12 -> 8, SvgIcon's fixed 24px -> a pxToRem value inflated
// by this theme's typography.fontSize, and Chip's solid fill -> a translucent
// overlay. They are pinned back in src/styles/theme.js.

const POST = "weekly-ai-bites-last-manual-gap-qa-testing/";

test.describe("widget metrics match the pre-upgrade design", () => {
  test("action bar icon buttons are 48x48 with 24px icons", async ({ page }) => {
    await page.goto(POST);

    const metrics = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")].filter(
        el => el.getBoundingClientRect().x > window.innerWidth - 120
      );
      return buttons.map(el => {
        const svg = el.querySelector("svg");
        const b = el.getBoundingClientRect();
        return {
          w: Math.round(b.width),
          h: Math.round(b.height),
          padding: getComputedStyle(el).padding,
          svg: svg ? Math.round(svg.getBoundingClientRect().width) : null,
        };
      });
    });

    expect(metrics.length, "no action bar buttons found").toBeGreaterThan(0);
    for (const m of metrics) {
      expect(m, `action bar button: ${JSON.stringify(m)}`).toMatchObject({
        w: 48,
        h: 48,
        padding: "12px",
        svg: 24,
      });
    }
  });

  test("tag chips keep the solid v3 fill", async ({ page }) => {
    await page.goto(POST);

    const chip = await page.evaluate(() => {
      const el = [...document.querySelectorAll("div")].find(
        e => e.children.length === 2 && /^\d+$/.test(e.children[0]?.textContent?.trim() || "")
      );
      if (!el) return null;
      const avatar = el.children[0];
      return {
        background: getComputedStyle(el).backgroundColor,
        height: Math.round(el.getBoundingClientRect().height),
        avatar: Math.round(avatar.getBoundingClientRect().width),
      };
    });

    expect(chip, "no tag chip found on the post page").toBeTruthy();
    // rgb(224,224,224), not MUI 9's rgba(0,0,0,0.08) overlay.
    expect(chip.background).toBe("rgb(224, 224, 224)");
    expect(chip.height).toBe(32);
    expect(chip.avatar).toBe(32);
  });

  test("the page background is the #fafafa the site has always used", async ({ page }) => {
    await page.goto(POST);

    // The visual suite cannot see this. toHaveScreenshot has a per-pixel colour
    // tolerance of its own (threshold, 0.2 by default), and #fafafa vs #ffffff
    // is 5/255 on each channel -- well inside it, so not one pixel counts as
    // different and the whole page can change shade with the suite still green.
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(250, 250, 250)");
  });

  test("navigator thumbnails are square", async ({ page }) => {
    await page.goto(POST);
    await page.waitForTimeout(1500);

    // react-lazyload 3 wraps children in a div that 2.x did not, which broke
    // the img's `height: 100%` and let thumbnails fall back to their natural
    // aspect ratio. Square is the whole point -- they sit in a rounded mask.
    const thumbs = await page.$$eval("li img", els =>
      els.slice(0, 5).map(e => {
        const b = e.getBoundingClientRect();
        return { w: Math.round(b.width), h: Math.round(b.height), src: e.getAttribute("src") };
      })
    );

    expect(thumbs.length, "no navigator thumbnails found").toBeGreaterThan(0);
    for (const t of thumbs) {
      expect(t.h, `thumbnail not square: ${JSON.stringify(t)}`).toBe(t.w);
    }
  });
});
