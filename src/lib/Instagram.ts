import { Puppet } from "./puppet";
import { Page } from "puppeteer";

export default class Instagram {
    puppet: Puppet;

    constructor(puppet: Puppet) {
        this.puppet = puppet;
    }

    async init() {
        await this.puppet.ready();
    }

    async login(page: Page, username: string, password: string) {
        await page.goto("https://www.instagram.com/accounts/login");

        await page.waitForSelector("input[name='username']");

        await page.type("input[name='username']", username);
        await page.type("input[name='password']", password);

        await page.click("button[type='submit']");

        await page.waitForNavigation();
    }

    async like(page: Page, postId?: string) {
        if (postId) {
            await page.goto(`https://www.instagram.com/p/${postId}`);
        }

        if (!!(await page.$("span[class*='glyphsSpriteHeart__outline']"))) {
            await page.click("span[class*='glyphsSpriteHeart__outline']");
        }
    }

    async unlinke(page: Page, postId?: string) {
        if (postId) {
            await page.goto(`https://www.instagram.com/p/${postId}`);
        }

        if (!!(await page.$("span[class*='glyphsSpriteHeart__filled']"))) {
            await page.click("span[class*='glyphsSpriteHeart__filled']");
        }
    }

    async bookmark(page: Page, postId?: string) {
        if (postId) {
            await page.goto(`https://www.instagram.com/p/${postId}`);
        }

        if (!!(await page.$("span[class*='glyphsSpriteSave__outline']"))) {
            await page.click("span[class*='glyphsSpriteSave__outline']");
        }
    }

    async unbookmark(page: Page, postId?: string) {
        if (postId) {
            await page.goto(`https://www.instagram.com/p/${postId}`);
        }

        if (!!(await page.$("span[class*='glyphsSpriteSave__filled']"))) {
            await page.click("span[class*='glyphsSpriteSave__filled']");
        }
    }

    async follow(page: Page, mode: "post" | "profile", id?: string) {
        if (mode == "post") {
            if (id) {
                await page.goto(`https://www.instagram.com/p/${id}`);
            }
        } else {
            if (id) {
                await page.goto(`https://www.instagram.com/${id}`);
            }
        }

        if (!!(await page.$x("//button[contains(text(), 'Follow')]"))) {
            await (await page.$x("//button[contains(text(), 'Follow')]"))[0].click();
        }

        let userId: string;

        if (mode == "post") {
            userId = await page.evaluate(() => {
                return $("article header h2").text();
            });
        } else {
            userId = await page.evaluate(() => {
                return $("h1").text();
            });
        }

        return userId;
    }

    async unfollow(page: Page, mode: "post" | "profile", id?: string) {
        if (mode == "post") {
            if (id) {
                await page.goto(`https://www.instagram.com/p/${id}`);
            }
        } else {
            if (id) {
                await page.goto(`https://www.instagram.com/${id}`);
            }
        }

        if (!!(await page.$x("//button[contains(text(), 'Following')]"))) {
            await (await page.$x("//button[contains(text(), 'Following')]"))[0].click();
        }

        await (await page.$x("//button[contains(text(), 'Unfollow')]"))[0].click();
    }
}
