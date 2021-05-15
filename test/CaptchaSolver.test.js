const { chromium, firefox, webkit } = require('playwright')
const puppeteer = require('puppeteer')
const CaptchaSolver = require('../src/CaptchaSolver')

jest.setTimeout(90000)

const runTestsFor = (name, browserType) => {
  describe(name, () => {
    let browser, context, page

    beforeAll(async () => {
      browser = await browserType.launch({ headless: true })
    })

    afterAll(async () => {
      await browser.close()
    })

    beforeEach(async () => {
      if ('newContext' in browser) {
        context = await browser.newContext({ ignoreHTTPSErrors: true })
        page = await context.newPage()
      } else {
        context = null
        page = await browser.newPage()
      }
    })

    afterEach(async () => {
      await page.close()
      if (context) await context.close()
    })

    describe('when the verify page appears', () => {
      beforeEach(async () => {
        const catchaSolver = new CaptchaSolver(page)
        await page.goto('https://www.tiktok.com/@tiktok')
        await catchaSolver.solve()
      })

      it('solves the captcha if it appears', async () => {
        expect(await page.$('[id$="verify-el"]')).toBeNull()
      })
    })

    describe('when the captcha may appear after loading a page', () => {
      beforeEach(async () => {
        const catchaSolver = new CaptchaSolver(page)
        await page.goto('https://www.tiktok.com/login')
        await page.goto('https://www.tiktok.com/@tiktok')
        await catchaSolver.solve()
      })

      it('solves the captcha if it appears', async () => {
        expect(await page.$('[id$="verify-el"]')).toBeNull()
      })
    })
  })
}

describe('CaptchaSolver', () => {
  runTestsFor('Puppeteer', puppeteer)

  runTestsFor('Playwright - chromium', chromium)
  runTestsFor('Playwright - firefox', firefox)
  runTestsFor('Playwright - webkit', webkit)
})
